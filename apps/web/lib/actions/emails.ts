"use server";

import { sendTeamInviteEmail as _sendTeamInviteEmail } from "@repo/database";

//ensure export is async function
export async function sendTeamInviteEmail(...args: Parameters<typeof _sendTeamInviteEmail>) {
  return _sendTeamInviteEmail(...args);
}