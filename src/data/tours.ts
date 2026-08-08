/**
 * Fictional journey catalogue for the Harry's Hunts demonstration site.
 *
 * Nothing here describes a real operator, a real property, or a bookable trip.
 * Regions are deliberately broad — no specific block, station, or access point
 * is named — and every figure is indicative rather than a quote.
 */
import type { ImageMetadata } from 'astro';

import snowlinePeaks from '../assets/scenes/snowline-peaks.jpg';
import braidedRiver from '../assets/scenes/braided-river.jpg';
import tussockRidge from '../assets/scenes/tussock-ridge.jpg';
import valleyDawn from '../assets/scenes/valley-dawn.jpg';
import cloudInversion from '../assets/scenes/cloud-inversion.jpg';

export type Island = 'north' | 'south';

export type SpeciesCategory =
  | 'red-deer'
  | 'sika'
  | 'tahr'
  | 'chamois'
  | 'mixed-foundation'
  | 'photography';

export interface TourDay {
  label: string;
  title: string;
  detail: string;
}

export interface Tour {
  slug: string;
  name: string;
  island: Island;
  /** Deliberately broad; we never publish access points or block names. */
  region: string;
  category: SpeciesCategory;
  categoryLabel: string;
  tagline: string;
  summary: string;
  story: string[];
  season: string;
  seasonMonths: string;
  durationDays: number;
  durationLabel: string;
  terrain: string;
  partySize: string;
  accommodation: string;
  accommodationDetail: string;
  guidingIntensity: string;
  /** 1 (gentle) to 5 (demanding). Drives the fitness meter. */
  fitness: 1 | 2 | 3 | 4 | 5;
  fitnessLabel: string;
  fitnessGuidance: string;
  included: string[];
  notIncluded: string[];
  days: TourDay[];
  /** Indicative planning figure in NZD per guest. Never presented as a quote. */
  indicativeFrom: number;
  image: ImageMetadata;
  imageAlt: string;
  featured?: boolean;
}

