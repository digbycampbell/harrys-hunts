/**
 * Mock bespoke-journey planner.
 *
 * Nine staged questions, a live summary rail, and a demonstration confirmation.
 * Every answer stays in this browser: state is mirrored to `localStorage` so a
 * refresh does not lose work, and the final step sends nothing anywhere.
 */
import { useCallback, useEffect, useMemo, useRef, useState } from 'preact/hooks';
import {
  accommodationChoices,
  addOns,
  contactPreferences,
  countryChoices,
  emptyBooking,
  experienceChoices,
  experienceLevels,
  guidingChoices,
  islandChoices,
  labelFor,
  prefillFromTour,
  timingChoices,
  type AddOn,
  type BookingState,
  type Choice,
} from '../data/booking';
import { href } from '../lib/paths';
import QuantityStepper from './QuantityStepper';

const STORAGE_KEY = 'hh-demo-booking-v1';
const MAX_GUESTS = 8;
const MAX_COMPANIONS = 6;

type Errors = Partial<Record<keyof BookingState | 'dates', string>>;

interface Step {
  id: string;
  nav: string;
  eyebrow: string;
  title: string;
  intro: string;
  validate: (state: BookingState) => Errors;
}

const steps: Step[] = [
  {
    id: 'island',
    nav: 'Island',
    eyebrow: 'Step one',
    title: 'Which island are you drawn to?',
    intro: 'This sets the terrain, the travel and most of the character of the week.',
    validate: (state) => (state.island ? {} : { island: 'Choose an island, or tell us you are open to either.' }),
  },
  {
    id: 'country',
    nav: 'Country',
    eyebrow: 'Step two',
    title: 'What kind of country suits you?',
    intro: 'Sightlines change everything: how you move, how you find animals, how tired you get.',
    validate: (state) => (state.country ? {} : { country: 'Pick the terrain you have in mind, or choose “Not sure yet”.' }),
  },
  {
    id: 'experience',
    nav: 'Experience',
    eyebrow: 'Step three',
    title: 'What are you hoping the week is about?',
    intro: 'Species categories shape the season and the skills. Not every week has to be about taking an animal.',
    validate: (state) => (state.experience ? {} : { experience: 'Choose the kind of experience you want.' }),
  },
  {
    id: 'timing',
    nav: 'Timing',
    eyebrow: 'Step four',
    title: 'When could you travel?',
    intro: 'Season matters more than dates. If you have a specific window, tell us; if not, flexibility is worth a lot.',
    validate: (state) => {
      const errors: Errors = {};
      if (!state.timing) errors.timing = 'Choose a season, or tell us you are fully flexible.';
      if (!state.flexibleDates && state.startDate && state.endDate && state.endDate < state.startDate) {
        errors.dates = 'The return date needs to be on or after the arrival date.';
      }
      if (!state.flexibleDates && state.endDate && !state.startDate) {
        errors.dates = 'Add an arrival date as well, or tick “my dates are flexible”.';
      }
      return errors;
    },
  },
  {
    id: 'party',
    nav: 'Party',
    eyebrow: 'Step five',
    title: 'Who is coming?',
    intro: 'Small parties are the whole model. Companions who are not on the hill are always welcome.',
    validate: (state) =>
      state.guests >= 1 ? {} : { guests: 'A journey needs at least one guest on the hill.' },
  },
  {
    id: 'accommodation',
    nav: 'Accommodation',
    eyebrow: 'Step six',
    title: 'Where would you rather sleep?',
    intro: 'This is often the honest limit on where a journey can go.',
    validate: (state) =>
      state.accommodation ? {} : { accommodation: 'Choose the accommodation style you would prefer.' },
  },
  {
    id: 'guiding',
    nav: 'Guiding',
    eyebrow: 'Step seven',
    title: 'How much guiding do you want?',
    intro: 'Every journey is guided. The question is the ratio and how much teaching you want with it.',
    validate: (state) => (state.guiding ? {} : { guiding: 'Choose a guiding arrangement.' }),
  },
  {
    id: 'extras',
    nav: 'Add-ons',
    eyebrow: 'Step eight',
    title: 'Anything to add?',
    intro: 'All optional. Choose as many as you like, or none at all.',
    validate: () => ({}),
  },
  {
    id: 'details',
    nav: 'Your details',
    eyebrow: 'Step nine',
    title: 'How should we reply?',
    intro: 'Only a name and an email. Nothing is transmitted — this stays in your browser.',
    validate: (state) => {
      const errors: Errors = {};
      if (!state.name.trim()) errors.name = 'Please add a name so the summary has someone to belong to.';
      if (!state.email.trim()) errors.email = 'Please add an email address.';
      else if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(state.email.trim()))
        errors.email = 'That does not look like an email address.';
      if (!state.experienceLevel) errors.experienceLevel = 'Tell us roughly where you are up to.';
      return errors;
    },
  },
  {
    id: 'review',
    nav: 'Review',
    eyebrow: 'Last step',
    title: 'Read it back',
    intro: 'Check anything you want to change, then produce the demonstration summary.',
    validate: () => ({}),
  },
];

