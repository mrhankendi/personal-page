import Link from "next/link";
import type { ReactNode } from "react";
import { getProfile, type Profile } from "@/lib/content";

function renderBioWithEmphasis(bio: string, emphasis?: string) {
  if (!emphasis) return bio;
  const idx = bio.indexOf(emphasis);
  if (idx === -1) return bio;
  return (
    <>
      {bio.slice(0, idx)}
      <strong className="font-semibold text-(--text)">{emphasis}</strong>
      {bio.slice(idx + emphasis.length)}
    </>
  );
}

type ProfileSidebarProps = {
  className?: string;
  sticky?: boolean;
};

const avatarPath = "/avatar.jpg";

const academicLinkMeta = [
  { key: "cv", label: "CV" },
  { key: "googleScholar", label: "Google Scholar" },
  { key: "orcid", label: "ORCID" },
  { key: "dblp", label: "DBLP" },
  { key: "semanticScholar", label: "Semantic Scholar" },
] as const;

function cx(...values: Array<string | false | null | undefined>) {
  return values.filter(Boolean).join(" ");
}

function ExternalLink({
  href,
  label,
  children,
  className,
  ariaLabel,
}: {
  href: string;
  label: string;
  children: ReactNode;
  className?: string;
  ariaLabel?: string;
}) {
  if (href.startsWith("/")) {
    return (
      <Link href={href} className={className} aria-label={ariaLabel}>
        {children}
      </Link>
    );
  }

  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      className={className}
      aria-label={ariaLabel ?? label}
      title={label}
    >
      {children}
    </a>
  );
}

