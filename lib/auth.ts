import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "./db";

const adminRole = "admin";
const userRole = "user";

export const auth = betterAuth({
    database: drizzleAdapter(db, {
        provider: "pg"
    }),
    socialProviders: {
        google: {
            clientId: process.env.GOOGLE_CLIENT_ID as string,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
            mapProfileToUser: (profile) => {
                return {
                    email: profile.email,
                    name: profile.name,
                    image: profile.picture,
                    role: userRole // any user logged in will be a normal user by default
                };
            }
        }
    }
});
