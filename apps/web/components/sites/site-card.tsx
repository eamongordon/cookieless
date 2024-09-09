import Link from 'next/link';

type SiteCardProps = {
  site: {
    siteId: string;
    siteName: string;
  };
}

const SiteCard: React.FC<SiteCardProps> = ({ site }) => {
  return (
    <Link href={`/sites/${site.siteId}`}>
      <div className="block p-4 border rounded-lg shadow hover:bg-gray-100 dark:hover:bg-gray-800">
        <h2 className="text-xl font-semibold">{site.siteName}</h2>
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
