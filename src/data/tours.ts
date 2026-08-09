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
    tagline: 'Six autumn mornings on the plateau',
    summary:
      'Pumice ridges, beech margins and open tops in early April, with the field days built around listening before moving.',
    story: [
      'Autumn on the plateau is about listening. Cold air can hold sound in the pumice gullies, so the outline favours long pauses and careful bearings before anyone crosses a face.',
      'Mornings begin before daylight. Afternoons leave time for rest, maps and another listen from a different aspect. The fictional guide sets the pace and makes the call when wind or ground rules out a stalk.',
      'The six-day format allows for poor weather and quiet mornings. Identification, safe handling and lawful access would need to be settled by a real operator before any real trip.',
    ],
    season: 'Autumn — the roar',
    seasonMonths: 'Late March to early May',
    durationDays: 6,
    durationLabel: '6 days / 5 nights',
    terrain: 'Rolling pumice ridges, beech margins and tussock clearings, 600–1,300 m',
    partySize: '2–4 guests, 1 guide per 2 guests',
    accommodation: 'Timber lodge',
    accommodationDetail:
      'A fictional small lodge with private rooms, space to dry gear and one shared table.',
    guidingIntensity: 'Fully guided, one guide per two guests',
    fitness: 3,
    fitnessLabel: 'Moderate',
    fitnessGuidance:
      'Expect 6–12 km a day on uneven ground with 400–700 m of climbing, carrying a light day pack. Comfortable if you walk hill country most weekends.',
    included: [
      'Six guide-led field days',
      'Lodge accommodation, all meals and non-alcoholic drinks',
      'Transfers from the nearest regional airport',
      'Illustrative access and permit planning',
      'Loan of optics, packs and wet-weather shells',
      'Game-care planning in the fictional itinerary',
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
    tagline: 'A slow week in tight eastern bush',
    summary:
      'A hut-to-hut outline through bush and mānuka scrub, built around sign, wind and moving slowly.',
    story: [
      'Sika country rewards patience. The bush is tight, sightlines are short and the useful work is reading sign, minding the wind and slowing down before the next step.',
      'This fictional route moves between simple huts with light packs. It is the most exacting journey in the catalogue for footwork and concentration, without promising an outcome.',
      'A real guide would own the navigation and safety plan. The guest would carry personal gear and be ready for a week in which seeing nothing is entirely possible.',
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
      'Seven guide-led field days',
      'Hut fees, all backcountry meals and cooking gear',
      'Transfers from the nearest town and road-end logistics',
      'Illustrative access and permit planning',
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
    tagline: 'Winter basins above the bushline',
    summary:
      'The most demanding journey in the catalogue: winter basins, steep sidling and a fictional helicopter approach.',
    story: [
      'The concept places tahr above the bushline in winter, where cold, steep ground and quick weather changes set the terms.',
      'The itinerary begins at a fictional alpine hut and works nearby basins on foot. Long days, exposed sidling and snow-covered ground make this a specialist outline, not a promise that a trip is suitable or available.',
      'A real journey in this country would require qualified people, current conditions and a proper alpine safety plan. This page supplies none of those; it only shows how such a catalogue entry might read.',
    ],
    season: 'Winter',
    seasonMonths: 'May to August',
    durationDays: 8,
    durationLabel: '8 days / 7 nights',
    terrain: 'Alpine basins, snow-grass slopes and bluff systems, 900–2,100 m',
    partySize: '2 guests, 1 guide per guest',
    accommodation: 'Serviced alpine hut',
    accommodationDetail:
      'A fictional four-bunk alpine hut with heat, hot food and room to dry gear.',
    guidingIntensity: 'One guide per guest',
    fitness: 5,
    fitnessLabel: 'Very demanding',
    fitnessGuidance:
      'Sustained climbing of 800–1,200 m on steep, exposed and often snow-covered ground. The concept assumes strong hill fitness and recent alpine experience; it is not a fitness assessment.',
    included: [
      'Eight guide-led alpine field days, one-to-one in the concept',
      'Return helicopter transfer and in-trip repositioning',
      'Alpine hut accommodation and all meals',
      'Avalanche safety equipment and briefing',
      'Illustrative access and permit planning',
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
    tagline: 'Long glass above a braided river',
    summary:
      'Five fictional days above a braided river, using a spotting scope before committing to the climb.',
    story: [
      'The work begins behind the glass. A long look across broad country is followed, if the ground allows, by a short and steeper approach.',
      'The fictional itinerary uses a different vantage each morning, with the rest of the day on foot. It keeps the walking purposeful without presenting the route as easy.',
      'This concept suits visitors interested in finding and observing as much as taking an animal. A camera-only version is included as an option, without claims about real demand.',
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
      'Five guide-led field days',
      'Cottage accommodation, all meals and a stocked pantry',
      'Vehicle transfers to daily vantage points',
      'Use of spotting scopes, tripods and shooting supports',
      'Illustrative access and permit planning',
      'Game-care planning in the fictional itinerary',
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
    tagline: 'A practical first look at fieldcraft',
    summary:
      'A three-day fictional introduction for newcomers and returning hunters, with a gentler pace and more time for instruction.',
    story: [
      'This is the catalogue entry for people who want a clear starting point. It is short, comfortable and weighted towards the basics: handling, identification, reading terrain and understanding game care.',
      'The outline uses a fictional station homestead and moderate field days. Non-hunting companions can be included in the planner, but no real rate or suitability is promised.',
      'The demonstration ends with a field-log concept and a discussion of next steps. Real licensing, access and instruction must come from the proper authorities and qualified providers.',
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
      'Two to five kilometres a day on tracks and gentle faces, with no compulsory climbing. Presented as the gentlest option in this fictional catalogue; it is not an assessment of individual suitability.',
    included: [
      'Three guide-led instructional field days',
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
    heading: 'Volcanic ground and tight bush',
    body: 'The North Island journeys use shorter sightlines and a slower pace. One works open pumice ridges; the other stays close in bush and scrub.',
    notes: [
      'Bush and scrub with short sightlines',
      'Sika and red deer country',
      'Lodges and backcountry huts',
      'Fictional regional transfer points',
    ],
  },
  south: {
    heading: 'Open country and higher ground',
    body: 'The South Island concepts use long sightlines, bigger climbs and faster-changing weather. Glassing does more of the finding before the walking begins.',
    notes: [
      'Alpine basins and braided river systems',
      'Tahr, chamois and high-country red deer',
      'Station cottages and serviced alpine huts',
      'Fictional helicopter approach on the alpine journey',
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
