"""Bouwt alle pagina's (NL en EN) uit src/pages: zet kop, menu, taalknop en voet om de pagina-inhoud.
Gebruik vanuit de repo-root:  python3 tools/build.py
Pas teksten aan in src/pages/<pagina>.html (NL) en src/pages/en/<pagina>.html (EN), nooit in de gegenereerde
index.html-bestanden. Alles na <!--SCRIPT--> in een fragment komt onderaan de pagina."""
import sys, pathlib

FRAG = pathlib.Path(sys.argv[1] if len(sys.argv) > 1 else "src/pages")
DONATE = "https://www.kominactievoordevoedselbank.nl/fundraisers/warreninmotion"
MAIL = "warreninmotion@outlook.com"
SOC = [("Instagram", "https://www.instagram.com/warreninmotion/", "@warreninmotion"),
       ("TikTok", "https://www.tiktok.com/@warren.in.motion", "@warren.in.motion")]  # Facebook voorlopig niet (pagina nog leeg)
# iconen voor de voet (eenvoudige glyphs in currentColor)
ICON = {
    "Instagram": '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4.2"/><circle cx="17.4" cy="6.6" r="1.1" fill="currentColor" stroke="none"/></svg>',
    "TikTok": '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12.53.02C13.84 0 15.14.01 16.44 0c.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z"/></svg>',
}

# sleutel: (NL-pad, EN-pad, NL-menunaam, EN-menunaam)
PAGES = {
    "home": ("/", "/en/", "Home", "Home"),
    "sponsoren": ("/sponsoren/", "/en/sponsor/", "Sponsoren", "Sponsor"),
    "doneren": ("/doneren/", "/en/donate/", "Doneren", "Donate"),
    "tussenstand": ("/tussenstand/", "/en/progress/", "Tussenstand", "Progress"),
    "route": ("/route/", "/en/route/", "De route", "The route"),
    "training": ("/training/", "/en/training/", "Training", "Training"),
    "over-warren": ("/over-warren/", "/en/about/", "Over Warren", "About Warren"),
    "contact": ("/contact/", "/en/contact/", "Contact", "Contact"),
    "beeldlijst": ("/beeldlijst/", "/en/", "Beeldlijst", "Shot list"),  # intern, niet in het menu
    "privacy": ("/privacy/", "/en/privacy/", "Privacy", "Privacy"),  # alleen in de voet
}
MENU = ["over-warren", "route", "training", "doneren", "sponsoren", "tussenstand", "contact"]
TXT = {
    "nl": {"skip": "Naar de inhoud", "main": "Hoofdmenu", "pages": "Pagina's", "switch": ("en", "EN", "Read this page in English"),
           "foot": "Lucca → Veenendaal · 15–22 mei 2027<br>Ten bate van Voedselbanken Nederland",
           "stichting": "Stichting Warren in Motion (in oprichting)", "donate": "Doneer aan Voedselbanken Nederland", "privacy": "Privacy en cookies"},
    "en": {"skip": "Skip to content", "main": "Main menu", "pages": "Pages", "switch": ("nl", "NL", "Lees deze pagina in het Nederlands"),
           "foot": "Lucca → Veenendaal · 15–22 May 2027<br>For the Dutch Food Banks (Voedselbanken Nederland)",
           "stichting": "Warren in Motion Foundation (in formation)", "donate": "Donate to the Dutch Food Banks", "privacy": "Privacy and cookies"},
}
# vlaggetjes voor de taalknop (inline SVG, werkt ook op Windows waar emoji-vlaggen ontbreken)
FLAG = {
    "en": '<svg class="flag" viewBox="0 0 60 30" aria-hidden="true"><clipPath id="fc"><path d="M0 0v30h60V0z"/></clipPath><clipPath id="ft"><path d="M30 15h30v15zv15H0zH0V0zV0h30z"/></clipPath><g clip-path="url(#fc)"><path d="M0 0v30h60V0z" fill="#012169"/><path d="M0 0l60 30m0-30L0 30" stroke="#fff" stroke-width="6"/><path d="M0 0l60 30m0-30L0 30" clip-path="url(#ft)" stroke="#C8102E" stroke-width="4"/><path d="M30 0v30M0 15h60" stroke="#fff" stroke-width="10"/><path d="M30 0v30M0 15h60" stroke="#C8102E" stroke-width="6"/></g></svg>',
    "nl": '<svg class="flag" viewBox="0 0 9 6" aria-hidden="true"><path fill="#AE1C28" d="M0 0h9v2H0z"/><path fill="#fff" d="M0 2h9v2H0z"/><path fill="#21468B" d="M0 4h9v2H0z"/></svg>',
}
P = lambda key, lang: PAGES[key][0 if lang == "nl" else 1]
N = lambda key, lang: PAGES[key][2 if lang == "nl" else 3]


