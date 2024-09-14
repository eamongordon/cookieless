import Link from 'next/link';
import { getUserSitesWrapper } from '@/lib/actions';

type Sites = Awaited<ReturnType<typeof getUserSitesWrapper>>;

type Site = Sites[number];

type SiteCardProps = {
  site: Site;
};

const SiteCard: React.FC<SiteCardProps> = ({ site }) => {
  return (
    <Link href={`/sites/${site.id}`}>
      <div className="flex flex-col justify-start items-start h-44 p-4 border rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800">
        <h2 className="text-xl font-semibold">{site.name}</h2>
        <p>Created {new Date(site.createdDate as Date).toLocaleDateString()}</p>
      </div>
    </Link>
  );
};

export default SiteCard;

export function PlaceholderSiteCard() {
  return (
    <div className="relative rounded-lg border border-stone-200 pb-10 shadow-md transition-all hover:shadow-xl dark:border-stone-700">
      <div className="h-44 w-full animate-pulse bg-stone-100 dark:bg-stone-800" />
      <div className="p-4">
        <div className="h-4 w-1/2 animate-pulse rounded-lg bg-stone-100 dark:bg-stone-800" />
        <div className="mt-2 h-3 w-3/4 animate-pulse rounded-lg bg-stone-100 dark:bg-stone-800" />
        <div className="mt-2 h-3 w-1/2 animate-pulse rounded-lg bg-stone-100 dark:bg-stone-800" />
      </div>
    </div>
  );
}
