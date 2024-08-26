import { NextAuthConfig } from "next-auth";

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
                    //@ts-expect-error;
                    if (token?.user && token?.user[key]) {
                        if (key !== 'password') {
                            //@ts-expect-error;
                            token.user[key] = session[key];
                        }
                    }
                });
            }
            return token;
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