// Trainingslog per week, uit Strava, vanaf de week van de lancering (week 41, 2026). Elke week een nieuwe week bovenaan.
// Alleen weekcijfers: geen datum, dag of tijd per training, geen routes of plaatsen. Ritten op lengte, niet op volgorde.
// Zones = Strava-hartslagzones (Z1 t/m Z5), in procenten van de tijd. up = hoogtemeters, kcal = Strava-schatting.
// soort: "duur" (vooral Z2), "tempo" (veel Z3), "opbouw" (oplopend, met een harde finale), "herstel" (vooral Z1).
// weetjes: bij elk totaal een leuk weetje; elke week vernieuwen zodat het bij de nieuwe totalen past.
window.WIM_TRAINING = {
  updated: "15 oktober 2026",
  tot: { week: 19, jaar: 2027 }, // de tocht: week 19 van 2027 (15–22 mei)
  weetjes: {
    km: ["Dat is verder dan van Veenendaal naar Brussel. En al 15% van de afstand van Lucca naar huis.",
      "That is further than from Veenendaal to Brussels. And already 15% of the distance from Lucca to home."],
    trainingen: ["Gemiddeld meer dan één training per dag.", "More than one session a day on average."],
    uren: ["Ongeveer zo lang als een vlucht van Amsterdam naar Bangkok.", "About as long as a flight from Amsterdam to Bangkok."],
    kcal: ["Goed voor zo'n 30 pannenkoeken. Gezond eten hoort er dus gewoon bij.", "Good for about 30 pancakes. So healthy eating is part of the job."],
    hm: ["", ""],
  },
  weeks: [
    {
      week: 41, jaar: 2026, van: "5 oktober 2026", tot: "11 oktober 2026", kcal: 7844,
      ritten: [
        { soort: "duur", km: 50.0, min: 100, up: 0, binnen: true, zones: [11, 89, 0, 0, 0] },
        { soort: "duur", km: 50.0, min: 98, up: 0, binnen: true, zones: [8, 92, 0, 0, 0] },
        { soort: "tempo", km: 50.0, min: 97, up: 0, binnen: true, zones: [1, 35, 64, 0, 0] },
        { soort: "opbouw", km: 50.0, min: 95, up: 0, binnen: true, zones: [7, 63, 27, 3, 0] },
        { soort: "duur", km: 44.3, min: 84, up: 0, binnen: true, zones: [5, 51, 43, 1, 0] },
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
  ],
};
