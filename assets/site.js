// Gedeeld op elke pagina: monogram, menu, kopieerknoppen, links en de stand uit data.js.

// Monogram Warren in Motion (uit het vectorbestand van het brandbook; nooit natekenen)
window.WIM_MONO = `<path fill="none" stroke-width="17.67" stroke-linecap="round" stroke-linejoin="round" stroke="currentColor" d="M 312.359932 162.922793 L 293.757444 188.543244 C 280.921805 206.500626 278.587698 229.927719 287.62308 250.06282 C 296.658462 270.201831 315.714479 284.026631 337.663694 286.372468 C 359.612909 288.718305 381.155513 279.229394 394.245283 261.455769 L 447.206464 188.543244 C 460.296235 170.769618 481.838838 161.280707 503.788054 163.630454 C 525.737269 165.972381 544.793285 179.797181 553.828668 199.936192 C 562.86796 220.075203 560.529942 243.498386 547.694304 261.455769 L 529.142642 287.076219 " transform="matrix(0.99911, 0, 0, 0.99911, 0, 0.0151246)"/><path fill="none" stroke-width="17.67" stroke-linecap="round" stroke-linejoin="round" stroke="currentColor" d="M 389.080532 162.922793 L 344.024822 225.001461 " transform="matrix(0.99911, 0, 0, 0.99911, 0, 0.0151246)"/><path fill="none" stroke-width="17.67" stroke-linecap="round" stroke-linejoin="round" stroke="currentColor" d="M 497.477752 225.001461 L 452.418132 287.076219 " transform="matrix(0.99911, 0, 0, 0.99911, 0, 0.0151246)"/><path fill="currentColor" d="M 357.660156 224.816406 C 357.660156 232.511719 351.417969 238.75 343.71875 238.75 C 336.019531 238.75 329.78125 232.511719 329.78125 224.816406 C 329.78125 217.117188 336.019531 210.878906 343.71875 210.878906 C 351.417969 210.878906 357.660156 217.117188 357.660156 224.816406 Z"/><path fill="currentColor" d="M 510.972656 224.816406 C 510.972656 232.511719 504.730469 238.75 497.035156 238.75 C 489.335938 238.75 483.09375 232.511719 483.09375 224.816406 C 483.09375 217.117188 489.335938 210.878906 497.035156 210.878906 C 504.730469 210.878906 510.972656 217.117188 510.972656 224.816406 Z"/>`;

// Taal: Nederlands (standaard) of Engels (pagina's onder /en/). t("nl", "en") kiest de juiste tekst,
// L("/route/") geeft het adres in de huidige taal, fmt/nl formatteren getallen in de juiste notatie.
window.WIM_LANG = (document.documentElement.lang || "nl").slice(0, 2) === "en" ? "en" : "nl";
window.t = (nl, en) => window.WIM_LANG === "en" ? en : nl;
window.WIM_LOC = window.WIM_LANG === "en" ? "en-GB" : "nl-NL";
window.WIM_PATHS = { "/": "/en/", "/sponsoren/": "/en/sponsor/", "/doneren/": "/en/donate/", "/tussenstand/": "/en/progress/", "/route/": "/en/route/", "/training/": "/en/training/", "/over-warren/": "/en/about/", "/contact/": "/en/contact/", "/privacy/": "/en/privacy/" };
window.L = path => { if (window.WIM_LANG !== "en") return path; const [p, h] = path.split("#"); return (window.WIM_PATHS[p] || p) + (h ? "#" + h : ""); };
// Datum uit data.js ("14 oktober 2026") in de huidige taal
window.WIM_DATE = s => {
  if (!s || window.WIM_LANG !== "en") return s;
  const M = { januari: "January", februari: "February", maart: "March", april: "April", mei: "May", juni: "June", juli: "July", augustus: "August", september: "September", oktober: "October", november: "November", december: "December" };
  return s.replace(/[a-z]+/, m => M[m] || m);
};

