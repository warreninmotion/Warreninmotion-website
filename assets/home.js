// Foto naast de kop (was de lanceringsvideo, eraf op 16-11-2026: te veel bandbreedte).
// Op de telefoon staat hij onder de tussenstand (wens Warren 26-10-2026); op de computer naast de kop.
(function () {
  const fig = document.querySelector(".hero-vid");
  if (!fig) return;
  const home = fig.parentNode, stand = document.querySelector(".stand-sec"), mq = matchMedia("(max-width:859px)");
  const place = () => mq.matches ? stand.after(fig) : home.append(fig);
  place(); mq.addEventListener("change", place);
})();

// Routetekening zonder landkaart: alleen de lijn, de etappes en de belangrijkste plaatsen
(function () {
  const svg = document.getElementById("homeMap"), xs = pts.map(q => q.p[0]), ys = pts.map(q => q.p[1]);
  const x0 = Math.min(...xs) - 120, x1 = Math.max(...xs) + 190, y0 = Math.min(...ys) - 30, y1 = Math.max(...ys) + 30;
  svg.setAttribute("viewBox", `${x0.toFixed(0)} ${y0.toFixed(0)} ${(x1 - x0).toFixed(0)} ${(y1 - y0).toFixed(0)}`);
  svg.append(el("path", { d: path(0, ROUTE_KM), fill: "none", stroke: "var(--line)", "stroke-width": 22, "stroke-linecap": "round", "stroke-linejoin": "round" }));
  STAGES.forEach((s, i) => svg.append(el("path", { d: path(s.a, s.b), fill: "none", stroke: i % 2 ? "var(--seg2)" : "var(--seg1)", "stroke-width": 9, "stroke-linecap": "round", "stroke-linejoin": "round" })));
  const lab = { "Lucca": ["r", t("Lucca · start", "Lucca · start")], "Locarno": ["l", "Locarno"], "Lukmanier": ["l", t("Lukmanierpas 1.915 m", "Lukmanier Pass 1,915 m")], "Mulhouse": ["l", "Mulhouse"], "Arlon": ["l", "Arlon"], "Veenendaal": ["r", t("Veenendaal · finish", "Veenendaal · finish")] };
  for (const q of pts) if (lab[q.name]) {
    const [x, y] = q.p, [side, txt] = lab[q.name], r = side === "r", big = q.name === "Lucca" || q.name === "Veenendaal";
    svg.append(el("circle", { cx: x, cy: y, r: big ? 9 : 5, fill: "var(--bg)", stroke: "var(--fg)", "stroke-width": big ? 3 : 2 }));
    svg.append(el("text", { x: x + (r ? 18 : -14), y: y + 7, "text-anchor": r ? "start" : "end", "font-size": big ? 24 : 19, "font-weight": big ? 700 : 400, fill: "var(--fg)", "font-style": q.name === "Lukmanier" ? "italic" : "normal" }, txt));
  }
  STAGES.forEach(s => {
    const f = { 3: .78, 8: .3 }[s.dag] || .5, [x, y] = at(s.a + (s.b - s.a) * f);
    svg.append(el("circle", { cx: x, cy: y, r: 14, fill: "var(--bg)", stroke: "var(--fg)", "stroke-width": 1.5 }));
    svg.append(el("text", { x, y: y + 6, "text-anchor": "middle", "font-size": 16, "font-weight": 700, fill: "var(--fg)" }, s.dag));
  });
})();
