# Warren in Motion: website (warreninmotion.nl)

Statische website voor de fietstocht van Warren van der Ploeg: Lucca (IT) → Veenendaal, 15–22 mei 2027,
1.570 km (GPX: 1.569,6 km) in 8 etappes door 7 landen, voor Voedselbanken Nederland. €20 per km
(hoofddoel €30.000; doel 1 €7.500, doel 2 €15.000).

## 1.500 km is de hook, de site toont echte data (BELANGRIJK)
- "1.500 km" is het marketinggetal (social media, slogans, volgbus). Op de site mag het in koppen en lopende
  tekst als "ruim 1.500 km".
- Overal waar de site data toont, staan de echte cijfers: 1.570 km, km en hoogtemeters per etappe, de kaart die volloopt,
  sponsorbedragen, straks de Garmin LiveTrack-link. Nooit schalen naar 1.500.
- Bedragen van de hoofdsponsor blijven verborgen.

## De tocht
- Start za 15 mei 2027, Piazza dell'Anfiteatro, Lucca (tijd nog niet bekend).
- Finish za 22 mei 2027, Veenendaal, verwacht rond 18:00 na de prijsuitreiking van Veenendaal–Veenendaal
  (pending: op de site altijd "onder voorbehoud").
- Bron van de route: de 8 GPX-bestanden uit Strava (etappe 5 = optie A, wijnroute met klim, 198,7 km).
  `assets/route-data.js` (`WIM_ROUTE`) is daaruit gegenereerd: spoor, km per etappe, hoogteprofiel, stijging en
  daling (drempel 2 m, komt overeen met Garmin). Niet met de hand aanpassen; bij een nieuwe GPX opnieuw genereren met
  `python3 tools/build_route.py assets/route-data.js etappe1.gpx … etappe8.gpx`.
  Etappenamen, data en teksten staan in `assets/route.js` (STAGES). ROUTE_KM = 1.570 (afgerond).
- Km per etappe: 233,2 · 194,5 · 197,3 · 208,4 · 198,7 · 225,2 · 198,6 · 113,8. Totale stijging ±9.560 m.
- Hoogste punt: Lukmanierpas, officieel 1.915 m (de GPX piekt op 1.965 m door het hoogtemodel; toon 1.915).
- Eindsprint Den Bosch → Veenendaal is volgens de GPX ±54 km; in tekst "ruim 50 km".
- Matchingcampagne (hoofdsponsor verdubbelt particuliere donaties) is het doel, in overleg, niet bevestigd:
  alleen zo noemen.
- De pitch (Warren_in_Motion_Pitch_6.pptx) is verouderd wat route, data en doelen betreft; de site is leidend.

## Talen en opbouw (BELANGRIJK)
- Nederlands op `/`, Engels onder `/en/`: `/en/sponsor/`, `/en/donate/`, `/en/progress/`, `/en/route/`, `/en/about/`,
  `/en/contact/`. De taalknop in de kop wisselt naar dezelfde pagina in de andere taal.
- De pagina's worden gebouwd. Bronnen: `src/pages/<pagina>.html` (NL) en `src/pages/en/<pagina>.html` (EN). Daarna
  `python3 tools/build.py` (repo-root): dat zet kop, menu, taalknop en voet eromheen en schrijft alle `index.html`.
  Pas nooit de gegenereerde `index.html`-bestanden zelf aan; kop en voet staan in `tools/build.py`.
