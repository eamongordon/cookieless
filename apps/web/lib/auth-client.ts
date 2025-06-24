
 
import { inferAdditionalFields } from "better-auth/client/plugins";
import { createAuthClient } from "better-auth/react";
import type { auth } from "@repo/database";

export const authClient = createAuthClient({
    baseURL: process.env.BASE_URL!, // Optional if the API base URL matches the frontend
    plugins: [inferAdditionalFields<typeof auth>()],
});
 
export const signIn: typeof authClient.signIn = authClient.signIn;
export const signOut: typeof authClient.signOut = authClient.signOut;
export const useSession: typeof authClient.useSession = authClient.useSession;
