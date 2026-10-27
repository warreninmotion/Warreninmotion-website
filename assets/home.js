// Lanceringsvideo: speelt vanzelf zonder geluid zodra hij in beeld is; geluid alleen als de bezoeker het aanzet.
(function () {
  const v = document.getElementById("lv"), b = document.getElementById("snd");
  const ICON_OFF = '<path d="M11 5 6 9H2v6h4l5 4V5z"/><path d="m23 9-6 6M17 9l6 6"/>', ICON_ON = '<path d="M11 5 6 9H2v6h4l5 4V5z"/><path d="M15.5 8.5a5 5 0 0 1 0 7M19 5a10 10 0 0 1 0 14"/>';
  const sync = () => { b.setAttribute("aria-pressed", String(!v.muted)); b.querySelector("span").textContent = v.muted ? t("Geluid aan", "Sound on") : t("Geluid uit", "Sound off"); b.querySelector("svg").innerHTML = v.muted ? ICON_OFF : ICON_ON; };
  b.addEventListener("click", () => { v.muted = !v.muted; if (!v.muted && v.paused) v.play(); sync(); });
  v.addEventListener("volumechange", sync);
  v.muted = true;
  // Op de telefoon staat de video onder de tussenstand (wens Warren 26-10-2026); op de computer naast de kop
  const fig = v.closest(".hero-vid"), home = fig.parentNode, stand = document.querySelector(".stand-sec"), mq = matchMedia("(max-width:859px)");
  const place = () => mq.matches ? stand.after(fig) : home.append(fig);
  place(); mq.addEventListener("change", place);
  if (matchMedia("(prefers-reduced-motion: reduce)").matches) { v.controls = true; return; } // geen autoplay bij minder beweging
  const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) v.play().catch(() => {}); else if (v.muted) v.pause(); }), { threshold: .35 });
  io.observe(v);
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
