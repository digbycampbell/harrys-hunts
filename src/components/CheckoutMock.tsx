/**
 * Staged checkout mockup.
 *
 * This island deliberately does nothing real. There is no network call, no
 * form action, no processor and no storage of anything typed here: the values
 * live in component state for the length of the visit and are discarded on
 * confirmation. The payment stage collects no payment method at all — it shows
 * fixed, disabled placeholders so no card detail can be entered by accident.
 */
import { useStore } from '@nanostores/preact';
import { useEffect, useRef, useState } from 'preact/hooks';
import {
  $deliveryZone,
  $lines,
  $subtotal,
  clearCart,
  deliveryZones,
  totalsFor,
  type CartTotals,
  type DeliveryZoneId,
  type ResolvedLine,
} from '../lib/cart';
import { useCartReady } from '../lib/use-cart-ready';
import { describeSelection } from '../data/products';
import { formatMoneyPrecise } from '../lib/money';
import { href } from '../lib/paths';
import type { ThumbMap } from '../lib/thumbs';

/* ------------------------------------------------------------------ model */

type FormStage = 'contact' | 'delivery' | 'payment' | 'review';
type Field = 'name' | 'email' | 'street' | 'suburb' | 'city' | 'postcode' | 'acknowledge';

const FORM_STAGES: FormStage[] = ['contact', 'delivery', 'payment', 'review'];

const STAGE_LABELS: Record<FormStage, string> = {
  contact: 'Contact',
  delivery: 'Delivery',
  payment: 'Payment',
  review: 'Review',
};

const STAGE_FIELDS: Record<FormStage, Field[]> = {
  contact: ['name', 'email'],
  delivery: ['street', 'suburb', 'city', 'postcode'],
  payment: ['acknowledge'],
  review: [],
};

const FIELD_LABELS: Record<Field, string> = {
  name: 'Name',
  email: 'Email address',
  street: 'Street address',
  suburb: 'Suburb',
  city: 'City or town',
  postcode: 'Postcode',
  acknowledge: 'Demonstration acknowledgement',
};

const ALL_FIELDS: Field[] = FORM_STAGES.flatMap((stage) => STAGE_FIELDS[stage]);

interface Values {
  name: string;
  email: string;
  street: string;
  suburb: string;
  city: string;
  postcode: string;
}

const EMPTY_VALUES: Values = {
  name: '',
  email: '',
  street: '',
  suburb: '',
  city: '',
  postcode: '',
};

const DEMO_VALUES: Values = {
  name: 'Demo Visitor',
  email: 'demo.visitor@example.invalid',
  street: '12 Tussock Lane',
  suburb: 'Fictional Flat',
  city: 'Demo Springs',
  postcode: '9999',
};

/** Deliberately forgiving: enough to catch a typo, not a validity oracle. */
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const POSTCODE_PATTERN = /^[A-Za-z0-9][A-Za-z0-9 -]{2,9}$/;

function fieldError(field: Field, values: Values, acknowledged: boolean): string | null {
  switch (field) {
    case 'name':
      return values.name.trim() ? null : 'Enter a name for the demonstration.';
    case 'email':
      if (!values.email.trim()) return 'Enter an email address.';
      return EMAIL_PATTERN.test(values.email.trim())
        ? null
        : 'Enter an email address in the form name@example.com.';
    case 'street':
      return values.street.trim() ? null : 'Enter a street address.';
    case 'suburb':
      return values.suburb.trim() ? null : 'Enter a suburb.';
    case 'city':
      return values.city.trim() ? null : 'Enter a city or town.';
    case 'postcode':
      if (!values.postcode.trim()) return 'Enter a postcode.';
      return POSTCODE_PATTERN.test(values.postcode.trim())
        ? null
        : 'Enter a postcode of three to ten characters.';
    case 'acknowledge':
      return acknowledged
        ? null
        : 'Confirm you understand this checkout is a demonstration.';
  }
}

function stageOf(field: Field): FormStage {
  return FORM_STAGES.find((stage) => STAGE_FIELDS[stage].includes(field)) ?? 'contact';
}

