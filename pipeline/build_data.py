"""Build the static data files the SMS bot and simulator read.

Sources (City of Toronto Open Data, retrieved at build time):
- Members of Toronto City Council Voting Record 2022-2026
- Address Points (Municipal) - Toronto One Address Repository
Run: python3 pipeline/build_data.py [cache_dir]
"""
import csv, json, re, sys, subprocess, difflib, random, urllib.request, collections, datetime, pathlib

CKAN = "https://ckan0.cf.opendata.inter.prod-toronto.ca/api/3/action/package_show?id="
OUT = pathlib.Path(__file__).resolve().parent.parent / "site" / "data"
ITEM_PAGE = "https://secure.toronto.ca/council/agenda-item.do?item="
csv.field_size_limit(10**8)


def resource_url(package, name):
    with urllib.request.urlopen(CKAN + package) as r:
        res = json.load(r)["result"]["resources"]
    return next(x["url"] for x in res if x["name"] == name)


def fetch(cache, package, name):
    path = cache / name
    if not path.exists():
        urllib.request.urlretrieve(resource_url(package, name), path)
    return path


def street_ranges(path):
    """street name -> [[lo, hi, ward], ...]; odd and even sides kept apart."""
    pts, names = collections.defaultdict(set), {}
    for r in csv.DictReader(open(path, encoding="utf-8-sig")):
        if r["LO_NUM"].isdigit() and r["WARD"]:
            pts[r["LINEAR_NAME_FULL"].upper()].add((int(r["LO_NUM"]), int(r["WARD"])))
            names[int(r["WARD"])] = r["WARD_NAME"]
    out = {}
    for street, ps in pts.items():
        ranges = []
        for parity in (0, 1):
            cur = None
            for num, ward in sorted(p for p in ps if p[0] % 2 == parity):
                if cur and cur[2] == ward:
                    cur[1] = num
                else:
                    cur = [num, num, ward]
                    ranges.append(cur)
        out[street] = ranges
    return out, names


def places(path):
    """Named buildings ("CN Tower") -> [name, official address, ward], from the same address dataset."""
    out = {(r["PLACE_NAME"], r["ADDRESS_FULL"], int(r["WARD"]))
           for r in csv.DictReader(open(path, encoding="utf-8-sig"))
           if r["PLACE_NAME"] not in ("", "None") and r["WARD"]}
    return sorted(out)


def items(path, since):
    """Agenda items whose title starts with a street address, with their recorded votes."""
    by_item = {}
    for r in csv.DictReader(open(path, encoding="utf-8-sig")):
        date = r["Date/Time"][:10]
        if date < since or not re.match(r"\d", r["Agenda Item Title"]):
            continue
        it = by_item.setdefault(r["Agenda Item #"], {
            "id": r["Agenda Item #"], "title": r["Agenda Item Title"],
            "url": ITEM_PAGE + r["Agenda Item #"], "votes": []})
        vote = {"date": date, "body": r["Committee"], "motion": r["Motion Type"],
                "result": r["Result"]}
        if vote not in it["votes"]:  # one row per councillor; keep one per motion
            it["votes"].append(vote)
    for it in by_item.values():
        it["votes"].sort(key=lambda v: v["date"])
    return sorted(by_item.values(), key=lambda i: i["votes"][-1]["date"], reverse=True)


RAW = pathlib.Path(__file__).resolve().parent.parent / "data" / "raw"


def pdf_text(path, layout=False):
    return subprocess.run(["pdftotext", *(["-layout"] if layout else []), str(path), "-"],
                          capture_output=True, text=True, check=True).stdout


def squash(text):
    # a line-end hyphen is a real one ("191-" + "199"), so join without a space
    return re.sub(r"\s+", " ", re.sub(r"-\n\s*", "-", text)).strip()


def numbered(text):
    """Split '1. ... 2. ...' into recommendations; sub-points (a., b.) stay with their parent."""
    parts = re.split(r"(?:^|\s)(\d{1,2})\.\s+(?=[A-Z])", squash(text))
    return [f"{n}. {t.strip()}" for n, t in zip(parts[1::2], parts[2::2])]


def section(text, start, end):
    m = re.search(start + r"(.*?)" + end, text, re.S)
    assert m, (start, end)
    return m.group(1)


