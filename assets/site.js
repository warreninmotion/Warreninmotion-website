// Gedeeld op elke pagina: monogram, menu, kopieerknoppen, links en de stand uit data.js.

// Monogram Warren in Motion (uit het vectorbestand van het brandbook; nooit natekenen)
window.WIM_MONO = `<path fill="none" stroke-width="17.67" stroke-linecap="round" stroke-linejoin="round" stroke="currentColor" d="M 312.359932 162.922793 L 293.757444 188.543244 C 280.921805 206.500626 278.587698 229.927719 287.62308 250.06282 C 296.658462 270.201831 315.714479 284.026631 337.663694 286.372468 C 359.612909 288.718305 381.155513 279.229394 394.245283 261.455769 L 447.206464 188.543244 C 460.296235 170.769618 481.838838 161.280707 503.788054 163.630454 C 525.737269 165.972381 544.793285 179.797181 553.828668 199.936192 C 562.86796 220.075203 560.529942 243.498386 547.694304 261.455769 L 529.142642 287.076219 " transform="matrix(0.99911, 0, 0, 0.99911, 0, 0.0151246)"/><path fill="none" stroke-width="17.67" stroke-linecap="round" stroke-linejoin="round" stroke="currentColor" d="M 389.080532 162.922793 L 344.024822 225.001461 " transform="matrix(0.99911, 0, 0, 0.99911, 0, 0.0151246)"/><path fill="none" stroke-width="17.67" stroke-linecap="round" stroke-linejoin="round" stroke="currentColor" d="M 497.477752 225.001461 L 452.418132 287.076219 " transform="matrix(0.99911, 0, 0, 0.99911, 0, 0.0151246)"/><path fill="currentColor" d="M 357.660156 224.816406 C 357.660156 232.511719 351.417969 238.75 343.71875 238.75 C 336.019531 238.75 329.78125 232.511719 329.78125 224.816406 C 329.78125 217.117188 336.019531 210.878906 343.71875 210.878906 C 351.417969 210.878906 357.660156 217.117188 357.660156 224.816406 Z"/><path fill="currentColor" d="M 510.972656 224.816406 C 510.972656 232.511719 504.730469 238.75 497.035156 238.75 C 489.335938 238.75 483.09375 232.511719 483.09375 224.816406 C 483.09375 217.117188 489.335938 210.878906 497.035156 210.878906 C 504.730469 210.878906 510.972656 217.117188 510.972656 224.816406 Z"/>`;

// Taal: Nederlands (standaard) of Engels (pagina's onder /en/). t("nl", "en") kiest de juiste tekst,
// L("/route/") geeft het adres in de huidige taal, fmt/nl formatteren getallen in de juiste notatie.
window.WIM_LANG = (document.documentElement.lang || "nl").slice(0, 2) === "en" ? "en" : "nl";
window.t = (nl, en) => window.WIM_LANG === "en" ? en : nl;
window.WIM_LOC = window.WIM_LANG === "en" ? "en-GB" : "nl-NL";
window.WIM_PATHS = { "/": "/en/", "/sponsoren/": "/en/sponsor/", "/doneren/": "/en/donate/", "/tussenstand/": "/en/progress/", "/route/": "/en/route/", "/training/": "/en/training/", "/over-warren/": "/en/about/", "/contact/": "/en/contact/" };
window.L = path => { if (window.WIM_LANG !== "en") return path; const [p, h] = path.split("#"); return (window.WIM_PATHS[p] || p) + (h ? "#" + h : ""); };
// Datum uit data.js ("14 oktober 2026") in de huidige taal
window.WIM_DATE = s => {
  if (!s || window.WIM_LANG !== "en") return s;
  const M = { januari: "January", februari: "February", maart: "March", april: "April", mei: "May", juni: "June", juli: "July", augustus: "August", september: "September", oktober: "October", november: "November", december: "December" };
  return s.replace(/[a-z]+/, m => M[m] || m);
};

