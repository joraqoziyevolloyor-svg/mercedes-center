#!/usr/bin/env python3
"""Bito sotuv narxi va qoldig'idan data/narxlar.json yasaydi.

Bito connector javoblari (bito_product_get_paging va bito_price_items_get_paging,
limit=50) sessiya yozuvlaridan (~/.claude/projects ostidagi *.jsonl, katta
javoblar uchun tool-results/*.txt) yig'iladi, natijani qayta yozish shart emas.
To'liq bo'lmasa, qaysi sahifalar yetishmasligini chiqaradi.

  python3 tools/narx_yangila.py --since <ISO vaqt> [--out data/narxlar.json]

Chiqish kodi: 0 = fayl o'zgardi, 3 = o'zgarish yo'q, 2 = ma'lumot to'liq emas yoki noto'g'ri.
"""
import argparse, glob, json, math, os, re, sys
from datetime import datetime, timezone

SOTUV_NARXI = "67b98a5500249661710688e8"   # "Sotuv narxi" (USD)
ORG = "67b97c1785d8af3e2bc8c03f"


def payloads(text):
    """Matn ichidagi Bito javob(lar)ini qaytaradi."""
    try:
        obj = json.loads(text)
    except Exception:
        return
    if isinstance(obj, list):            # tool-results/*.txt: [{type,text}]
        for b in obj:
            if isinstance(b, dict) and b.get("type") == "text":
                yield from payloads(b.get("text", ""))
    elif isinstance(obj, dict) and isinstance(obj.get("data"), list):
        yield obj


def parse_ts(v):
    try:
        return datetime.fromisoformat(str(v).replace("Z", "+00:00")).timestamp()
    except Exception:
        return None


def results_from_jsonl(path, since):
    """(vaqt, asbob nomi, sahifa, matn) - chaqiruv va javobini juftlab beradi.
    Faqat o'z vaqti since'dan keyin bo'lgan javoblar olinadi."""
    calls = {}
    for line in open(path, encoding="utf-8", errors="replace"):
        try:
            o = json.loads(line)
        except Exception:
            continue
        c = (o.get("message") or {}).get("content")
        if not isinstance(c, list):
            continue
        ts = parse_ts(o.get("timestamp"))
        for b in c:
            if b.get("type") == "tool_use":
                calls[b.get("id")] = (b.get("name", ""), (b.get("input") or {}).get("page"))
            elif b.get("type") == "tool_result":
                if ts is None or ts < since:
                    continue
                name, page = calls.get(b.get("tool_use_id"), ("", None))
                cc = b.get("content")
                parts = [cc] if isinstance(cc, str) else [x.get("text", "") for x in cc or [] if x.get("type") == "text"]
                for t in parts:
                    m = re.search(r"saved to (\S+?\.txt)", t)
                    if m and os.path.exists(m.group(1)):
                        t = open(m.group(1), encoding="utf-8").read()
                    yield ts, name, page, t


