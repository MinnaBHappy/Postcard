type NameButtonProps = {
  label: string;
  onClick: () => void;
};

export default function NameButton({ label, onClick }: NameButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="w-48 rounded-2xl border border-rule bg-paper-elevated px-6 py-8 text-xl font-semibold text-foreground shadow-sm transition hover:-translate-y-1 hover:border-accent hover:shadow-md active:translate-y-0"
    >
      {label}
    </button>
  );
}