function SocialIcon({ name }: { name: string }) {
  if (name === "github") {
    return (
      <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4" aria-hidden>
        <path d="M12 .5a12 12 0 0 0-3.79 23.4c.6.11.82-.26.82-.58v-2.04c-3.34.73-4.04-1.61-4.04-1.61-.55-1.39-1.35-1.76-1.35-1.76-1.1-.75.08-.74.08-.74 1.22.09 1.86 1.26 1.86 1.26 1.08 1.85 2.83 1.31 3.52 1 .11-.78.42-1.31.76-1.61-2.67-.31-5.47-1.34-5.47-5.95 0-1.31.47-2.38 1.24-3.22-.12-.31-.54-1.57.12-3.28 0 0 1.01-.32 3.3 1.23a11.47 11.47 0 0 1 6 0c2.29-1.55 3.3-1.23 3.3-1.23.66 1.71.24 2.97.12 3.28.77.84 1.24 1.9 1.24 3.22 0 4.62-2.81 5.63-5.49 5.93.43.37.81 1.1.81 2.22v3.29c0 .32.22.7.82.58A12 12 0 0 0 12 .5Z" />
      </svg>
    );
  }

  if (name === "linkedin") {
    return (
      <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4" aria-hidden>
        <path d="M4.98 3.5a2.5 2.5 0 1 1 0 5.001 2.5 2.5 0 0 1 0-5Zm.02 6.5H2v11h3v-11Zm4 0H6v11h3v-6.2c0-3.42 4-3.7 4 0V21h3v-6.98c0-6.02-6.5-5.8-7.02-2.84V10Z" />
      </svg>
    );
  }

  if (name === "scholar") {
    return (
      <svg viewBox="0 0 48 48" fill="currentColor" className="h-4 w-4" aria-hidden>
        <path d="M24 4 6 18l18 8 18-8L24 4Zm0 24c-6.627 0-12 4.03-12 9v7h24v-7c0-4.97-5.373-9-12-9Z" />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4" aria-hidden>
      <path d="M11 3a1 1 0 1 0 0 2h2.586l-6.293 6.293a1 1 0 1 0 1.414 1.414L15 6.414V9a1 1 0 1 0 2 0V4a1 1 0 0 0-1-1h-5z" />
      <path d="M5 5a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2v-3a1 1 0 1 0-2 0v3H5V7h3a1 1 0 0 0 0-2H5z" />
    </svg>
  );
}

export default function ProfileSidebar({
  className,
  sticky = false,
}: ProfileSidebarProps) {
  const profile: Profile = getProfile();

  return (
    <aside
      className={cx(
        "rounded-[1.75rem] border border-(--border-soft) bg-(--surface-raised) shadow-[0_12px_32px_rgba(15,23,42,0.06)]",
        sticky && "sticky top-24",
        className,
      )}
    >
      <div className="space-y-6 p-5 sm:p-6">
        <div className="flex items-start gap-4 sm:flex-col sm:items-center sm:text-center">
          <img
            src={avatarPath}
            alt={`${profile.name} portrait`}
            width={160}
            height={160}
            className="h-20 w-20 shrink-0 rounded-3xl object-cover ring-1 ring-(--border) sm:h-32 sm:w-32"
          />
          <div className="min-w-0 space-y-2">
            <div className="space-y-1">
              <h2 className="text-xl font-semibold text-(--text)">{profile.name}</h2>
              {profile.title ? (
                <p className="text-sm leading-6 text-(--muted-text)">{profile.title}</p>
              ) : null}
            </div>
            {profile.location ? (
              <p className="text-sm text-(--muted-text)">{profile.location}</p>
            ) : null}
          </div>
        </div>

        {profile.bio ? (
          <p className="text-sm leading-6 text-(--muted-text)">
            {renderBioWithEmphasis(profile.bio, profile.bioEmphasis)}
          </p>
        ) : null}

        {profile.researchInterests?.length ? (
          <div className="space-y-3">
            <h3 className="text-sm font-semibold uppercase tracking-[0.14em] text-(--muted-text)">
              Research Interests
            </h3>
            <div className="flex flex-wrap gap-2">
              {profile.researchInterests.map((interest) => (
                <span
                  key={interest}
                  className="rounded-full border border-(--border) bg-(--surface-muted) px-3 py-1 text-xs font-medium text-(--muted-text)"
                >
                  {interest}
                </span>
              ))}
            </div>
          </div>
        ) : null}

        {profile.links ? (
          <div className="space-y-3">
            <h3 className="text-sm font-semibold uppercase tracking-[0.14em] text-(--muted-text)">
              Academic Profiles
            </h3>
            <div className="flex flex-wrap gap-2">
              {academicLinkMeta.map(({ key, label }) => {
                const href = profile.links?.[key];
                if (!href) return null;

                return (
                  <ExternalLink
                    key={key}
                    href={href}
                    label={label}
                    className="inline-flex items-center justify-center rounded-full border border-(--border) px-3 py-2 text-xs font-medium text-(--text) transition-colors hover:border-(--border-strong) hover:bg-(--surface-muted)"
                  >
                    {label}
                  </ExternalLink>
                );
              })}
            </div>
          </div>
        ) : null}

        <div className="space-y-3">
          <h3 className="text-sm font-semibold uppercase tracking-[0.14em] text-(--muted-text)">
            Contact
          </h3>
          <div className="flex items-center gap-2">
            {profile.email ? (
              <a
                href={`mailto:${profile.email}`}
                className="min-w-0 flex-1 rounded-2xl border border-(--border) px-4 py-3 text-sm text-(--text) transition-colors hover:border-(--border-strong) hover:bg-(--surface-muted)"
              >
                <span className="block text-xs uppercase tracking-[0.16em] text-(--muted-text)">
                  Email
                </span>
                <span className="block truncate">{profile.email}</span>
              </a>
            ) : null}
            {profile.social ? (
              <ul className="flex shrink-0 items-center gap-2">
                {Object.entries(profile.social).map(([name, href]) => (
                  <li key={name}>
                    <ExternalLink
                      href={href}
                      label={name}
                      ariaLabel={name}
                      className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-(--border) text-(--muted-text) transition-colors hover:border-(--border-strong) hover:bg-(--surface-muted) hover:text-(--text)"
                    >
                      <SocialIcon name={name} />
                    </ExternalLink>
                  </li>
                ))}
              </ul>
            ) : null}
          </div>
        </div>
      </div>
    </aside>
  );
}
