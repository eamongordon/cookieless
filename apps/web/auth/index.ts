import NextAuth, { NextAuthResult } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import Nodemailer from "next-auth/providers/nodemailer";
import { compare } from "bcrypt";
import authConfig from "./config";
import { findUserByEmail } from "@repo/database";

const nextauth = NextAuth({
    ...authConfig,
    providers: [
        CredentialsProvider({
            credentials: {
                email: { label: "Email", type: "email" },
                password: { label: "Password", type: "password" }
            },
            async authorize(credentials) {
                const { email, password } = credentials ?? {}
                if (!email || !password) {
                    throw new Error("Missing email or password");
                }
                const user = await findUserByEmail(email as string);
                // if user doesn't exist or password doesn't match
                if (!user || !user.password || !(await compare(password as string, user.password))) {
                    throw new Error("Invalid email or password")
                }
                return user;
            },
        }),
        Nodemailer({
            server: {
                host: process.env.EMAIL_SERVER_HOST,
                port: parseInt(process.env.EMAIL_SERVER_PORT as string),
                auth: {
                    user: process.env.EMAIL_SERVER_USER,
                    pass: process.env.EMAIL_SERVER_PASSWORD
                }
            },
            from: process.env.EMAIL_FROM
        })
    ]
});

export const auth: NextAuthResult["auth"] = nextauth.auth;
export const handlers: NextAuthResult["handlers"] = nextauth.handlers;