// Evenementen: waar Warren meedoet of zelf iets organiseert, ook samen met bedrijven. Nieuwste onderaan, op datum.
// datum: "JJJJ-MM-DD" (of week: [jaar, week] als de precieze dag nog niet vastligt); tot: laatste dag bij meerdaagse.
// voorbehoud: true = datum of plan nog niet bevestigd ("onder voorbehoud").
// partner: bedrijf waarmee het evenement samen gebeurt (krijgt zo zichtbaarheid); link: meer info of aanmelden.
// meedoen: true = bezoekers kunnen zelf meedoen of komen kijken.
window.WIM_EVENTS = [
  { datum: "2027-03-21", voorbehoud: true, soort: ["Toertocht", "Sportive"],
    titel: ["Omloop van Zandvoort", "Omloop van Zandvoort"], plek: "Circuit Zandvoort",
    tekst: ["Over het circuit, door de duinen en langs de bloemenvelden. Routes van 40, 80 en 120 km; Warren rijdt de lange.",
      "Across the race track, through the dunes and past the flower fields. Routes of 40, 80 and 120 km; Warren rides the long one."],
    link: "https://www.circuitzandvoort.nl/", meedoen: true },
  { week: [2027, 16], voorbehoud: true, soort: ["Verkenning", "Recce"],
    titel: ["De route afrijden", "Riding the route"], plek: ["Lucca → Veenendaal", "Lucca → Veenendaal"],
    tekst: ["Een maand voor de tocht rijdt Warren de route alvast: de generale repetitie voor fiets, voeding, slapen en de volgbus.",
      "A month before the ride, Warren rides the route in advance: the dress rehearsal for bike, food, sleep and the follow van."] },
  { datum: "2027-05-15", tot: "2027-05-22", soort: ["De tocht", "The ride"],
    titel: ["Lucca → Veenendaal", "Lucca → Veenendaal"], plek: ["Start op de Piazza dell'Anfiteatro, Lucca", "Start at the Piazza dell'Anfiteatro, Lucca"],
    tekst: ["Acht dagen, zeven landen, 1.570 km. Volg Warren live, kilometer voor kilometer.", "Eight days, seven countries, 1,570 km. Follow Warren live, kilometre by kilometre."],
    link: "/route/" },
  { datum: "2027-05-22", soort: ["Meefietsen", "Ride along"],
    titel: ["Eindsprint en diner", "Final sprint and dinner"], plek: ["Den Bosch → Veenendaal", "Den Bosch → Veenendaal"],
    tekst: ["Fiets de laatste ruim 50 km mee naar de finish en vier het daarna samen bij het diner. Maximaal 50 plekken.",
      "Ride the last 50-plus km to the finish with Warren and celebrate together at the dinner. Up to 50 places."],
    link: "/doneren/#eindsprint", meedoen: true },
];
