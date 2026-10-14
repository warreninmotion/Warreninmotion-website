// Tussenstand: echte stand, of een voorbeeld van een volle route dat zich opbouwt en eindigt met confetti.
// Het voorbeeld is verzonnen en staat alleen hier; de echte stand komt uit data.js.
const FULL = {
  pelotonEuro: (ROUTE_KM - 1200) * 20, eindsprint: 50, diner: 100,
  tenue: {
    hoofd: { status: "bezet", sponsor: "Bouwbedrijf Hendriks" },
    mouwL: { status: "bezet", sponsor: "Accountantskantoor De Vries" },
    mouwR: { status: "bezet", sponsor: "Transport Van Dijk" },
    zak1: { status: "bezet", sponsor: "Sportschool Kracht" },
    zak2: { status: "bezet", sponsor: "Installatietechniek Bosman" },
    zak3: { status: "bezet", sponsor: "IT-bureau Bitwerk" },
    buik: { status: "bezet", sponsor: "Makelaardij Het Erf" },
  },
  sponsors: [
    ["Bakkerij De Korenschoof", 60], ["Fietsenmakerij Van Rijn", 25], ["Bouwbedrijf Hendriks", 100, "Hoofdsponsor"],
    ["Studio Lijn & Vlak", 20], ["Kapsalon Knipwerk", 15], ["", 75], ["Installatietechniek Bosman", 50],
    ["Bloemenhuis De Tuinkamer", 10], ["Accountantskantoor De Vries", 50], ["Koffiebar Het Hoekje", 20],
    ["Garage Van Ommeren", 40], ["Fysiopraktijk Soepel", 30], ["Drukkerij Puntgaaf", 25], ["Transport Van Dijk", 100],
    ["Makelaardij Het Erf", 75], ["Hoveniersbedrijf Groen & Zo", 35], ["", 20], ["Schildersbedrijf Kwast", 45],
    ["IT-bureau Bitwerk", 80], ["Restaurant De Gouden Lepel", 50], ["Advocatenkantoor Smit", 60],
    ["Sportschool Kracht", 100], ["Zonnepanelen Oost", 70], ["Tandartspraktijk Wit", 45],
  ].map(([name, km, pakket]) => ({ name, km, pakket: pakket || `Vrije kilometers · ${eur(km * 20)}` })),
};
const KIT_IDS = ["hoofd", "mouwL", "mouwR", "zak1", "zak2", "zak3", "buik"];
const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;

function renderSpots() {
  const s = CUR, taken = KIT_IDS.filter(id => (s.tenue[id] || {}).status === "bezet").length;
  $("spots").innerHTML = [
    [t("Shirtplekken bezet", "Jersey spots taken"), t(`${taken} van ${KIT_IDS.length}`, `${taken} of ${KIT_IDS.length}`)],
    [t("Meefietsers eindsprint", "Final-sprint riders"), t(`${s.eindsprint} van ${SPRINT}`, `${s.eindsprint} of ${SPRINT}`)],
    [t("Gasten aan het diner", "Guests at the dinner"), `${s.diner}`],
  ].map(([a, b]) => `<div><span>${a}</span><span>${b}</span></div>`).join("");
  $("foot").textContent = CUR === DATA
    ? t(`Echte stand, bijgewerkt op ${WIM_DATE(DATA.updated)}. Donaties tellen we elke week bij. Alle kilometers zijn echte kilometers van de route (${nl(ROUTE_KM)} km).`, `Real progress, updated ${WIM_DATE(DATA.updated)}. Donations are added every week. Every kilometre is a real kilometre of the route (${nl(ROUTE_KM)} km).`)
    : t("Voorbeeld: alle bedrijven en bedragen op deze pagina zijn verzonnen. Kies Echte tussenstand voor de echte stand.", "Example: all companies and amounts on this page are made up. Choose Real progress to see the real numbers.");
}
function show() { render(); renderSpots(); }