function loadState(): { state: BookingState; step: number; journey: string } | null {
  if (typeof localStorage === 'undefined') return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as {
      state?: Partial<BookingState>;
      step?: number;
      journey?: string;
    };
    if (typeof parsed?.state !== 'object' || parsed.state === null) return null;

    // Take persisted values only when they still match the expected shape, so a
    // hand-edited or stale entry can never blank the planner.
    const state: BookingState = { ...emptyBooking };
    for (const key of Object.keys(emptyBooking) as (keyof BookingState)[]) {
      const value = (parsed.state as Record<string, unknown>)[key];
      if (key === 'addOns') {
        if (Array.isArray(value)) {
          state.addOns = value.filter((entry): entry is string => typeof entry === 'string');
        }
      } else if (typeof value === typeof emptyBooking[key]) {
        (state as Record<keyof BookingState, unknown>)[key] = value;
      }
    }
    state.guests = Number.isFinite(state.guests)
      ? Math.min(MAX_GUESTS, Math.max(1, Math.floor(state.guests)))
      : emptyBooking.guests;
    state.companions = Number.isFinite(state.companions)
      ? Math.min(MAX_COMPANIONS, Math.max(0, Math.floor(state.companions)))
      : emptyBooking.companions;

    const step =
      typeof parsed.step === 'number' && Number.isFinite(parsed.step)
        ? Math.floor(parsed.step)
        : 0;
    return {
      state,
      step: Math.min(Math.max(step, 0), steps.length - 1),
      journey: typeof parsed.journey === 'string' ? parsed.journey : '',
    };
  } catch {
    return null;
  }
}

function reference(): string {
  const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let index = 0; index < 4; index += 1) {
    code += alphabet[Math.floor(Math.random() * alphabet.length)];
  }
  return `HH-PLAN-${code}`;
}

/* ------------------------------------------------------------------ inputs */

