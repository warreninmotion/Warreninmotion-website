"""Weekrapport uit Google Analytics 4 (warreninmotion.nl) voor Warren, elke vrijdag.
Gebruik (repo-root): python3 tools/ga_report.py [dagen]   (standaard 7; vergelijkt met de periode ervoor)
Toegang: de JSON-sleutel van serviceaccount claude-rapport (rol Lezer op de property) staat als netwerkgeheim
"GCP access token (with Service Account Key)" voor analyticsdata.googleapis.com in de omgeving: de proxy zet dan zelf
het Authorization-kopje op elke aanvraag. Alleen als omgevingsvariabele GA_SERVICE_ACCOUNT_JSON bestaat, maakt
het script zelf een token. De sleutel nooit in de repo of de chat zetten.
Voor de knoppen: in GA4 de gebeurtenisparameters "knop" en "pagina" als aangepaste dimensies (bereik: gebeurtenis)
registreren; site.js stuurt bij elke klik de gebeurtenis "klik" met die twee parameters.
Schrijft Markdown naar stdout. Alleen standaardbibliotheek + cryptography."""
import base64, html.parser, json, os, pathlib, re, ssl, sys, time, urllib.error, urllib.parse, urllib.request

PROPERTY = "559326726"  # GA4 property warreninmotion.nl (meet-ID G-PW3QDXVHXW)
DAYS = int(sys.argv[1]) if len(sys.argv) > 1 and sys.argv[1].isdigit() else 7
ROOT = pathlib.Path(__file__).resolve().parent.parent

ctx = ssl.create_default_context(cafile=next((p for p in (os.environ.get("SSL_CERT_FILE"), os.environ.get("REQUESTS_CA_BUNDLE"),
                                                         "/root/.ccr/ca-bundle.crt") if p and os.path.exists(p)), None))


def b64(b):
    return base64.urlsafe_b64encode(b).rstrip(b"=").decode()


def token():
    if not os.environ.get("GA_SERVICE_ACCOUNT_JSON"):
        return ""  # netwerkgeheim: de proxy voegt het token toe
    from cryptography.hazmat.primitives import hashes, serialization
    from cryptography.hazmat.primitives.asymmetric import padding
    key = json.loads(os.environ["GA_SERVICE_ACCOUNT_JSON"])
    now = int(time.time())
    head = b64(json.dumps({"alg": "RS256", "typ": "JWT"}).encode())
    claim = b64(json.dumps({"iss": key["client_email"], "scope": "https://www.googleapis.com/auth/analytics.readonly",
                            "aud": "https://oauth2.googleapis.com/token", "iat": now, "exp": now + 3600}).encode())
    pk = serialization.load_pem_private_key(key["private_key"].encode(), password=None)
    sig = b64(pk.sign(f"{head}.{claim}".encode(), padding.PKCS1v15(), hashes.SHA256()))
    body = urllib.parse.urlencode({"grant_type": "urn:ietf:params:oauth:grant-type:jwt-bearer", "assertion": f"{head}.{claim}.{sig}"}).encode()
    with urllib.request.urlopen(urllib.request.Request("https://oauth2.googleapis.com/token", body), context=ctx) as r:
        return json.load(r)["access_token"]


TOKEN = None


def run(dims, mets, limit=50, flt=None, ranges=None):
    global TOKEN
    if TOKEN is None:
        TOKEN = token()
    req = {"dateRanges": ranges or [{"startDate": f"{DAYS}daysAgo", "endDate": "yesterday"}],
           "dimensions": [{"name": d} for d in dims], "metrics": [{"name": m} for m in mets], "limit": limit}
    if mets:
        req["orderBys"] = [{"metric": {"metricName": mets[0]}, "desc": True}]
    if flt:
        req["dimensionFilter"] = flt
    r = urllib.request.Request(f"https://analyticsdata.googleapis.com/v1beta/properties/{PROPERTY}:runReport",
                               json.dumps(req).encode(), {"Content-Type": "application/json", **({"Authorization": f"Bearer {TOKEN}"} if TOKEN else {})})
    try:
        with urllib.request.urlopen(r, context=ctx) as f:
            data = json.load(f)
    except urllib.error.HTTPError as e:
        msg = json.loads(e.read() or b"{}").get("error", {}).get("message", str(e))
        raise RuntimeError(msg)
    return [([d["value"] for d in row.get("dimensionValues", [])], [float(m["value"]) for m in row["metricValues"]])
            for row in data.get("rows", [])]


class Knoppen(html.parser.HTMLParser):
    """Alle vaste links en knoppen per pagina, met hetzelfde label als site.js meestuurt (data-track, aria-label of tekst)."""
    def __init__(self):
        super().__init__(); self.stack = []; self.found = []; self.skip = 0

    def handle_starttag(self, tag, a):
        a = dict(a)
        if tag in ("script", "style"):
            self.skip += 1
        if tag in ("a", "button"):
            self.stack.append([a.get("data-track") or a.get("aria-label"), ""])

    def handle_endtag(self, tag):
        if tag in ("script", "style"):
            self.skip -= 1
        if tag in ("a", "button") and self.stack:
            fixed, txt = self.stack.pop()
            label = re.sub(r"\s+", " ", fixed or txt).strip()[:60]
            if label:
                self.found.append(label)

    def handle_data(self, d):
        if not self.skip:
            for s in self.stack:
                s[1] += d


