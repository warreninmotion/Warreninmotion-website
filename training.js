// Trainingsverslag per week, uit Strava (ritten, km, tijd en hartslagzones). Elke week een nieuwe week bovenaan.
// Privacy (vast): geen datum of dag per training, geen starttijden, geen routes, kaarten of plaatsen.
// Ritten binnen een week staan op lengte, niet op volgorde. Zones = Strava-hartslagzones (Z1 t/m Z5), in procenten van de tijd.
// soort: "duur" (vooral Z2), "tempo" (veel Z3), "opbouw" (oplopend, met een harde finale), "herstel" (vooral Z1).
window.WIM_TRAINING = {
  updated: "15 oktober 2026",
  weeks: [
    {
      week: 41, van: "5 oktober 2026", tot: "11 oktober 2026",
      ritten: [
        { soort: "duur", km: 50.0, min: 100, binnen: true, zones: [11, 89, 0, 0, 0] },
        { soort: "duur", km: 50.0, min: 98, binnen: true, zones: [8, 92, 0, 0, 0] },
        { soort: "tempo", km: 50.0, min: 97, binnen: true, zones: [1, 35, 64, 0, 0] },
        { soort: "opbouw", km: 50.0, min: 95, binnen: true, zones: [7, 63, 27, 3, 0] },
        { soort: "duur", km: 44.3, min: 84, binnen: true, zones: [5, 51, 43, 1, 0] },
      ],
      overig: [{ soort: "hiit", aantal: 3, min: 248 }],
      tekst: [
        "Een sterke week op de fiets: vijf ritten en ruim 244 kilometer. De meeste kilometers reed ik rustig in zone 2. Dat is de basis voor acht lange dagen in mei: lang door kunnen zonder leeg te raken.",
        "Eén rit reed ik bewust harder, met bijna twee derde in zone 3. De laatste rit bouwde ik op naar een stevige eindsprint. Daarnaast deed ik drie HIIT-sessies voor kracht en explosiviteit. Stap voor stap komt de conditie.",
      ],
      text: [
        "A strong week on the bike: five rides and more than 244 kilometres. I rode most of them easy, in zone 2. That is the base for eight long days in May: keep going for hours without running empty.",
        "One ride was deliberately harder, with almost two thirds in zone 3. The last ride built up to a solid final sprint. On top of that I did three HIIT sessions for strength and power. Step by step, the fitness is coming.",
      ],
    },
    {
      week: 40, van: "28 september 2026", tot: "4 oktober 2026",
      ritten: [],
      overig: [{ soort: "run", aantal: 2, km: 20.6, min: 131 }, { soort: "hiit", aantal: 1, min: 48 }],
      tekst: [
        "Deze week stond de fiets stil. Ik liep twee keer hard, samen 20,6 km met flink wat hoogtemeters, en deed één HIIT-sessie. Even iets anders voor lijf en hoofd, en volgende week weer volop fietsen.",
      ],
      text: [
        "The bike stayed in the shed this week. I went for two runs, 20.6 km together with plenty of climbing, and did one HIIT session. Something different for body and mind, and back to full cycling next week.",
      ],
    },
    {
      week: 39, van: "21 september 2026", tot: "27 september 2026",
      ritten: [],
      overig: [{ soort: "walk", aantal: 6, km: 54.5, min: 757 }],
      tekst: [
        "Een actieve rustweek: geen fiets, wel zes wandelingen, samen 54,5 km. Rust hoort bij het plan. Zo kom ik fris terug op de fiets.",
      ],
      text: [
        "An active rest week: no bike, but six walks, 54.5 km together. Rest is part of the plan. That way I come back to the bike fresh.",
      ],
    },
    {
      week: 38, van: "14 september 2026", tot: "20 september 2026",
      ritten: [
        { soort: "herstel", km: 66.3, min: 138, binnen: true, zones: [59, 41, 0, 0, 0] },
        { soort: "herstel", km: 61.0, min: 137, binnen: true, zones: [83, 17, 0, 0, 0] },
        { soort: "duur", km: 43.0, min: 86, binnen: false, zones: [3, 56, 41, 0, 0] },
      ],
      overig: [{ soort: "hiit", aantal: 2, min: 120 }],
      tekst: [
        "Drie ritten, samen 170 kilometer. Eén stevige rit buiten, met ruim 40% in zone 3, en twee lange ritten binnen van ruim twee uur, rustig in zone 1 en 2. Lange tijd in het zadel went: precies wat ik in mei nodig heb. Daarbij twee HIIT-sessies.",
      ],
      text: [
        "Three rides, 170 kilometres together. One solid ride outdoors, with over 40% in zone 3, and two long indoor rides of more than two hours, easy in zones 1 and 2. Getting used to long hours in the saddle: exactly what I need in May. Plus two HIIT sessions.",
      ],
    },
  ],
};
