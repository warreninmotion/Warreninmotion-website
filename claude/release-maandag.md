# Maandagrelease: opdrachtenlijst

Afspraak met Warren (29-10-2026): de site gaat één keer per week live, op **maandagochtend**, samen met de
training-update van de afgelopen week. Alles wat Warren en Claude in de loop van de week besluiten, komt hieronder
als opdracht te staan. De geplande taak "Maandagrelease" voert de lijst uit, zet alles in één keer live
(één merge naar `main` = één Netlify-deploy = 15 credits) en maakt de lijst daarna leeg.

Regels:
- Alleen opdrachten waar Warren ja op heeft gezegd. Twijfel = niet doen, terugvragen.
- Tussendoor nooit naar `main` pushen. Wijzigingen staan op branch `claude/awesome-carson-21ymps`.
- Netlify-credits: 300 per cyclus, vernieuwing op de 13e. Eerste maandagrelease: **16 november 2026**
  (de credits van de cyclus tot 13 november zijn op).

## Open opdrachten (volgende release: maandag 16 november 2026)

1. **Lanceringsvideo van Home af** (besluit Warren 29-10-2026, kost te veel bandbreedte; 7,6 MB per bezoek).
   - `src/pages/home.html` en `src/pages/en/home.html`: de `<video id="lv">` vervangen door een foto, even hoog
     als nu naast de keuzes. Voorlopig `assets/video/lancering-poster.jpg` (als webp naar `assets/img/`), tot er
     een eigen mooie foto is (Warren maakt die; zet hem dan in `shots.js` als plek `home-kop`).
   - Knop "Geluid aan" en de videologica in `assets/home.js` weghalen; op mobiel schuift nu de foto mee.
   - `assets/video/lancering.mp4` uit de repo verwijderen (de poster blijft als foto).
   - CLAUDE.md (sectie Home en Pagina's) bijwerken.
2. **Training: alle ontbrekende weken** (vanaf week 44) uit Strava, volgens de werkwijze in CLAUDE.md (Training).
3. **Werkafspraak in CLAUDE.md** (staat al op de branch): maandagrelease in plaats van "na elke wijziging pushen".

## Ideeën, nog niet besloten (niet uitvoeren)

- Overige video's lichter maken (`training.mp4` 3,7 MB, `home-pedalen.mp4` 2,1 MB) en pas laden als ze in beeld komen.
- `netlify.toml` met een ignore-regel, zodat een commit met alleen CLAUDE.md of `claude/` geen deploy kost.

## Gedaan

(De geplande taak zet hier per release de datum en wat er live ging.)
