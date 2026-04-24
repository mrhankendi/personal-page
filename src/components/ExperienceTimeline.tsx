import { getExperience } from "@/lib/content";
import type { SubRole } from "@/lib/content";

function DescriptionLines({ lines }: Readonly<{ lines: string[] }>) {
  return (
    <div className="mt-2 space-y-1">
      {lines.map((line, i) =>
        line.startsWith("- ") ? (
          <p key={i} className="text-sm leading-snug text-(--muted-text)">
            <span className="mr-1.5 select-none opacity-50">·</span>
            {line.slice(2)}
          </p>
        ) : (
          <p key={i} className="text-sm leading-snug text-(--muted-text)">
            {line}
          </p>
        ),
      )}
    </div>
  );
}

function SubRoleBlock({ role }: Readonly<{ role: SubRole }>) {
  return (
    <div className="relative pl-4">
      <div className="absolute left-0 top-[7px] h-2 w-2 rounded-full border border-(--border) bg-(--surface-muted)" />
      <p className="text-sm font-semibold leading-snug text-(--text)">{role.title}</p>
      <p className="mt-0.5 text-xs text-(--muted-text)">
        {role.startDate} – {role.endDate}
        <span className="mx-1 opacity-40">·</span>
        {role.duration}
      </p>
      {role.location ? (
        <p className="text-xs text-(--muted-text)">{role.location}</p>
      ) : null}
      <DescriptionLines lines={role.description} />
    </div>
  );
}

function LogoBox({ src, alt }: Readonly<{ src: string; alt: string }>) {
  return (
    <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-(--border) bg-(--surface-raised) shadow-sm">
      <img src={src} alt={alt} className="h-10 w-10 object-contain" />
    </div>
  );
}

export default function ExperienceTimeline() {
  const entries = getExperience();

  return (
    <section>
      <h2 className="mb-5 text-(--text)">Experience</h2>
      <div className="divide-y divide-(--border)">
        {entries.map((entry) => (
          <div key={entry.company + (entry.type === "single" ? entry.title : "")} className="flex gap-4 py-5 first:pt-0 last:pb-0">
            <LogoBox src={entry.logo} alt={`${entry.company} logo`} />

            {entry.type === "single" ? (
              <div className="flex-1">
                <p className="font-semibold text-(--text)">{entry.title}</p>
                <p className="text-sm text-(--muted-text)">
                  {entry.company}
                  {entry.employment ? (
                    <><span className="mx-1 opacity-40">·</span>{entry.employment}</>
                  ) : null}
                </p>
                <p className="text-xs text-(--muted-text)">
                  {entry.startDate} – {entry.endDate}
                  <span className="mx-1 opacity-40">·</span>
                  {entry.duration}
                </p>
                {entry.location ? (
                  <p className="text-xs text-(--muted-text)">{entry.location}</p>
                ) : null}
                <DescriptionLines lines={entry.description} />
              </div>
            ) : (
              <div className="flex-1">
                <p className="font-semibold text-(--text)">{entry.company}</p>
                <p className="text-xs text-(--muted-text)">{entry.totalDuration}</p>
                <div className="mt-4 space-y-5">
                  {entry.roles.map((role) => (
                    <SubRoleBlock key={role.title + role.startDate} role={role} />
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}
