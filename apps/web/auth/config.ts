import { NextAuthConfig } from "next-auth";
import { JWT } from "next-auth/jwt";

export default {
    providers: [],
    pages: {
        signIn: `/login`,
        verifyRequest: `/login`,
        error: "/login", // Error code passed in query string as ?error=
    },
    //adapter: PrismaAdapter(prisma),
    session: { strategy: "jwt" },
    callbacks: {
        jwt: async ({ token, user, trigger, session }) => {
            if (trigger === "update") {
                const sessionKeyList = Object.keys(session);
                sessionKeyList.forEach(async (key) => {
                    token[key] = session[key];
                });
            }
            return token;
        },
        session: async ({ session, token }) => {
            session.user = {
                ...session.user,
                ...(token.sub && { id: token.sub }),
            };
            return session;
        },
        /*
        signIn: async ({ user, profile }) => {
            if (!profile) {
                const userExists = await prisma.user.findUnique({
                    where: {
                        email: user.email || undefined
                    },
                });
                if (userExists) {
                    return true;   //if the email exists in the User collection, email them a magic login link
                } else {
                    return false;
                }
            } else {
                return true;
            }
        },
        */
    }
} satisfies NextAuthConfig;