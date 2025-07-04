import { ReactNode } from "react";
import { getSiteWrapper } from "@/lib/actions";
import SiteSettingsNav from "@/components/sites/settings-nav";

export default async function SiteAnalyticsLayout(
  props: {
    params: Promise<{ id: string }>;
    children: ReactNode;
  }
) {
  const params = await props.params;

  const {
    children
  } = props;

  const site = await getSiteWrapper(params.id);

  const navItems = [
    {
      name: "General",
      href: `/sites/${params.id}/settings`,
      segment: null,
    },
    {
      name: "Setup",
      href: `/sites/${params.id}/settings/setup`,
      segment: "setup",
    },
    {
      name: "Custom Properties",
      href: `/sites/${params.id}/settings/custom-properties`,
      segment: "custom-properties",
    },
    {
      name: "Funnels",
      href: `/sites/${params.id}/settings/funnels`,
      segment: "funnels",
    },
  ];

  return (
    <>
      <h1 className="text-xl font-bold dark:text-white sm:text-3xl">
        Settings for {site.name}
      </h1>
      <SiteSettingsNav navItems={navItems} />
      {children}
    </>
  );
}