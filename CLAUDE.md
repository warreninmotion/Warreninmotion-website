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
- Nederlands op `/`, Engels onder `/en/`: `/en/sponsor/`, `/en/donate/`, `/en/progress/`, `/en/route/`, `/en/training/`,
  `/en/about/`, `/en/contact/`. De taalknop in de kop wisselt naar dezelfde pagina in de andere taal.
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
  Enige uitzondering: Google Analytics (googletagmanager.com), en alleen na "ja" in de cookiemelding.

## Pagina's en bestanden
- Opbouw naar bezoeker: Home (`index.html`) is de landingspagina met twee keuzes: "Ik ben een bedrijf → Ik wil
  sponsoren" (`sponsoren/`) en "Ik ben particulier → Ik wil doneren" (`doneren/`, met daarin de eindsprint en het
  diner onder `#eindsprint`). Verder `tussenstand/`, `route/`, `over-warren/`, `contact/`.
- Menu (van links naar rechts, in leesvolgorde): Over Warren · De route · Training · Doneren · Sponsoren · Tussenstand ·
  Contact, plus taalknop met vlaggetje (🇬🇧 EN op Nederlandse pagina's, 🇳🇱 NL op Engelse; inline SVG in `tools/build.py`).
  Doneren en Sponsoren staan als groene knop in het menu (`CTA` in `tools/build.py`).
- Home: groene band bovenaan (kop "Ruim 1.500 km fietsen voor de voedselbank", twee keuzes: Sponsor kilometers /
  Doneer en rij mee, lanceringsvideo even hoog ernaast), daaronder kerncijfers, kaart met citaat van Warren
  (concept, door Warren te bevestigen) en Wie/Route/Voedselbank, en de tussenstand.
- Sponsoren: blok "Zij rijden al mee" rechts naast de kop (niet als band eronder): slider met één logo tegelijk
  (sponsors uit `data.js`, niet anoniem; logo's uit `logos.js` → `assets/logos/`, op wit; zonder logo de naam als
  woordmerk), laatste dia "Jouw bedrijf hier?". Ook zo in het artifact.
- Over Warren loopt als verhaal: wie hij is (met foto) → hoe het begon (drie drijfveren) → dat verhaal zit in het
  logo (animatie + vijf stappen) → groene band "Waarom fietst Warren 1.570 km?" met door naar Training en de route.
- Evenementen in `events.js` (`WIM_EVENTS`): op de Training-pagina in de weekkalender en als blok "Evenementen";
  samenwerkingen met bedrijven krijgen `partner` (zichtbaarheid). Omloop van Zandvoort 21 maart 2027 is onder voorbehoud.
  Week 16 (april 2027): Warren rijdt met de auto terug en fietst onderweg de zwaarste klim, de Lukmanierpas (niet de hele route).
- `_redirects` (Netlify) stuurt de oude adressen `/elke-kilometer-telt/` en `/eindsprint/` door.
- `assets/site.css` = huisstijl en gedeelde onderdelen; `assets/site.js` = monogram, menu, kopieerknoppen,
  stand op Home, peloton en eindsprint op Doneren, en vaste gegevens (`WIM_SITE`: mail, doneerlink, `liveUrl`
  voor Garmin LiveTrack, doelen).
- De route: links een grote kaart die stilstaat (vast blok naast het etappevak, geen meescrollende kaart). Kies je een
  etappe, dan zoomt de kaart in, wordt hij kleiner en verschijnen de beklimmingen eronder; een klim aanklikken
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
- Contact op de site: warreninmotion@outlook.com · socials: Instagram @warreninmotion, TikTok @warren.in.motion
  (https://www.tiktok.com/@warren.in.motion). Facebook voorlopig niet tonen (account op Warrens naam, pagina nog leeg).
  In de voet staan Instagram en TikTok als ronde icoonknoppen (`SOC`/`ICON` in `tools/build.py`).
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

## Training (`training/`, `/en/training/`)
- Trainingslog uit Strava (Strava-koppeling) vanaf de week van de lancering (week 41, 2026); de vakantie daarvoor
  hoort er niet in. Elke week een nieuwe week bovenaan in `training.js` (`window.WIM_TRAINING`): ritten (soort, km,
  duur, hoogtemeters, binnen/buiten, tijd per hartslagzone uit de hartslagstream, Strava-zones Z1–Z5), overige
  training (HIIT, hardlopen, wandelen), kcal (Strava) en een kort blogje van Warren (ik-vorm, NL en EN).
- Pagina (`assets/training-page.js`, `assets/training.css`):
  1. Kop: tekst en totaalblok links, rechts de 360-video, precies even hoog (boven- en onderkant gelijk); video
     `assets/video/training.mp4` zonder geluid, speelt vanzelf als hij in beeld is (niet bij "minder beweging").
     Het totaal sinds de lancering is een slider: km (met de route en "op de route zou
     Warren nu in etappe X zijn"), trainingen, uren, kcal en hoogtemeters (alleen als > 0).
  2. Onder elk totaal een weetje (`weetjes` in `training.js`). Elke week vernieuwen zodat het past bij de nieuwe
     totalen (bv. km → "dat is van Veenendaal naar Parijs"). Afstanden en feiten kloppen, niet overdrijven.
  3. Weekkalender: alle weken van de lancering tot de tocht (week 19, 2027); de laatste week met data staat open,
     eerdere weken terug te kijken. Toekomstige weken tonen het geplande schema (`plan` in `training.js`: fasen met
     richtlijn-km en focus, lichtere weken ±60%); aanklikken toont het schema-overzicht. Tochtweek in brons.
     `#week-41` opent een week. Het schema is een CONCEPT van 15-10-2026, nog door Warren te bevestigen.
  4. Per week het weekverhaal (staande 9:16-story: weekcijfers, foto's/video's, zones, ritten, citaat, voortgang)
     en het verslag met de ritten.
- Foto's en video's per week: `media: [{ type: "foto"|"video", src, alt, altEn, cap, capEn, poster }]` in de week;
  bestanden in `assets/training/` (foto's webp, max. 1080 px breed; video mp4 H.264, zonder geluid, max. 15 s en
  ±3 MB, met poster).
- Weken lopen ma–zo (ISO-week); alleen afgeronde weken. Ritten op lengte sorteren, niet op volgorde.
- Alleen weekcijfers delen (intern, niet op de site vermelden): nooit datum, dag of tijdstip per training, geen
  routes, kaarten, GPS of plaatsnamen, geen ruwe hartslagwaarden; ook niet herkenbaar in foto's of video's.

## Statistiek (Google Analytics 4, gratis)
- `WIM_SITE.gaId` in `assets/site.js` = GA4-meet-ID: G-PW3QDXVHXW (property warreninmotion.nl, aangemaakt 16-10-2026).
  Leeg = geen statistiek en geen cookiemelding. Het artifact krijgt nooit GA (`build_artifact.py` maakt gaId leeg).
- Cookiemelding "Koekje erbij?" (onderaan, groen/inkt; tekst: Warren verbrandt ruim 60.000 kcal = zo'n 1.250 koekjes (8 × (2.600 rust + 8 u × 650 zone 2)), "Eentje voor jou?"): GA laadt pas na "Ja, koekje erbij"; keuze in localStorage
  `wim-cookies`; in de voet "Cookie-instellingen" om te wijzigen. Elke klik op link/knop = GA-gebeurtenis "klik"
  (knop, pagina).
- Warren wil elke vrijdag een rapport: bezoekers, gemiddelde bezoektijd, populairste pagina's, gebruikte knoppen en
  vooral wat niet gebruikt wordt. Daarvoor: GA4 Data API met een serviceaccount (sleutel als geheime instelling van
  de omgeving), daarna een geplande taak op vrijdag.
  - Property-ID 559326726. Serviceaccount `claude-rapport` (Google Cloud-project "Warren in Motion API", Analytics
    Data API aan), rol Lezer op de property. Sleutel als netwerkgeheim "GCP access token (with Service Account Key)" voor analyticsdata.googleapis.com
    (scope analytics.readonly; de proxy zet het token erbij), nooit in chat of repo.
  - Rapport: `python3 tools/ga_report.py [dagen]` (Markdown: bezoekers, bezoektijd, pagina's, knoppen, niet bezocht /
    niet geklikt, kanalen, apparaat, plaatsen). Knoppen vereisen aangepaste dimensies `knop` en `pagina` (gebeurtenis) in GA4.
  - Geplande taak "Vrijdagrapport website" (trig_01PT5QgfSWgEJ7LcXpKPmf8B): elke vrijdag 07:53 (Amsterdam), nieuwe sessie,
    alleen rapport (geen wijzigingen aan de site), melding via push en e-mail.
- Privacyverklaring op `/privacy/` en `/en/privacy/` (link in de voet en in de cookiemelding): cookies `_ga` en
  `_ga_PW3QDXVHXW` (2 jaar), gegevensbewaring 14 maanden, Google-signalen uit, gedetailleerde locatie- en apparaatgegevens aan (plaats, telefoon/computer). Kies je later "nee", dan wist de site
  de _ga-cookies. Verander je iets aan GA-instellingen, werk de verklaring bij (beide talen, datum).

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

## Beelden (vervangbeelden en beeldlijst)
- Waar een echte foto of video van Warren moet komen staat `<figure class="ph" data-shot="id">`. `shots.js`
  (`WIM_SHOTS`) beschrijft per plek: soort (foto/video), verhouding (bepaalt staand of liggend), wat erop moet en een
  tip. Zonder `src` toont de site het vaste vervangbeeld `assets/img/placeholder.webp` (vervaagd, groen) met rechtsonder
  nummer, soort, staand/liggend en wat er nodig is. Met `src` verschijnt het echte beeld.
- Overzicht voor Warren: `/beeldlijst/` (intern, niet in het menu, noindex).
- Vraag alleen beelden die nu te maken zijn: het Warren in Motion-shirt en de beplakte volgbus bestaan pas als de
  sponsors er zijn en betaald hebben. Dus geen foto's "in het shirt" of "met de bus".
- De route: foto van de Piazza dell'Anfiteatro (startplek) bovenaan (`assets/img/lucca-anfiteatro.webp`, aangeleverd door
  Warren; 900 px breed, bij voorkeur vervangen door een grotere of eigen foto).
- Tussenstand ("Elke kilometer telt"): sfeerbeeld van een bergweg met haarspeldbochten naast de kop
  (`assets/img/bergweg.webp`, rechtenvrij, aangeleverd door Warren). Het is géén plek op de route: nooit als zodanig benoemen.
- Training: een training kan uit blokken bestaan (`blokken` in een rit, bv. 2× 50 km op één dag); de site telt dat als
  één training en laat de blokken met een pauze ertussen zien, met de uitleg dat etappes in mei ook in blokken gaan.
- Niet benadrukken dat geld "niet via Warren" of "rechtstreeks" gaat: dat wekt juist wantrouwen. Gewoon: "gaat naar
  Voedselbanken Nederland".
- Nergens ontspanning suggereren (geen "bijkomen", "uitrusten", "rustig aan", "genieten", "ontspannen", geen "nachten
  slapen"): de tocht is een zware fysieke uitputtingsslag en dat verdient donaties. Stops zijn om te eten en voor
  sanitaire stops. Slaap heet "noodzakelijk slaapblok", altijd vanuit veiligheid (verkeer, scherpte in de afdalingen,
  reactievermogen bij onverwachte situaties). In het schema heet een rustweek "lichtere week"; Z1 heet "opwarmen".
- Geen grote nullen tonen ("0 aangemeld", "€0"): bij een lege stand een uitnodigende zin.

## Ontwerpregels (tegen het "AI-gevoel")
- Geen pijltjes (→) achter knoppen en links; links zijn onderstreept (`.more`). Het pijltje alleen in "Lucca → Veenendaal".
- Eyebrows (labels boven koppen) spaarzaam en in gewone kleine letters, niet in hoofdletters met spatiëring.
- Niet alles in beige kaartjes: liever volle groene banden, echte foto's/video en witruimte. Kaartjes alleen waar ze iets
  afbakenen (rekenhulp, weekpaneel).
- Echte stem: citaten en teksten van Warren zelf in plaats van uitleg over Warren.
- Strak uitlijnen: tekst naast een beeld of blok altijd verticaal centreren (align-items:center); staande beelden
  naast korte tekst klein houden (±300 px breed). Is één kolom veel langer (rekenhulp naast het shirt), dan blijft de
  kortere kolom met position:sticky in beeld in plaats van een leeg vlak.
