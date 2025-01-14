import {
  boolean,
  timestamp,
  pgTable,
  text,
  primaryKey,
  integer,
  decimal,
  jsonb
} from "drizzle-orm/pg-core";
import { relations, sql } from "drizzle-orm";
import { type Funnel } from "./stats";

export type NamedFunnel = Funnel & {
  name: string;
};

export const users = pgTable("user", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  name: text("name"),
  email: text("email").unique(),
  password: text("password"),
  emailVerified: timestamp("emailVerified", { mode: "date" }),
  image: text("image"),
  createdDate: timestamp("createdDate", { mode: "date", withTimezone: true }).defaultNow(),
  updatedDate: timestamp("updatedDate", { mode: "date", withTimezone: true }).defaultNow().$onUpdateFn(() => new Date()),
});

export const usersRelations = relations(users, ({ one, many }) => ({
  site: one(sites, {
    fields: [users.id],
    references: [sites.ownerId],
  }),
  usersToTeams: many(usersToTeams),
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
);

export const sessions = pgTable("session", {
  sessionToken: text("sessionToken").primaryKey(),
  userId: text("userId")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  expires: timestamp("expires", { mode: "date" }).notNull(),
});

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
);

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
);

export const teams = pgTable("teams", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  name: text("name").notNull(),
  createdDate: timestamp("createdDate", { mode: "date", withTimezone: true }).defaultNow(),
  updatedDate: timestamp("updatedDate", { mode: "date", withTimezone: true }).defaultNow().$onUpdateFn(() => new Date()),
});

export const teamsRelations = relations(teams, ({ many }) => ({
  usersToTeams: many(usersToTeams),
  sites: many(sites),
}));

export const usersToTeams = pgTable(
  'users_to_teams',
  {
    userId: text('user_id')
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    teamId: text('team_id')
      .notNull()
      .references(() => teams.id, { onDelete: "cascade" }),
  },
  (t) => ({
    pk: primaryKey({ columns: [t.userId, t.teamId] }),
  }),
);

export const usersToTeamsRelations = relations(usersToTeams, ({ one }) => ({
  user: one(users, {
    fields: [usersToTeams.userId],
    references: [users.id],
  }),
  team: one(teams, {
    fields: [usersToTeams.teamId],
    references: [teams.id],
  }),
}));

export const sites = pgTable("sites", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  name: text("name").notNull(),
  teamId: text("team_id")
    .references(() => teams.id, { onDelete: "cascade" }),
  ownerId: text("owner_id")
    .references(() => users.id, { onDelete: "cascade" }),
  createdDate: timestamp("createdDate", { mode: "date", withTimezone: true }).defaultNow(),
  updatedDate: timestamp("updatedDate", { mode: "date", withTimezone: true }).defaultNow().$onUpdateFn(() => new Date()),
  custom_properties: jsonb('custom_properties').$type<Array<{ name: string, operation: "avg" | "sum" | "count" }>>()
    .notNull()
    .default(sql`'[]'::jsonb`),
  funnels: jsonb('funnels').$type<Array<NamedFunnel>>()
    .notNull()
    .default(sql`'[]'::jsonb`)
});

export const sitesRelations = relations(sites, ({ one }) => ({
  owner: one(users, {
    fields: [sites.ownerId],
    references: [users.id],
  }),
  team: one(teams, {
    fields: [sites.teamId],
    references: [teams.id],
  }),
}));

export const events = pgTable("events", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  site_id: text("site_id").references(() => sites.id, {
    onDelete: "cascade",
    onUpdate: "cascade",
  }).notNull(),
  type: text("type").notNull(),
  path: text("path").notNull(),
  name: text("name"),
  timestamp: timestamp("timestamp", { mode: "date", withTimezone: true }).notNull(),
  left_timestamp: timestamp("left_timestamp", { mode: "date", withTimezone: true }),
  useragent: text("useragent").notNull(),
  visitor_hash: text("visitor_hash"),
  country: text("country"),
  region: text("region"),
  city: text("city"),
  browser: text("browser"),
  os: text("os"),
  size: text("size"),
  referrer: text("referrer"),
  referrer_hostname: text("referrer_hostname"),
  utm_medium: text("utm_medium"),
  utm_source: text("utm_source"),
  utm_campaign: text("utm_campaign"),
  utm_content: text("utm_content"),
  utm_term: text("utm_term"),
  revenue: decimal("revenue"),
  custom_properties: jsonb("custom_properties")
});