// Vaste gegevens. liveUrl = Garmin LiveTrack-link, zodra die er is.
window.WIM_SITE = {
  mail: "steun@warreninmotion.nl",
  donateUrl: "https://www.kominactievoordevoedselbank.nl/fundraisers/warreninmotion",
  liveUrl: "",
  gaId: "G-PW3QDXVHXW", // Google Analytics 4 meet-ID ("G-..."); leeg = geen statistiek en geen cookiemelding
  routeKm: 1570, // = Math.round(WIM_ROUTE.km) uit assets/route-data.js
  sprintMax: 50,
  // Gezinnen: Voedselbanken Nederland (voedselbankennederland.nl, "Doneer"): €12,50 = boodschappen voor een gezin.
  // Aantal gezinnen = bedrag / 12,50 (afgerond naar beneden). 1 km (€20) = 1,6 gezin; hoofddoel €30.000 = 2.400 gezinnen.
  euroPerGezin: 12.5,
  goals: [{ eur: 7500, label: t("Doel 1", "Goal 1") }, { eur: 15000, label: t("Doel 2", "Goal 2") }, { eur: 30000, label: t("Hoofddoel", "Main goal") }],
};

// Gezinnen die boodschappen krijgen van de voedselbank voor een bedrag (Home, Tussenstand, Doneren, rekenhulp en artifact)
window.WIM_gezinnen = eur => Math.floor(eur / window.WIM_SITE.euroPerGezin + 1e-9);
window.WIM_gezinLine = (eur, uitleg) => {
  const g = WIM_gezinnen(eur), n = v => v.toLocaleString(window.WIM_LOC);
  const p = window.WIM_SITE.euroPerGezin.toLocaleString(window.WIM_LOC, { minimumFractionDigits: 2 });
  const txt = g ? t(`Daarmee krijgen <b>${n(g)} ${g === 1 ? "gezin" : "gezinnen"}</b> boodschappen van de voedselbank`, `That gives <b>${n(g)} ${g === 1 ? "family" : "families"}</b> groceries from the food bank`)
    : t(`Met elke <b>€${p}</b> krijgt een gezin boodschappen van de voedselbank`, `Every <b>€${p}</b> gives a family groceries from the food bank`);
  return `<div class="meals">${txt}${uitleg && g ? `<small>${t(`Met €${p} krijgt een gezin boodschappen van de voedselbank (Voedselbanken Nederland).`, `€${p} gives a family groceries from the food bank (the Dutch Food Banks).`)}</small>` : ""}</div>`;
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
      ? `<a class="btn" href="${S.liveUrl}" target="_blank" rel="noopener">${t("Volg me live", "Follow me live")}</a>`
      : `<span class="muted">${t("Vanaf zaterdag 15 mei 2027 volg je me hier live, kilometer voor kilometer.", "From Saturday 15 May 2027 you can follow me live here, kilometre by kilometre.")}</span>`;
  });

  // Stand: echte kilometers van bedrijven en het peloton, op de echte route
  const sKm = D.sponsors.reduce((s, x) => s + x.km, 0), pKm = D.pelotonEuro / 20;
  const km = Math.min(S.routeKm, sKm + pKm), euro = sKm * 20 + D.pelotonEuro;
  document.querySelectorAll("[data-stand]").forEach(n => {
    const pct = v => (v / S.routeKm * 100).toFixed(2) + "%";
    const nxt = S.goals.find(g => euro < g.eur), nB = D.sponsors.length;
    n.innerHTML = `<div class="big">€${fmt(euro)} <small>${t("opgehaald", "raised")}</small></div>
      <div class="sub"><b>${t(`${fmt(km)} van ${fmt(S.routeKm)} km`, `${fmt(km)} of ${fmt(S.routeKm)} km`)}</b> ${t("gevuld", "filled")} · ${t(`${nB} ${nB === 1 ? "bedrijf" : "bedrijven"}${pKm ? " en het peloton" : ""}`, `${nB} ${nB === 1 ? "company" : "companies"}${pKm ? " and the peloton" : ""}`)}</div>
      ${WIM_gezinLine(euro)}
      <div class="bar"><div class="f" style="width:${pct(sKm)}"></div><div class="p" style="left:${pct(sKm)};width:${pct(pKm)}"></div>${S.goals.map(g => `<div class="tick" style="left:calc(${pct(g.eur / 20)} - 1px)"><span>€${fmt(g.eur)}</span></div>`).join("")}</div>
      <div class="sub">${nxt ? t(`Op naar <b>${nxt.label.toLowerCase()}: €${fmt(nxt.eur)}</b>. Nog ${fmt((nxt.eur - euro) / 20)} km te gaan.`, `Next up: <b>${nxt.label.toLowerCase()}, €${fmt(nxt.eur)}</b>. ${fmt((nxt.eur - euro) / 20)} km to go.`) : t(`<b>Het hoofddoel is gehaald!</b> Dank je wel, iedereen die meerijdt.`, `<b>The main goal is reached!</b> Thank you to everyone riding along.`)}${upd ? t(` Bijgewerkt op ${upd}.`, ` Updated ${upd}.`) : ""}</div>`;
  });

  // Peloton: alle particuliere donaties samen
  document.querySelectorAll("[data-peloton]").forEach(n => {
    const link = `<a href="${L("/tussenstand/")}">${t("Bekijk de tussenstand", "See the progress")}</a>`;
    n.innerHTML = D.pelotonEuro
      ? `<div class="sub">${t(`Het peloton staat op <b>€${fmt(D.pelotonEuro)}</b>: samen al ${fmt(pKm)} km.`, `The peloton is at <b>€${fmt(D.pelotonEuro)}</b>: ${fmt(pKm)} km together so far.`)}${upd ? t(` Bijgewerkt op ${upd}.`, ` Updated ${upd}.`) : ""} ${link}</div>${WIM_gezinLine(D.pelotonEuro)}`
      : `<div class="sub">${t("Het peloton is net vertrokken. Rij jij als een van de eersten mee?", "The peloton has just set off. Will you be one of the first to ride along?")} ${link}</div>`;
  });

  // Eindsprint en diner
  document.querySelectorAll("[data-sprint]").forEach(n => {
    const free = Math.max(0, S.sprintMax - D.eindsprint), e = D.eindsprint, d = D.diner;
    n.innerHTML = `<div class="big">${free} <small>${t(`van ${S.sprintMax} fietsplekken vrij`, `of ${S.sprintMax} riding places left`)}</small></div>
      <div class="sub">${e ? t(`${e} ${e === 1 ? "meefietser" : "meefietsers"} aangemeld · ${d} ${d === 1 ? "gast" : "gasten"} aan tafel bij het diner`, `${e} ${e === 1 ? "rider" : "riders"} signed up · ${d} ${d === 1 ? "guest" : "guests"} at the dinner`)
        : t("De inschrijving is net open. Wees er vroeg bij, want vol is vol.", "Sign-ups have just opened. Be quick: when it's full, it's full.")}${upd && e ? t(` · bijgewerkt op ${upd}`, ` · updated ${upd}`) : ""}</div>`;
  });
})();

