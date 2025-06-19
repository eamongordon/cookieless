"use server";

import { createSite, deleteUser, editUser, getUserSites, deleteSite, updateSite, listFieldValues, listCustomProperties, getSite, getUserTeams, createTeam, updateTeam, deleteTeam, getTeam, getTeamWithSites, getTeamInvite, acceptTeamInvite, deleteTeamInvite, resendTeamInvite, leaveTeam, removeTeamMember, updateTeamRole } from "@repo/database";
import { auth } from "@/lib/auth";
import { getStats } from "@repo/database";
import { headers } from "next/headers";
import { createTransport } from "nodemailer";

export async function deleteUserWrapper() {
    const session = await auth.api.getSession({
        headers: await headers(),
    });
    if (!session?.user?.id) {
        throw new Error("Not authenticated");
    }
    return await deleteUser(session.user.id);
}

export async function editUserWrapper(formData: any, key: string) {
    const session = await auth.api.getSession({
        headers: await headers(),
    });
    if (!session?.user?.id) {
        throw new Error("Not authenticated");
    }
    return await editUser(formData, key, session.user.id);
}

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

export async function getTeamWithSitesWrapper(teamId: string) {
    const session = await auth.api.getSession({
        headers: await headers(),
    });
    if (!session?.user?.id) {
        throw new Error("Not authenticated");
    }
    return await getTeamWithSites(teamId, session.user.id);
}