CTA = {"doneren", "sponsoren"}  # in het menu als gekleurde knop


def nav_links(cur, lang, indent):
    return "\n".join(f'{indent}<li><a href="{P(k, lang)}"{" class=\"cta\"" if k in CTA else ""}{" aria-current=\"page\"" if k == cur else ""}>{N(k, lang)}</a></li>' for k in MENU)


def header(cur, lang):
    T = TXT[lang]; other, code, label = T["switch"]
    return f'''<a class="skip" href="#main">{T["skip"]}</a>
<header class="site-head">
  <div class="site-head__in">
    <a class="brand" href="{P("home", lang)}"{' aria-current="page"' if cur == "home" else ""}><svg class="mono" aria-hidden="true"></svg><span>Warren in Motion</span></a>
    <a class="lang" href="{P(cur, other)}" hreflang="{other}" lang="{other}" aria-label="{label}">{FLAG[other]}<span>{code}</span></a>
    <button class="menu-btn" type="button" aria-expanded="false" aria-controls="site-nav">Menu</button>
    <nav class="site-nav" id="site-nav" aria-label="{T["main"]}">
      <ul>
{nav_links(cur, lang, "        ")}
      </ul>
    </nav>
  </div>
</header>'''


def footer(lang):
    T = TXT[lang]
    soc = "".join(f'<a class="soc" href="{u}" target="_blank" rel="noopener" aria-label="{n} {h}" title="{n} · {h}">{ICON[n]}</a>' for n, u, h in SOC)
    return f'''<footer class="site-foot">
  <div class="site-foot__in">
    <div>
      <svg class="mono" aria-hidden="true"></svg>
      <p><b>Warren in Motion</b><br>{T["foot"]}</p>
      <p style="margin-top:10px">{T["stichting"]}</p>
    </div>
    <nav aria-label="{T["pages"]}">
      <ul>
        <li><a href="{P("home", lang)}">Home</a></li>
{nav_links(None, lang, "        ")}
      </ul>
    </nav>
    <div>
      <div class="socs">{soc}</div>
      <ul>
        <li><a href="mailto:{MAIL}">{MAIL}</a></li>
        <li><a href="{DONATE}" target="_blank" rel="noopener">{T["donate"]}</a></li>
        <li><a href="{P("privacy", lang)}">{T["privacy"]}</a></li>
      </ul>
    </div>
  </div>
</footer>'''


def page(key, lang, title, desc, body, scripts="", head=""):
    out = pathlib.Path(P(key, lang).lstrip("/")) / "index.html"
    out.parent.mkdir(parents=True, exist_ok=True)
    alt = "".join(f'<link rel="alternate" hreflang="{l}" href="https://warreninmotion.nl{P(key, l)}">\n' for l in ("nl", "en"))
    html = f'''<!doctype html>
<html lang="{lang}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">
<title>{title}</title>
<meta name="description" content="{desc}">
{alt}<link rel="icon" href="/assets/favicon.svg" type="image/svg+xml">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600&amp;display=swap">
<link rel="stylesheet" href="/assets/site.css">
<script>document.documentElement.classList.add("js")</script>
{head}</head>
<body>
{header(key, lang)}

<main id="main">
{body.strip()}
</main>

{footer(lang)}

<script src="/data.js"></script>
{'<script src="/logos.js"></script>' + chr(10) if key == "sponsoren" else ""}<script src="/shots.js"></script>
<script src="/assets/site.js"></script>
{scripts}</body>
</html>
'''
    out.write_text(html)


MAPLIBS = '''<script src="https://cdnjs.cloudflare.com/ajax/libs/d3/3.5.17/d3.min.js"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/topojson/1.6.20/topojson.min.js"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/datamaps/0.5.9/datamaps.world.hires.min.js"></script>
<script src="/assets/route-data.js"></script>
<script src="/assets/route.js"></script>
'''
ACTIE = MAPLIBS + '<script src="/assets/actie.js"></script>\n'
ACSS = '<link rel="stylesheet" href="/assets/actie.css">\n'
TCSS = '<link rel="stylesheet" href="/assets/training.css">\n'


