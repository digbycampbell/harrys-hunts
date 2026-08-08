import { MAX_QUANTITY } from '../lib/cart';

interface Props {
  value: number;
  onChange: (next: number) => void;
  label: string;
  /** Allows stepping down to zero (which removes a cart line). */
  allowZero?: boolean;
  compact?: boolean;
  max?: number;
  testId?: string;
}

/** Keyboard-complete quantity control: two buttons plus a live number input. */
export default function QuantityStepper({
  value,
  onChange,
  label,
  allowZero = false,
  compact = false,
  max = MAX_QUANTITY,
  testId,
}: Props) {
  const min = allowZero ? 0 : 1;

  return (
    <div class={`hh-stepper${compact ? ' hh-stepper--compact' : ''}`} data-testid={testId}>
      <button
        type="button"
        class="hh-stepper__button"
        onClick={() => onChange(Math.max(min, value - 1))}
        disabled={value <= min}
        aria-label={`Decrease quantity of ${label}`}
      >
        <span aria-hidden="true">&minus;</span>
      </button>
      <input
        class="hh-stepper__input"
        type="number"
        inputMode="numeric"
        min={min}
        max={max}
        step={1}
        value={value}
        aria-label={`Quantity of ${label}`}
        onInput={(event) => {
          const next = Number.parseInt((event.currentTarget as HTMLInputElement).value, 10);
          if (Number.isFinite(next)) onChange(Math.min(max, Math.max(min, next)));
        }}
      />
      <button
        type="button"
        class="hh-stepper__button"
        onClick={() => onChange(Math.min(max, value + 1))}
        disabled={value >= max}
        aria-label={`Increase quantity of ${label}`}
      >
        <span aria-hidden="true">+</span>
      </button>
    </div>
  );
}
