// Meefietsen (/meefietsen/, /en/ride-along/) en de bedankpagina's.
// Drie keuzes in het formulier (besluit Warren 19-11-2026): meefietsen €50 (incl. fietsshirt), meefietsen + diner €150
// (€50 + €100), alleen het diner €100. Bij "alleen het diner" vallen de fietsvelden weg (maat, fiets, eigen risico):
// ze worden verborgen en uitgeschakeld, dus niet verplicht en niet verstuurd. Het verborgen veld `fietsplek` zegt of de
// aanmelding meetelt voor de 50 fietsplekken (ja/nee); alleen fietsers tellen mee voor de deelnemerslijst, de tweede
// groep (vanaf de 51e fietser) en de reservelijst. Vooraf kiezen kan met ?keuze=meefietsen|meefietsen-diner|diner.
(function () {
  const KEUZES = ["meefietsen", "meefietsen-diner", "diner"];
  const q = new URLSearchParams(location.search).get("keuze");
  const ss = { get() { try { return sessionStorage.getItem("wim-mf-keuze"); } catch (e) { return null; } },
               set(v) { try { sessionStorage.setItem("wim-mf-keuze", v); } catch (e) {} } };

  // Bedankpagina: tekst voor fietsers, fietsers met diner of alleen het diner.
  // Keuze uit ?keuze= (action van het formulier); valt die weg, dan uit sessionStorage (gezet bij versturen).
  const bedankt = document.querySelectorAll("[data-alleen]");
  if (bedankt.length) {
    const k = KEUZES.includes(q) ? q : ss.get();
    bedankt.forEach(n => {
      const a = n.dataset.alleen;
      n.hidden = a === "diner" ? k !== "diner" : a === "metdiner" ? k !== "meefietsen-diner" : k === "diner";
    });
  }

  const form = document.querySelector('form[name="meefietsen"]');
  if (!form) return;
  const blok = form.querySelector("[data-fiets]"), base = form.getAttribute("action").split("?")[0];
  const zet = () => {
    const k = (form.querySelector('input[name="keuze"]:checked') || {}).value || "";
    const alleenDiner = k === "diner";
    blok.hidden = alleenDiner;
    blok.querySelectorAll("input,select").forEach(el => { el.disabled = alleenDiner; });
    form.elements.diner.value = k ? (k === "meefietsen" ? "nee" : "ja") : "";
    form.elements.fietsplek.value = k ? (alleenDiner ? "nee" : "ja") : "";
    form.setAttribute("action", k ? `${base}?keuze=${k}` : base);
  };
  const kies = k => {
    const r = form.querySelector(`input[name="keuze"][value="${k}"]`);
    if (r) { r.checked = true; zet(); }
  };
  form.addEventListener("change", e => {
    if (e.target.name !== "keuze") return;
    zet();
    if (KEUZES.includes(new URLSearchParams(location.search).get("keuze"))) history.replaceState(null, "", `?keuze=${e.target.value}${location.hash}`);
  });
  form.addEventListener("submit", () => { const k = (form.querySelector('input[name="keuze"]:checked') || {}).value; if (k) ss.set(k); });
  // Kaartlinks op dezelfde pagina: keuze zetten zonder te herladen
  document.querySelectorAll("a[data-keuze]").forEach(a => a.addEventListener("click", e => {
    e.preventDefault(); kies(a.dataset.keuze);
    history.replaceState(null, "", `?keuze=${a.dataset.keuze}#aanmelden`);
    document.getElementById("aanmelden").scrollIntoView({ behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth" });
  }));
  if (KEUZES.includes(q)) kies(q); else zet();
})();