export async function leaveTeamWrapper(teamId: string) {
    const session = await auth.api.getSession({
        headers: await headers(),
    });
    if (!session?.user?.id) {
        throw new Error("Not authenticated");
    }
    return await leaveTeam(teamId, session.user.id);
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

export async function testAggregateEvents(): GetStatsReturnType {
    const res = await getStatsWrapper({
        siteId: "a12fa5ad-2efe-4d3d-b789-f8b2272f0711",
        timeData: {
            startDate: new Date("2024-09-14").toISOString(),
            endDate: new Date().toISOString(),
            calendarDuration: "2 days",
        },
        aggregations: [
            {
                property: "type",
                operator: "count",
                metrics: ["completions", "visitors", "averageTimeSpent", "bounceRate", "sessionDuration", "viewsPerSession"]
            },
            {
                property: "path",
                operator: "count",
                filters: [{
                    property: "path",
                    condition: "is",
                    value: ["/", "/settings", "/sites"]
                }],
                metrics: ["completions", "visitors", "averageTimeSpent", "bounceRate", "entries", "exits"]
            },
            {
                property: "name",
                operator: "count",
                metrics: ["completions"],
                offset: 1,
                sort: {
                    dimension: "completions",
                    order: "asc"
                },
                limit: 2
            },
            {
                property: "customCount",
                operator: "sum",
            },
            {
                property: "customCount",
                operator: "avg",
            },
            {
                property: "customBoolean",
                operator: "count",
                metrics: ["completions"]
            },
            {
                property: "theme",
                operator: "count",
                metrics: ["completions"]
            },
            {
                property: "revenue",
                operator: "sum",
            }
        ],
        filters: [
            { property: "name", condition: "contains", value: "Update", logical: "OR" },
            { property: "name", condition: "contains", value: "Test", logical: "OR" },
            { property: "name", condition: "isNull", logical: "OR" }, //Must have if metrics includes averageTimeSpent or bounceRate
            {
                logical: "AND",
                nestedFilters: [
                    { property: "revenue", condition: "greaterThan", value: 10 },
                    { property: "revenue", condition: "isNull", logical: "OR" },
                ]
            },
            {
                logical: "OR",
                nestedFilters: [{
                    property: "name",
                    logical: "AND",
                    condition: "contains",
                    value: "Update"
                }, {
                    property: "path",
                    logical: "AND",
                    condition: "contains",
                    value: "8fffaf8b-2177-4f42-95ac-0ff9ce3e2f88"
                }]
            }],
        metrics: ["aggregations", "averageTimeSpent", "bounceRate", "sessionDuration", "viewsPerSession", "funnels"],
        funnels: [{
            steps: [
                {
                    filters: [{ property: "path", condition: "is", value: "/" }]
                },
                {
                    filters: [{ property: "path", condition: "is", value: "/sites" }]
                },
                {
                    filters: [{ property: "path", condition: "is", value: "/settings" }]
                }
            ]
        }]
    });
    return res;
}

export async function testListFieldsValue() {
    return await listFieldValuesWrapper({
        siteId: "ca3abb06-5b7d-4efd-96ec-a6d3b283349a",
        timeData: {
            range: "all time"
        },
        field: "path"
    });
}

export async function testListCustomProperties() {
    return await listCustomPropertiesWrapper({
        siteId: "ca3abb06-5b7d-4efd-96ec-a6d3b283349a",
        timeData: {
            range: "all time"
        }
    });
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

export async function getSiteWrapper(siteId: string) {
    const session = await auth.api.getSession({
        headers: await headers(),
    });
    if (!session?.user?.id) {
        throw new Error("Not authenticated");
    }
    return await getSite(session.user.id, siteId);
}

export async function getUserTeamsWrapper(includeSites: boolean = false) {
    const session = await auth.api.getSession({
        headers: await headers(),
    });
    if (!session?.user?.id) {
        throw new Error("Not authenticated");
    }
    return await getUserTeams(session.user.id, includeSites);
}

export async function createTeamWrapper(formData: FormData) {
    const name = formData.get("name") as string;
    const session = await auth.api.getSession({
        headers: await headers(),
    });
    if (!session?.user?.id) {
        throw new Error("Not authenticated");
    }
    return await createTeam(session.user.id, name);
}

export async function updateTeamWrapper(teamId: string, formData: FormData) {
    const session = await auth.api.getSession({
        headers: await headers(),
    });
    if (!session?.user?.id) {
        throw new Error("Not authenticated");
    }
    return await updateTeam(session.user.id, teamId, formData);
}

export async function deleteTeamWrapper(teamId: string) {
    const session = await auth.api.getSession({
        headers: await headers(),
    });
    if (!session?.user?.id) {
        throw new Error("Not authenticated");
    }
    return await deleteTeam(session.user.id, teamId);
}

export async function getTeamWrapper(teamId: string) {
    const session = await auth.api.getSession({
        headers: await headers(),
    });
    if (!session?.user?.id) {
        throw new Error("Not authenticated");
    }
    return await getTeam(teamId, session.user.id);
}

const transport = createTransport({
    host: process.env.EMAIL_SERVER_HOST,
    port: parseInt(process.env.EMAIL_SERVER_PORT as string),
    auth: {
        user: process.env.EMAIL_SERVER_USER,
        pass: process.env.EMAIL_SERVER_PASSWORD
    }
});

export async function sendTeamInviteEmail({ email, teamName, inviteId }: { email: string, teamName: string, inviteId: string }) {
    const baseUrl = process.env.BASE_URL;
    const url = `${baseUrl}/teaminvite/${inviteId}`;
    const result = await transport.sendMail({
        to: email,
        from: process.env.EMAIL_FROM,
        subject: `Invitation to join team ${teamName}`,
        text: `You have been invited to join team ${teamName} on Cookieless.\nAccept the invitation: ${url}\n\n`,
        html: teamInviteEmailHtml(url, teamName)
    });
    return await result;
}

const teamInviteEmailHtml = (url: string, className: string): string => {
    const color = {
        background: "#f9f9f9",
        text: "#444",
        textDark: "#fff",
        mainBackground: "#fff",
        mainBackgroundDark: "#000",
        buttonBackground: "#dbac5c",
        buttonBorder: "#dbac5c",
        buttonText: "#fff"
    }
    const logo = `https://www.financedu.org/_next/image?url=%2Ffinancedu_icon.png&w=128&q=75`;
    return `
    <html lang="en" style="color-scheme: light dark;">
      <body style="background: light-dark(${color.mainBackground}, ${color.mainBackgroundDark}); color-scheme: light dark;">
        <table width="100%" border="0" cellspacing="20" cellpadding="0"
          style="background: light-dark(${color.mainBackground}, ${color.mainBackgroundDark}); color-scheme: light dark; max-width: 600px; margin: auto; border-radius: 10px;">
          <tr>
            <td align="center" style="padding: 10px 0px; font-size: 22px;">
              <img src=${logo} width="55" height="55" alt="Financedu Logo">
            </td>
          </tr>
          <tr>
            <td align="center" style="padding: 10px 0px; font-size: 22px; font-family: Helvetica, Arial, sans-serif; color: light-dark(${color.text}, ${color.textDark});">
              You have been invited to join the class <strong>${className}</strong> as a teacher.
            </td>
          </tr>
          <tr>
            <td align="center" style="padding: 10px 0px; font-size: 16px; font-family: Helvetica, Arial, sans-serif; color: light-dark(${color.text}, ${color.textDark})">
              Accept the invitation by clicking the button below.
            </td>
          </tr>
          <tr>
            <td align="center" style="padding: 20px 0;">
              <table border="0" cellspacing="0" cellpadding="0">
                <tr>
                  <td align="center" style="border-radius: 5px;" bgcolor="${color.buttonBackground}">
                    <a href="${url}" target="_blank"
                      style="font-size: 18px; font-family: Helvetica, Arial, sans-serif; color: ${color.buttonText}; text-decoration: none; border-radius: 5px; padding: 10px 20px; border: 1px solid ${color.buttonBorder}; display: inline-block; font-weight: bold;">
                      Accept Invitation
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td align="center" style="padding: 0px 0px 10px 0px; font-size: 16px; line-height: 22px; font-family: Helvetica, Arial, sans-serif; color: light-dark(${color.text}, ${color.textDark})">
              Don't recognize this request? Please ignore this email.
            </td>
          </tr>
        </table>
      </body>
    </html>
    `
};

export async function acceptTeamInviteWrapper(inviteId: string) {
    const session = await auth.api.getSession({
        headers: await headers(),
    });
    if (!session?.user?.id) {
        throw new Error("Not authenticated");
    }
    await acceptTeamInvite(inviteId, session.user.id);
}

export async function deleteTeamInviteWrapper(inviteId: string) {
    const session = await auth.api.getSession({
        headers: await headers(),
    });
    if (!session?.user?.id) {
        throw new Error("Not authenticated");
    }
    await deleteTeamInvite(inviteId);
}

export async function resendTeamInviteWrapper(inviteId: string) {
    const session = await auth.api.getSession({
        headers: await headers(),
    });
    if (!session?.user?.id) {
        throw new Error("Not authenticated");
    }
    try {
        const invite = await resendTeamInvite(inviteId);
        await sendTeamInviteEmail({
            email: session.user.email!,
            teamName: invite.team.name,
            inviteId
        })
    } catch (error) {
        console.error("Error resending team invite:", error);
        throw new Error("Failed to resend team invite");
    }
}

export async function removeTeamMemberWrapper(teamId: string, userId: string) {
    const session = await auth.api.getSession({
        headers: await headers(),
    });
    if (!session?.user?.id) {
        throw new Error("Not authenticated");
    }
    if (session.user.id === userId) {
        throw new Error("You cannot remove yourself from the team");
    }
    return await removeTeamMember(teamId, userId, session.user.id);
}

export async function updateTeamRoleWrapper({
    teamId,
    targetUserId,
    role
}: {
    teamId: string,
    targetUserId: string,
    role: "Admin" | "Member"
}) {
    const session = await auth.api.getSession({
        headers: await headers(),
    });
    if (!session?.user?.id) {
        throw new Error("Not authenticated");
    }
    if (session.user.id === targetUserId) {
        throw new Error("You cannot change your own role");
    }
    return await updateTeamRole({
        teamId: teamId,
        targetUserId: targetUserId,
        newRole: role,
        actingUserId: session.user.id
    });
}