export const tours: Tour[] = [
  {
    slug: 'volcanic-plateau-roar',
    name: 'Volcanic Plateau Roar',
    island: 'north',
    region: 'Central North Island high country',
    category: 'red-deer',
    categoryLabel: 'Red stag',
    tagline: 'Six mornings inside the roar',
    summary:
      'Pumice country, beech edges and open tops in the first week of April, when the valleys carry sound for miles and every ridge is worth a listen.',
    story: [
      'The plateau in autumn is a listening country. Cold air settles into the pumice gullies overnight and holds sound, so a stag two basins away can arrive at your ear like he is standing in the next clearing. The work is patience: sit, listen, triangulate, and only then commit to a face.',
      'We run this journey as a small, unhurried party. Mornings start in the dark and finish mid-morning; afternoons are for maps, rest, and a second listen from a different aspect. Your guide sets the pace, calls the wind, and makes the shot decision with you — not for you.',
      'Every party is briefed on identification, safe firearm handling, and the permissions covering the ground we walk. If conditions or animal condition are wrong, we let it go and come back tomorrow. That is the whole point of a six-morning trip.',
    ],
    season: 'Autumn — the roar',
    seasonMonths: 'Late March to early May',
    durationDays: 6,
    durationLabel: '6 days / 5 nights',
    terrain: 'Rolling pumice ridges, beech margins and tussock clearings, 600–1,300 m',
    partySize: '2–4 guests, 1 guide per 2 guests',
    accommodation: 'Timber lodge',
    accommodationDetail:
      'Private room in a six-guest lodge with drying room, boot room and a long table that everyone eats at.',
    guidingIntensity: 'Fully guided, one guide per two guests',
    fitness: 3,
    fitnessLabel: 'Moderate',
    fitnessGuidance:
      'Expect 6–12 km a day on uneven ground with 400–700 m of climbing, carrying a light day pack. Comfortable if you walk hill country most weekends.',
    included: [
      'Six days guided fieldcraft with a NZ-licensed guide',
      'Lodge accommodation, all meals and non-alcoholic drinks',
      'Transfers from the nearest regional airport',
      'Permit administration and access permissions for the ground we use',
      'Loan of optics, packs and wet-weather shells',
      'Game care, chiller access and processing coordination',
    ],
    notIncluded: [
      'Flights to New Zealand and domestic connections',
      'Firearms licensing, hire or ammunition',
      'Travel and medical insurance',
      'Trophy export, taxidermy and freight',
      'Alcohol and personal items',
    ],
    days: [
      {
        label: 'Day 1',
        title: 'Arrival and range time',
        detail:
          'Airport transfer, lodge settling, kit check and an unhurried afternoon confirming zero and safe handling with your guide.',
      },
      {
        label: 'Days 2–5',
        title: 'Mornings on the tops',
        detail:
          'Pre-dawn starts, listening from high ground, and a considered stalk when the wind and light line up. Afternoons for rest, maps and a second sit.',
      },
      {
        label: 'Day 6',
        title: 'Last listen and departure',
        detail:
          'A short final morning, breakfast at the long table, game-care handover and transfer back.',
      },
    ],
    indicativeFrom: 7900,
    image: valleyDawn,
    imageAlt:
      'Guided party walking a tussock ridge above a braided river valley at dawn, with cloud settling in the ranges beyond.',
    featured: true,
  },
  {
    slug: 'kaweka-sika-line',
    name: 'Kaweka Sika Line',
    island: 'north',
    region: 'Eastern North Island ranges',
    category: 'sika',
    categoryLabel: 'Sika',
    tagline: 'The quiet deer, on their terms',
    summary:
      'A hut-to-hut week in tight bush and manuka scrub, learning to move slowly enough that sika stop leaving before you arrive.',
    story: [
      'Sika reward the patient and humble the confident. They live in thick country, they move on their own schedule, and they will exit a face before most people register they were there. This journey is built around the skill rather than the outcome: reading sign, wind discipline, still-hunting at a genuinely slow pace.',
      'We work a hut-to-hut line through bush and scrub with light packs, moving camp twice across the week. It is the most technical of our foot journeys and the one guests most often book a second time.',
      'Guides carry the navigation and the safety plan. You carry your own gear and your own attention. Some parties take an animal on day two; some take none. Both are ordinary weeks in sika country.',
    ],
    season: 'Late summer through winter',
    seasonMonths: 'February to July',
    durationDays: 7,
    durationLabel: '7 days / 6 nights',
    terrain: 'Dense bush, manuka scrub and steep faces, 400–1,100 m',
    partySize: '2–3 guests, 1 guide',
    accommodation: 'Backcountry huts',
    accommodationDetail:
      'Simple huts with bunks, wood heat and shared cooking. Bring a sleeping bag; we supply everything else.',
    guidingIntensity: 'Fully guided, shared guide',
    fitness: 4,
    fitnessLabel: 'Demanding',
    fitnessGuidance:
      'Steep, trackless ground for 5–8 hours a day carrying 12–15 kg on move days. Suited to guests who tramp regularly with a full pack.',
    included: [
      'Seven days guided fieldcraft with a NZ-licensed guide',
      'Hut fees, all backcountry meals and cooking gear',
      'Transfers from the nearest town and road-end logistics',
      'Permit administration for the ground we use',
      'Loan of packs, shells, and a personal locator beacon',
      'Pre-trip fitness and kit consultation',
    ],
    notIncluded: [
      'Flights and domestic connections',
      'Firearms licensing, hire or ammunition',
      'Sleeping bag and personal clothing layers',
      'Travel and medical insurance',
      'Trophy export, taxidermy and freight',
    ],
    days: [
      {
        label: 'Day 1',
        title: 'Road end to first hut',
        detail:
          'Kit shakedown, a three-hour walk in, and an evening briefing on sign, wind and the week ahead.',
      },
      {
        label: 'Days 2–3',
        title: 'Learning the ground',
        detail:
          'Still-hunting the faces around the first hut, working out where the deer are feeding and where they are bedding.',
      },
      {
        label: 'Day 4',
        title: 'Move camp',
        detail: 'A tops crossing to the second hut, with glassing stops on the way over.',
      },
      {
        label: 'Days 5–6',
        title: 'The second basin',
        detail: 'Two full days on fresh country with the pace set by conditions rather than plan.',
      },
      {
        label: 'Day 7',
        title: 'Walk out',
        detail: 'An early exit to the road end, debrief and transfer.',
      },
    ],
    indicativeFrom: 8600,
    image: cloudInversion,
    imageAlt: 'Cloud settling below a bush-edged ridgeline with snow on the higher tops behind.',
  },
  {
    slug: 'alpine-tahr-traverse',
    name: 'Alpine Tahr Traverse',
    island: 'south',
    region: 'Southern Alps, Main Divide country',
    category: 'tahr',
    categoryLabel: 'Himalayan tahr',
    tagline: 'Winter coats, high basins, real mountains',
    summary:
      'Our most serious alpine journey: bluff systems, snow-line basins and a helicopter lift into country you would otherwise spend two days reaching.',
    story: [
      'Tahr live where the map runs out of contour lines. Winter is when their capes are heaviest and the light is at its best, and it is also when the mountains ask the most of everyone in the party. This is a genuine alpine trip with a genuine alpine safety plan.',
      'We fly in, establish at a serviced alpine hut, and work basins on foot from there. Days are long and cold and involve exposed sidling on steep ground. Guides are avalanche-trained and carry the call on when a basin is off the table.',
      'Shot discipline matters more here than anywhere else we operate. If the animal, the angle, or the recovery ground is wrong, we do not shoot. We would rather bring you back next winter.',
    ],
    season: 'Winter',
    seasonMonths: 'May to August',
    durationDays: 8,
    durationLabel: '8 days / 7 nights',
    terrain: 'Alpine basins, snow-grass slopes and bluff systems, 900–2,100 m',
    partySize: '2 guests, 1 guide per guest',
    accommodation: 'Serviced alpine hut',
    accommodationDetail:
      'A four-bunk alpine hut with diesel heat, hot food and a drying rack, resupplied by air.',
    guidingIntensity: 'One guide per guest',
    fitness: 5,
    fitnessLabel: 'Very demanding',
    fitnessGuidance:
      'Sustained climbing of 800–1,200 m on steep, exposed, often snow-covered ground in cold conditions. We ask for a frank fitness conversation and a recent alpine day under your belt before confirming.',
    included: [
      'Eight days guided alpine fieldcraft, one guide per guest',
      'Return helicopter transfer and in-trip repositioning',
      'Alpine hut accommodation and all meals',
      'Avalanche safety equipment and briefing',
      'Permit administration for the ground we use',
      'Loan of alpine boots, crampons, ice axe and optics',
    ],
    notIncluded: [
      'International and domestic flights',
      'Firearms licensing, hire or ammunition',
      'Personal alpine clothing layers',
      'Travel, medical and helicopter-evacuation insurance',
      'Trophy export, taxidermy and freight',
    ],
    days: [
      {
        label: 'Day 1',
        title: 'Briefing and weather window',
        detail:
          'Kit check, avalanche briefing and range time in the valley while we read the flying forecast.',
      },
      {
        label: 'Day 2',
        title: 'Fly in',
        detail:
          'A short lift to the alpine hut, an acclimatising walk, and first glassing from the terrace.',
      },
      {
        label: 'Days 3–6',
        title: 'Basins on foot',
        detail:
          'Four full days working basins and bluff systems, with one weather day assumed in every itinerary.',
      },
      {
        label: 'Day 7',
        title: 'Reserve day',
        detail: 'Held for weather, recovery, or the basin you wanted one more look at.',
      },
      {
        label: 'Day 8',
        title: 'Fly out',
        detail: 'Morning lift to the valley, game-care handover and transfer.',
      },
    ],
    indicativeFrom: 14500,
    image: snowlinePeaks,
    imageAlt: 'Snow-covered alpine peaks above a dark ridge with cloud banked against the range.',
    featured: true,
  },
  {
    slug: 'braided-river-chamois',
    name: 'Braided River Chamois',
    island: 'south',
    region: 'Inland Canterbury high country',
    category: 'chamois',
    categoryLabel: 'Chamois',
    tagline: 'Big country, small animal, long glass',
    summary:
      'Five days of spotting-scope work above a braided river system, where the animals are found with patience and the walking is earned rather than long.',
    story: [
      'Chamois are a glassing animal. You find them by sitting still behind good glass for longer than feels reasonable, then you earn the last four hundred metres on your hands and knees. It is the most technical shooting we guide and the most rewarding to get right.',
      'The river country gives us broad sightlines and a lot of aspects to work. We move by vehicle to a new vantage each morning and spend the day on foot from there, which keeps the walking honest without making it a slog.',
      'This journey suits guests who like the finding as much as the taking, and it pairs well with a camera. Several parties each season book it without any intention of taking an animal at all.',
    ],
    season: 'Autumn and early winter',
    seasonMonths: 'April to July',
    durationDays: 5,
    durationLabel: '5 days / 4 nights',
    terrain: 'River terraces, tussock faces and shingle basins, 500–1,600 m',
    partySize: '2–4 guests, 1 guide per 2 guests',
    accommodation: 'Station cottage',
    accommodationDetail:
      'A restored high-country cottage with two twin rooms, a wood range, and a veranda that faces the river.',
    guidingIntensity: 'Fully guided, one guide per two guests',
    fitness: 3,
    fitnessLabel: 'Moderate',
    fitnessGuidance:
      'Short, steep pushes of 300–600 m with long stationary periods in cold wind. Being comfortable sitting still in the cold matters as much as the climbing.',
    included: [
      'Five days guided fieldcraft with a NZ-licensed guide',
      'Cottage accommodation, all meals and a stocked pantry',
      'Vehicle transfers to daily vantage points',
      'Use of spotting scopes, tripods and shooting supports',
      'Permit administration for the ground we use',
      'Game care and chiller access',
    ],
    notIncluded: [
      'Flights and domestic connections',
      'Firearms licensing, hire or ammunition',
      'Travel and medical insurance',
      'Trophy export, taxidermy and freight',
      'Alcohol and personal items',
    ],
    days: [
      {
        label: 'Day 1',
        title: 'Into the valley',
        detail: 'Transfer, cottage settling, range confirmation and an evening glass from the terrace.',
      },
      {
        label: 'Days 2–4',
        title: 'A vantage a day',
        detail:
          'Three full days working different aspects of the catchment, with the stalk decided by what the glass finds.',
      },
      {
        label: 'Day 5',
        title: 'Morning and out',
        detail: 'A final sit at first light, then breakfast, handover and transfer.',
      },
    ],
    indicativeFrom: 6800,
    image: braidedRiver,
    imageAlt: 'A wide braided river winding through dark ranges seen from a tussock ridge above.',
    featured: true,
  },
  {
    slug: 'high-country-first-season',
    name: 'High Country First Season',
    island: 'south',
    region: 'Southern high-country station',
    category: 'mixed-foundation',
    categoryLabel: 'Foundation journey',
    tagline: 'For the first trip, not the tenth',
    summary:
      'A three-day introduction to guided fieldcraft for newcomers, returning hunters and families: navigation, safety, glassing and game care, at a civilised pace.',
    story: [
      'Most people who want to learn this properly have nowhere sensible to start. This journey is that start. It is deliberately short, deliberately comfortable, and deliberately heavy on the parts that matter — safe handling, identification, terrain reading, and what actually happens after an animal is taken.',
      'We run it from a station homestead with a real bed and real coffee, and we keep the days to a length that a fifteen-year-old and a sixty-five-year-old can both enjoy. Non-shooting companions are welcome and pay a reduced rate.',
      'Guests finish with a written field log, a clear picture of the licensing and permission process, and an honest read on whether the longer journeys are for them.',
    ],
    season: 'Late spring through summer',
    seasonMonths: 'November to March',
    durationDays: 3,
    durationLabel: '3 days / 2 nights',
    terrain: 'Farm tracks, tussock terraces and gentle faces, 300–900 m',
    partySize: '2–6 guests, 1 guide per 3 guests',
    accommodation: 'Station homestead',
    accommodationDetail:
      'Homestead rooms with ensuites, a long veranda, and dinner cooked by the station kitchen.',
    guidingIntensity: 'Instructional, small group',
    fitness: 2,
    fitnessLabel: 'Gentle',
    fitnessGuidance:
      'Two to five kilometres a day on tracks and gentle faces, with no compulsory climbing. Suitable for most reasonably active guests aged 14 and over.',
    included: [
      'Three days of instruction with a NZ-licensed guide',
      'Homestead accommodation and all meals',
      'Transfers from the nearest regional airport',
      'Safety, identification and game-care modules',
      'Loan of optics, packs and wet-weather shells',
      'A bound field log to take home',
    ],
    notIncluded: [
      'Flights and domestic connections',
      'Firearms licensing, hire or ammunition',
      'Travel and medical insurance',
      'Trophy export, taxidermy and freight',
      'Alcohol and personal items',
    ],
    days: [
      {
        label: 'Day 1',
        title: 'Foundations',
        detail:
          'Arrival, safe handling and identification, then an afternoon on the range and a first glassing session.',
      },
      {
        label: 'Day 2',
        title: 'A full field day',
        detail:
          'Navigation, wind and terrain reading in the morning; a guided stalk in the afternoon with the emphasis on decision-making.',
      },
      {
        label: 'Day 3',
        title: 'Game care and next steps',
        detail:
          'Field dressing and processing, a licensing and permissions walk-through, and a planning conversation over lunch.',
      },
    ],
    indicativeFrom: 2950,
    image: tussockRidge,
    imageAlt: 'Three guided walkers following a tussock ridge in low evening light.',
    featured: true,
  },
];