def collect(since):
    files = glob.glob(os.path.expanduser("~/.claude/projects/**/*.jsonl"), recursive=True)
    records = []
    for f in files:
        if os.path.getmtime(f) >= since:
            records.extend(results_from_jsonl(f, since))
    records.sort(key=lambda r: r[0])          # eng yangi javob oxirida yoziladi va yutadi
    products, prices, ptotal, rtotal = {}, {}, None, None
    ok = {"product": set(), "price": set()}
    for _, name, page, t in records:
        for p in payloads(t):
            got = None
            for it in p["data"]:
                if not isinstance(it, dict):
                    continue
                if it.get("price_id") == SOTUV_NARXI and isinstance(it.get("product"), dict):
                    prices[it["product"]["_id"]] = it.get("amount")
                    rtotal, got = p.get("total", rtotal), "price"
                elif "number" in it and "organizations" in it:
                    products[it["_id"]] = it
                    ptotal, got = p.get("total", ptotal), "product"
            if got and page and ("price_items" in name or "product_get_paging" in name):
                ok[got].add(page)
    return products, prices, ptotal, rtotal, ok


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--since", required=True, help="faqat shu vaqtdan keyingi yozuvlar (ISO)")
    ap.add_argument("--out", default="data/narxlar.json")
    ap.add_argument("--katalog", default="data/katalog.json", help="saytdagi tovarlar ro'yxati")
    a = ap.parse_args()
    since = datetime.fromisoformat(a.since.replace("Z", "+00:00")).timestamp()
    products, prices, ptotal, rtotal, ok = collect(since)
    print(f"mahsulot {len(products)}/{ptotal}, narx qatori {len(prices)}/{rtotal}")
    # Narx qatorlari soni olish paytida o'zgarishi mumkin (Bito'da yangi tovar),
    # shuning uchun narx uchun "hamma sahifa olindi" yetarli; saytdagi har bir
    # tovarning narxi borligi pastda alohida tekshiriladi.
    missing = {}
    for kind, total in (("product", ptotal), ("price", rtotal)):
        missing[kind] = sorted(set(range(1, math.ceil((total or 0) / 50) + 1)) - ok[kind]) if total else None
    if not products or len(products) != ptotal or not prices or missing["price"] != []:
        for kind, miss in missing.items():
            print(f"YETISHMAYDI {kind} sahifalar: {miss}")
        print("TO'LIQ EMAS: hamma sahifalar olinmagan, fayl yozilmadi")
        return 2
    nop = sorted((p["number"] for k, p in products.items() if k not in prices), key=str)
    if nop:
        print(f"narxi topilmagan tovarlar: {len(nop)} ta {nop[:10]}")
    items = {}
    for pid, p in products.items():
        if pid not in prices:
            continue
        qoldiq = sum(o.get("amount") or 0 for o in p.get("organizations", [])
                     if o.get("organization_id") == ORG)
        items[str(p["number"])] = {"price": prices[pid], "stock": qoldiq > 0}
    # Tekshiruv: saytdagi har bir tovar bo'lishi va narxlar to'g'ri son bo'lishi kerak
    if not os.path.exists(a.katalog):
        print(f"XATO: {a.katalog} topilmadi, saytdagi tovarlarni tekshirib bo'lmaydi, fayl yozilmadi")
        return 2
    site = [i["id"] for i in json.load(open(a.katalog, encoding="utf-8"))["items"]]
    miss = [i for i in site if i not in items]
    if miss:
        print(f"XATO: saytdagi {len(miss)} ta tovar yo'q (masalan {miss[:10]}), fayl yozilmadi")
        return 2
    bad = [k for k, v in items.items()
           if isinstance(v["price"], bool) or not isinstance(v["price"], (int, float))
           or not math.isfinite(v["price"]) or v["price"] < 0]
    if bad:
        print(f"XATO: {len(bad)} ta narx son emas, cheksiz yoki manfiy (masalan {bad[:10]}), fayl yozilmadi")
        return 2
    zero = [k for k, v in items.items() if v["price"] == 0]
    if len(zero) > max(20, len(items) // 20):
        print(f"XATO: {len(zero)} ta narx 0, fayl yozilmadi")
        return 2
    items = dict(sorted(items.items(), key=lambda kv: int(kv[0]) if kv[0].isdigit() else 0))
    old = None
    if os.path.exists(a.out):
        try:
            old = json.load(open(a.out, encoding="utf-8")).get("items")
        except Exception:
            pass
    if old == items:
        print("o'zgarish yo'q")
        return 3
    if old:
        ch = [k for k in items if old.get(k) != items[k]] + [k for k in old if k not in items]
        print(f"o'zgargan: {len(ch)} ta (masalan {ch[:10]})")
    out = {"updated": datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%MZ"),
           "currency": "USD", "count": len(items), "items": items}
    os.makedirs(os.path.dirname(a.out) or ".", exist_ok=True)
    with open(a.out, "w", encoding="utf-8") as f:
        json.dump(out, f, ensure_ascii=False, separators=(",", ":"))
        f.write("\n")
    print(f"yozildi: {a.out} ({len(items)} ta)")
    return 0


if __name__ == "__main__":
    sys.exit(main())
