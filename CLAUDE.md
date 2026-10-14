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
  daling (drempel 2 m, komt overeen met Garmin). Niet met de hand aanpassen; bij een nieuwe GPX opnieuw genereren.
  Etappenamen, data en teksten staan in `assets/route.js` (STAGES). ROUTE_KM = 1.570 (afgerond).
- Km per etappe: 233,2 · 194,5 · 197,3 · 208,4 · 198,7 · 225,2 · 198,6 · 113,8. Totale stijging ±9.560 m.
- Hoogste punt: Lukmanierpas, officieel 1.915 m (de GPX piekt op 1.965 m door het hoogtemodel; toon 1.915).
- Eindsprint Den Bosch → Veenendaal is volgens de GPX ±54 km; in tekst "ruim 50 km".
- Matchingcampagne (hoofdsponsor verdubbelt particuliere donaties) is het doel, in overleg, niet bevestigd:
  alleen zo noemen.
- De pitch (Warren_in_Motion_Pitch_6.pptx) is verouderd wat route, data en doelen betreft; de site is leidend.

## Hosting
- GitHub: warreninmotion/warreninmotion-website, branch `main`.
- Netlify publiceert `main` automatisch (geen build-stap; gewone HTML/CSS/JS). Domein warreninmotion.nl staat bij TransIP.
- Externe scripts alleen van cdnjs (d3 3.5.17, topojson 1.6.20, datamaps 0.5.9 voor de landkaart); fonts via Google Fonts.

## Pagina's en bestanden
- Opbouw naar bezoeker: Home (`index.html`) is de landingspagina met twee keuzes: "Ik ben een bedrijf → Ik wil
  sponsoren" (`sponsoren/`) en "Ik ben particulier → Ik wil doneren" (`doneren/`, met daarin de eindsprint en het
  diner onder `#eindsprint`). Verder `tussenstand/`, `route/`, `over-warren/`, `contact/`.
- Menu: Sponsoren · Doneren · Tussenstand · De route · Over Warren · Contact. Kop, menu en voet staan in elke
  pagina hetzelfde; wijzig ze op alle zeven pagina's tegelijk.
- `_redirects` (Netlify) stuurt de oude adressen `/elke-kilometer-telt/` en `/eindsprint/` door.
- `assets/site.css` = huisstijl en gedeelde onderdelen; `assets/site.js` = monogram, menu, kopieerknoppen,
  stand op Home, peloton en eindsprint op Doneren, en vaste gegevens (`WIM_SITE`: mail, doneerlink, `liveUrl`
  voor Garmin LiveTrack, doelen).
- De route: kaart links blijft staan en zoomt in op de gekozen etappe; rechts een scrollvak met de etappes. Een etappe
  openklappen toont het hoogteprofiel gekleurd naar helling (<3, 3–6, 6–9, 9–12, >12%) en de beklimmingen
  (berekend uit de GPX: >= 1 km, gem. >= 3%, >= 80 m; categorie volgens de Strava-formule). Link per etappe: `/route/#dag-3`.
- `assets/route-data.js` + `assets/route.js` = GPS-spoor, etappes, hoogteprofielen, kaartprojectie en landkaart
  (Home, De route, Tussenstand).
- `assets/actie.js` + `actie.css` = kaart die volloopt, kopgroep en peloton, rekenhulp, shirtplekken en volgbus
  (Tussenstand en Sponsoren). Toont `CUR` (standaard de echte stand uit `data.js`).
- Tussenstand heeft twee knoppen: "Echte tussenstand" (standaard) en "Zo ziet het eruit als het gelukt is": een
  verzonnen volle route (`FULL` in `tussenstand/index.html`) die zich opbouwt en eindigt met confetti. Het
  voorbeeld speelt nooit vanzelf af en staat altijd gemarkeerd als verzonnen. Geen fictief voorbeeld elders.
- Links altijd absoluut (`/route/`, `/assets/...`); lokaal testen met `python3 -m http.server` in de repo-root.
- De stand staat in `data.js` (`window.WIM_DATA`).

## HubSpot is leidend (BELANGRIJK)
Alles over sponsors, kilometers, dinerplekken, shirtplekken, losse tickets en particuliere donaties staat in
HubSpot, pipeline "Warren in Motion - Partnerships". Hoort een sessie iets nieuws over een sponsor (waar dan
ook), dan wordt het EERST in HubSpot gezet; `data.js` wordt daarna uit HubSpot afgeleid, nooit andersom.

Vast regeltje bovenaan de deal-omschrijving:
- Bedrijf: `km: 50 | diner: 1 | shirt: geen | anoniem: nee`
  - shirt-waarden: geen, open, hoofd, mouwL, mouwR, zak1, zak2, zak3, buik
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
- Shirtplek alleen vanaf 50 km: mouwen €500, achterzakken (3) en buik €250; hoofdsponsor op borst, bovenrug en
  zijkanten. Geen plekken op de broek. Logo staat op shirt Warren, shirts meefietsers en volgbus.
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

## Werkwijze
- Wijzigingen klein houden en na elke wijziging pushen naar `main` (Netlify zet het live).
- Altijd zowel licht als donker thema en telefoonbreedte (~390 px) controleren.
- Bedragen van de hoofdsponsor nooit tonen.
