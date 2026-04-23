"use client";
/* eslint-disable @next/next/no-img-element */
import { getProfile, type Profile } from "@/lib/content";

const avatarPath = "/avatar.jpg";

export default function Sidebar() {
  const p: Profile = getProfile();

  return (
    <aside className="sticky top-16 hidden w-72 shrink-0 self-start border-r border-(--border) bg-(--surface) py-8 lg:block">
      <div className="space-y-4 px-4">
        <div className="flex flex-col items-center text-center">
          <img
            src={avatarPath}
            alt={`${p.name} avatar`}
            width={160}
            height={160}
            className="mb-3 h-32 w-32 rounded-full object-cover ring-1 ring-(--border)"
            onError={(event) => {
              const target = event.currentTarget as HTMLImageElement;
              target.onerror = null;
              target.src = "https://placehold.co/160x160?text=Avatar";
            }}
          />
          <h2 className="text-xl font-semibold">{p.name}</h2>
          {p.title ? <p className="text-sm text-(--muted-text)">{p.title}</p> : null}
        </div>

        {p.location ? (
          <p className="flex items-center gap-2 text-sm text-(--muted-text)">
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
              />
            </svg>
            <span>{p.location}</span>
          </p>
        ) : null}

        {p.email ? (
          <p className="flex items-center gap-2 text-sm">
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
              />
            </svg>
            <a className="text-blue-600 hover:underline" href={`mailto:${p.email}`}>
              {p.email}
            </a>
          </p>
        ) : null}

        {p.bio ? <p className="text-sm text-(--muted-text)">{p.bio}</p> : null}
      </div>

      {p.social ? (
        <div className="mt-4 px-4 text-center">
          <ul className="flex flex-wrap justify-center gap-2 text-(--muted-text)">
            {Object.entries(p.social).map(([k, url]) => (
              <li key={k}>
                <a
                  href={url}
                  target="_blank"
                  rel="noreferrer"
                  aria-label={k}
                  className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-(--border) hover:bg-(--surface-muted)"
                  title={k}
                >
                  {k === "github" ? (
                    <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4" aria-hidden>
                      <path d="M12 .5a12 12 0 0 0-3.79 23.4c.6.11.82-.26.82-.58v-2.04c-3.34.73-4.04-1.61-4.04-1.61-.55-1.39-1.35-1.76-1.35-1.76-1.1-.75.08-.74.08-.74 1.22.09 1.86 1.26 1.86 1.26 1.08 1.85 2.83 1.31 3.52 1 .11-.78.42-1.31.76-1.61-2.67-.31-5.47-1.34-5.47-5.95 0-1.31.47-2.38 1.24-3.22-.12-.31-.54-1.57.12-3.28 0 0 1.01-.32 3.3 1.23a11.47 11.47 0 0 1 6 0c2.29-1.55 3.3-1.23 3.3-1.23.66 1.71.24 2.97.12 3.28.77.84 1.24 1.9 1.24 3.22 0 4.62-2.81 5.63-5.49 5.93.43.37.81 1.1.81 2.22v3.29c0 .32.22.7.82.58A12 12 0 0 0 12 .5Z" />
                    </svg>
                  ) : null}
                  {k === "twitter" ? (
                    <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4" aria-hidden>
                      <path d="M22.46 6c-.77.35-1.6.58-2.46.69a4.27 4.27 0 0 0 1.87-2.36 8.54 8.54 0 0 1-2.7 1.03A4.26 4.26 0 0 0 11.1 8.2a12.1 12.1 0 0 1-8.79-4.46 4.26 4.26 0 0 0 1.32 5.68c-.66-.02-1.29-.2-1.84-.5v.05a4.26 4.26 0 0 0 3.42 4.18c-.31.08-.63.12-.96.12-.24 0-.47-.02-.7-.06a4.26 4.26 0 0 0 3.98 2.96A8.55 8.55 0 0 1 2 19.53 12.06 12.06 0 0 0 8.27 21.4c7.87 0 12.18-6.52 12.18-12.18 0-.19-.01-.39-.02-.58A8.69 8.69 0 0 0 22.46 6Z" />
                    </svg>
                  ) : null}
                  {k === "linkedin" ? (
                    <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4" aria-hidden>
                      <path d="M4.98 3.5a2.5 2.5 0 1 1 0 5.001 2.5 2.5 0 0 1 0-5Zm.02 6.5H2v11h3v-11Zm4 0H6v11h3v-6.2c0-3.42 4-3.7 4 0V21h3v-6.98c0-6.02-6.5-5.8-7.02-2.84V10Z" />
                    </svg>
                  ) : null}
                  {k === "scholar" ? (
                    <svg viewBox="0 0 48 48" fill="currentColor" className="h-4 w-4" aria-hidden>
                      <path d="M24 4 6 18l18 8 18-8L24 4Zm0 24c-6.627 0-12 4.03-12 9v7h24v-7c0-4.97-5.373-9-12-9Z" />
                    </svg>
                  ) : null}
                  {k === "orcid" ? (
                    <svg viewBox="0 0 256 256" fill="currentColor" className="h-4 w-4" aria-hidden>
                      <path d="M128 0a128 128 0 1 0 0 256A128 128 0 0 0 128 0Zm-24 66h12v124H104V66Zm42 0c30.376 0 52 22.215 52 52s-21.624 52-52 52h-20V66h20Zm0 12h-8v80h8c23.196 0 40-16.804 40-40s-16.804-40-40-40Z" />
                    </svg>
                  ) : null}
                  {!["github", "twitter", "linkedin", "scholar", "orcid"].includes(k) ? (
                    <svg viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4" aria-hidden>
                      <path d="M11 3a1 1 0 100 2h2.586l-6.293 6.293a1 1 0 101.414 1.414L15 6.414V9a1 1 0 102 0V4a1 1 0 00-1-1h-5z" />
                      <path d="M5 5a2 2 0 00-2 2v8a2 2 0 002 2h8a2 2 0 002-2v-3a1 1 0 10-2 0v3H5V7h3a1 1 0 000-2H5z" />
                    </svg>
                  ) : null}
                </a>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </aside>
  );
}