function ChoiceGroup({
  name,
  choices,
  value,
  onChange,
  describedBy,
  invalid,
}: {
  name: string;
  choices: Choice[];
  value: string;
  onChange: (id: string) => void;
  describedBy?: string;
  invalid?: boolean;
}) {
  function onKeyDown(event: KeyboardEvent) {
    const step =
      event.key === 'ArrowRight' || event.key === 'ArrowDown'
        ? 1
        : event.key === 'ArrowLeft' || event.key === 'ArrowUp'
          ? -1
          : 0;
    if (step === 0) return;
    event.preventDefault();
    // Anchor on the focused option, so arrow keys work before anything is chosen.
    const focused = (event.target as HTMLElement | null)?.closest<HTMLElement>('[data-choice]');
    const anchor = focused?.dataset.choice ?? value;
    const index = Math.max(
      choices.findIndex((choice) => choice.id === anchor),
      0,
    );
    const next = choices[(index + step + choices.length) % choices.length];
    onChange(next.id);
    (event.currentTarget as HTMLElement)
      .querySelector<HTMLElement>(`[data-choice="${next.id}"]`)
      ?.focus();
  }

  return (
    <div
      class="hh-choices"
      role="radiogroup"
      aria-labelledby={`${name}-legend`}
      aria-describedby={describedBy}
      aria-invalid={invalid ? 'true' : undefined}
      data-testid={`choices-${name}`}
      onKeyDown={onKeyDown}
    >
      {choices.map((choice) => {
        const checked = value === choice.id;
        return (
          <button
            type="button"
            key={choice.id}
            role="radio"
            aria-checked={checked}
            tabIndex={checked || (!value && choices[0].id === choice.id) ? 0 : -1}
            class="hh-choice"
            data-choice={choice.id}
            data-testid={`choice-${name}-${choice.id}`}
            onClick={() => onChange(choice.id)}
          >
            <span class="hh-choice__mark" aria-hidden="true" />
            <span class="hh-choice__text">
              <span class="hh-choice__label">{choice.label}</span>
              {choice.detail && <span class="hh-choice__detail">{choice.detail}</span>}
            </span>
          </button>
        );
      })}
    </div>
  );
}

function AddOnGroup({
  selected,
  onToggle,
}: {
  selected: string[];
  onToggle: (id: string, on: boolean) => void;
}) {
  return (
    <div class="hh-choices" data-testid="choices-addons">
      {addOns.map((addOn: AddOn) => {
        const checked = selected.includes(addOn.id);
        return (
          <label
            class="hh-choice hh-choice--check"
            key={addOn.id}
            data-checked={checked}
            data-testid={`addon-${addOn.id}`}
          >
            <input
              type="checkbox"
              class="hh-visually-hidden"
              checked={checked}
              data-testid={`addon-input-${addOn.id}`}
              onChange={(event) => onToggle(addOn.id, (event.currentTarget as HTMLInputElement).checked)}
            />
            <span class="hh-choice__mark hh-choice__mark--box" aria-hidden="true" />
            <span class="hh-choice__text">
              <span class="hh-choice__label">{addOn.label}</span>
              <span class="hh-choice__detail">{addOn.detail}</span>
            </span>
          </label>
        );
      })}
    </div>
  );
}

function FieldError({ id, message }: { id: string; message?: string }) {
  if (!message) return null;
  return (
    <p class="hh-error" id={id} data-testid={id}>
      <span aria-hidden="true">!</span>
      <span>{message}</span>
    </p>
  );
}

/* ------------------------------------------------------------------ wizard */

