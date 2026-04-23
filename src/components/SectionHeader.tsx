type SectionHeaderProps = {
  id?: string;
  eyebrow?: string;
  title: string;
  description?: string;
  count?: number;
};

export default function SectionHeader({
  id,
  eyebrow,
  title,
  description,
  count,
}: SectionHeaderProps) {
  return (
    <div className="space-y-2">
      {eyebrow ? (
        <p className="text-xs font-medium uppercase tracking-[0.22em] text-(--muted-text)">
          {eyebrow}
        </p>
      ) : null}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div className="space-y-1">
          <h2 id={id} className="text-2xl font-semibold text-(--text)">
            {title}
          </h2>
          {description ? (
            <p className="max-w-3xl text-sm leading-6 text-(--muted-text)">
              {description}
            </p>
          ) : null}
        </div>
        {typeof count === "number" ? (
          <p className="text-sm text-(--muted-text)">{count} publications</p>
        ) : null}
      </div>
    </div>
  );
}