def frag(name, lang):
    t = ((FRAG / "en") if lang == "en" else FRAG).joinpath(name).read_text()
    if "<!--SCRIPT-->" in t:
        b, s = t.split("<!--SCRIPT-->")
        return b, s.strip() + "\n"
    return t, ""


META = {
    "home": (("Warren in Motion", "Warren fietst in mei 2027 ruim 1.500 km van Lucca naar Veenendaal, door 7 landen, voor Voedselbanken Nederland. Sponsor als bedrijf of doneer als particulier."),
             ("Warren in Motion", "In May 2027 Warren cycles more than 1,500 km from Lucca to Veenendaal, through 7 countries, for the Dutch Food Banks. Sponsor as a company or donate as an individual."), "", ""),
    "sponsoren": (("Sponsor als bedrijf · Warren in Motion", "Koop kilometers van de route Lucca–Veenendaal voor €20 per km, met je logo op het shirt en de volgbus. Alles gaat naar Voedselbanken Nederland."),
                  ("Sponsor as a company · Warren in Motion", "Buy kilometres of the Lucca–Veenendaal route for €20 per km, with your logo on the jersey and the follow van. Everything goes to the Dutch Food Banks."), "ACTIE", "ACSS"),
    "doneren": (("Doneer en rij mee · Warren in Motion", "Doneer aan Voedselbanken Nederland en rij mee in het peloton, of fiets op 22 mei 2027 de eindsprint mee van Den Bosch naar Veenendaal."),
                ("Donate and ride along · Warren in Motion", "Donate to the Dutch Food Banks and ride along in the peloton, or join the final sprint from Den Bosch to Veenendaal on 22 May 2027."), "", ""),
    "tussenstand": (("Tussenstand · Warren in Motion", "De echte tussenstand van Warren in Motion: welke bedrijven en hoeveel particulieren meerijden op de route Lucca–Veenendaal."),
                    ("Progress · Warren in Motion", "The real progress of Warren in Motion: which companies and how many individuals are riding along on the Lucca–Veenendaal route."), "ACTIE", "ACSS"),
    "route": (("De route · Warren in Motion", "Acht etappes van Lucca naar Veenendaal, 1.570 km door 7 landen, van 15 tot 22 mei 2027."),
              ("The route · Warren in Motion", "Eight stages from Lucca to Veenendaal, 1,570 km through 7 countries, from 15 to 22 May 2027."), "MAPLIBS", ""),
    "training": (("Training · Warren in Motion", "Zo traint Warren voor ruim 1.500 km van Lucca naar Veenendaal: elke week de gefietste kilometers, de ritten en de hartslagzones, met een kort verslag."),
                 ("Training · Warren in Motion", "How Warren trains for more than 1,500 km from Lucca to Veenendaal: every week the kilometres cycled, the rides and the heart rate zones, with a short report."), "MAPLIBS", "TCSS"),
    "over-warren": (("Over Warren · Warren in Motion", "Wie Warren van der Ploeg is en waarom hij van Lucca naar Veenendaal fietst voor Voedselbanken Nederland."),
                    ("About Warren · Warren in Motion", "Who Warren van der Ploeg is and why he is cycling from Lucca to Veenendaal for the Dutch Food Banks."), "", ""),
    "beeldlijst": (("Beeldlijst · Warren in Motion", "Welke foto's en video's er nog nodig zijn voor de site."),
                   ("Shot list · Warren in Motion", "Which photos and videos the site still needs."), "", "NOINDEX"),
    "privacy": (("Privacy en cookies · Warren in Motion", "Welke cookies en statistiek warreninmotion.nl gebruikt, waarvoor en hoe lang."),
                ("Privacy and cookies · Warren in Motion", "Which cookies and statistics warreninmotion.nl uses, what for and for how long."), "", ""),
    "contact": (("Contact · Warren in Motion", "Mail Warren over sponsoring, doneren, de eindsprint, pers of meedoen."),
                ("Contact · Warren in Motion", "Email Warren about sponsoring, donating, the final sprint, press or getting involved."), "", ""),
}
NOINDEX = '<meta name="robots" content="noindex">\n'
G = {"NOINDEX": NOINDEX, "ACTIE": ACTIE, "ACSS": ACSS, "TCSS": TCSS, "MAPLIBS": MAPLIBS, "": ""}
for key, (nl, en, pre, head) in META.items():
    for lang, (title, desc) in (("nl", nl), ("en", en)):
        name = key + ".html"
        if lang == "en" and not (FRAG / "en" / name).exists():
            continue
        b, s = frag(name, lang)
        page(key, lang, title, desc, b, G[pre] + s, G[head])
