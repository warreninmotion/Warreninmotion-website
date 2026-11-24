# Maandagrelease: opdrachtenlijst

Afspraak met Warren (29-10-2026): de site gaat één keer per week live, op **maandagochtend**, samen met de
training-update van de afgelopen week. Alles wat Warren en Claude in de loop van de week besluiten, komt hieronder
als opdracht te staan. De geplande taak "Maandagrelease" voert de lijst uit, zet alles in één keer live
(één merge naar `main` = één Netlify-deploy = 15 credits) en maakt de lijst daarna leeg.

Regels:
- Alleen opdrachten waar Warren ja op heeft gezegd. Twijfel = niet doen, terugvragen.
- Tussendoor nooit naar `main` pushen. Wijzigingen staan op branch `claude/awesome-carson-21ymps`.
- Netlify-credits: 300 per cyclus, vernieuwing op de 15e. Eerste maandagrelease: **16 november 2026**
  (de credits van de cyclus tot 13 november zijn op).

## Open opdrachten (volgende release: maandag 30 november 2026)

1. **Training:** de week van 23 t/m 29 november uit Strava (week 48; de rit van ma 23-11 hoort daarbij).
2. **Meefietsen: alleen nog de testinzending.** De pagina staat al live (zie Gedaan, 23-11): de branch
   `claude/meefietsen-diner` NIET opnieuw mergen. Wat rest: één testinzending per taal in Netlify Forms
   (/meefietsen/ en /en/ride-along/), nakijken dat ze binnenkomen en daarna verwijderen.

## Ideeën, nog niet besloten (niet uitvoeren)

- Overige video's lichter maken (`training.mp4` 3,7 MB, `home-pedalen.mp4` 2,1 MB) en pas laden als ze in beeld komen.
- `netlify.toml` met een ignore-regel, zodat een commit met alleen CLAUDE.md of `claude/` geen deploy kost.

## Gedaan

(De geplande taak zet hier per release de datum en wat er live ging.)

- **24-11-2026** (handmatig door Hendricus, op verzoek van Warren: de release van ma 23-11 was niet gedaan; één deploy):
  - Training: week 47 (16 t/m 22 november, ziekteweek) uit Strava: 1 rit van 17,7 km (trainer, 28% Z1 / 72% Z2),
    1× HIIT 88 min, 1× padel 125 min, 2.058 kcal. Totaal nu 1.283,6 km, 48 trainingen, 72 uur, 43.133 kcal,
    1.275 hoogtemeters; weetje trainingen aangepast ("Bijna elke dag een training"), de rest klopt nog.
  - Verwachte aankomst in Veenendaal nu **tussen 14:00 en 15:00** (voorlopig, onder voorbehoud) en vertrek uit Den Bosch
    rond 12:00 (besluit Warren 24-11): op Meefietsen, Doneren (blok Eindsprint) en De route, in NL en EN; CLAUDE.md bijgewerkt.
    Eerder stond overal rond 18:00 na de prijsuitreiking.
- **23-11-2026, 07:54** (handmatig door Hendricus, ja Warren 23-11 07:50: pagina live vóór het persbericht van di 24-11;
  kostte een eigen deploy, los van de maandagrelease van 08:37):
  - Meefietsen-pagina en doelenladder (PR #12) met "alleen het diner" (drie keuzes) en de Bikebear-kopfoto op Home,
    via PR #13 (`claude/meefietsen-diner` → `main`).
  - Op productie gecontroleerd 07:55: /meefietsen/ en /en/ride-along/ geven 200, /meefietsen en /eindsprint sturen door,
    bedankpagina en `assets/meefietsen.js` 200, formulier door Netlify herkend, Home en Doneren linken naar de pagina
    (Doneren "alleen het diner" naar `?keuze=diner#aanmelden`), nieuwe kopfoto op Home.
- **16-11-2026** (handmatig door Hendricus; de geplande run van 08:37 zette niets klaar):
  - Training: weken 44, 45 en 46 uit Strava, weetjes vernieuwd (totaal 1.265,9 km, 45 trainingen).
  - Home: lanceringsvideo vervangen door een foto (`assets/img/home-kop.webp`); `lancering.mp4` verwijderd.
  - CLAUDE.md: werkafspraak maandagrelease, sectie Home, credits vernieuwen op de 15e.
