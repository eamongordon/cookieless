import Link from 'next/link';
import { Skeleton } from '../ui/skeleton';
import { sites } from "@repo/database/schema";

export type Site = typeof sites.$inferSelect;

type SiteCardProps = {
  site: Site;
};

export const SiteCard: React.FC<SiteCardProps> = ({ site }) => {
  return (
    <Link href={`/sites/${site.id}`} className="flex flex-col h-44 p-4 border rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800">
      <h2 className="text-xl font-semibold">{site.name}</h2>
      <p>Created {new Date(site.createdDate as Date).toLocaleDateString()}</p>
    </Link>
  );
};

export function PlaceholderSiteCard() {
  return (
    <Skeleton className="flex flex-col h-44 p-4 border rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800" />
  );
}
