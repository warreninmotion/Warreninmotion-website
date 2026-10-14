# Warren in Motion website

Statische site voor warreninmotion.nl, gehost via Netlify (geen build-stap).

- `index.html`: Home
- `route/`: De route (8 etappes, kaart)
- `elke-kilometer-telt/`: routekaart die volloopt, rekenhulp, shirt en volgbus
- `eindsprint/`: Eindsprint & diner
- `over-warren/`, `contact/`
- `assets/`: gedeelde stijl (`site.css`), scripts (`site.js`, `route.js`), favicon en foto's
- `data.js`: stand van de actie, afgeleid uit HubSpot (zie CLAUDE.md)

Lokaal bekijken: `python3 -m http.server` in deze map en open http://localhost:8000.