- Teksten in scripts zijn tweetalig via `t("nederlands", "English")`; links via `L("/route/")` (geeft het EN-adres op
  Engelse pagina's); getallen via `nl()`/`fmt()` in de notatie van de taal; datums uit data.js via `WIM_DATE()`.
- Verander je een tekst, doe het dan altijd in beide talen.
- Paginascripts: `assets/home.js`, `assets/route-page.js`, `assets/tussenstand.js` (gedeeld door NL en EN).

## Schrijfstijl
- Lezers: particulieren en ondernemers. Doel: een positief gevoel en zin om mee te doen.
- Actief en direct, spreek de lezer aan met "je" ("Rij mee", "Kies je kilometers"). Warm, concreet en nuchter
  (brandbook): geen schreeuwerige superlatieven, niet belerend. Korte zinnen, eerst wat de lezer eraan heeft.
- Engels: dezelfde toon, Brits Engels (kilometres, colour), "the Dutch Food Banks" voor Voedselbanken Nederland.

## Hosting
- GitHub: warreninmotion/warreninmotion-website, branch `main`.
- Netlify publiceert `main` automatisch (geen build-stap; gewone HTML/CSS/JS). Domein warreninmotion.nl staat bij TransIP.
- Externe scripts alleen van cdnjs (d3 3.5.17, topojson 1.6.20, datamaps 0.5.9 voor de landkaart); fonts via Google Fonts.

## Pagina's en bestanden
- Opbouw naar bezoeker: Home (`index.html`) is de landingspagina met twee keuzes: "Ik ben een bedrijf → Ik wil
  sponsoren" (`sponsoren/`) en "Ik ben particulier → Ik wil doneren" (`doneren/`, met daarin de eindsprint en het
  diner onder `#eindsprint`). Verder `tussenstand/`, `route/`, `over-warren/`, `contact/`.
- Menu: Sponsoren · Doneren · Tussenstand · De route · Over Warren · Contact, plus taalknop NL | EN.
- `_redirects` (Netlify) stuurt de oude adressen `/elke-kilometer-telt/` en `/eindsprint/` door.
- `assets/site.css` = huisstijl en gedeelde onderdelen; `assets/site.js` = monogram, menu, kopieerknoppen,
  stand op Home, peloton en eindsprint op Doneren, en vaste gegevens (`WIM_SITE`: mail, doneerlink, `liveUrl`
  voor Garmin LiveTrack, doelen).
- De route: links een kleinere kaart die zoomt op de gekozen etappe, met daaronder de beklimmingen; een klim aanklikken
  toont op de plek van de kaart het klimprofiel (per 100 m gekleurd, % per km). Rechts een scrollvak met de etappes;
  openklappen toont het hoogteprofiel gekleurd naar helling (<3, 3–6, 6–9, 9–12, >12%) en de beklimmingen
  (berekend uit de GPX: >= 1 km, gem. >= 3%, >= 80 m; categorie volgens de Strava-formule). Link per etappe: `/route/#dag-3`.
- `assets/route-data.js` + `assets/route.js` = GPS-spoor, etappes, hoogteprofielen, kaartprojectie en landkaart
  (Home, De route, Tussenstand).
