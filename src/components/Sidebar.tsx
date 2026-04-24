"use client";
/* eslint-disable @next/next/no-img-element */
import { getProfile, type Profile } from "@/lib/content";

const avatarPath = "/avatar.jpg";
const mobileSocialKeys = ["github", "scholar", "linkedin"] as const;

const socialMeta: Record<
  string,
  {
    label: string;
    description: string;
    accent: string;
  }
> = {
  github: {
    label: "GitHub",
    description: "Code and projects",
    accent: "group-hover:text-slate-950 dark:group-hover:text-white",
  },
  scholar: {
    label: "Google Scholar",
    description: "Citations and papers",
    accent: "group-hover:text-blue-700 dark:group-hover:text-blue-300",
  },
  linkedin: {
    label: "LinkedIn",
    description: "Professional profile",
    accent: "group-hover:text-sky-700 dark:group-hover:text-sky-300",
  },
  orcid: {
    label: "ORCID",
    description: "Research identifier",
    accent: "group-hover:text-lime-700 dark:group-hover:text-lime-300",
  },
};

function SocialIcon({ name }: Readonly<{ name: string }>) {
  if (name === "github") {
    return (
      <svg viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5" aria-hidden>
        <path d="M12 .5a12 12 0 0 0-3.79 23.4c.6.11.82-.26.82-.58v-2.04c-3.34.73-4.04-1.61-4.04-1.61-.55-1.39-1.35-1.76-1.35-1.76-1.1-.75.08-.74.08-.74 1.22.09 1.86 1.26 1.86 1.26 1.08 1.85 2.83 1.31 3.52 1 .11-.78.42-1.31.76-1.61-2.67-.31-5.47-1.34-5.47-5.95 0-1.31.47-2.38 1.24-3.22-.12-.31-.54-1.57.12-3.28 0 0 1.01-.32 3.3 1.23a11.47 11.47 0 0 1 6 0c2.29-1.55 3.3-1.23 3.3-1.23.66 1.71.24 2.97.12 3.28.77.84 1.24 1.9 1.24 3.22 0 4.62-2.81 5.63-5.49 5.93.43.37.81 1.1.81 2.22v3.29c0 .32.22.7.82.58A12 12 0 0 0 12 .5Z" />
      </svg>
    );
  }

  if (name === "linkedin") {
    return (
      <svg viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5" aria-hidden>
        <path d="M4.98 3.5a2.5 2.5 0 1 1 0 5.001 2.5 2.5 0 0 1 0-5Zm.02 6.5H2v11h3v-11Zm4 0H6v11h3v-6.2c0-3.42 4-3.7 4 0V21h3v-6.98c0-6.02-6.5-5.8-7.02-2.84V10Z" />
      </svg>
    );
  }

  if (name === "scholar") {
    return (
      <svg viewBox="0 0 48 48" fill="currentColor" className="h-5 w-5" aria-hidden>
        <path d="M24 4 6 18l18 8 18-8L24 4Zm0 24c-6.63 0-12 4.03-12 9v7h24v-7c0-4.97-5.37-9-12-9Z" />
      </svg>
    );
  }

  if (name === "orcid") {
    return (
      <svg viewBox="0 0 256 256" fill="currentColor" className="h-5 w-5" aria-hidden>
        <path d="M128 0a128 128 0 1 0 0 256A128 128 0 0 0 128 0Zm-24 66h12v124h-12V66Zm42 0c30.38 0 52 22.22 52 52s-21.62 52-52 52h-20V66h20Zm0 12h-8v80h8c23.2 0 40-16.8 40-40s-16.8-40-40-40Z" />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 20 20" fill="currentColor" className="h-5 w-5" aria-hidden>
      <path d="M11 3a1 1 0 1 0 0 2h2.59l-6.3 6.29a1 1 0 1 0 1.42 1.42L15 6.41V9a1 1 0 1 0 2 0V4a1 1 0 0 0-1-1h-5Z" />
      <path d="M5 5a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2v-3a1 1 0 1 0-2 0v3H5V7h3a1 1 0 0 0 0-2H5Z" />
    </svg>
  );
}

function ArrowIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4" aria-hidden>
      <path d="M11 3a1 1 0 1 0 0 2h2.59l-6.3 6.29a1 1 0 1 0 1.42 1.42L15 6.41V9a1 1 0 1 0 2 0V4a1 1 0 0 0-1-1h-5Z" />
      <path d="M5 5a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2v-3a1 1 0 1 0-2 0v3H5V7h3a1 1 0 0 0 0-2H5Z" />
    </svg>
  );
}

