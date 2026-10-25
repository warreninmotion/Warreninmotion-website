// Trainingslog per week, uit Strava, vanaf de week van de lancering (week 41, 2026). Elke week een nieuwe week bovenaan.
// Alleen weekcijfers: geen datum, dag of tijd per training, geen routes of plaatsen. Ritten op lengte, niet op volgorde.
// Zones = Strava-hartslagzones (Z1 t/m Z5), in procenten van de tijd. up = hoogtemeters, kcal = Strava-schatting.
// soort: "duur" (vooral Z2), "tempo" (veel Z3), "opbouw" (oplopend, met een harde finale), "herstel" (vooral Z1).
// Eén training in blokken (bv. 2× 50 km op één dag met een pauze ertussen): blokken: [{ km, min, up, zones }, ...];
// km, duur en zones van de training worden dan uit de blokken berekend. Zo gaat het in mei ook: etappes in blokken.
// weetjes: bij elk totaal een leuk weetje; elke week vernieuwen zodat het bij de nieuwe totalen past.
window.WIM_TRAINING = {
  updated: "25 oktober 2026",
  tot: { week: 19, jaar: 2027 }, // de tocht: week 19 van 2027 (15–22 mei)
  // Gepland schema voor de weken die nog komen. CONCEPT (15-10-2026), opgesteld door Claude: nog door Warren bevestigen.
  // km = richtlijn per week [van, tot]; lichtere weken ("rust") krijgen ongeveer 60% daarvan.
  plan: {
    fasen: [
      { naam: ["Basis", "Base"], van: [2026, 42], tot: [2026, 51], km: [220, 300],
        focus: ["Veel kilometers in zone 2, de duurzone, en twee keer per week kracht of HIIT. Zo groeit het fundament voor lange dagen.",
          "Lots of kilometres in zone 2, the endurance zone, and strength or HIIT twice a week. That builds the foundation for long days."] },
      { naam: ["Feestdagen", "Holidays"], van: [2026, 52], tot: [2027, 1], km: [120, 180],
        focus: ["Ook rond kerst en oud en nieuw doortrainen, met minder kilometers.", "Training on through Christmas and New Year, with fewer kilometres."] },
      { naam: ["Opbouw", "Build"], van: [2027, 2], tot: [2027, 9], km: [300, 400],
        focus: ["Langere ritten tot 120 à 150 km en blokken in zone 3. De duurritten worden echte dagtochten.",
          "Longer rides of 120 to 150 km and blocks in zone 3. The endurance rides become proper day trips."] },
      { naam: ["Specifiek", "Specific"], van: [2027, 10], tot: [2027, 15], km: [400, 550],
        focus: ["Twee of drie lange ritten achter elkaar en klimmen voor de Lukmanierpas. Wennen aan dag na dag in het zadel.",
          "Two or three long rides back to back and climbing for the Lukmanier Pass. Getting used to day after day in the saddle."] },
      { naam: ["De Lukmanier verkennen", "Scouting the Lukmanier"], van: [2027, 16], tot: [2027, 16], km: [350, 450],
        focus: ["Op weg terug naar Nederland fiets ik de zwaarste klim van de tocht: de Lukmanierpas. Zo weet ik in mei precies wat er komt.",
          "On the way back to the Netherlands, I ride the toughest climb of the ride: the Lukmanier Pass. So in May I know exactly what is coming."] },
      { naam: ["Afbouwen", "Taper"], van: [2027, 17], tot: [2027, 18], km: [150, 280],
        focus: ["Minder kilometers, wel scherp blijven. Zo sta ik op mijn sterkst aan de start in Lucca.",
          "Fewer kilometres, but staying sharp. So I am at my strongest at the start in Lucca."] },
    ],
    rust: [[2026, 45], [2026, 49], [2027, 5], [2027, 9], [2027, 13]],
  },
  weetjes: {
    km: ["Verder dan van Veenendaal naar Parijs over de weg. En al ruim 40 procent van de route van Lucca naar huis.",
      "Further than from Veenendaal to Paris by road. And already more than 40 per cent of the route from Lucca to home."],
    trainingen: ["Ruim een training per dag.", "More than one training session a day."],
    uren: ["Bijna anderhalf etmaal: dag en nacht doorgetraind, en dan nog een halve dag erbij.", "Almost a day and a half: a full day and night of training, plus half a day more."],
    kcal: ["Goed voor zo'n 80 pannenkoeken. Gezond eten hoort er dus gewoon bij.", "Good for about 80 pancakes. So healthy eating is part of the job."],
    hm: ["Ruim twee en een half keer de Eiffeltoren. Op de Lukmanierpas, 1.915 m hoog, wordt dat een stuk meer.",
      "More than two and a half times the Eiffel Tower. On the Lukmanier Pass, 1,915 m high, it will be a lot more."],
  },
  weeks: [
    {
      week: 43, jaar: 2026, van: "19 oktober 2026", tot: "25 oktober 2026", kcal: 6903,
      ritten: [
        { soort: "lang", binnen: false, blokken: [ // eerste blok buiten, tweede binnen
          { km: 50.2, min: 115, up: 204, zones: [5, 95, 0, 0, 0] },
          { km: 50.0, min: 102, up: 0, zones: [0, 100, 0, 0, 0] } ] },
        { soort: "duur", km: 51.9, min: 116, up: 377, binnen: false, zones: [1, 64, 35, 0, 0] },
      ],
      overig: [{ soort: "hiit", aantal: 3, min: 230 }, { soort: "padel", aantal: 2, min: 149 }],
      tekst: [
        "Deze week minder kilometers op de fiets, wel meer afwisseling: twee trainingen en ruim 152 kilometer, met 581 hoogtemeters. De langste dag was 100 km in twee blokken van 50: het eerste buiten, het tweede binnen op de trainer. Allebei vrijwel helemaal in zone 2, de duurzone.",
        "De andere rit was korter maar steviger, met ruim een derde in zone 3 en de meeste hoogtemeters van de week. Daarnaast deed ik drie HIIT-sessies voor kracht en explosiviteit en speelde ik twee keer padel. Zo train ik ook snelheid en wendbaarheid, naast de duurkilometers.",
      ],
      text: [
        "Fewer kilometres on the bike this week, but more variety: two sessions and more than 152 kilometres, with 581 metres of climbing. The longest day was 100 km in two blocks of 50: the first outdoors, the second indoors on the trainer. Both almost entirely in zone 2, the endurance zone.",
        "The other ride was shorter but harder, with more than a third in zone 3 and most of the week's climbing. On top of that I did three HIIT sessions for strength and power, and played padel twice. That way I also train speed and agility, alongside the endurance kilometres.",
      ],
    },
    {
      week: 42, jaar: 2026, van: "12 oktober 2026", tot: "18 oktober 2026", kcal: 6719,
      ritten: [
        { soort: "lang", binnen: true, blokken: [
          { km: 50.0, min: 99, up: 0, zones: [3, 97, 0, 0, 0] },
          { km: 30.0, min: 56, up: 0, zones: [5, 70, 23, 2, 0] } ] },
        { soort: "duur", km: 60.0, min: 122, up: 0, binnen: true, zones: [33, 67, 0, 0, 0] },
        { soort: "duur", km: 55.8, min: 124, up: 178, binnen: false, zones: [3, 97, 0, 0, 0] },
        { soort: "duur", km: 30.9, min: 71, up: 154, binnen: false, zones: [11, 88, 1, 0, 0] },
        { soort: "herstel", km: 26.7, min: 60, up: 0, binnen: false, zones: [0, 0, 0, 0, 0] }, // geen hartslag gemeten
      ],
      overig: [{ soort: "hiit", aantal: 3, min: 162 }],
      tekst: [
        "Weer een stap verder: vijf trainingen op de fiets en ruim 253 kilometer, iets meer dan vorige week. Voor het eerst reed ik ook buiten, met de eerste hoogtemeters erbij. De langste dag was 80 km in twee blokken, van 50 en 30 km.",
        "Bijna alles reed ik in zone 2, de duurzone. Daar groeit het fundament voor de lange dagen in mei. Het laatste blok liep op naar een stevige finale. Daarnaast deed ik drie HIIT-sessies voor kracht en explosiviteit.",
      ],
      text: [
        "Another step forward: five sessions on the bike and more than 253 kilometres, a bit more than last week. For the first time I also rode outdoors, with the first metres of climbing. The longest day was 80 km in two blocks, of 50 and 30 km.",
        "Almost everything was in zone 2, the endurance zone. That is where the foundation for the long days in May grows. The last block built up to a solid finish. On top of that I did three HIIT sessions for strength and power.",
      ],
    },
    {
      week: 41, jaar: 2026, van: "5 oktober 2026", tot: "11 oktober 2026", kcal: 7844,
      ritten: [
        { soort: "lang", binnen: true, blokken: [
          { km: 50.0, min: 100, up: 0, zones: [11, 89, 0, 0, 0] },
          { km: 50.0, min: 97, up: 0, zones: [1, 35, 64, 0, 0] } ] },
        { soort: "duur", km: 50.0, min: 98, up: 0, binnen: true, zones: [8, 92, 0, 0, 0] },
        { soort: "opbouw", km: 50.0, min: 95, up: 0, binnen: true, zones: [7, 63, 27, 3, 0] },
        { soort: "duur", km: 44.3, min: 84, up: 0, binnen: true, zones: [5, 51, 43, 1, 0] },
      ],
      overig: [{ soort: "hiit", aantal: 3, min: 248 }],
      tekst: [
        "Een sterke week op de fiets: vier trainingen en ruim 244 kilometer. De langste was 100 km in twee blokken van 50, met een pauze ertussen. Zo ga ik het in mei ook doen: een etappe van 200 km rijd je niet in één ruk, maar in blokken.",
        "Het eerste blok reed ik in zone 2, de duurzone, het tweede bewust harder, met bijna twee derde in zone 3. Eén rit bouwde ik op naar een stevige eindsprint. Daarnaast deed ik drie HIIT-sessies voor kracht en explosiviteit. Stap voor stap komt de conditie.",
      ],
      text: [
        "A strong week on the bike: four sessions and more than 244 kilometres. The longest was 100 km in two blocks of 50, with a break in between. That is how I will do it in May too: you don't ride a 200 km stage in one go, but in blocks.",
        "I rode the first block in zone 2, the endurance zone, and the second one deliberately harder, with almost two thirds in zone 3. One ride built up to a solid final sprint. On top of that I did three HIIT sessions for strength and power. Step by step, the fitness is coming.",
      ],
    },
  ],
};
