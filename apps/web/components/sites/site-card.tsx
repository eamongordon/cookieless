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