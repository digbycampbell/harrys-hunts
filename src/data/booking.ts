/**
 * Option data for the mock bespoke-booking flow.
 *
 * The planner collects preferences and produces a written summary in the
 * browser. It sends nothing, stores nothing off-device, and reserves nothing.
 */
import { tours, type Island } from './tours';

export interface Choice {
  id: string;
  label: string;
  detail: string;
  /** Restricts the choice to one island where the country demands it. */
  island?: Island;
}

export const islandChoices: Choice[] = [
  {
    id: 'north',
    label: 'North Island',
    detail: 'Volcanic plateau, eastern ranges. Bush and scrub, shorter travel, sound-carrying country.',
  },
  {
    id: 'south',
    label: 'South Island',
    detail: 'Southern Alps and high-country basins. Long sightlines, real altitude, faster weather.',
  },
  {
    id: 'either',
    label: 'Open to either',
    detail: 'Tell us the week and the appetite and we will match the island to it.',
  },
];

export const countryChoices: Choice[] = [
  {
    id: 'bush',
    label: 'Bush and scrub',
    detail: 'Short sightlines, slow still-hunting, wind discipline.',
    island: 'north',
  },
  {
    id: 'plateau',
    label: 'Open plateau',
    detail: 'Pumice ridges and tussock clearings with beech margins.',
    island: 'north',
  },
  {
    id: 'high-country',
    label: 'High-country stations',
    detail: 'Tussock faces and river terraces, vehicle access to daily vantages.',
    island: 'south',
  },
  {
    id: 'alpine',
    label: 'Alpine basins',
    detail: 'Snow-grass slopes and bluff systems above the bushline.',
    island: 'south',
  },
  {
    id: 'river',
    label: 'Braided river country',
    detail: 'Broad catchments worked with a spotting scope.',
    island: 'south',
  },
  {
    id: 'unsure',
    label: 'Not sure yet',
    detail: 'We will talk it through and suggest the terrain that fits your week.',
  },
];

export const experienceChoices: Choice[] = [
  {
    id: 'red-deer',
    label: 'Red stag — the roar',
    detail: 'Autumn mornings spent listening. Patience over distance.',
  },
  {
    id: 'sika',
    label: 'Sika in the bush',
    detail: 'The most technical foot journey we run. Slow, quiet, humbling.',
  },
  {
    id: 'tahr',
    label: 'Himalayan tahr',
    detail: 'Winter alpine work with a genuine alpine safety plan.',
  },
  {
    id: 'chamois',
    label: 'Chamois',
    detail: 'Long glassing, short technical stalks, precise shooting.',
  },
  {
    id: 'mixed-foundation',
    label: 'Foundation and instruction',
    detail: 'Safety, identification, terrain reading and game care at a civilised pace.',
  },
  {
    id: 'photography',
    label: 'Glass and camera only',
    detail: 'Same country, same guides, nothing taken. More common than people expect.',
  },
];

export const timingChoices: Choice[] = [
  { id: 'summer', label: 'Summer — Dec to Feb', detail: 'Long light, gentle conditions, foundation journeys.' },
  { id: 'autumn', label: 'Autumn — Mar to May', detail: 'The roar, chamois in coat, the busiest weeks we run.' },
  { id: 'winter', label: 'Winter — Jun to Aug', detail: 'Tahr country at its best and its most demanding.' },
  { id: 'spring', label: 'Spring — Sep to Nov', detail: 'Quiet ranges, unsettled weather, good value.' },
  { id: 'flexible', label: 'Fully flexible', detail: 'Give us the appetite and we will pick the window.' },
];

export const accommodationChoices: Choice[] = [
  { id: 'lodge', label: 'Timber lodge', detail: 'Private room, drying room, one long table.' },
  { id: 'cottage', label: 'Station cottage', detail: 'Restored high-country cottage with a wood range.' },
  { id: 'homestead', label: 'Station homestead', detail: 'Ensuite rooms and a station kitchen.' },
  { id: 'hut', label: 'Backcountry huts', detail: 'Bunks, wood heat, everything carried in.' },
  { id: 'alpine-hut', label: 'Serviced alpine hut', detail: 'Four bunks, diesel heat, resupplied by air.' },
  { id: 'mixed', label: 'A mix is fine', detail: 'Comfort at the start and finish, simple in the middle.' },
];

export const guidingChoices: Choice[] = [
  {
    id: 'one-to-one',
    label: 'One guide per guest',
    detail: 'Maximum attention and the widest choice of country. The alpine standard.',
  },
  {
    id: 'one-to-two',
    label: 'One guide per two guests',
    detail: 'Our usual arrangement. Sociable without slowing the day down.',
  },
  {
    id: 'instructional',
    label: 'Instructional, small group',
    detail: 'Teaching first. Best for first seasons and mixed-ability parties.',
  },
  {
    id: 'light-touch',
    label: 'Light touch',
    detail: 'For experienced parties: access, permissions, logistics and a guide on call.',
  },
];

