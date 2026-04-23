import PublicationsExplorer from "@/components/PublicationsExplorer";
import { getProfile, getPublications } from "@/lib/content";

export const metadata = { title: "Publications" };

export default function PublicationsPage() {
  const publications = getPublications();
  const profile = getProfile();

  return <PublicationsExplorer publications={publications} profile={profile} />;
}