// Vaste gegevens. liveUrl = Garmin LiveTrack-link, zodra die er is.
window.WIM_SITE = {
  mail: "warreninmotion@outlook.com",
  donateUrl: "https://www.kominactievoordevoedselbank.nl/fundraisers/warreninmotion",
  liveUrl: "",
  routeKm: 1570, // = Math.round(WIM_ROUTE.km) uit assets/route-data.js
  sprintMax: 50,
  goals: [{ eur: 7500, label: t("Doel 1", "Goal 1") }, { eur: 15000, label: t("Doel 2", "Goal 2") }, { eur: 30000, label: t("Hoofddoel", "Main goal") }],
};

function bindCopy(root) {
  const C0 = t("Kopieer", "Copy");
  root.querySelectorAll(".copy").forEach(b => b.addEventListener("click", () => {
    const addr = b.previousElementSibling, done = () => { b.textContent = t("Gekopieerd", "Copied"); setTimeout(() => b.textContent = C0, 1800); };
    const pick = () => { const r = document.createRange(); r.selectNodeContents(addr); const s = getSelection(); s.removeAllRanges(); s.addRange(r); b.textContent = t("Geselecteerd", "Selected"); setTimeout(() => b.textContent = C0, 1800); };
    try { navigator.clipboard.writeText(addr.textContent).then(done, pick); } catch (e) { pick(); }
  }));
}