export interface AddOn {
  id: string;
  label: string;
  detail: string;
}

export const addOns: AddOn[] = [
  {
    id: 'heli',
    label: 'Helicopter repositioning',
    detail: 'An extra lift mid-journey to open a second catchment.',
  },
  {
    id: 'extra-day',
    label: 'Extra field day',
    detail: 'One more day on the hill, with the accommodation to match.',
  },
  {
    id: 'photography',
    label: 'Field photographer',
    detail: 'A second guide carrying a camera instead of a pack of gear.',
  },
  {
    id: 'game-care',
    label: 'Extended game care',
    detail: 'Butchery, chilling and packing coordinated end to end.',
  },
  {
    id: 'rifle-hire',
    label: 'Rifle hire coordination',
    detail: 'We arrange licensed hire and range time. Licensing remains your responsibility.',
  },
  {
    id: 'companion',
    label: 'Non-hunting companion programme',
    detail: 'Walks, fishing and station days for anyone not on the hill.',
  },
  {
    id: 'transfers',
    label: 'City transfers',
    detail: 'Door-to-door from Auckland or Christchurch instead of the regional airport.',
  },
];

export const experienceLevels: Choice[] = [
  { id: 'first', label: 'First time', detail: 'Never hunted, or never in New Zealand.' },
  { id: 'some', label: 'Some seasons', detail: 'Comfortable with the basics, still learning the country.' },
  { id: 'experienced', label: 'Experienced', detail: 'Regular hill time and confident with your own gear.' },
];

export const contactPreferences: Choice[] = [
  { id: 'email', label: 'Email', detail: 'A written summary first.' },
  { id: 'call', label: 'A call', detail: 'Easier for the complicated weeks.' },
  { id: 'either', label: 'Either is fine', detail: '' },
];

export interface BookingState {
  island: string;
  country: string;
  experience: string;
  timing: string;
  /** Optional specific window; the planner works fine without one. */
  startDate: string;
  endDate: string;
  flexibleDates: boolean;
  guests: number;
  companions: number;
  accommodation: string;
  guiding: string;
  addOns: string[];
  name: string;
  email: string;
  country_of_residence: string;
  experienceLevel: string;
  contactPreference: string;
  notes: string;
  /** Journey slug when the planner was opened from a journey page. */
  journey: string;
}

export const emptyBooking: BookingState = {
  island: '',
  country: '',
  experience: '',
  timing: '',
  startDate: '',
  endDate: '',
  flexibleDates: false,
  guests: 2,
  companions: 0,
  accommodation: '',
  guiding: '',
  addOns: [],
  name: '',
  email: '',
  country_of_residence: '',
  experienceLevel: '',
  contactPreference: 'email',
  notes: '',
  journey: '',
};

/** Maps a journey slug onto sensible planner defaults for the `?journey=` deep link. */
export function prefillFromTour(slug: string): Partial<BookingState> {
  const tour = tours.find((candidate) => candidate.slug === slug);
  if (!tour) return {};

  const country: Record<string, string> = {
    'volcanic-plateau-roar': 'plateau',
    'kaweka-sika-line': 'bush',
    'alpine-tahr-traverse': 'alpine',
    'braided-river-chamois': 'river',
    'high-country-first-season': 'high-country',
  };

  const timing: Record<string, string> = {
    'volcanic-plateau-roar': 'autumn',
    'kaweka-sika-line': 'autumn',
    'alpine-tahr-traverse': 'winter',
    'braided-river-chamois': 'autumn',
    'high-country-first-season': 'summer',
  };

  const accommodation: Record<string, string> = {
    'volcanic-plateau-roar': 'lodge',
    'kaweka-sika-line': 'hut',
    'alpine-tahr-traverse': 'alpine-hut',
    'braided-river-chamois': 'cottage',
    'high-country-first-season': 'homestead',
  };

  const guiding: Record<string, string> = {
    'volcanic-plateau-roar': 'one-to-two',
    'kaweka-sika-line': 'one-to-two',
    'alpine-tahr-traverse': 'one-to-one',
    'braided-river-chamois': 'one-to-two',
    'high-country-first-season': 'instructional',
  };

  return {
    journey: tour.slug,
    island: tour.island,
    country: country[tour.slug] ?? '',
    experience: tour.category,
    timing: timing[tour.slug] ?? '',
    accommodation: accommodation[tour.slug] ?? '',
    guiding: guiding[tour.slug] ?? '',
  };
}

export function labelFor(choices: Choice[] | AddOn[], id: string): string {
  return choices.find((choice) => choice.id === id)?.label ?? '';
}
