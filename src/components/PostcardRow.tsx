import Link from "next/link";

type PostcardRowProps = {
  id: string;
  label: string;
  statusLabel: string;
  dateLabel?: string;
  deleteLabel: string;
  onDelete: () => void;
};

export default function PostcardRow({
  id,
  label,
  statusLabel,
  dateLabel,
  deleteLabel,
  onDelete,
}: PostcardRowProps) {
  return (
    <div className="flex items-center gap-2 rounded-lg border border-rule bg-paper-elevated px-4 py-3">
      <Link href={`/postcard/${id}`} className="flex flex-1 items-center justify-between gap-3">
        <span className="text-foreground">{label}</span>
        <span className="flex items-center gap-2">
          {dateLabel && <span className="text-xs text-ink-muted">{dateLabel}</span>}
          <span className="status-text rounded-full bg-accent-soft px-2 py-0.5">{statusLabel}</span>
        </span>
      </Link>
      <button
        type="button"
        onClick={(e) => {
          e.preventDefault();
          onDelete();
        }}
        aria-label={deleteLabel}
        title={deleteLabel}
        className="flex-none text-ink-muted hover:text-accent"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M3 6h18" />
          <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
          <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
          <path d="M10 11v6M14 11v6" />
        </svg>
      </button>
    </div>
  );
}