export default function BookingWizard() {
  const [state, setState] = useState<BookingState>(emptyBooking);
  const [stepIndex, setStepIndex] = useState(0);
  const [errors, setErrors] = useState<Errors>({});
  const [showErrors, setShowErrors] = useState(false);
  const [confirmation, setConfirmation] = useState<string | null>(null);
  const [restored, setRestored] = useState(false);
  const [ready, setReady] = useState(false);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const alertRef = useRef<HTMLDivElement>(null);
  const firstRender = useRef(true);
  const journeyRef = useRef('');

  // Restore saved answers, then apply a `?journey=` prefill only the first time
  // that journey is seen, so a reload never reverts deliberate edits.
  useEffect(() => {
    const saved = loadState();
    const params = new URLSearchParams(window.location.search);
    const journey = params.get('journey') ?? '';
    const prefill = journey && journey !== saved?.journey ? prefillFromTour(journey) : {};
    journeyRef.current = journey || saved?.journey || '';

    if (saved) {
      setState({ ...saved.state, ...prefill });
      setStepIndex(saved.step);
      setRestored(true);
    } else if (Object.keys(prefill).length > 0) {
      setState({ ...emptyBooking, ...prefill });
    }
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ state, step: stepIndex, journey: journeyRef.current }),
      );
    } catch {
      /* Private mode: the planner still works, it just will not survive a refresh. */
    }
  }, [state, stepIndex, ready]);

  // Move focus to the new step so keyboard and screen-reader users follow along.
  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false;
      return;
    }
    headingRef.current?.focus();
  }, [stepIndex, confirmation]);

  const step = steps[stepIndex];

  const update = useCallback((patch: Partial<BookingState>) => {
    setState((current) => ({ ...current, ...patch }));
  }, []);

  // Re-validate live once the guest has been shown an error for this step.
  useEffect(() => {
    if (!showErrors) return;
    setErrors(step.validate(state));
  }, [state, showErrors, step]);

  const availableCountry = useMemo(
    () =>
      countryChoices.filter(
        (choice) => !choice.island || state.island === 'either' || choice.island === state.island,
      ),
    [state.island],
  );

  function goTo(index: number) {
    setShowErrors(false);
    setErrors({});
    setStepIndex(Math.min(Math.max(index, 0), steps.length - 1));
  }

  function next() {
    const found = step.validate(state);
    if (Object.keys(found).length > 0) {
      setErrors(found);
      setShowErrors(true);
      window.requestAnimationFrame(() => {
        alertRef.current?.focus();
      });
      return;
    }
    if (stepIndex === steps.length - 1) {
      setConfirmation(reference());
      return;
    }
    goTo(stepIndex + 1);
  }

  function startAgain() {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      /* ignore */
    }
    setState(emptyBooking);
    setStepIndex(0);
    setConfirmation(null);
    setErrors({});
    setShowErrors(false);
    setRestored(false);
  }

  const summary = useMemo(
    () => [
      { id: 'island', step: 0, label: 'Island', value: labelFor(islandChoices, state.island) },
      { id: 'country', step: 1, label: 'Country', value: labelFor(countryChoices, state.country) },
      { id: 'experience', step: 2, label: 'Experience', value: labelFor(experienceChoices, state.experience) },
      {
        id: 'timing',
        step: 3,
        label: 'Timing',
        value: [
          labelFor(timingChoices, state.timing),
          state.flexibleDates
            ? 'Dates flexible'
            : state.startDate
              ? `${state.startDate}${state.endDate ? ` to ${state.endDate}` : ''}`
              : '',
        ]
          .filter(Boolean)
          .join(' · '),
      },
      {
        id: 'party',
        step: 4,
        label: 'Party',
        value: `${state.guests} on the hill${state.companions ? `, ${state.companions} companion${state.companions === 1 ? '' : 's'}` : ''}`,
      },
      {
        id: 'accommodation',
        step: 5,
        label: 'Accommodation',
        value: labelFor(accommodationChoices, state.accommodation),
      },
      { id: 'guiding', step: 6, label: 'Guiding', value: labelFor(guidingChoices, state.guiding) },
      {
        id: 'extras',
        step: 7,
        label: 'Add-ons',
        value: state.addOns.length
          ? state.addOns.map((id) => labelFor(addOns, id)).join(', ')
          : 'None',
      },
      {
        id: 'details',
        step: 8,
        label: 'Contact',
        value: [state.name, state.email].filter(Boolean).join(' · '),
      },
    ],
    [state],
  );

  if (!ready) {
    return (
      <div class="hh-wizard hh-wizard--loading" aria-busy="true">
        <p class="hh-visually-hidden">Loading the journey planner</p>
        <div class="hh-skeleton" style="height:3rem" />
        <div class="hh-skeleton" style="height:16rem; margin-top:1rem" />
      </div>
    );
  }

  if (confirmation) {
    return (
      <section class="hh-confirm" data-testid="booking-confirmation" aria-labelledby="confirm-title">
        <p class="hh-eyebrow">Demonstration summary</p>
        <h2 id="confirm-title" class="hh-confirm__title" ref={headingRef} tabIndex={-1}>
          Your journey outline is ready
        </h2>
        <p class="hh-confirm__reference">
          Reference <strong data-testid="booking-reference">{confirmation}</strong>
        </p>

        <div class="hh-notice hh-confirm__notice" role="status">
          <span>
            <strong>No reservation has been made.</strong> Nothing was sent, no enquiry was created
            and no record exists anywhere but this browser. Harry&rsquo;s Hunts is a fictional
            company built to demonstrate this interface.
          </span>
        </div>

        <dl class="hh-confirm__list">
          {summary.map((item) => (
            <div key={item.id}>
              <dt>{item.label}</dt>
              <dd data-testid={`confirm-${item.id}`}>{item.value || '—'}</dd>
            </div>
          ))}
          {state.notes.trim() && (
            <div class="hh-confirm__notes">
              <dt>Notes</dt>
              <dd>{state.notes}</dd>
            </div>
          )}
        </dl>

        <div class="hh-confirm__actions">
          <button type="button" class="hh-button hh-button--secondary" onClick={startAgain}>
            Plan another journey
          </button>
          <a class="hh-button hh-button--ghost" href={href('/journeys/')}>
            Back to the journeys
          </a>
        </div>
      </section>
    );
  }

  const errorList = Object.values(errors).filter(Boolean) as string[];

  return (
    <div class="hh-wizard" data-testid="booking-wizard" data-step={step.id}>
      <nav class="hh-wizard__progress" aria-label="Planner progress">
        <ol>
          {steps.map((entry, index) => {
            const done = index < stepIndex;
            const current = index === stepIndex;
            return (
              <li key={entry.id} data-state={current ? 'current' : done ? 'done' : 'todo'}>
                <button
                  type="button"
                  aria-current={current ? 'step' : undefined}
                  disabled={index > stepIndex}
                  onClick={() => goTo(index)}
                  data-testid={`progress-${entry.id}`}
                  /* The visible label is hidden on narrow screens, so name the
                     button explicitly rather than leaving only the number. */
                  aria-label={`Step ${index + 1}: ${entry.nav}`}
                >
                  <span class="hh-wizard__dot" aria-hidden="true">
                    {index + 1}
                  </span>
                  <span class="hh-wizard__navlabel">{entry.nav}</span>
                </button>
              </li>
            );
          })}
        </ol>
      </nav>

      <p class="hh-visually-hidden" role="status" data-testid="step-announcer">
        Step {stepIndex + 1} of {steps.length}: {step.title}
      </p>

      <div class="hh-wizard__layout">
        <div class="hh-wizard__main">
          {restored && stepIndex > 0 && (
            <p class="hh-wizard__restored" data-testid="booking-restored">
              Picked up where you left off. <button type="button" onClick={startAgain}>Start again</button>
            </p>
          )}

          <p class="hh-eyebrow">{step.eyebrow}</p>
          <h2 class="hh-wizard__title" ref={headingRef} tabIndex={-1}>
            {step.title}
          </h2>
          <p class="hh-wizard__intro">{step.intro}</p>

          {showErrors && errorList.length > 0 && (
            <div
              class="hh-wizard__alert"
              role="alert"
              tabIndex={-1}
              ref={alertRef}
              data-testid="booking-alert"
            >
              <p>Before you continue:</p>
              <ul>
                {errorList.map((message) => (
                  <li key={message}>{message}</li>
                ))}
              </ul>
            </div>
          )}

          <div class="hh-wizard__panel">
            {step.id === 'island' && (
              <fieldset class="hh-wizard__fieldset">
                <legend id="island-legend" class="hh-visually-hidden">Island</legend>
                <ChoiceGroup
                  name="island"
                  choices={islandChoices}
                  value={state.island}
                  invalid={Boolean(errors.island)}
                  describedBy={errors.island ? 'error-island' : undefined}
                  onChange={(id) =>
                    update({
                      island: id,
                      // Terrain choices are island-specific, so drop one that no longer applies.
                      country: countryChoices.some(
                        (choice) =>
                          choice.id === state.country &&
                          (!choice.island || id === 'either' || choice.island === id),
                      )
                        ? state.country
                        : '',
                    })
                  }
                />
                <FieldError id="error-island" message={errors.island} />
              </fieldset>
            )}

            {step.id === 'country' && (
              <fieldset class="hh-wizard__fieldset">
                <legend id="country-legend" class="hh-visually-hidden">Country</legend>
                <ChoiceGroup
                  name="country"
                  choices={availableCountry}
                  value={state.country}
                  invalid={Boolean(errors.country)}
                  describedBy={errors.country ? 'error-country' : undefined}
                  onChange={(id) => update({ country: id })}
                />
                <FieldError id="error-country" message={errors.country} />
              </fieldset>
            )}

            {step.id === 'experience' && (
              <fieldset class="hh-wizard__fieldset">
                <legend id="experience-legend" class="hh-visually-hidden">Experience</legend>
                <ChoiceGroup
                  name="experience"
                  choices={experienceChoices}
                  value={state.experience}
                  invalid={Boolean(errors.experience)}
                  describedBy={errors.experience ? 'error-experience' : undefined}
                  onChange={(id) => update({ experience: id })}
                />
                <FieldError id="error-experience" message={errors.experience} />
              </fieldset>
            )}

            {step.id === 'timing' && (
              <>
                <fieldset class="hh-wizard__fieldset">
                  <legend id="timing-legend" class="hh-visually-hidden">Season</legend>
                  <ChoiceGroup
                    name="timing"
                    choices={timingChoices}
                    value={state.timing}
                    invalid={Boolean(errors.timing)}
                    describedBy={errors.timing ? 'error-timing' : undefined}
                    onChange={(id) => update({ timing: id })}
                  />
                  <FieldError id="error-timing" message={errors.timing} />
                </fieldset>

                <div class="hh-wizard__subpanel">
                  <label
                    class="hh-choice hh-choice--check hh-choice--inline"
                    data-checked={state.flexibleDates}
                    data-testid="flexible-dates"
                  >
                    <input
                      type="checkbox"
                      class="hh-visually-hidden"
                      checked={state.flexibleDates}
                      data-testid="flexible-dates-input"
                      onChange={(event) =>
                        update({ flexibleDates: (event.currentTarget as HTMLInputElement).checked })
                      }
                    />
                    <span class="hh-choice__mark hh-choice__mark--box" aria-hidden="true" />
                    <span class="hh-choice__text">
                      <span class="hh-choice__label">My dates are flexible</span>
                      <span class="hh-choice__detail">
                        We will suggest the best window in your chosen season.
                      </span>
                    </span>
                  </label>

                  {!state.flexibleDates && (
                    <div class="hh-wizard__dates">
                      <p class="hh-field">
                        <label class="hh-label" for="start-date">Arrival (optional)</label>
                        <input
                          class="hh-input"
                          id="start-date"
                          type="date"
                          value={state.startDate}
                          aria-describedby={errors.dates ? 'error-dates' : undefined}
                          aria-invalid={errors.dates ? 'true' : undefined}
                          data-testid="start-date"
                          onInput={(event) =>
                            update({ startDate: (event.currentTarget as HTMLInputElement).value })
                          }
                        />
                      </p>
                      <p class="hh-field">
                        <label class="hh-label" for="end-date">Return (optional)</label>
                        <input
                          class="hh-input"
                          id="end-date"
                          type="date"
                          value={state.endDate}
                          min={state.startDate || undefined}
                          aria-describedby={errors.dates ? 'error-dates' : undefined}
                          aria-invalid={errors.dates ? 'true' : undefined}
                          data-testid="end-date"
                          onInput={(event) =>
                            update({ endDate: (event.currentTarget as HTMLInputElement).value })
                          }
                        />
                      </p>
                    </div>
                  )}
                  <FieldError id="error-dates" message={errors.dates} />
                </div>
              </>
            )}

            {step.id === 'party' && (
              <div class="hh-wizard__party">
                <div class="hh-wizard__counter">
                  <span class="hh-label" id="guests-label">On the hill</span>
                  <p class="hh-hint">Guests who will be hunting or glassing with a guide.</p>
                  <QuantityStepper
                    value={state.guests}
                    label="guests on the hill"
                    max={MAX_GUESTS}
                    testId="guests"
                    onChange={(value) => update({ guests: Math.min(MAX_GUESTS, Math.max(1, value)) })}
                  />
                </div>
                <div class="hh-wizard__counter">
                  <span class="hh-label" id="companions-label">Companions</span>
                  <p class="hh-hint">Travelling with you but not on the hill. Reduced rate.</p>
                  <QuantityStepper
                    value={state.companions}
                    label="non-hunting companions"
                    allowZero
                    max={MAX_COMPANIONS}
                    testId="companions"
                    onChange={(value) =>
                      update({ companions: Math.min(MAX_COMPANIONS, Math.max(0, value)) })
                    }
                  />
                </div>
                <FieldError id="error-guests" message={errors.guests} />
              </div>
            )}

            {step.id === 'accommodation' && (
              <fieldset class="hh-wizard__fieldset">
                <legend id="accommodation-legend" class="hh-visually-hidden">Accommodation</legend>
                <ChoiceGroup
                  name="accommodation"
                  choices={accommodationChoices}
                  value={state.accommodation}
                  invalid={Boolean(errors.accommodation)}
                  describedBy={errors.accommodation ? 'error-accommodation' : undefined}
                  onChange={(id) => update({ accommodation: id })}
                />
                <FieldError id="error-accommodation" message={errors.accommodation} />
              </fieldset>
            )}

            {step.id === 'guiding' && (
              <fieldset class="hh-wizard__fieldset">
                <legend id="guiding-legend" class="hh-visually-hidden">Guiding</legend>
                <ChoiceGroup
                  name="guiding"
                  choices={guidingChoices}
                  value={state.guiding}
                  invalid={Boolean(errors.guiding)}
                  describedBy={errors.guiding ? 'error-guiding' : undefined}
                  onChange={(id) => update({ guiding: id })}
                />
                <FieldError id="error-guiding" message={errors.guiding} />
              </fieldset>
            )}

            {step.id === 'extras' && (
              <AddOnGroup
                selected={state.addOns}
                onToggle={(id, on) =>
                  update({
                    addOns: on ? [...state.addOns, id] : state.addOns.filter((entry) => entry !== id),
                  })
                }
              />
            )}

            {step.id === 'details' && (
              <div class="hh-wizard__details">
                <p class="hh-field">
                  <label class="hh-label" for="booking-name">Name</label>
                  <input
                    class="hh-input"
                    id="booking-name"
                    type="text"
                    autocomplete="off"
                    value={state.name}
                    required
                    aria-invalid={errors.name ? 'true' : undefined}
                    aria-describedby={errors.name ? 'error-name' : undefined}
                    data-testid="booking-name"
                    onInput={(event) => update({ name: (event.currentTarget as HTMLInputElement).value })}
                  />
                  <FieldError id="error-name" message={errors.name} />
                </p>

                <p class="hh-field">
                  <label class="hh-label" for="booking-email">Email</label>
                  <input
                    class="hh-input"
                    id="booking-email"
                    type="email"
                    autocomplete="off"
                    value={state.email}
                    required
                    aria-invalid={errors.email ? 'true' : undefined}
                    aria-describedby={errors.email ? 'error-email' : 'email-hint'}
                    data-testid="booking-email"
                    onInput={(event) => update({ email: (event.currentTarget as HTMLInputElement).value })}
                  />
                  <span class="hh-hint" id="email-hint">
                    Kept in this browser only. Nothing is sent.
                  </span>
                  <FieldError id="error-email" message={errors.email} />
                </p>

                <p class="hh-field">
                  <label class="hh-label" for="booking-residence">Where are you travelling from? (optional)</label>
                  <input
                    class="hh-input"
                    id="booking-residence"
                    type="text"
                    autocomplete="off"
                    value={state.country_of_residence}
                    data-testid="booking-residence"
                    onInput={(event) =>
                      update({ country_of_residence: (event.currentTarget as HTMLInputElement).value })
                    }
                  />
                </p>

                <fieldset class="hh-wizard__fieldset">
                  <legend class="hh-label" id="level-legend">Experience so far</legend>
                  <ChoiceGroup
                    name="level"
                    choices={experienceLevels}
                    value={state.experienceLevel}
                    invalid={Boolean(errors.experienceLevel)}
                    describedBy={errors.experienceLevel ? 'error-experienceLevel' : undefined}
                    onChange={(id) => update({ experienceLevel: id })}
                  />
                  <FieldError id="error-experienceLevel" message={errors.experienceLevel} />
                </fieldset>

                <fieldset class="hh-wizard__fieldset">
                  <legend class="hh-label" id="contact-legend">How should we reply?</legend>
                  <ChoiceGroup
                    name="contact"
                    choices={contactPreferences}
                    value={state.contactPreference}
                    onChange={(id) => update({ contactPreference: id })}
                  />
                </fieldset>

                <p class="hh-field">
                  <label class="hh-label" for="booking-notes">
                    Anything else we should know? (optional)
                  </label>
                  <textarea
                    class="hh-textarea"
                    id="booking-notes"
                    value={state.notes}
                    data-testid="booking-notes"
                    onInput={(event) =>
                      update({ notes: (event.currentTarget as HTMLTextAreaElement).value })
                    }
                  />
                  <span class="hh-hint">
                    Fitness, dietary needs, mobility, who you are travelling with. Please do not
                    enter identity or payment details &mdash; this is a demonstration.
                  </span>
                </p>
              </div>
            )}

            {step.id === 'review' && (
              <div class="hh-review" data-testid="booking-review">
                <dl class="hh-review__list">
                  {summary.map((item) => (
                    <div key={item.id}>
                      <dt>{item.label}</dt>
                      {/* The edit control lives inside the <dd>: a <div> in a <dl>
                          may only contain <dt> and <dd> elements. */}
                      <dd>
                        <span data-testid={`review-${item.id}`}>{item.value || '—'}</span>
                        <button
                          type="button"
                          class="hh-review__edit"
                          data-testid={`edit-${item.id}`}
                          onClick={() => goTo(item.step)}
                        >
                          Edit<span class="hh-visually-hidden"> {item.label}</span>
                        </button>
                      </dd>
                    </div>
                  ))}
                </dl>
                {state.notes.trim() && (
                  <div class="hh-review__notes">
                    <h3>Your notes</h3>
                    <p>{state.notes}</p>
                  </div>
                )}
                <p class="hh-notice">
                  <span>
                    <strong>Producing the summary sends nothing.</strong> There is no enquiry
                    endpoint, no inbox and no record. The next screen is a demonstration of what a
                    confirmation would look like.
                  </span>
                </p>
              </div>
            )}
          </div>

          <div class="hh-wizard__nav">
            <button
              type="button"
              class="hh-button hh-button--secondary"
              onClick={() => goTo(stepIndex - 1)}
              disabled={stepIndex === 0}
              data-testid="booking-back"
            >
              Back
            </button>
            <button type="button" class="hh-button" onClick={next} data-testid="booking-next">
              {stepIndex === steps.length - 1 ? 'Produce the demo summary' : 'Continue'}
            </button>
          </div>
        </div>

        <aside class="hh-wizard__rail" aria-labelledby="rail-title">
          <h2 class="hh-wizard__railtitle" id="rail-title">Your outline</h2>
          <dl class="hh-wizard__summary" data-testid="booking-summary">
            {summary.map((item) => (
              <div key={item.id} data-filled={Boolean(item.value)}>
                <dt>{item.label}</dt>
                <dd data-testid={`summary-${item.id}`}>
                  {item.value || <span class="hh-wizard__pending">Not chosen yet</span>}
                </dd>
              </div>
            ))}
          </dl>
          <p class="hh-wizard__railnote">
            Saved in this browser so a refresh does not lose your place. Nothing leaves the device.
          </p>
        </aside>
      </div>
    </div>
  );
}