// Bezoekersstatistiek: Google Analytics 4, alleen na "ja" in de cookiemelding (keuze in localStorage "wim-cookies").
// Tekst (berekening Warren): 8 dagen × (2.600 kcal ruststofwisseling + 8 uur × 650 kcal zone 2) = 62.400 kcal,
// eerder meer door het klimmen; / ±50 kcal per koekje = ±1.250 koekjes.
// Elke klik op een link of knop gaat als gebeurtenis "klik" mee (knoptekst + pagina). Zonder gaId gebeurt er niets.
window.WIM_track = (name, props) => {
  try { if (window.gtag && window.WIM_GA_ON) window.gtag("event", name.toLowerCase(), props); } catch (e) { /* statistiek mag de site nooit breken */ }
};
(function () {
  const id = window.WIM_SITE.gaId;
  if (!id) return;
  const get = () => { try { return localStorage.getItem("wim-cookies"); } catch (e) { return null; } };
  const set = v => { try { localStorage.setItem("wim-cookies", v); } catch (e) { /* geen opslag: vraag het volgende keer opnieuw */ } };
  const load = () => {
    if (window.WIM_GA_ON) return;
    window.WIM_GA_ON = true;
    window.dataLayer = window.dataLayer || [];
    window.gtag = function () { window.dataLayer.push(arguments); };
    window.gtag("js", new Date());
    window.gtag("config", id, { anonymize_ip: true });
    const sc = document.createElement("script"); sc.async = true; sc.src = "https://www.googletagmanager.com/gtag/js?id=" + id; document.head.append(sc);
  };
  // nee na eerder ja: Analytics stilzetten en de _ga-cookies wissen
  const off = () => {
    window["ga-disable-" + id] = true; window.WIM_GA_ON = false;
    const host = location.hostname.split(".").slice(-2).join(".");
    document.cookie.split(";").map(c => c.split("=")[0].trim()).filter(n => /^_ga/.test(n)).forEach(n => {
      for (const d of ["", "; domain=" + host, "; domain=." + host]) document.cookie = n + "=; Max-Age=0; path=/" + d;
    });
  };
  const ask = () => {
    if (document.getElementById("cookie")) return;
    const box = document.createElement("div");
    box.id = "cookie"; box.className = "cookie"; box.setAttribute("role", "dialog"); box.setAttribute("aria-labelledby", "cookie-h");
    box.innerHTML = `<div class="cookie-in">
      <p id="cookie-h" class="cookie-h">${t("Koekje erbij?", "Fancy a cookie?")}</p>
      <p>${t("Van Lucca naar Veenendaal verbrand ik ruim 60.000 kilocalorieën. Dat zijn zo'n 1.250 koekjes. Eentje voor jou?",
        "From Lucca to Veenendaal, I burn more than 60,000 calories. That's about 1,250 biscuits. Fancy one?")} <a href="${L("/privacy/")}">${t("Meer over privacy", "More about privacy")}</a></p>
      <div class="cookie-b"><button type="button" class="btn" data-c="yes">${t("Ja, koekje erbij", "Yes, I'll have one")}</button><button type="button" class="btn ghost" data-c="no">${t("Nee, dank je", "No, thanks")}</button></div></div>`;
    box.addEventListener("click", e => { const b = e.target.closest("[data-c]"); if (!b) return; set(b.dataset.c); if (b.dataset.c === "yes") load(); else off(); box.remove(); });
    document.body.append(box);
  };
  const c = get();
  if (c === "yes") load(); else if (c !== "no") ask();
  // link in de voet om de keuze te wijzigen
  const foot = document.querySelector(".site-foot__in > div:last-child ul");
  if (foot) { const li = document.createElement("li"); li.innerHTML = `<a href="#" data-cookie>${t("Cookie-instellingen", "Cookie settings")}</a>`; foot.append(li); }
  document.addEventListener("click", e => { if (e.target.closest("[data-cookie]")) { e.preventDefault(); ask(); } });
})();
document.addEventListener("click", e => {
  const el = e.target.closest("a, button");
  if (!el) return;
  const label = (el.dataset.track || el.getAttribute("aria-label") || el.textContent || "").replace(/\s+/g, " ").trim().slice(0, 60);
  window.WIM_track("Klik", { knop: label || el.className || "?", pagina: location.pathname });
}, { capture: true });