(function () {
  const S = window.WIM_SITE;
  const D = Object.assign({ updated: "", pelotonEuro: 0, eindsprint: 0, diner: 0, sponsors: [] }, window.WIM_DATA || {});
  const fmt = n => (Math.round(n * 10) / 10).toLocaleString(window.WIM_LOC, { maximumFractionDigits: 1 });
  const upd = WIM_DATE(D.updated);

  document.querySelectorAll("svg.mono").forEach(s => { s.setAttribute("viewBox", "273.3 154.1 294.8 141.8"); s.innerHTML = window.WIM_MONO; });
  bindCopy(document);

  // Menu op telefoon
  const head = document.querySelector(".site-head"), btn = document.querySelector(".menu-btn");
  if (head && btn) {
    const set = o => { head.classList.toggle("open", o); btn.setAttribute("aria-expanded", String(o)); btn.textContent = o ? t("Sluit", "Close") : "Menu"; };
    btn.addEventListener("click", () => set(!head.classList.contains("open")));
    document.addEventListener("keydown", e => { if (e.key === "Escape" && head.classList.contains("open")) { set(false); btn.focus(); } });
  }

  // Live volgen: link zodra liveUrl gevuld is
  document.querySelectorAll("[data-live]").forEach(n => {
    n.innerHTML = S.liveUrl
      ? `<a class="btn" href="${S.liveUrl}" target="_blank" rel="noopener">${t("Volg Warren live", "Follow Warren live")}</a>`
      : `<span class="muted">${t("Vanaf zaterdag 15 mei 2027 volg je Warren hier live, kilometer voor kilometer.", "From Saturday 15 May 2027 you can follow Warren live here, kilometre by kilometre.")}</span>`;
  });

  // Stand: echte kilometers van bedrijven en het peloton, op de echte route
  const sKm = D.sponsors.reduce((s, x) => s + x.km, 0), pKm = D.pelotonEuro / 20;
  const km = Math.min(S.routeKm, sKm + pKm), euro = sKm * 20 + D.pelotonEuro;
  document.querySelectorAll("[data-stand]").forEach(n => {
    const pct = v => (v / S.routeKm * 100).toFixed(2) + "%";
    const nxt = S.goals.find(g => euro < g.eur), nB = D.sponsors.length;
    n.innerHTML = `<div class="big">€${fmt(euro)} <small>${t("opgehaald", "raised")}</small></div>
      <div class="sub"><b>${t(`${fmt(km)} van ${fmt(S.routeKm)} km`, `${fmt(km)} of ${fmt(S.routeKm)} km`)}</b> ${t("gevuld", "filled")} · ${t(`${nB} ${nB === 1 ? "bedrijf" : "bedrijven"}${pKm ? " en het peloton" : ""}`, `${nB} ${nB === 1 ? "company" : "companies"}${pKm ? " and the peloton" : ""}`)}</div>
      <div class="bar"><div class="f" style="width:${pct(sKm)}"></div><div class="p" style="left:${pct(sKm)};width:${pct(pKm)}"></div>${S.goals.map(g => `<div class="tick" style="left:calc(${pct(g.eur / 20)} - 1px)"><span>€${fmt(g.eur)}</span></div>`).join("")}</div>
      <div class="sub">${nxt ? t(`Op naar <b>${nxt.label.toLowerCase()}: €${fmt(nxt.eur)}</b>. Nog ${fmt((nxt.eur - euro) / 20)} km te gaan.`, `Next up: <b>${nxt.label.toLowerCase()}, €${fmt(nxt.eur)}</b>. ${fmt((nxt.eur - euro) / 20)} km to go.`) : t(`<b>Het hoofddoel is gehaald!</b> Dank je wel, iedereen die meerijdt.`, `<b>The main goal is reached!</b> Thank you to everyone riding along.`)}${upd ? t(` Bijgewerkt op ${upd}.`, ` Updated ${upd}.`) : ""}</div>`;
  });

  // Peloton: alle particuliere donaties samen
  document.querySelectorAll("[data-peloton]").forEach(n => {
    const link = `<a href="${L("/tussenstand/")}">${t("Bekijk de tussenstand", "See the progress")}</a>`;
    n.innerHTML = D.pelotonEuro
      ? `<div class="sub">${t(`Het peloton staat op <b>€${fmt(D.pelotonEuro)}</b>: samen al ${fmt(pKm)} km.`, `The peloton is at <b>€${fmt(D.pelotonEuro)}</b>: ${fmt(pKm)} km together so far.`)}${upd ? t(` Bijgewerkt op ${upd}.`, ` Updated ${upd}.`) : ""} ${link}</div>`
      : `<div class="sub">${t("Het peloton staat nog op €0. Word jij de eerste die meerijdt?", "The peloton is still at €0. Will you be the first to ride along?")} ${link}</div>`;
  });

  // Eindsprint en diner
  document.querySelectorAll("[data-sprint]").forEach(n => {
    const free = Math.max(0, S.sprintMax - D.eindsprint), e = D.eindsprint, d = D.diner;
    n.innerHTML = `<div class="big">${free} <small>${t(`van ${S.sprintMax} fietsplekken vrij`, `of ${S.sprintMax} riding places left`)}</small></div>
      <div class="sub">${t(`${e} ${e === 1 ? "meefietser" : "meefietsers"} aangemeld · ${d} ${d === 1 ? "gast" : "gasten"} aan tafel bij het diner`, `${e} ${e === 1 ? "rider" : "riders"} signed up · ${d} ${d === 1 ? "guest" : "guests"} at the dinner`)}${upd ? t(` · bijgewerkt op ${upd}`, ` · updated ${upd}`) : ""}</div>`;
  });
})();

// Bezoekersstatistiek: elke klik op een link of knop als gebeurtenis "Klik" (knoptekst + pagina).
// Doet niets zolang er geen statistiekdienst geladen is (Plausible of Umami); zie CLAUDE.md "Statistiek".
window.WIM_track = (name, props) => {
  try { if (window.plausible) window.plausible(name, { props }); else if (window.umami) window.umami.track(name, props); } catch (e) { /* statistiek mag de site nooit breken */ }
};
document.addEventListener("click", e => {
  const el = e.target.closest("a, button");
  if (!el) return;
  const label = (el.dataset.track || el.getAttribute("aria-label") || el.textContent || "").replace(/\s+/g, " ").trim().slice(0, 60);
  window.WIM_track("Klik", { knop: label || el.className || "?", pagina: location.pathname });
}, { capture: true });
