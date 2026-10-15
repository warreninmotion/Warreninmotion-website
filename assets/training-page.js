// Training: weekverslagen uit /training.js (WIM_TRAINING). Gedeeld door NL en EN.
(function () {
  const T = window.WIM_TRAINING || { weeks: [] }, W = T.weeks;
  const $ = id => document.getElementById(id);
  const n1 = v => (Math.round(v * 10) / 10).toLocaleString(WIM_LOC, { maximumFractionDigits: 1 });
  const dur = m => `${Math.floor(m / 60)}:${String(Math.round(m % 60)).padStart(2, "0")} ${t("uur", "h")}`;
  const SOORT = {
    duur: t("Duurrit", "Endurance ride"), tempo: t("Temporit", "Tempo ride"),
    opbouw: t("Opbouwrit", "Progressive ride"), herstel: t("Herstelrit", "Recovery ride"),
  };
  const OVERIG = {
    hiit: (o) => t(`${o.aantal}× HIIT`, `${o.aantal}× HIIT`),
    run: (o) => t(`${o.aantal}× hardlopen · ${n1(o.km)} km`, `${o.aantal}× running · ${n1(o.km)} km`),
    walk: (o) => t(`${o.aantal}× wandelen · ${n1(o.km)} km`, `${o.aantal}× walking · ${n1(o.km)} km`),
  };
  const ZN = [t("Herstel", "Recovery"), t("Duur", "Endurance"), "Tempo", t("Drempel", "Threshold"), t("Maximaal", "Maximum")];
  const range = w => {
    const [a, b] = [WIM_DATE(w.van), WIM_DATE(w.tot)].map(s => s.split(" "));
    return a[1] === b[1] ? `${a[0]}–${b[0]} ${b[1]} ${b[2]}` : `${a[0]} ${a[1]} – ${b.join(" ")}`;
  };
  const kmOf = w => w.ritten.reduce((s, r) => s + r.km, 0);
  const minOf = w => w.ritten.reduce((s, r) => s + r.min, 0);

  // Totaal
  const tKm = W.reduce((s, w) => s + kmOf(w), 0), tRit = W.reduce((s, w) => s + w.ritten.length, 0), tMin = W.reduce((s, w) => s + minOf(w), 0);
  if ($("tFacts")) $("tFacts").innerHTML = [
    [n1(tKm), t("km gefietst", "km cycled")],
    [tRit, t("ritten", "rides")],
    [Math.round(tMin / 60), t("uur op de fiets", "hours on the bike")],
    [W.length, t("weken in dit verslag", "weeks in this log")],
  ].map(([a, b]) => `<div><dt>${a}</dt><dd>${b}</dd></div>`).join("");

  // Fietskilometers per week (oud → nieuw)
  const svg = $("tChart");
  if (svg && W.length) {
    const rows = W.slice().reverse(), max = Math.max(100, ...rows.map(kmOf));
    const top = Math.ceil(max / 100) * 100, cw = 64, H = 180, L = 40, B = 26, Wd = L + rows.length * cw + 8;
    svg.setAttribute("viewBox", `0 0 ${Wd} ${H + B}`);
    let s = "";
    for (let v = 0; v <= top; v += 100) {
      const y = H - v / top * (H - 14);
      s += `<line x1="${L}" x2="${Wd}" y1="${y}" y2="${y}" stroke="var(--line)"/><text x="${L - 6}" y="${y + 4}" text-anchor="end" font-size="11" fill="var(--muted)">${n1(v)}</text>`;
    }
    rows.forEach((w, i) => {
      const k = kmOf(w), h = k / top * (H - 14), x = L + i * cw + 12;
      s += `<rect x="${x}" y="${H - h}" width="${cw - 24}" height="${Math.max(h, 0)}" rx="3" fill="var(--groen)"/>`;
      s += `<text x="${x + (cw - 24) / 2}" y="${H - h - 6}" text-anchor="middle" font-size="12" font-weight="600" fill="var(--fg)">${k ? n1(Math.round(k)) : "–"}</text>`;
      s += `<text x="${x + (cw - 24) / 2}" y="${H + 18}" text-anchor="middle" font-size="12" fill="var(--muted)">${t("wk", "wk")} ${w.week}</text>`;
    });
    svg.innerHTML = s;
  }

  // Zone-uitleg
  if ($("tZones")) $("tZones").innerHTML = ZN.map((z, i) => `<span><i class="zc z${i + 1}"></i>Z${i + 1} · ${z}</span>`).join("");

  // Weekverslagen
  const zbar = z => `<span class="zbar" role="img" aria-label="${z.map((v, i) => `Z${i + 1} ${v}%`).join(", ")}">${z.map((v, i) => v ? `<i class="z${i + 1}" style="width:${v}%"></i>` : "").join("")}</span>`;
  const main = z => { const i = z.indexOf(Math.max(...z)); return `${t("vooral", "mostly")} Z${i + 1}`; };
  if ($("tWeeks")) $("tWeeks").innerHTML = W.map(w => {
    const km = kmOf(w), m = minOf(w);
    const stats = [
      w.ritten.length ? `<b>${n1(km)} km</b> ${t("gefietst", "cycled")}` : t("Geen fietskilometers", "No cycling"),
      w.ritten.length ? `${w.ritten.length} ${w.ritten.length === 1 ? t("rit", "ride") : t("ritten", "rides")} · ${dur(m)}` : "",
      ...(w.overig || []).map(o => OVERIG[o.soort] ? OVERIG[o.soort](o) : ""),
    ].filter(Boolean).map(x => `<span>${x}</span>`).join("");
    const rides = w.ritten.length ? `<ul class="rides">${w.ritten.map(r => `<li>
        <div class="r-h"><b>${SOORT[r.soort] || r.soort}</b><span>${n1(r.km)} km · ${dur(r.min)} · ${n1(r.km / r.min * 60)} ${t("km/u", "km/h")}${r.binnen ? t(" · binnen", " · indoor") : t(" · buiten", " · outdoor")}</span></div>
        ${zbar(r.zones)}<span class="r-z">${main(r.zones)}</span></li>`).join("")}</ul>` : "";
    return `<article class="wk" id="week-${w.week}">
      <header><div class="eyebrow">${t("Week", "Week")} ${w.week} · ${range(w)}</div><div class="wk-stats">${stats}</div></header>
      <div class="wk-body"><div class="prose">${(t(w.tekst, w.text) || []).map(p => `<p>${p}</p>`).join("")}<p class="sig">— Warren</p></div>${rides}</div>
    </article>`;
  }).join("");
  if ($("tUpd")) $("tUpd").textContent = t(`Bijgewerkt op ${WIM_DATE(T.updated)}.`, `Updated ${WIM_DATE(T.updated)}.`);
})();
