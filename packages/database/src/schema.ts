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

export const user = pgTable("user", {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  email: text('email').notNull().unique(),
  emailVerified: boolean('email_verified').notNull(),
  image: text('image'),
  createdAt: timestamp('created_at').notNull(),
  updatedAt: timestamp('updated_at').notNull(),
  stripeCustomerId: text('stripe_customer_id'),
  subscriptionStatus: text('subscription_status')
});

export const session = pgTable("session", {
  id: text('id').primaryKey(),
  expiresAt: timestamp('expires_at').notNull(),
  token: text('token').notNull().unique(),
  createdAt: timestamp('created_at').notNull(),
  updatedAt: timestamp('updated_at').notNull(),
  ipAddress: text('ip_address'),
  userAgent: text('user_agent'),
  userId: text('user_id').notNull().references(() => user.id, { onDelete: 'cascade' })
});

export const account = pgTable("account", {
  id: text('id').primaryKey(),
  accountId: text('account_id').notNull(),
  providerId: text('provider_id').notNull(),
  userId: text('user_id').notNull().references(() => user.id, { onDelete: 'cascade' }),
  accessToken: text('access_token'),
  refreshToken: text('refresh_token'),
  idToken: text('id_token'),
  accessTokenExpiresAt: timestamp('access_token_expires_at'),
  refreshTokenExpiresAt: timestamp('refresh_token_expires_at'),
  scope: text('scope'),
  password: text('password'),
  createdAt: timestamp('created_at').notNull(),
  updatedAt: timestamp('updated_at').notNull()
});

export const verification = pgTable("verification", {
  id: text('id').primaryKey(),
  identifier: text('identifier').notNull(),
  value: text('value').notNull(),
  expiresAt: timestamp('expires_at').notNull(),
  createdAt: timestamp('created_at'),
  updatedAt: timestamp('updated_at')
});

export const usersRelations = relations(user, ({ one, many }) => ({
  site: one(sites, {
    fields: [user.id],
    references: [sites.ownerId],
  }),
  usersToTeams: many(usersToTeams),
  apiKeys: many(apiKeys),
}));

export const authenticators = pgTable(
  "authenticator",
  {
    credentialID: text("credentialID").notNull().unique(),
    userId: text("userId")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
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
  stripeCustomerId: text('stripe_customer_id'),
  subscriptionStatus: text('subscription_status')
});

export const teamsRelations = relations(teams, ({ many }) => ({
  usersToTeams: many(usersToTeams),
  sites: many(sites),
  invites: many(teamInvites),
  apiKeys: many(apiKeys),
}));

export const usersToTeams = pgTable(
  'users_to_teams',
  {
    userId: text('user_id')
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    teamId: text('team_id')
      .notNull()
      .references(() => teams.id, { onDelete: "cascade" }),
    role: text('role').notNull()
  },
  (t) => ({
    pk: primaryKey({ columns: [t.userId, t.teamId] }),
  }),
);

export const usersToTeamsRelations = relations(usersToTeams, ({ one }) => ({
  user: one(user, {
    fields: [usersToTeams.userId],
    references: [user.id],
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
    .references(() => user.id, { onDelete: "cascade" }),
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
  owner: one(user, {
    fields: [sites.ownerId],
    references: [user.id],
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

export const teamInvites = pgTable(
  'team_invites',
  {
    id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
    teamId: text('team_id').notNull().references(() => teams.id, { onDelete: 'cascade' }),
    email: text('email').notNull(),
    invitedByUserId: text('invited_by_user_id').notNull().references(() => user.id, { onDelete: 'set null' }),
    firstInvitedAt: timestamp("firstInvitedAt", { mode: "date", withTimezone: true }).defaultNow(),
    lastInvitedAt: timestamp("lastInvitedAt", { mode: "date", withTimezone: true }).defaultNow(),
    role: text('role').notNull(),
  }
);

export const teamInvitesRelations = relations(teamInvites, ({ one }) => ({
  team: one(teams, {
    fields: [teamInvites.teamId],
    references: [teams.id],
  }),
  invitedBy: one(user, {
    fields: [teamInvites.invitedByUserId],
    references: [user.id],
  }),
}));

export const apiKeys = pgTable("api_keys", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  name: text("name").notNull(),
  key: text("key").notNull().unique(),
  hashedKey: text("hashed_key").notNull().unique(),
  userId: text("user_id").references(() => user.id, { onDelete: "cascade" }),
  teamId: text("team_id").references(() => teams.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at", { mode: "date", withTimezone: true }).defaultNow(),
});

export const apiKeysRelations = relations(apiKeys, ({ one }) => ({
  user: one(user, {
    fields: [apiKeys.userId],
    references: [user.id],
  }),
  team: one(teams, {
    fields: [apiKeys.teamId],
    references: [teams.id],
  }),
}));