function formatSocialKey(key: string) {
  return key
    .replace(/([A-Z])/g, " $1")
    .replace(/^\w/, (letter) => letter.toUpperCase());
}

export default function Sidebar() {
  const p: Profile = getProfile();

  return (
    <aside className="w-full shrink-0 pt-3 lg:sticky lg:top-16 lg:w-72 lg:self-start lg:border-r lg:border-(--border) lg:bg-(--surface) lg:py-8">
      <div className="space-y-4 rounded-2xl border border-(--border) bg-(--surface-raised) p-4 shadow-[0_12px_30px_rgba(15,23,42,0.04)] lg:rounded-none lg:border-0 lg:bg-transparent lg:p-0 lg:px-4 lg:shadow-none">
        <div className="flex items-center gap-4 lg:flex-col lg:text-center">
          <img
            src={avatarPath}
            alt={`${p.name} avatar`}
            width={160}
            height={160}
            className="h-20 w-20 shrink-0 rounded-2xl object-cover ring-1 ring-(--border) lg:mb-3 lg:h-32 lg:w-32 lg:rounded-full"
            onError={(event) => {
              const target = event.currentTarget as HTMLImageElement;
              target.onerror = null;
              target.src = "https://placehold.co/160x160?text=Avatar";
            }}
          />
          <div className="min-w-0">
            <h2 className="text-xl font-semibold">{p.name}</h2>
            {p.title ? <p className="text-sm leading-6 text-(--muted-text)">{p.title}</p> : null}
          </div>
        </div>

        {p.location ? (
          <p className="flex items-center gap-2 text-sm text-(--muted-text)">
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17.657 16.657 13.414 20.9a2 2 0 0 1-2.827 0l-4.244-4.243a8 8 0 1 1 11.314 0Z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 11a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"
              />
            </svg>
            <span>{p.location}</span>
          </p>
        ) : null}

        {p.email ? (
          <p className="flex items-center gap-2 text-sm">
            <svg className="h-4 w-4 text-(--muted-text)" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 8l7.89 5.26a2 2 0 0 0 2.22 0L21 8M5 19h14a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2Z"
              />
            </svg>
            <a className="text-(--link) hover:underline" href={`mailto:${p.email}`}>
              {p.email}
            </a>
          </p>
        ) : null}

        {p.social ? (
          <ul className="flex gap-2 border-t border-(--border) pt-3 lg:hidden" aria-label="Profile links">
            {mobileSocialKeys.map((key) => {
              const url = p.social?.[key];
              const meta = socialMeta[key];
              if (!url) return null;

              return (
                <li key={key}>
                  <a
                    href={url}
                    target="_blank"
                    rel="noreferrer"
                    aria-label={meta.label}
                    title={meta.label}
                    className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-(--border) bg-(--surface) text-(--muted-text) transition hover:-translate-y-0.5 hover:border-(--border-strong) hover:bg-(--surface-muted) hover:text-(--text)"
                  >
                    <SocialIcon name={key} />
                  </a>
                </li>
              );
            })}
          </ul>
        ) : null}
      </div>

      {p.social ? (
        <div className="mt-5 hidden px-4 lg:block">
          <ul className="grid gap-2">
            {Object.entries(p.social).map(([key, url]) => {
              const meta = socialMeta[key] ?? {
                label: formatSocialKey(key),
                description: "External profile",
                accent: "group-hover:text-(--text)",
              };

              return (
                <li key={key}>
                  <a
                    href={url}
                    target="_blank"
                    rel="noreferrer"
                    aria-label={meta.label}
                    className="group flex h-full items-center gap-3 rounded-2xl border border-(--border) bg-(--surface-raised) px-3 py-2.5 text-(--text) shadow-sm transition-all hover:-translate-y-0.5 hover:border-(--border-strong) hover:bg-(--surface-muted) hover:shadow-[0_10px_24px_rgba(15,23,42,0.08)]"
                    title={meta.label}
                  >
                    <span
                      className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-(--border) bg-(--surface) text-(--muted-text) transition-colors ${meta.accent}`}
                    >
                      <SocialIcon name={key} />
                    </span>
                    <span className="min-w-0 flex-1 text-left">
                      <span className="block text-sm font-semibold leading-5 text-(--text)">
                        {meta.label}
                      </span>
                      <span className="block text-xs leading-4 text-(--muted-text)">
                        {meta.description}
                      </span>
                    </span>
                    <span className="text-(--muted-text) opacity-60 transition group-hover:translate-x-0.5 group-hover:opacity-100">
                      <ArrowIcon />
                    </span>
                  </a>
                </li>
              );
            })}
          </ul>
        </div>
      ) : null}
    </aside>
  );
}