// Logoblok "Zij rijden al mee" (Sponsoren en artifact): sponsors uit data.js, logo's uit logos.js.
// Eén logo tegelijk, schuift elke 3,5 s door; de laatste dia is "Jouw bedrijf hier?". Stil bij "minder beweging".
(function () {
  const box = document.querySelector("[data-logos]");
  if (!box) return;
  const L0 = window.WIM_LOGOS || {}, D = window.WIM_DATA || { sponsors: [] };
  const names = [...new Set(D.sponsors.filter(s => s.name).map(s => s.name))];
  const esc = s => s.replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  const slides = names.map(n => `<div class="logo-slide">${L0[n] ? `<img src="${L0[n]}" alt="${esc(n)}">` : `<span class="wordmark">${esc(n)}</span>`}</div>`)
    .concat(`<div class="logo-slide you"><a href="#rekenhulp"><b>${t("Jouw bedrijf hier?", "Your company here?")}</b><span>${t("Bereken je bijdrage", "Work out your contribution")}</span></a></div>`);
  box.innerHTML = `<div class="logo-stage">${slides.join("")}</div><div class="logo-dots">${slides.map((_, i) => `<button type="button" aria-label="${i + 1} / ${slides.length}"></button>`).join("")}</div>`;
  const S = [...box.querySelectorAll(".logo-slide")], B = [...box.querySelectorAll(".logo-dots button")];
  let i = 0, timer = 0, hold = false;
  const show = j => { i = (j + S.length) % S.length; S.forEach((s, k) => { s.classList.toggle("on", k === i); s.setAttribute("aria-hidden", String(k !== i)); }); B.forEach((b, k) => b.setAttribute("aria-current", String(k === i))); plan(); };
  const plan = () => { clearTimeout(timer); if (!hold && S.length > 1 && !matchMedia("(prefers-reduced-motion: reduce)").matches) timer = setTimeout(() => show(i + 1), 3500); };
  B.forEach((b, k) => b.addEventListener("click", () => show(k)));
  box.addEventListener("pointerenter", () => { hold = true; plan(); });
  box.addEventListener("pointerleave", () => { hold = false; plan(); });
  box.addEventListener("focusin", () => { hold = true; plan(); });
  box.addEventListener("focusout", () => { hold = false; plan(); });
  show(0);
})();

