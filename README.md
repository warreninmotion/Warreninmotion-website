# Warren in Motion website

Statische site voor warreninmotion.nl, gehost via Netlify (geen build-stap).

- `index.html`: Home, de landingspagina met de keuze bedrijf of particulier
- `sponsoren/`: sponsoren als bedrijf (rekenhulp, shirt, volgbus)
- `doneren/`: doneren als particulier, eindsprint en diner
- `tussenstand/`: kaart die volloopt, met de echte stand en een voorbeeld van een volle route
- `route/`, `over-warren/`, `contact/`
- `assets/`: gedeelde stijl en scripts, favicon en foto's
- `data.js`: stand van de actie, afgeleid uit HubSpot (zie CLAUDE.md)
- `_redirects`: oude adressen naar de nieuwe pagina's
- `en/`: Engelse versie van alle pagina's
- `src/pages/` + `tools/build.py`: bronnen van de pagina's (NL en EN); bouwen met `python3 tools/build.py`
- `tools/build_route.py`: maakt `assets/route-data.js` uit de GPX-bestanden

Lokaal bekijken: `python3 -m http.server` in deze map en open http://localhost:8000.
