// Trainingslog per week, uit Strava, vanaf de week van de lancering (week 41, 2026). Elke week een nieuwe week bovenaan.
// Alleen weekcijfers: geen datum, dag of tijd per training, geen routes of plaatsen. Ritten op lengte, niet op volgorde.
// Zones = Strava-hartslagzones (Z1 t/m Z5), in procenten van de tijd. up = hoogtemeters, kcal = Strava-schatting.
// soort: "duur" (vooral Z2), "tempo" (veel Z3), "opbouw" (oplopend, met een harde finale), "herstel" (vooral Z1).
// Eén training in blokken (bv. 2× 50 km op één dag met een pauze ertussen): blokken: [{ km, min, up, zones }, ...];
// km, duur en zones van de training worden dan uit de blokken berekend. Zo gaat het in mei ook: etappes in blokken.
// weetjes: bij elk totaal een leuk weetje; elke week vernieuwen zodat het bij de nieuwe totalen past.
window.WIM_TRAINING = {
  updated: "15 oktober 2026",
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
    km: ["Dat is verder dan van Veenendaal naar Brussel. En al 15% van de afstand van Lucca naar huis.",
      "That is further than from Veenendaal to Brussels. And already 15% of the distance from Lucca to home."],
    trainingen: ["Gemiddeld elke dag een training.", "A training session every day on average."],
    uren: ["Ongeveer zo lang als een vlucht van Amsterdam naar Bangkok.", "About as long as a flight from Amsterdam to Bangkok."],
    kcal: ["Goed voor zo'n 30 pannenkoeken. Gezond eten hoort er dus gewoon bij.", "Good for about 30 pancakes. So healthy eating is part of the job."],
    hm: ["", ""],
  },
  weeks: [
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