/** Client-side only. Nothing looks this up, because nothing exists to look up. */
function makeReference(): string {
  const alphabet = '0123456789ABCDEF';
  let suffix = '';
  if (typeof crypto !== 'undefined' && typeof crypto.getRandomValues === 'function') {
    const bytes = new Uint8Array(4);
    crypto.getRandomValues(bytes);
    bytes.forEach((byte) => {
      suffix += alphabet[byte % 16];
    });
  } else {
    for (let index = 0; index < 4; index += 1) {
      suffix += alphabet[Math.floor(Math.random() * 16)];
    }
  }
  return `HH-DEMO-${suffix}`;
}

interface Confirmation {
  reference: string;
  lines: ResolvedLine[];
  totals: CartTotals;
  contact: { name: string; email: string };
  delivery: { street: string; suburb: string; city: string; postcode: string; zone: string };
}

/* ----------------------------------------------------------------- island */

export default function CheckoutMock({ thumbs }: { thumbs: ThumbMap }) {
  const ready = useCartReady();
  const lines = useStore($lines);
  const subtotal = useStore($subtotal);
  const zoneId = useStore($deliveryZone);

  const [stage, setStage] = useState<FormStage>('contact');
  const [values, setValues] = useState<Values>(EMPTY_VALUES);
  const [acknowledged, setAcknowledged] = useState(false);
  const [errors, setErrors] = useState<Partial<Record<Field, string>>>({});
  const [attempted, setAttempted] = useState<Partial<Record<FormStage, boolean>>>({});
  const [showSummary, setShowSummary] = useState(false);
  const [confirmation, setConfirmation] = useState<Confirmation | null>(null);

  const headingRef = useRef<HTMLHeadingElement>(null);
  const successRef = useRef<HTMLHeadingElement>(null);
  const fieldRefs = useRef<Partial<Record<Field, HTMLElement | null>>>({});
  const pendingFocus = useRef<Field | null>(null);
  const navigated = useRef(false);

  useEffect(() => {
    if (!navigated.current) return;
    const field = pendingFocus.current;
    pendingFocus.current = null;
    if (field && fieldRefs.current[field]) {
      fieldRefs.current[field]?.focus();
      return;
    }
    headingRef.current?.focus();
  }, [stage]);

  useEffect(() => {
    if (confirmation) successRef.current?.focus();
  }, [confirmation]);

  const totals = totalsFor(subtotal, zoneId);
  const stageIndex = confirmation ? 4 : FORM_STAGES.indexOf(stage);
  const stepLabels = [...FORM_STAGES.map((id) => STAGE_LABELS[id]), 'Confirmation'];

  function setValue(field: keyof Values, next: string) {
    const nextValues: Values = { ...values, [field]: next };
    setValues(nextValues);
    // Clear a standing error the moment the value becomes valid, but never
    // raise a new one mid-keystroke: half-typed input is not a mistake yet.
    if (errors[field] && !fieldError(field, nextValues, acknowledged)) {
      setErrors((previous) => {
        const updated = { ...previous };
        delete updated[field];
        return updated;
      });
    }
  }

  function revalidate(field: Field, nextValues: Values, nextAck: boolean) {
    setErrors((previous) => {
      const updated = { ...previous };
      const message = fieldError(field, nextValues, nextAck);
      if (message) updated[field] = message;
      else delete updated[field];
      return updated;
    });
  }

  function onBlurField(field: Field, event: FocusEvent) {
    if (!attempted[stageOf(field)]) return;
    // Blurring onto Back/Continue must not insert or remove an error message:
    // the resulting reflow moves the button out from under the pointer between
    // mousedown and mouseup, and the activation is lost. Submitting the stage
    // validates everything a moment later anyway.
    const receiving = event.relatedTarget as HTMLElement | null;
    if (receiving && receiving.tagName === 'BUTTON') return;
    revalidate(field, values, acknowledged);
  }

  function goTo(next: FormStage, focusField?: Field) {
    navigated.current = true;
    pendingFocus.current = focusField ?? null;
    setStage(next);
  }

  function fillDemoDetails() {
    const next: Values = { ...values, ...DEMO_VALUES, name: values.name, email: values.email };
    setValues(next);
    setErrors((previous) => {
      const updated = { ...previous };
      STAGE_FIELDS.delivery.forEach((field) => delete updated[field]);
      return updated;
    });
    setShowSummary(false);
  }

  function confirmOrder() {
    // Snapshot before clearing: the success panel shows what *would* have shipped.
    const snapshotLines = $lines.get();
    const snapshotTotals = totalsFor($subtotal.get(), $deliveryZone.get());
    setConfirmation({
      reference: makeReference(),
      lines: snapshotLines,
      totals: snapshotTotals,
      contact: { name: values.name.trim(), email: values.email.trim() },
      delivery: {
        street: values.street.trim(),
        suburb: values.suburb.trim(),
        city: values.city.trim(),
        postcode: values.postcode.trim(),
        zone: snapshotTotals.zone.label,
      },
    });
    setValues(EMPTY_VALUES);
    setAcknowledged(false);
    setErrors({});
    setAttempted({});
    setShowSummary(false);
    clearCart();
  }

  function onSubmit(event: Event) {
    event.preventDefault();

    if (stage === 'review') {
      const all: Partial<Record<Field, string>> = {};
      ALL_FIELDS.forEach((field) => {
        const message = fieldError(field, values, acknowledged);
        if (message) all[field] = message;
      });
      const firstBad = ALL_FIELDS.find((field) => all[field]);
      if (firstBad) {
        setErrors(all);
        setAttempted((previous) => ({ ...previous, [stageOf(firstBad)]: true }));
        setShowSummary(true);
        goTo(stageOf(firstBad), firstBad);
        return;
      }
      confirmOrder();
      return;
    }

    const stageErrors: Partial<Record<Field, string>> = {};
    STAGE_FIELDS[stage].forEach((field) => {
      const message = fieldError(field, values, acknowledged);
      if (message) stageErrors[field] = message;
    });
    setErrors(stageErrors);
    setAttempted((previous) => ({ ...previous, [stage]: true }));

    const firstBad = STAGE_FIELDS[stage].find((field) => stageErrors[field]);
    if (firstBad) {
      setShowSummary(true);
      fieldRefs.current[firstBad]?.focus();
      return;
    }

    setShowSummary(false);
    goTo(FORM_STAGES[FORM_STAGES.indexOf(stage) + 1]);
  }

  function goBack() {
    setShowSummary(false);
    goTo(FORM_STAGES[Math.max(0, FORM_STAGES.indexOf(stage) - 1)]);
  }

  /* --------------------------------------------------------- field helper */

  function textField(
    field: Extract<Field, 'name' | 'email' | 'street' | 'suburb' | 'city' | 'postcode'>,
    options: {
      autocomplete: string;
      type?: string;
      hint?: string;
      inputMode?: 'text' | 'email' | 'numeric';
    },
  ) {
    const id = `hh-co-${field}`;
    const errorId = `${id}-error`;
    const hintId = `${id}-hint`;
    const message = errors[field];
    const described = [options.hint ? hintId : null, message ? errorId : null]
      .filter(Boolean)
      .join(' ');

    return (
      <div class="hh-field">
        <label class="hh-label" for={id}>
          {FIELD_LABELS[field]}
        </label>
        {options.hint && (
          <p class="hh-hint" id={hintId}>
            {options.hint}
          </p>
        )}
        <input
          class="hh-input"
          id={id}
          name={field}
          type={options.type ?? 'text'}
          inputMode={options.inputMode}
          autocomplete={options.autocomplete}
          value={values[field]}
          aria-invalid={message ? 'true' : undefined}
          aria-describedby={described || undefined}
          data-testid={`input-${field}`}
          ref={(element) => {
            fieldRefs.current[field] = element as HTMLElement | null;
          }}
          onInput={(event) => setValue(field, (event.currentTarget as HTMLInputElement).value)}
          onBlur={(event) => onBlurField(field, event as unknown as FocusEvent)}
        />
        {message && (
          <p class="hh-error" id={errorId} data-testid={`error-${field}`}>
            {message}
          </p>
        )}
      </div>
    );
  }

  /* ------------------------------------------------------------- branches */

  if (!ready) {
    return (
      <div class="hh-checkout" aria-busy="true" data-testid="checkout-loading">
        <p class="hh-visually-hidden" role="status">
          Loading your cart
        </p>
        <div class="hh-checkout__loading">
          <div class="hh-skeleton" style="height:3rem" />
          <div class="hh-skeleton" style="height:18rem" />
        </div>
      </div>
    );
  }

  if (!confirmation && lines.length === 0) {
    return (
      <div class="hh-checkout">
        <div class="hh-emptystate" data-testid="checkout-empty">
          <p class="hh-eyebrow">Nothing added</p>
          <h2 class="hh-emptystate__title">The cart is empty</h2>
          <p class="hh-emptystate__body">
            Add a fictional product, then try the contact, delivery, payment-demo and confirmation
            stages. No order will be created.
          </p>
          <a class="hh-button" href={href('/shop/')} data-testid="checkout-empty-shop">
            Browse the field kit
          </a>
        </div>
      </div>
    );
  }

  if (confirmation) {
    return (
      <div class="hh-checkout">
        {stageIndicator()}
        <p class="hh-visually-hidden" role="status" data-testid="checkout-live">
          Step 5 of 5: Confirmation
        </p>

        <section
          class="hh-success"
          aria-labelledby="hh-co-success-title"
          data-testid="checkout-success"
        >
          <p class="hh-eyebrow">End of demonstration</p>
          <h2 id="hh-co-success-title" class="hh-success__title" tabindex={-1} ref={successRef}>
            Checkout demonstration complete
          </h2>

          <p class="hh-notice hh-success__notice">
            <span>
              <strong>No order was made and no payment was taken.</strong> Nothing was sent or stored
              off this device. No processor was contacted and no card details were collected. The
              reference below was generated in this browser.
            </span>
          </p>

          <p class="hh-success__reference">
            <span class="hh-success__referencelabel">Demonstration reference</span>
            <strong class="hh-num" data-testid="checkout-reference">
              {confirmation.reference}
            </strong>
          </p>

          <div class="hh-success__body">
            <div class="hh-reviewblock">
              <h3 class="hh-reviewblock__title">What was in the cart</h3>
              <ul class="hh-cartlines" data-testid="success-lines">
                {confirmation.lines.map((line) => (
                  <li
                    class="hh-cartline hh-cartline--static"
                    key={line.id}
                    data-testid={`success-line-${line.slug}`}
                  >
                    {thumbs[line.slug] && (
                      <img
                        class="hh-cartline__image"
                        src={thumbs[line.slug].src}
                        width={thumbs[line.slug].width}
                        height={thumbs[line.slug].height}
                        alt=""
                        loading="lazy"
                        decoding="async"
                      />
                    )}
                    <div class="hh-cartline__detail">
                      <span class="hh-cartline__name">{line.product.name}</span>
                      <p class="hh-cartline__options">
                        {describeSelection(line.product, line.selection)}
                      </p>
                      <p class="hh-cartline__unit">
                        {line.quantity} × {formatMoneyPrecise(line.unitPrice)}
                      </p>
                    </div>
                    <p class="hh-cartline__price hh-num">{formatMoneyPrecise(line.lineTotal)}</p>
                  </li>
                ))}
              </ul>
            </div>

            <div class="hh-reviewblock">
              <h3 class="hh-reviewblock__title">Totals that were not charged</h3>
              <dl class="hh-totals">
                <div class="hh-totals__row">
                  <dt>Subtotal</dt>
                  <dd class="hh-num" data-testid="success-subtotal">
                    {formatMoneyPrecise(confirmation.totals.subtotal)}
                  </dd>
                </div>
                <div class="hh-totals__row">
                  <dt>Delivery — {confirmation.totals.zone.label}</dt>
                  <dd class="hh-num" data-testid="success-delivery">
                    {confirmation.totals.delivery === 0
                      ? 'Included'
                      : formatMoneyPrecise(confirmation.totals.delivery)}
                  </dd>
                </div>
                <div class="hh-totals__row hh-totals__row--grand">
                  <dt>Total</dt>
                  <dd class="hh-num" data-testid="success-total">
                    {formatMoneyPrecise(confirmation.totals.total)}
                  </dd>
                </div>
              </dl>
              <p class="hh-summary__gst" data-testid="success-gst">
                GST included: {formatMoneyPrecise(confirmation.totals.gstIncluded)}
              </p>

              <dl class="hh-speclist hh-success__spec">
                <div>
                  {/* Not "sent to" — nothing left the browser. */}
                  <dt>Contact entered</dt>
                  <dd>
                    {confirmation.contact.name}
                    <br />
                    {confirmation.contact.email}
                  </dd>
                </div>
                <div>
                  <dt>Demonstration address</dt>
                  <dd>
                    {confirmation.delivery.street}
                    <br />
                    {confirmation.delivery.suburb}, {confirmation.delivery.city}{' '}
                    {confirmation.delivery.postcode}
                    <br />
                    {confirmation.delivery.zone}
                  </dd>
                </div>
                <div>
                  <dt>Payment</dt>
                  <dd>Sandbox token HH-DEMO-TOKEN. No processor was contacted.</dd>
                </div>
              </dl>
            </div>
          </div>

          <div class="hh-success__actions">
            <a class="hh-button" href={href('/shop/')} data-testid="success-shop-link">
              Back to the store
            </a>
            <a
              class="hh-button hh-button--secondary"
              href={href('/')}
              data-testid="success-home-link"
            >
              Return home
            </a>
          </div>
        </section>
      </div>
    );
  }

  /* ------------------------------------------------------------ indicator */

  function stageIndicator() {
    return (
      <nav class="hh-steps" aria-label="Checkout progress">
        <ol class="hh-steps__list" data-testid="checkout-steps">
          {stepLabels.map((label, index) => (
            <li
              class="hh-steps__item"
              key={label}
              data-state={index < stageIndex ? 'done' : index === stageIndex ? 'current' : 'todo'}
              data-testid={`checkout-step-${label.toLowerCase()}`}
              aria-current={index === stageIndex ? 'step' : undefined}
            >
              <span class="hh-steps__number" aria-hidden="true">
                {index + 1}
              </span>
              <span class="hh-steps__label">{label}</span>
            </li>
          ))}
        </ol>
      </nav>
    );
  }

  /* ----------------------------------------------------------- form stage */

  const stageErrorList = STAGE_FIELDS[stage].filter((field) => errors[field]);
  const isFirst = stage === FORM_STAGES[0];

  return (
    <div class="hh-checkout">
      {stageIndicator()}
      <p class="hh-visually-hidden" role="status" data-testid="checkout-live">
        Step {stageIndex + 1} of 5: {STAGE_LABELS[stage]}
      </p>

      <div class="hh-checkout__layout">
        <form class="hh-checkout__form" novalidate onSubmit={onSubmit}>
          {showSummary && stageErrorList.length > 0 && (
            <div class="hh-alert" role="alert" data-testid="checkout-error-summary">
              <p class="hh-alert__title">
                {stageErrorList.length === 1
                  ? 'One field needs attention before you continue.'
                  : `${stageErrorList.length} fields need attention before you continue.`}
              </p>
              <ul class="hh-alert__list">
                {stageErrorList.map((field) => (
                  <li key={field}>
                    {FIELD_LABELS[field]}: {errors[field]}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {stage === 'contact' && (
            <section
              class="hh-stage"
              aria-labelledby="hh-co-stage-title"
              data-testid="checkout-stage-contact"
            >
              <h2 id="hh-co-stage-title" class="hh-stage__title" tabindex={-1} ref={headingRef}>
                Contact
              </h2>
              <p class="hh-stage__intro">
                Use made-up contact details. Nothing is emailed, logged or kept after you leave the page.
              </p>
              <div class="hh-stage__fields">
                {textField('name', { autocomplete: 'off' })}
                {textField('email', {
                  autocomplete: 'off',
                  type: 'email',
                  inputMode: 'email',
                  hint: 'Use a made-up address. It is never sent.',
                })}
              </div>
            </section>
          )}

          {stage === 'delivery' && (
            <section
              class="hh-stage"
              aria-labelledby="hh-co-stage-title"
              data-testid="checkout-stage-delivery"
            >
              <h2 id="hh-co-stage-title" class="hh-stage__title" tabindex={-1} ref={headingRef}>
                Delivery
              </h2>
              <p class="hh-stage__intro">
                Use the sample details or invent your own. The address is not checked, saved or used
                for delivery.
              </p>
              <p class="hh-stage__tools">
                <button
                  type="button"
                  class="hh-button hh-button--secondary hh-button--small"
                  onClick={fillDemoDetails}
                  data-testid="fill-demo-address"
                >
                  Use sample details
                </button>
              </p>
              <div class="hh-stage__fields">
                {textField('street', { autocomplete: 'off' })}
                <div class="hh-fieldrow">
                  {textField('suburb', { autocomplete: 'off' })}
                  {textField('city', { autocomplete: 'off' })}
                </div>
                <div class="hh-fieldrow">
                  {textField('postcode', { autocomplete: 'off', inputMode: 'numeric' })}
                  <div class="hh-field">
                    <label class="hh-label" for="hh-co-zone">
                      Delivery zone
                    </label>
                    <select
                      class="hh-select"
                      id="hh-co-zone"
                      value={zoneId}
                      data-testid="input-zone"
                      onChange={(event) =>
                        $deliveryZone.set(
                          (event.currentTarget as HTMLSelectElement).value as DeliveryZoneId,
                        )
                      }
                    >
                      {deliveryZones.map((zone) => (
                        <option value={zone.id} key={zone.id}>
                          {zone.label} — {zone.estimate}
                        </option>
                      ))}
                    </select>
                    <p class="hh-hint" data-testid="checkout-zone-estimate">
                      Indicative window: {totals.zone.estimate}. This only changes the demo total.
                    </p>
                  </div>
                </div>
              </div>
            </section>
          )}

          {stage === 'payment' && (
            <section
              class="hh-stage"
              aria-labelledby="hh-co-stage-title"
              data-testid="checkout-stage-payment"
            >
              <h2 id="hh-co-stage-title" class="hh-stage__title" tabindex={-1} ref={headingRef}>
                Payment
              </h2>
              <p class="hh-stage__intro">
                A real checkout would ask for payment here. This demonstration does not.
              </p>

              <div class="hh-payment" data-testid="payment-demo-panel">
                <p class="hh-notice hh-payment__notice">
                  <span>
                    <strong>No payment method is collected.</strong> Card entry is not possible and
                    there is no payment processor. The fixed values below are only placeholders.
                  </span>
                </p>

                <div class="hh-payment__grid">
                  <div class="hh-field">
                    <label class="hh-label" for="hh-co-card">
                      Card on file (placeholder)
                    </label>
                    <input
                      class="hh-input hh-input--locked"
                      id="hh-co-card"
                      type="text"
                      value="demo •••• 0000"
                      disabled
                      readOnly
                      data-testid="payment-card-display"
                    />
                  </div>
                  <div class="hh-field">
                    <label class="hh-label" for="hh-co-token">
                      Sandbox token
                    </label>
                    <input
                      class="hh-input hh-input--locked"
                      id="hh-co-token"
                      type="text"
                      value="HH-DEMO-TOKEN"
                      disabled
                      readOnly
                      data-testid="payment-token-display"
                    />
                  </div>
                </div>

                <dl class="hh-speclist hh-payment__spec">
                  <div>
                    <dt>Mode</dt>
                    <dd>Sandbox demonstration — offline</dd>
                  </div>
                  <div>
                    <dt>Processor</dt>
                    <dd>None. No request leaves the browser.</dd>
                  </div>
                  <div>
                    <dt>Amount authorised</dt>
                    <dd>Nil. Nothing is charged at any point.</dd>
                  </div>
                </dl>

                <div class="hh-check">
                  <input
                    type="checkbox"
                    id="hh-co-acknowledge"
                    class="hh-check__input"
                    checked={acknowledged}
                    aria-invalid={errors.acknowledge ? 'true' : undefined}
                    aria-describedby={errors.acknowledge ? 'hh-co-acknowledge-error' : undefined}
                    data-testid="input-acknowledge"
                    ref={(element) => {
                      fieldRefs.current.acknowledge = element as HTMLElement | null;
                    }}
                    onChange={(event) => {
                      const next = (event.currentTarget as HTMLInputElement).checked;
                      setAcknowledged(next);
                      if (attempted.payment) revalidate('acknowledge', values, next);
                    }}
                    onBlur={(event) =>
                      onBlurField('acknowledge', event as unknown as FocusEvent)
                    }
                  />
                  <label class="hh-check__label" for="hh-co-acknowledge">
                    I understand this is a demonstration and that no payment will be taken.
                  </label>
                </div>
                {errors.acknowledge && (
                  <p
                    class="hh-error"
                    id="hh-co-acknowledge-error"
                    data-testid="error-acknowledge"
                  >
                    {errors.acknowledge}
                  </p>
                )}
              </div>
            </section>
          )}

          {stage === 'review' && (
            <section
              class="hh-stage"
              aria-labelledby="hh-co-stage-title"
              data-testid="checkout-stage-review"
            >
              <h2 id="hh-co-stage-title" class="hh-stage__title" tabindex={-1} ref={headingRef}>
                Review
              </h2>
              <p class="hh-stage__intro">
                Check the sample details and fictional totals. The final button creates no order and
                takes no payment.
              </p>

              <div class="hh-reviewblock" data-testid="review-contact">
                <div class="hh-reviewblock__head">
                  <h3 class="hh-reviewblock__title">Contact</h3>
                  <button
                    type="button"
                    class="hh-reviewblock__edit"
                    onClick={() => goTo('contact')}
                    data-testid="edit-contact"
                  >
                    Edit<span class="hh-visually-hidden"> contact details</span>
                  </button>
                </div>
                <dl class="hh-speclist">
                  <div>
                    <dt>Name</dt>
                    <dd>{values.name}</dd>
                  </div>
                  <div>
                    <dt>Email</dt>
                    <dd>{values.email}</dd>
                  </div>
                </dl>
              </div>

              <div class="hh-reviewblock" data-testid="review-delivery">
                <div class="hh-reviewblock__head">
                  <h3 class="hh-reviewblock__title">Delivery</h3>
                  <button
                    type="button"
                    class="hh-reviewblock__edit"
                    onClick={() => goTo('delivery')}
                    data-testid="edit-delivery"
                  >
                    Edit<span class="hh-visually-hidden"> delivery details</span>
                  </button>
                </div>
                <dl class="hh-speclist">
                  <div>
                    <dt>Address</dt>
                    <dd>
                      {values.street}
                      <br />
                      {values.suburb}, {values.city} {values.postcode}
                    </dd>
                  </div>
                  <div>
                    <dt>Zone</dt>
                    <dd>
                      {totals.zone.label} — {totals.zone.estimate}
                    </dd>
                  </div>
                </dl>
              </div>

              <div class="hh-reviewblock" data-testid="review-payment">
                <div class="hh-reviewblock__head">
                  <h3 class="hh-reviewblock__title">Payment</h3>
                  <button
                    type="button"
                    class="hh-reviewblock__edit"
                    onClick={() => goTo('payment')}
                    data-testid="edit-payment"
                  >
                    Edit<span class="hh-visually-hidden"> payment mode</span>
                  </button>
                </div>
                <dl class="hh-speclist">
                  <div>
                    <dt>Mode</dt>
                    <dd>Sandbox demonstration — no processor</dd>
                  </div>
                  <div>
                    <dt>Method</dt>
                    <dd>demo •••• 0000 (HH-DEMO-TOKEN)</dd>
                  </div>
                </dl>
              </div>

              <div class="hh-reviewblock">
                <h3 class="hh-reviewblock__title">Items</h3>
                <ul class="hh-cartlines" data-testid="review-lines">
                  {lines.map((line) => (
                    <li
                      class="hh-cartline hh-cartline--static"
                      key={line.id}
                      data-testid={`review-line-${line.slug}`}
                    >
                      {thumbs[line.slug] && (
                        <img
                          class="hh-cartline__image"
                          src={thumbs[line.slug].src}
                          width={thumbs[line.slug].width}
                          height={thumbs[line.slug].height}
                          alt=""
                          loading="lazy"
                          decoding="async"
                        />
                      )}
                      <div class="hh-cartline__detail">
                        <span class="hh-cartline__name">{line.product.name}</span>
                        <p class="hh-cartline__options">
                          {describeSelection(line.product, line.selection)}
                        </p>
                        <p class="hh-cartline__unit">
                          {line.quantity} × {formatMoneyPrecise(line.unitPrice)}
                        </p>
                      </div>
                      <p class="hh-cartline__price hh-num">
                        {formatMoneyPrecise(line.lineTotal)}
                      </p>
                    </li>
                  ))}
                </ul>
                <p class="hh-reviewblock__foot">
                  <a class="hh-link" href={href('/cart/')}>
                    Change quantities in the cart
                  </a>
                </p>
              </div>
            </section>
          )}

          <div class="hh-checkout__nav">
            <button
              type="button"
              class="hh-button hh-button--secondary"
              onClick={goBack}
              disabled={isFirst}
              data-testid="checkout-back"
            >
              Back
            </button>
            {stage === 'review' ? (
              <button type="submit" class="hh-button" data-testid="checkout-place-order">
                Complete demonstration
              </button>
            ) : (
              <button type="submit" class="hh-button" data-testid="checkout-next">
                Continue
              </button>
            )}
          </div>

          <p class="hh-notice hh-checkout__notice" data-testid="checkout-demo-notice">
            <span>
              <strong>This checkout is a mockup.</strong> It collects no payment, creates no order and
              sends nothing. Typed details stay in this browser tab only.
            </span>
          </p>
        </form>

        <aside
          class="hh-summary"
          aria-labelledby="hh-co-summary-title"
          data-testid="checkout-summary"
        >
          <div class="hh-summary__inner">
            <h2 id="hh-co-summary-title" class="hh-summary__title">
              Order summary
            </h2>

            <ul class="hh-cartlines hh-cartlines--tight">
              {lines.map((line) => (
                <li class="hh-cartline hh-cartline--static hh-cartline--mini" key={line.id}>
                  {thumbs[line.slug] && (
                    <img
                      class="hh-cartline__image"
                      src={thumbs[line.slug].src}
                      width={thumbs[line.slug].width}
                      height={thumbs[line.slug].height}
                      alt=""
                      loading="lazy"
                      decoding="async"
                    />
                  )}
                  <div class="hh-cartline__detail">
                    <span class="hh-cartline__name">{line.product.name}</span>
                    <p class="hh-cartline__options">
                      {describeSelection(line.product, line.selection)}
                    </p>
                    <p class="hh-cartline__unit">
                      {line.quantity} × {formatMoneyPrecise(line.unitPrice)}
                    </p>
                  </div>
                  <p class="hh-cartline__price hh-num">{formatMoneyPrecise(line.lineTotal)}</p>
                </li>
              ))}
            </ul>

            <dl class="hh-totals">
              <div class="hh-totals__row">
                <dt>Subtotal</dt>
                <dd class="hh-num" data-testid="checkout-subtotal">
                  {formatMoneyPrecise(totals.subtotal)}
                </dd>
              </div>
              <div class="hh-totals__row">
                <dt>Delivery — {totals.zone.label}</dt>
                <dd class="hh-num" data-testid="checkout-delivery">
                  {totals.delivery === 0 ? 'Included' : formatMoneyPrecise(totals.delivery)}
                </dd>
              </div>
              <div class="hh-totals__row hh-totals__row--grand">
                <dt>Total</dt>
                <dd class="hh-num" data-testid="checkout-total">
                  {formatMoneyPrecise(totals.total)}
                </dd>
              </div>
            </dl>

            {totals.freeDeliveryShortfall !== null && (
              <p class="hh-summary__shortfall" data-testid="checkout-shortfall">
                {formatMoneyPrecise(totals.freeDeliveryShortfall)} more and delivery to{' '}
                {totals.zone.label} is included.
              </p>
            )}

            <p class="hh-summary__gst" data-testid="checkout-gst">
              GST included: {formatMoneyPrecise(totals.gstIncluded)}
            </p>

            <p class="hh-summary__link">
              <a class="hh-link" href={href('/cart/')} data-testid="checkout-cart-link">
                Back to the cart
              </a>
            </p>
          </div>
        </aside>
      </div>
    </div>
  );
}