def item_page(item_id, cache):
    """Fields from a hand-saved PDF printout of the official item page, plus the staff report it links."""
    raw = pdf_text(RAW / f"{item_id}.pdf", layout=True)
    # Chrome print headers/footers: timestamp, page title, page URL, "n/N"
    lines = [l.strip() for l in raw.splitlines() if not re.match(
        r"^\s*(\d\d/\d\d/\d{4}, \d\d:\d\d|Agenda Item History - |https://secure\.toronto\.ca/council/agenda-item|\d+/\d+\s*$)", l)]
    text = "\n".join(lines)
    status = squash(section(text, r"Tracking Status\n", r"\nSee also|\n[A-Z][a-z]+ Council consideration|\nCity Council consideration"))
    ward = int(re.search(r"Ward: (\d+)", text).group(1))
    decision = section(text, r"City Council Decision\n.*?adopted the following:\n", r"\nPublic Notice Given")
    report_url = re.search(r"https://www\.toronto\.ca/legdocs/mmis/\S+/bgrd/backgroundfile-\d+\.pdf", text).group(0)
    report = cache / report_url.rsplit("/", 1)[1]
    if not report.exists():
        urllib.request.urlretrieve(report_url, report)
    rtext = pdf_text(report, layout=True)
    rtext = "\n".join(l for l in rtext.splitlines() if not re.search(r"Page \d+ of \d+\s*$", l))
    staff = re.sub(r"^.*?recommends? that:", "", section(rtext, r"\n\s*RECOMMENDATIONS\s*\n", r"\n\s*FINANCIAL IMPACT\s*\n"), flags=re.S)
    staff_recs, council_recs = numbered(staff), numbered(decision)
    for r in council_recs:  # every extracted line must be the city's own words
        assert squash(r[r.index(" ") + 1:]) in squash(text), r[:60]
    comments = collections.Counter(m for m in re.findall(r"\nCommunications \((.*?)\)\n", text))
    n_comments = len(re.findall(r"^\([A-Z][a-z]+ \d{1,2}, \d{4}\) (?:E-mail|Letter|Submission)", text, re.M))
    return {
        "ward": ward, "status": status,
        "page": {
            "notice": squash(section(text, r"Public Notice Given\n", r"\n")),
            "reportUrl": report_url, "comments": n_comments,
            "diff": diff(staff_recs, council_recs),
            "source": f"Printout of the official item page saved {datetime.date.today().isoformat()}",
        },
    }


def diff(staff, council):
    """Pair staff recommendations with council decisions by wording; word-level changes for pairs."""
    out, used = [], set()
    for s in staff:
        best = max(((difflib.SequenceMatcher(None, s, c).ratio(), i) for i, c in enumerate(council) if i not in used), default=(0, -1))
        if best[0] < 0.6:
            out.append({"op": "removed", "staff": s})
            continue
        used.add(best[1])
        c = council[best[1]]
        sw, cw = s.split(), c.split()
        words = [[tag, " ".join(sw[i1:i2]), " ".join(cw[j1:j2])]
                 for tag, i1, i2, j1, j2 in difflib.SequenceMatcher(None, sw, cw).get_opcodes()]
        out.append({"op": "same" if s == c else "changed", "staff": s, "council": c, "words": words})
    out += [{"op": "added", "council": c} for i, c in enumerate(council) if i not in used]
    return out


def address_sample(path, n=2000):
    """Random real addresses with their official ward, to test the lookup never names a wrong ward."""
    rows = [(r["ADDRESS_FULL"], int(r["WARD"])) for r in csv.DictReader(open(path, encoding="utf-8-sig"))
            if r["LO_NUM"].isdigit() and r["WARD"]]
    return random.Random(1).sample(rows, n)


def main():
    cache = pathlib.Path(sys.argv[1] if len(sys.argv) > 1 else "data/cache")
    cache.mkdir(parents=True, exist_ok=True)
    OUT.mkdir(parents=True, exist_ok=True)
    today = datetime.date.today().isoformat()
    votes_src = ("members-of-toronto-city-council-voting-record", "member-voting-record-2022-2026.csv")
    addr_src = ("address-points-municipal-toronto-one-address-repository", "Address Points - 4326.csv")

    streets, ward_names = street_ranges(fetch(cache, *addr_src))
    its = items(fetch(cache, *votes_src), "2026-01-01")
    assert len(ward_names) == 25, ward_names
    assert all(i["votes"] for i in its)
    for it in its:
        if (RAW / f"{it['id']}.pdf").exists():
            it.update(item_page(it["id"], cache))
    assert sum("page" in i for i in its) == len(list(RAW.glob("*.pdf")))

    data = {
        "retrieved": today,
        "sources": {
            "votes": "https://open.toronto.ca/dataset/members-of-toronto-city-council-voting-record/",
            "addresses": "https://open.toronto.ca/dataset/address-points-municipal-toronto-one-address-repository/",
        },
        "lastVote": max(v["date"] for i in its for v in i["votes"]),
        "wards": ward_names,
        "items": its,
    }
    (OUT / "items.json").write_text(json.dumps(data, separators=(",", ":")))
    (OUT / "streets.json").write_text(json.dumps(streets, separators=(",", ":")))
    (OUT / "places.json").write_text(json.dumps(places(fetch(cache, *addr_src)), separators=(",", ":")))
    tests = OUT.parent.parent / "tests"
    tests.mkdir(exist_ok=True)
    (tests / "address_sample.json").write_text(json.dumps(address_sample(fetch(cache, *addr_src))))
    print(f"{len(its)} items, {len(streets)} streets -> {OUT}")


if __name__ == "__main__":
    main()
