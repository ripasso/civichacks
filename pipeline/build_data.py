"""Build the static data files the SMS bot and simulator read.

Sources (City of Toronto Open Data, retrieved at build time):
- Members of Toronto City Council Voting Record 2022-2026
- Address Points (Municipal) - Toronto One Address Repository
Run: python3 pipeline/build_data.py [cache_dir]
"""
import csv, json, re, sys, urllib.request, collections, datetime, pathlib

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

    data = {
        "retrieved": today,
        "sources": {
            "votes": "https://open.toronto.ca/dataset/members-of-toronto-city-council-voting-record/",
            "addresses": "https://open.toronto.ca/dataset/address-points-municipal-toronto-one-address-repository/",
        },
        "wards": ward_names,
        "items": its,
    }
    (OUT / "items.json").write_text(json.dumps(data, separators=(",", ":")))
    (OUT / "streets.json").write_text(json.dumps(streets, separators=(",", ":")))
    print(f"{len(its)} items, {len(streets)} streets -> {OUT}")


if __name__ == "__main__":
    main()
