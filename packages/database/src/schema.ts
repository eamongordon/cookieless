import {
  boolean,
  timestamp,
  pgTable,
  text,
  primaryKey,
  integer,
  decimal,
  jsonb
} from "drizzle-orm/pg-core"
import { relations } from "drizzle-orm";
//ADAPTER ACCOUNT TYPE ERROR
//import type { AdapterAccountType } from "next-auth/adapters"

export const users = pgTable("user", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  name: text("name"),
  email: text("email").unique(),
  password: text("password"),
  emailVerified: timestamp("emailVerified", { mode: "date" }),
  image: text("image"),
  createdDate: timestamp("createdDate").defaultNow(),
  updatedDate: timestamp("updatedDate").defaultNow().$onUpdateFn(() => new Date()),
});


export const usersRelations = relations(users, ({ many }) => ({
  usersToSites: many(usersToSites),
}));

export const accounts = pgTable(
  "account",
  {
    userId: text("userId")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    type: text("type").notNull(),
    provider: text("provider").notNull(),
    providerAccountId: text("providerAccountId").notNull(),
    refresh_token: text("refresh_token"),
    access_token: text("access_token"),
    expires_at: integer("expires_at"),
    token_type: text("token_type"),
    scope: text("scope"),
    id_token: text("id_token"),
    session_state: text("session_state"),
  },
  (account) => ({
    compoundKey: primaryKey({
      columns: [account.provider, account.providerAccountId],
    }),
  })
)

export const sessions = pgTable("session", {
  sessionToken: text("sessionToken").primaryKey(),
  userId: text("userId")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  expires: timestamp("expires", { mode: "date" }).notNull(),
})

export const verificationTokens = pgTable(
  "verificationToken",
  {
    identifier: text("identifier").notNull(),
    token: text("token").notNull(),
    expires: timestamp("expires", { mode: "date" }).notNull(),
  },
  (verificationToken) => ({
    compositePk: primaryKey({
      columns: [verificationToken.identifier, verificationToken.token],
    }),
  })
)

export const authenticators = pgTable(
  "authenticator",
  {
    credentialID: text("credentialID").notNull().unique(),
    userId: text("userId")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    providerAccountId: text("providerAccountId").notNull(),
    credentialPublicKey: text("credentialPublicKey").notNull(),
    counter: integer("counter").notNull(),
    credentialDeviceType: text("credentialDeviceType").notNull(),
    credentialBackedUp: boolean("credentialBackedUp").notNull(),
    transports: text("transports"),
  },
  (authenticator) => ({
    compositePK: primaryKey({
      columns: [authenticator.userId, authenticator.credentialID],
    }),
  })
)

export const sites = pgTable("sites", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  name: text("name").notNull(),
  createdDate: timestamp("createdDate").defaultNow(),
  updatedDate: timestamp("updatedDate").defaultNow().$onUpdateFn(() => new Date()),
});

export const sitesRelations = relations(sites, ({ many }) => ({
  usersToSites: many(usersToSites),
}));

export const events = pgTable("events", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  siteId: text("siteId").references(() => sites.id, {
    onDelete: "cascade",
    onUpdate: "cascade",
  }).notNull(),
  type: text("type").notNull(),
  url: text("url").notNull(),
  name: text("name"),
  timestamp: timestamp("timestamp", { mode: "date" }).notNull(),
  useragent: text("useragent").notNull(),
  visitorHash: text("visitorHash"),
  country: text("country"),
  region: text("region"),
  city: text("city"),
  revenue: decimal("revenue"),
  customFields: jsonb("customFields")
});

export const usersToSites = pgTable(
  'users_to_sites',
  {
    userId: text('user_id')
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    siteId: text('site_id')
      .notNull()
      .references(() => sites.id, { onDelete: "cascade" }),
  },
  (t) => ({
    pk: primaryKey({ columns: [t.userId, t.siteId] }),
  }),
);