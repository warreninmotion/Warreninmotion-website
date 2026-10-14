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
  het shirt (voor/achter, shirt Warren / shirt meefietsers), volgbus (Mercedes-Benz Citan, zij- en achterkant).
- Stand bijwerken: het `DATA`-blok bovenin het script (sponsors: naam, pakket, km; naam "" = anoniem;
  pelotonEuro = totaal particuliere donaties zónder bedrijven; eindsprint; diner; tenue = shirtplekken met
  status "optie"/"bezet" + sponsor). Zolang DATA leeg is, toont de pagina een fictief voorbeeld (DEMO).

## Sponsormodel (stand 14-10-2026)
- Bedrijven: €20 per km, schuif 10–100 km; >100 km = hoofdsponsor (op aanvraag, bedrag nooit tonen).
- Bij elke sponsoring minimaal 1 dinerplek (€100 p.p., 1 of 2, meer in overleg).
- Shirtplek alleen vanaf 50 km: mouwen €500, achterzakken (3) en buik €250; hoofdsponsor op borst, bovenrug en
  zijkanten. Geen plekken op de broek. Logo staat op shirt Warren, shirts meefietsers en volgbus.
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
- Bedragen van de hoofdsponsor nooit tonen.