// Mobiel: vaste actiebalk onderin met Doneer en Sponsor, zichtbaar na de kop en niet als de cookiemelding of voet in beeld is
(function () {
  if (!document.querySelector(".site-head") || /beeldlijst|privacy/.test(location.pathname)) return;
  const onDon = /\/(doneren|en\/donate)\//.test(location.pathname), onSp = /\/(sponsoren|en\/sponsor)\//.test(location.pathname);
  const bar = document.createElement("nav");
  bar.className = "actbar"; bar.setAttribute("aria-label", t("Doe mee", "Join in"));
  bar.innerHTML = `<a href="${onDon ? window.WIM_SITE.donateUrl : L("/doneren/")}"${onDon ? ' target="_blank" rel="noopener"' : ""}>${t("Doneer", "Donate")}</a><a class="alt" href="${onSp ? "#rekenhulp" : L("/sponsoren/")}">${onSp ? t("Bereken je bijdrage", "Work it out") : t("Sponsor", "Sponsor")}</a>`;
  document.body.append(bar); document.body.classList.add("has-actbar");
  const foot = document.querySelector(".site-foot");
  let footIn = false;
  if (foot && "IntersectionObserver" in window) new IntersectionObserver(es => { footIn = es[0].isIntersecting; upd(); }).observe(foot);
  const upd = () => bar.classList.toggle("on", window.scrollY > window.innerHeight * 0.6 && !footIn && !document.getElementById("cookie") && !document.querySelector(".site-head.open"));
  document.querySelector(".menu-btn")?.addEventListener("click", () => setTimeout(upd));
  addEventListener("scroll", upd, { passive: true }); addEventListener("resize", upd);
  new MutationObserver(upd).observe(document.body, { childList: true });
  upd();
})();

// Uitklapblokken: op computer open, op mobiel dicht; een link naar iets in een dicht blok klapt het open
(function () {
  const F = [...document.querySelectorAll("details.fold")];
  if (!F.length) return;
  const wide = matchMedia("(min-width:900px)");
  const set = () => F.forEach(d => { const t0 = location.hash.length > 1 && document.getElementById(location.hash.slice(1)); d.open = wide.matches || !!(t0 && (d.contains(t0) || t0.contains(d))); });
  set(); wide.addEventListener("change", set);
  F.forEach(d => d.querySelector("summary").addEventListener("click", e => { if (wide.matches) e.preventDefault(); }));
  const openFor = h => { try { const el = h && document.querySelector(h); const d = el && (el.closest("details.fold") || el.querySelector("details.fold")); if (d) d.open = true; } catch (e) { /* geen geldige selector */ } };
  document.addEventListener("click", e => { const a = e.target.closest('a[href^="#"]'); if (a) openFor(a.getAttribute("href")); }, true);
  addEventListener("hashchange", () => openFor(location.hash));
})();

// Vervangbeeld voor foto's en video's die nog komen (shots.js): vast beeld met rechtsonder wat er nodig is.
window.WIM_fillShots = function (root) {
  const S = window.WIM_SHOTS;
  if (!S) return;
  const keys = Object.keys(S);
  (root || document).querySelectorAll("[data-shot]").forEach(f => {
    const s = S[f.dataset.shot]; if (!s) return;
    const [w, h] = s.ratio.split("/").map(Number), stand = h > w;
    f.style.aspectRatio = `${w} / ${h}`;
    const wat = t(s.wat[0], s.wat[1]);
    if (s.src) {
      const alt = s.alt ? t(s.alt[0], s.alt[1]) : wat;
      f.classList.add("real");
      const still = matchMedia("(prefers-reduced-motion: reduce)").matches;
      f.innerHTML = s.soort === "video"
        ? `<video src="${s.src}"${s.poster ? ` poster="${s.poster}"` : ""} muted loop playsinline${still ? "" : " autoplay"} preload="metadata" aria-label="${alt}"></video>`
        : `<img src="${s.src}" alt="${alt}" loading="lazy">`;
      return;
    }
    // op warreninmotion.nl zelf geen label (alleen het vervangbeeld); op testversies en /beeldlijst/ wel
    const tag = !/(^|\.)warreninmotion\.nl$/.test(location.hostname) || /beelden/.test(location.search) || f.closest("#shots");
    f.innerHTML = `<img src="/assets/img/placeholder.webp" alt="" loading="lazy">` + (tag ? `<figcaption class="ph-tag"><span class="ph-n">#${keys.indexOf(f.dataset.shot) + 1}</span>
      <span><b>${s.soort === "video" ? t("Video", "Video") : t("Foto", "Photo")} · ${stand ? t("staand", "portrait") : t("liggend", "landscape")} ${w}:${h}</b>${wat}</span></figcaption>` : "");
  });
};
window.WIM_fillShots();
