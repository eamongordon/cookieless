import { toNextJsHandler } from "better-auth/next-js";
import { auth } from "@repo/database";

export const { POST, GET } = toNextJsHandler(auth.handler);