import type { ProjectStatus, ProjectType } from "@/lib/schema";
import { STATUS_LABELS, TYPE_SWATCH } from "@/lib/content";

/**
 * §8: colour carries meaning, but never alone. The swatch encodes the product
 * type; the word beside it is what actually conveys the status.
 */
export function StatusChip({
  status,
  type,
}: {
  status: ProjectStatus;
  type: ProjectType;
}) {
  return (
    <span className="u-mono inline-flex items-center gap-2 rounded-full border border-line bg-paper px-3 py-1 text-ink">
      <span
        aria-hidden
        className={`size-2 rounded-full ${TYPE_SWATCH[type]}`}
      />
      {STATUS_LABELS[status]}
    </span>
  );
}