- `assets/actie.js` + `actie.css` = kaart die volloopt, kopgroep en peloton, rekenhulp, shirtplekken op het
  echte Owayo-shirt (foto's voor, achter, links, rechts; plekken in procenten van de foto in `KIT`) en volgbus
  (Tussenstand en Sponsoren). Toont `CUR` (standaard de echte stand uit `data.js`).
- Tussenstand heeft twee knoppen: "Echte tussenstand" (standaard) en "Zo ziet het eruit als het gelukt is": een
  verzonnen volle route (`FULL` in `tussenstand/index.html`) die zich opbouwt en eindigt met confetti. Het
  voorbeeld speelt nooit vanzelf af en staat altijd gemarkeerd als verzonnen. Verder alleen in het artifact (daar lopen
  ook shirt en volgbus mee vol); geen fictief voorbeeld elders op de site.
- Links altijd absoluut (`/route/`, `/assets/...`); lokaal testen met `python3 -m http.server` in de repo-root.
- De stand staat in `data.js` (`window.WIM_DATA`).

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
- Shirtplek alleen vanaf 50 km, op het echte Owayo-ontwerp (foto's in `assets/img/shirt-*.webp`, vier kanten):
  geel = hoofdsponsor (borst, bovenrug, beide zijkanten); 12 grijze plekken: 3 balken voor en 2 balken rug €500,
  3 achterzakken en 4 mouwvlakken (2 per mouw) €250 (voorstel 14-10-2026, nog niet bevestigd door Warren).
  Geen plekken op de broek. Logo staat op shirt Warren, shirts meefietsers en volgbus.
- Eindsprint za 22 mei 2027, Den Bosch → Veenendaal (ruim 50 km, GPX ±54 km), max 50 plekken, €150 = meefietsen + officieel
  shirt + diner/cheque/feest. Alleen diner €100.
- Facturatie via Stichting Warren in Motion (in oprichting). Particulieren doneren via
  https://www.kominactievoordevoedselbank.nl/fundraisers/warreninmotion
- Contact op de site: warreninmotion@outlook.com · socials @warreninmotion (Instagram, TikTok, Facebook).
- Echte sponsors: Chiropractie Bennekom, 50 km (km 0–50), 1 dinerplek.

## Huisstijl (brandbook 2.0)
- Kleuren: Dennengroen #1E4034, Zand #F2EEE4, Inkt #14201C, Brons #C08A3E (accent, spaarzaam, nooit als vlak of tekstkleur).
- Type: Playfair Display (koppen), TeX Gyre Heros / Helvetica (tekst).
- Toon: praktisch, direct, warm, concreet, nuchter. Niet belerend of schreeuwerig.
- Monogram nooit natekenen: de SVG-paden in `assets/site.js` (`WIM_MONO`) komen uit het vectorbestand.
- Teksten op de volgbus in het Engels; site in het Nederlands.
- Volgbus (Mercedes-Benz Citan): foto's zonder achtergrond (`assets/img/bus-zij.webp`, `bus-achter.webp`, uit de
  Mercedes-configurator; vervangen door eigen foto's zodra de bus er is) met de magneetpanelen en het kenteken
  "Warren in Motion" als SVG erover (`drawBus` in `assets/actie.js`).

## Home
- De lanceringsvideo (`assets/video/lancering.mp4`, 7,6 MB) speelt vanzelf zonder geluid zodra hij in beeld is, in een lus;
  geluid alleen via de knop "Geluid aan". Geen autoplay bij "minder beweging".

## Werkwijze
- Wijzigingen klein houden en na elke wijziging pushen naar `main` (Netlify zet het live).
- Altijd zowel licht als donker thema en telefoonbreedte (~390 px) controleren.
- Alles gelijk houden (VAST, na elke wijziging aan de site, zonder dat Warren erom vraagt):
  1. Artifact "Elke kilometer telt" (https://claude.ai/artifact/WNZQq2xvyEwfRpz45o7yDT): de sponsorpagina waarmee
     Warren werft tot de website klaar is (kaart die volloopt, kopgroep en peloton, rekenhulp, shirt, volgbus,
     hoofdsponsor, kort iets voor particulieren). Bron `src/artifact/index.html`; scripts, stijl, data en foto's komen
     uit de site. Bouwen met `python3 tools/build_artifact.py <scratchpad>/art` en publiceren met Artifact (eerst read,
     dan publish met url, file_path `<map>/index.html`, root `<map>`, files = de lijst die het script print). Opnieuw
     publiceren na elke wijziging aan sponsoren, shirt, bus, rekenhulp of `data.js`. Teksten gelijk houden met
     `src/pages/sponsoren.html`.
  2. Sponsorplan in Claude Docs (https://claude.ai/code/artifact/bbac9212-164a-4162-b1b0-2ead9f626499) bijwerken
     als prijzen, plekken of afspraken veranderen; as-of datum bijwerken.
  3. Project-doc `claude/sponsoring/sponsorplan.md` (en zo nodig `werkwijze-sponsors.md`) gelijk trekken.
  4. Sponsorovereenkomst (Claude Docs 2e6a02bc-9d80-45d6-b21f-570494f57c1c) nalopen als prijzen veranderen.
- Bedragen van de hoofdsponsor nooit tonen.
