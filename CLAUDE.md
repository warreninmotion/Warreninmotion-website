# Warren in Motion: website (warreninmotion.nl)

Statische website voor de fietstocht van Warren van der Ploeg: Lucca (IT) → Veenendaal, 15–22 mei 2027,
1.576 km (GPX) door 7 landen, voor Voedselbanken Nederland. Marketing rekent met 1.500 km en €20 per km
(hoofddoel €30.000; doel 1 €7.500, doel 2 €15.000).

## Hosting
- GitHub: warreninmotion/warreninmotion-website, branch `main`.
- Netlify publiceert `main` automatisch (geen build-stap; gewone HTML/CSS/JS). Domein warreninmotion.nl staat bij TransIP.
- Externe scripts alleen van cdnjs (d3 3.5.17, topojson 1.6.20, datamaps 0.5.9 voor de landkaart); fonts via Google Fonts.

## Huidige inhoud
- `index.html` = pagina "Elke kilometer telt": routekaart die volloopt (bedrijven op volgorde van aanmelding,
  daarachter "het peloton" = particuliere vrienden van de tocht), rekenhulp voor bedrijven, sponsorplekken op
  het echte Owayo-shirt (voor, achter, links, rechts), volgbus (Mercedes-Benz Citan, zij- en achterkant).
- De stand staat in `data.js` (`window.WIM_DATA`). Zolang die leeg is, toont de pagina een fictief voorbeeld (DEMO).

## HubSpot is leidend (BELANGRIJK)
Alles over sponsors, kilometers, dinerplekken, shirtplekken, losse tickets en particuliere donaties staat in
HubSpot, pipeline "Warren in Motion - Partnerships". Hoort een sessie iets nieuws over een sponsor (waar dan
ook), dan wordt het EERST in HubSpot gezet; `data.js` wordt daarna uit HubSpot afgeleid, nooit andersom.

Vast regeltje bovenaan de deal-omschrijving:
- Bedrijf: `km: 50 | diner: 1 | shirt: geen | anoniem: nee`
  - shirt-waarden: geen, open, hoofd, borst1, borst2, borst3, rug1, rug2, zak1, zak2, zak3, mouwL1, mouwL2, mouwR1, mouwR2
- Deal "Peloton – particuliere vrienden": `type: peloton`; bedrag (amount) = totaal particuliere donaties zonder bedrijven.
- Deal "Eindsprint en diner – losse tickets": `type: tickets | eindsprint: N | diner: N`.

Afleiden van `data.js`:
- sponsors: bedrijfsdeals in fase Closed Won, gesorteerd op sluitdatum (oud → nieuw); name = bedrijfsnaam
  (leeg als anoniem: ja); km uit het regeltje; pakket = "Vrije kilometers · €<km×20>" (hoofdsponsor: "Hoofdsponsor").
- pelotonEuro = bedrag van de peloton-deal. eindsprint = uit de tickets-deal.
- diner = som van `diner` over Closed Won bedrijfsdeals + `diner` uit de tickets-deal.
- tenue: shirt-waarde van een Closed Won deal → { status: "bezet", sponsor: naam }; van een open deal (niet Closed Lost) → { status: "optie" }.
- updated = datum van vandaag ("14 oktober 2026"). Alleen committen en pushen als er echt iets verandert.

## Sponsormodel (stand 14-10-2026)
- Bedrijven: €20 per km, schuif 10–100 km; >100 km = hoofdsponsor (op aanvraag, bedrag nooit tonen).
- Bij elke sponsoring minimaal 1 dinerplek (€100 p.p., 1 of 2, meer in overleg).
- Shirtplek alleen vanaf 50 km, op het echte Owayo-ontwerp (foto's in `img/shirt-*.webp`, vier kanten):
  geel = hoofdsponsor (borst, bovenrug, beide zijkanten); 12 grijze plekken: 3 balken voor en 2 balken rug €500,
  3 achterzakken en 4 mouwvlakken (2 per mouw) €250 (voorstel 14-10-2026, nog niet bevestigd door Warren).
  Geen plekken op de broek. Logo staat op shirt Warren, shirts meefietsers en volgbus.
- Eindsprint za 22 mei 2027, Den Bosch → Veenendaal (~50 km), max 50 plekken, €150 = meefietsen + officieel
  shirt + diner/cheque/feest. Alleen diner €100.
- Facturatie via Stichting Warren in Motion (in oprichting). Particulieren doneren via
  https://www.kominactievoordevoedselbank.nl/fundraisers/warreninmotion
- Contact op de site: warreninmotion@outlook.com · socials @warreninmotion (Instagram, TikTok, Facebook).
- Echte sponsors: Chiropractie Bennekom, 50 km (km 0–50), 1 dinerplek.

## Huisstijl (brandbook 2.0)
- Kleuren: Dennengroen #1E4034, Zand #F2EEE4, Inkt #14201C, Brons #C08A3E (accent, spaarzaam, nooit als vlak of tekstkleur).
- Type: Playfair Display (koppen), TeX Gyre Heros / Helvetica (tekst).
- Toon: praktisch, direct, warm, concreet, nuchter. Niet belerend of schreeuwerig.
- Monogram nooit natekenen: de SVG-paden in `index.html` (MONO) komen uit het vectorbestand.
- Teksten op de volgbus in het Engels; site in het Nederlands.

## Werkwijze
- Wijzigingen klein houden en na elke wijziging pushen naar `main` (Netlify zet het live).
- Altijd zowel licht als donker thema en telefoonbreedte (~390 px) controleren.
- Alles gelijk houden (VAST, na elke wijziging aan de site, zonder dat Warren erom vraagt):
  1. Artifact "Elke kilometer telt" (https://claude.ai/artifact/WNZQq2xvyEwfRpz45o7yDT) opnieuw publiceren:
     eerst lezen (Artifact read), dan publish met url, file_path `index.html` en files `data.js` + `img/*.webp`.
  2. Sponsorplan in Claude Docs (https://claude.ai/code/artifact/bbac9212-164a-4162-b1b0-2ead9f626499) bijwerken
     als prijzen, plekken of afspraken veranderen; as-of datum bijwerken.
  3. Project-doc `claude/sponsoring/sponsorplan.md` (en zo nodig `werkwijze-sponsors.md`) gelijk trekken.
  4. Sponsorovereenkomst (Claude Docs 2e6a02bc-9d80-45d6-b21f-570494f57c1c) nalopen als prijzen veranderen.
- Bedragen van de hoofdsponsor nooit tonen.