export const toursBySlug = new Map(tours.map((tour) => [tour.slug, tour]));

export function getTour(slug: string): Tour | undefined {
  return toursBySlug.get(slug);
}

export function toursForIsland(island: Island): Tour[] {
  return tours.filter((tour) => tour.island === island);
}

export const islandLabels: Record<Island, string> = {
  north: 'North Island',
  south: 'South Island',
};

export const islandBlurbs: Record<Island, { heading: string; body: string; notes: string[] }> = {
  north: {
    heading: 'Sound, scrub and volcanic ground',
    body: 'The North Island is close, warm and deceptively difficult. Bush is thicker, animals are quieter, and the country rewards a hunter who can slow down. Journeys here are shorter to reach and longer to master.',
    notes: [
      'Bush and scrub with short sightlines',
      'Sika and red deer country',
      'Lodges and backcountry huts',
      'Shorter travel from Auckland and Napier',
    ],
  },
  south: {
    heading: 'Distance, altitude and open glass',
    body: 'The South Island is a landscape of long sightlines and real consequence. Tops are higher, weather turns faster, and finding an animal is an act of patience behind a spotting scope rather than a walk into cover.',
    notes: [
      'Alpine basins and braided river systems',
      'Tahr, chamois and high-country red deer',
      'Station cottages and serviced alpine huts',
      'Helicopter access on the alpine journeys',
    ],
  },
};

/** Formats an indicative planning figure. Never a quote — see the demo notices. */
export function formatIndicative(amount: number): string {
  return new Intl.NumberFormat('en-NZ', {
    style: 'currency',
    currency: 'NZD',
    maximumFractionDigits: 0,
  }).format(amount);
}
