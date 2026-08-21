type PinInputProps = {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
};

export default function PinInput({ value, onChange, disabled }: PinInputProps) {
  return (
    <input
      type="password"
      inputMode="numeric"
      pattern="[0-9]*"
      maxLength={4}
      autoFocus
      disabled={disabled}
      value={value}
      onChange={(e) => onChange(e.target.value.replace(/\D/g, "").slice(0, 4))}
      className="w-40 rounded-xl border border-neutral-300 bg-white px-4 py-3 text-center text-2xl tracking-[0.5em] text-neutral-800 outline-none focus:border-neutral-500 disabled:opacity-50 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-100"
    />
  );
}
