import { CurrencyCode, CURRENCY_NAMES } from '@device-passport/shared';

interface CurrencySelectProps {
  value?: string;
  onChange?: (value: string) => void;
  name?: string;
  className?: string;
  disabled?: boolean;
  register?: any; // For react-hook-form
}

export default function CurrencySelect({
  value,
  onChange,
  name,
  className = 'input w-28',
  disabled = false,
  register,
}: CurrencySelectProps) {

  // If register is provided (react-hook-form), use it
  if (register) {
    return (
      <select className={className} disabled={disabled} {...register}>
        {Object.values(CurrencyCode).map((currency) => (
          <option key={currency} value={currency}>
            {currency} ({CURRENCY_NAMES[currency]?.symbol})
          </option>
        ))}
      </select>
    );
  }

  // Otherwise use controlled component
  return (
    <select
      name={name}
      value={value}
      onChange={(e) => onChange?.(e.target.value)}
      className={className}
      disabled={disabled}
    >
      {Object.values(CurrencyCode).map((currency) => (
        <option key={currency} value={currency}>
          {currency} ({CURRENCY_NAMES[currency]?.symbol})
        </option>
      ))}
    </select>
  );
}

// Helper to format currency amount
export function formatCurrency(amount: number, currency: CurrencyCode | string): string {
  const currencyInfo = CURRENCY_NAMES[currency as CurrencyCode];
  if (!currencyInfo) {
    return `${currency} ${amount.toLocaleString()}`;
  }
  return `${currencyInfo.symbol}${amount.toLocaleString()}`;
}
