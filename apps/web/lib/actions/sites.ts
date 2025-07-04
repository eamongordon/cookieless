"use server";

import { createSite, getUserSites, deleteSite, updateSite, getTeamWithSites, getSite, getStats, listCustomProperties, listFieldValues } from "@repo/database";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

export async function createSiteWrapper(formData: FormData, teamId?: string) {
    const name = formData.get("name") as string;
    const session = await auth.api.getSession({
        headers: await headers(),
    });
    if (!session?.user?.id) {
        throw new Error("Not authenticated");
    }
    type CreateSiteParams = Parameters<typeof createSite>[0];
    let params: CreateSiteParams;
    if (teamId) {
        params = {
            teamId,
            name
        };
    } else {
        params = {
            userId: session.user.id,
            name
        };
    }
    return await createSite(params);
}

export async function getUserSitesWrapper() {
    const session = await auth.api.getSession({
        headers: await headers(),
    });
    if (!session?.user?.id) {
        throw new Error("Not authenticated");
    }
    return await getUserSites(session.user.id);
}

export async function deleteSiteWrapper(siteId: string) {
    const session = await auth.api.getSession({
        headers: await headers(),
    });
    if (!session?.user?.id) {
        throw new Error("Not authenticated");
    }
    return deleteSite(session.user.id, siteId);
}

export async function updateSiteWrapper(siteId: string, formData: FormData) {
    const session = await auth.api.getSession({
        headers: await headers(),
    });
    if (!session?.user?.id) {
        throw new Error("Not authenticated");
    }
    return await updateSite(session.user.id, siteId, formData);
}

export async function getSiteWrapper(siteId: string) {
    const session = await auth.api.getSession({
        headers: await headers(),
    });
    if (!session?.user?.id) {
        throw new Error("Not authenticated");
    }
    return await getSite(session.user.id, siteId);
}

type GetStatsParametersObj = Parameters<typeof getStats>[0]
type GetStatsParametersObjWithoutUserId = Omit<GetStatsParametersObj, 'userId'>;
type GetStatsReturnType = ReturnType<typeof getStats>;

export async function getStatsWrapper(params: GetStatsParametersObjWithoutUserId): Promise<GetStatsReturnType> {
    const session = await auth.api.getSession({
        headers: await headers(),
    });
    if (!session?.user?.id) {
        throw new Error("Not authenticated");
    }
    const paramsWithUserId: GetStatsParametersObj = {
        ...params,
        userId: session.user.id,
    };
    return getStats(paramsWithUserId);
}

type ListFieldValuesParametersObj = Parameters<typeof listFieldValues>[0];
type ListFieldValuesParametersObjWithoutUserId = Omit<ListFieldValuesParametersObj, 'userId'>;
type ListFieldValuesReturnType = ReturnType<typeof listFieldValues>;

export async function listFieldValuesWrapper(params: ListFieldValuesParametersObjWithoutUserId): Promise<ListFieldValuesReturnType> {
    const session = await auth.api.getSession({
        headers: await headers(),
    });
    if (!session?.user?.id) {
        throw new Error("Not authenticated");
    }
    const paramsWithUserId: ListFieldValuesParametersObj = {
        ...params,
        userId: session.user.id,
    };
    return listFieldValues(paramsWithUserId);
}

type ListCustomPropertiesParametersObj = Parameters<typeof listCustomProperties>[0];
type ListCustomPropertiesParametersObjWithoutUserId = Omit<ListCustomPropertiesParametersObj, 'userId'>;
type ListCustomPropertiesReturnType = ReturnType<typeof listCustomProperties>;

export async function listCustomPropertiesWrapper(params: ListCustomPropertiesParametersObjWithoutUserId): Promise<ListCustomPropertiesReturnType> {
    const session = await auth.api.getSession({
        headers: await headers(),
    });
    if (!session?.user?.id) {
        throw new Error("Not authenticated");
    }
    const paramsWithUserId: ListCustomPropertiesParametersObj = {
        ...params,
        userId: session.user.id,
    };
    return listCustomProperties(paramsWithUserId);
}

export async function testSiteInstallation(siteId: string, domain: string) {
    const session = await auth.api.getSession({
        headers: await headers(),
    });
    if (!session?.user?.id) {
        throw new Error("Not authenticated");
    }

    // Verify user has access to this site
    const site = await getSite(session.user.id, siteId);
    if (!site) {
        throw new Error("Site not found");
    }

    if (!domain) {
        return {
            success: false,
            message: "Domain is required"
        };
    }

    try {
        // Test if the domain is accessible and has the tracking script
        const domainUrl = domain.startsWith('http') ? domain : `https://${domain}`;
        const response = await fetch(domainUrl, {
            headers: {
                'User-Agent': 'Cookieless-Bot/1.0',
            },
            // Set a timeout
            signal: AbortSignal.timeout(10000),
        });

        if (!response.ok) {
            return {
                success: false,
                message: `Could not access domain: ${response.status} ${response.statusText}`
            };
        }

        const html = await response.text();
        
        // Check if our tracking script or site ID is present
        const hasTrackingScript = html.includes(`data-site-id="${siteId}"`) || 
                                html.includes(`siteId="${siteId}"`) ||
                                html.includes(`'${siteId}'`) ||
                                html.includes(`"${siteId}"`);

        if (hasTrackingScript) {
            return {
                success: true,
                message: "Tracking script detected successfully!"
            };
        } else {
            return {
                success: false,
                message: "Tracking script not found. Make sure you've added the script to your website."
            };
        }

    } catch (fetchError) {
        console.error("Domain fetch error:", fetchError);
        return {
            success: false,
            message: "Could not access the domain. Please check if the domain is correct and accessible."
        };
    }
}