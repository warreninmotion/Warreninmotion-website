// Beeldlijst: alle plekken waar nog een echte foto of video van Warren moet komen. Tot die tijd staat er het vaste
// vervangbeeld (assets/img/placeholder.webp) met rechtsonder een label: welk beeld, staand of liggend en welke verhouding.
// Gebruik in een pagina: <figure class="ph" data-shot="home-pedalen"></figure>. Overzicht voor Warren: /beeldlijst/.
// Alleen beelden die nu te maken zijn: het shirt en de beplakte volgbus bestaan pas als de sponsors er zijn.
// Is het beeld er? Zet src (en bij video poster) en het vervangbeeld verdwijnt vanzelf.
window.WIM_SHOTS = {
  "home-pedalen": { pagina: "/", soort: "video", ratio: "4/5", src: "",
    wat: ["Detail: draaiende pedalen en Warrens schoenen (achtergrond van 'Acht dagen, zeven landen')", "Detail: spinning pedals and Warren's shoes (background for 'Eight days, seven countries')"],
    tip: ["Laag bij de grond, camera stil, Warren fietst door. 5 tot 10 seconden is genoeg.", "Low to the ground, camera still, Warren keeps pedalling. 5 to 10 seconds is enough."] },
  "home-frontaal": { pagina: "/", soort: "foto", ratio: "4/5", src: "",
    wat: ["Frontaal: Warren fietst op je af (achtergrond van 'Wie is Warren?')", "Head-on: Warren riding towards you (background for 'Who is Warren?')"],
    tip: ["Staand, op een dijk of polderweg, veel lucht, in je eigen fietskleding. Onderin komt tekst: houd daar rust in beeld.", "Portrait, on a dyke or polder road, lots of sky, in your own cycling kit. Text goes at the bottom: keep that area calm."] },
  "home-koken": { pagina: "/", soort: "foto", ratio: "4/5", src: "",
    wat: ["Warren kookt een gezonde maaltijd (achtergrond van 'Waarom de voedselbank')", "Warren cooking a healthy meal (background for 'Why the food bank')"],
    tip: ["Handen, pan en verse groente; van bovenaf of schuin. Gewone keuken, geen studio.", "Hands, pan and fresh veg; from above or at an angle. An ordinary kitchen, no studio."] },
  "warren-thuis": { pagina: "/over-warren/", soort: "foto", ratio: "4/5", src: "",
    wat: ["Warren thuis, kijkt recht in de camera", "Warren at home, looking straight into the camera"],
    tip: ["Daglicht, gewone kleding, een lach. Dit is het 'hoe het begon'-beeld.", "Daylight, everyday clothes, a smile. This is the 'how it started' picture."] },
  "warren-weg": { pagina: "/over-warren/", soort: "video", ratio: "16/9", src: "",
    wat: ["Warren fietst bij zonsopkomst van de camera weg", "Warren riding away from the camera at sunrise"],
    tip: ["Van achteren, lange weg, laag zonlicht. Mag ook als foto.", "From behind, a long road, low sun. A photo is fine too."] },
  "doneren-tas": { pagina: "/doneren/", soort: "foto", ratio: "4/5", src: "",
    wat: ["Voedselbank: een tas boodschappen wordt meegegeven", "Food bank: a bag of groceries being handed over"],
    tip: ["Focus op de tas en de handen, geen herkenbare klanten.", "Focus on the bag and the hands, no recognisable clients."] },
  "doneren-groep": { pagina: "/doneren/", soort: "foto", ratio: "21/9", src: "",
    wat: ["Groep fietsers samen op de weg", "A group of cyclists riding together"],
    tip: ["Een groepsrit met vrienden of een club: zo ziet de eindsprint er straks uit.", "A group ride with friends or a club: that's what the final sprint will look like."] },
  "sponsor-bezoek": { pagina: "/sponsoren/", soort: "foto", ratio: "3/2", src: "",
    wat: ["Warren bij een sponsor: samen bij het bedrijf", "Warren with a sponsor: together at their business"],
    tip: ["Bijvoorbeeld bij Chiropractie Bennekom: handdruk of samen voor de deur, logo of naambord in beeld.", "For example at Chiropractie Bennekom: a handshake or together at the door, with their logo or sign in shot."] },
  "contact-portret": { pagina: "/contact/", soort: "foto", ratio: "4/5", src: "",
    wat: ["Portret: Warren lachend", "Portrait: Warren smiling"],
    tip: ["Halflang, effen achtergrond, gewone kleding of fietskleding, recht in de camera: 'mail me gerust'.", "Waist up, calm background, everyday or cycling clothes, straight into the camera: 'feel free to email me'."] },
};