def site_buttons():
    out = {}
    for f in sorted(ROOT.glob("**/index.html")):
        rel = "/" + f.parent.relative_to(ROOT).as_posix().strip(".") + "/"
        rel = rel.replace("//", "/")
        if "beeldlijst" in rel or rel.startswith("/src/"):
            continue
        p = Knoppen(); p.feed(f.read_text())
        # kop en voet staan op elke pagina: die tellen we apart
        out[rel] = p.found
    return out


def pct(a, b):
    return "" if not b else f" ({'+' if a >= b else ''}{(a - b) / b * 100:.0f}%)"


def mmss(s):
    return f"{int(s // 60)}:{int(s % 60):02d}"


def main():
    nu = [{"startDate": f"{DAYS}daysAgo", "endDate": "yesterday"}]
    toen = [{"startDate": f"{DAYS * 2}daysAgo", "endDate": f"{DAYS + 1}daysAgo"}]
    M = ["activeUsers", "newUsers", "sessions", "averageSessionDuration", "screenPageViews", "engagementRate"]
    a = (run([], M, ranges=nu) or [([], [0] * 6)])[0][1]
    b = (run([], M, ranges=toen) or [([], [0] * 6)])[0][1]
    L = [f"# Weekrapport warreninmotion.nl, afgelopen {DAYS} dagen", "",
         f"- **Bezoekers:** {a[0]:.0f}{pct(a[0], b[0])}, waarvan {a[1]:.0f} nieuw",
         f"- **Bezoeken:** {a[2]:.0f}{pct(a[2], b[2])}",
         f"- **Gemiddelde bezoektijd:** {mmss(a[3])} min{pct(a[3], b[3])}",
         f"- **Paginaweergaven:** {a[4]:.0f}{pct(a[4], b[4])}",
         f"- **Betrokken bezoeken:** {a[5] * 100:.0f}% (langer dan 10 s, of 2+ pagina's, of een klik)", ""]

    pages = run(["pagePath"], ["screenPageViews", "activeUsers", "userEngagementDuration"], ranges=nu)
    L += ["## Populairste pagina's", "", "| Pagina | Weergaven | Bezoekers | Tijd per bezoeker |", "|---|---:|---:|---:|"]
    L += [f"| {d[0]} | {m[0]:.0f} | {m[1]:.0f} | {mmss(m[2] / m[1]) if m[1] else '-'} |" for d, m in pages[:12]]
    seen = {d[0] for d, _ in pages}
    knoppen = site_buttons()
    niet = [p for p in knoppen if p not in seen]
    L += ["", "**Niet bezocht:** " + (", ".join(niet) if niet else "alle pagina's zijn bezocht."), ""]

    try:
        kl = run(["customEvent:knop", "customEvent:pagina"], ["eventCount"], limit=250, ranges=nu,
                 flt={"filter": {"fieldName": "eventName", "stringFilter": {"value": "klik"}}})
        L += ["## Meest gebruikte knoppen en links", "", "| Knop | Pagina | Klikken |", "|---|---|---:|"]
        L += [f"| {d[0]} | {d[1]} | {m[0]:.0f} |" for d, m in kl[:20]]
        clicked = {(d[1], d[0]) for d, _ in kl} | {("*", d[0]) for d, _ in kl}
        common = set.intersection(*map(set, knoppen.values())) if knoppen else set()
        L += ["", "## Niet gebruikt", "", "Knoppen en links die er deze periode wel stonden, maar waar niemand op klikte "
              "(alleen pagina's met bezoek; kop en voet apart).", ""]
        kop = sorted(k for k in common if ("*", k) not in clicked)
        if kop and seen:
            L.append(f"- **Kop en voet:** {', '.join(kop)}")
        for p, labels in knoppen.items():
            if p not in seen:
                continue
            rest = sorted({k for k in labels if k not in common and (p, k) not in clicked})
            if rest:
                L.append(f"- **{p}:** {', '.join(rest)}")
    except RuntimeError as e:
        L += ["## Knoppen", "", f"Nog niet beschikbaar: {e}",
              "Registreer in GA4 (Beheer → Aangepaste definities) de parameters `knop` en `pagina` als aangepaste dimensie."]

    for title, dim in (("Waar komen bezoekers vandaan", "sessionDefaultChannelGroup"), ("Apparaat", "deviceCategory"), ("Plaatsen", "city")):
        rows = run([dim], ["activeUsers"], limit=8, ranges=nu)
        L += ["", f"## {title}", "", ", ".join(f"{d[0]} {m[0]:.0f}" for d, m in rows) or "geen gegevens"]
    print("\n".join(L))


if __name__ == "__main__":
    if "--knoppen" in sys.argv:  # test zonder GA: welke knoppen staan er per pagina
        for p, k in site_buttons().items():
            print(p, len(k))
    else:
        main()
