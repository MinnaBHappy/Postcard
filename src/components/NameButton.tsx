type NameButtonProps = {
  label: string;
  onClick: () => void;
};

export default function NameButton({ label, onClick }: NameButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="w-48 rounded-2xl border border-neutral-200 bg-white px-6 py-8 text-xl font-semibold text-neutral-800 shadow-sm transition hover:-translate-y-1 hover:shadow-md active:translate-y-0 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-100"
    >
      {label}
    </button>
  );
}
