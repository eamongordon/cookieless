import { ReactNode } from "react";
import { getSiteWrapper } from "@/lib/actions";
import SiteSettingsNav from "@/components/sites/settings-nav";

export default async function SiteAnalyticsLayout({
  params,
  children,
}: {
  params: { id: string };
  children: ReactNode;
}) {
  const site = await getSiteWrapper(params.id);

  return (
    <>
      <h1 className="text-xl font-bold dark:text-white sm:text-3xl">
        Settings for {site.name}
      </h1>
      <SiteSettingsNav />
      {children}
    </>
  );
}