let timer = null;
function stop() { clearTimeout(timer); timer = null; }
function setMode(full) {
  stop();
  $("modeReal").setAttribute("aria-pressed", String(!full));
  $("modeFull").setAttribute("aria-pressed", String(full));
  $("demo").hidden = !full; $("done").hidden = true; $("skipBtn").hidden = !full;
  sel = null;
  if (!full) { CUR = DATA; show(); return; }
  if (reduce) return finish(false);
  play();
}
// Opbouw: bedrijven één voor één, dan het peloton, dan de eindsprint en de shirtplekken.
function play() {
  const steps = [];
  FULL.sponsors.forEach((_, i) => steps.push([450, s => { s.sponsors = FULL.sponsors.slice(0, i + 1); s.diner = i + 1; }]));
  for (let f = 1; f <= 10; f++) steps.push([140, s => { s.pelotonEuro = Math.round(FULL.pelotonEuro * f / 10 / 20) * 20; }]);
  for (let r = 5; r <= 50; r += 5) steps.push([90, s => { s.eindsprint = r; s.diner = FULL.sponsors.length + r; }]);
  KIT_IDS.forEach(id => steps.push([160, s => { s.tenue = { ...s.tenue, [id]: FULL.tenue[id] }; }]));
  CUR = { pelotonEuro: 0, eindsprint: 0, diner: 0, tenue: {}, sponsors: [] };
  show();
  let i = 0;
  const next = () => {
    if (i >= steps.length) return finish(true);
    const [ms, fn] = steps[i++];
    fn(CUR); show();
    const lb = $("listbox"); lb.scrollTop = lb.scrollHeight;
    timer = setTimeout(next, ms);
  };
  timer = setTimeout(next, 600);
}
function finish(party) {
  stop();
  CUR = FULL; show();
  $("skipBtn").hidden = true; $("done").hidden = false;
  if (party) confetti();
}
$("modeReal").addEventListener("click", () => setMode(false));
$("modeFull").addEventListener("click", () => setMode(true));
$("skipBtn").addEventListener("click", () => finish(true));

// Confetti in de huisstijlkleuren, ongeveer drie seconden
function confetti() {
  if (reduce) return;
  const cv = $("confetti"), cx = cv.getContext("2d"), dpr = Math.min(2, devicePixelRatio || 1);
  cv.hidden = false; cv.width = innerWidth * dpr; cv.height = innerHeight * dpr;
  const cols = ["#1E4034", "#4A7560", "#C08A3E", "#F2EEE4", "#9CC2AA", "#14201C"];
  const P = Array.from({ length: 180 }, () => ({
    x: innerWidth * (.2 + Math.random() * .6), y: innerHeight * .35, vx: (Math.random() - .5) * 14, vy: -6 - Math.random() * 12,
    w: 6 + Math.random() * 6, h: 8 + Math.random() * 8, r: Math.random() * 6, vr: (Math.random() - .5) * .3, c: cols[Math.floor(Math.random() * cols.length)],
  }));
  const t0 = performance.now();
  (function frame(t) {
    const age = t - t0;
    cx.setTransform(dpr, 0, 0, dpr, 0, 0); cx.clearRect(0, 0, innerWidth, innerHeight);
    for (const p of P) {
      p.vy += .32; p.vx *= .99; p.x += p.vx; p.y += p.vy; p.r += p.vr;
      cx.save(); cx.translate(p.x, p.y); cx.rotate(p.r); cx.globalAlpha = Math.max(0, 1 - age / 3400);
      cx.fillStyle = p.c; cx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h * Math.abs(Math.cos(p.r))); cx.restore();
    }
    if (age < 3400) requestAnimationFrame(frame); else cv.hidden = true;
  })(t0);
}
$("doneTxt").textContent = t(`${nl(ROUTE_KM)} km gevuld · ${eur(ROUTE_KM * 20)} voor Voedselbanken Nederland`, `${nl(ROUTE_KM)} km filled · ${eur(ROUTE_KM * 20)} for the Dutch Food Banks`);
renderSpots();
