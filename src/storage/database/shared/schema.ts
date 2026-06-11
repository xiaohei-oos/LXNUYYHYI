import { pgTable, serial, varchar, text, integer, boolean, timestamp, numeric, bigint, index } from "drizzle-orm/pg-core"
import { sql } from "drizzle-orm"

// Categories table - each category is a product (image pack)
export const categories = pgTable(
	"categories",
	{
		id: varchar("id", { length: 36 }).primaryKey().default(sql`gen_random_uuid()`),
		name: varchar("name", { length: 100 }).notNull(),
		name_cn: varchar("name_cn", { length: 100 }).notNull(),
		slug: varchar("slug", { length: 100 }).notNull().unique(),
		description: text("description"),
		description_cn: text("description_cn"),
		cover_image: varchar("cover_image", { length: 500 }),
		image_count: integer("image_count").default(0).notNull(),
		price_cents: integer("price_cents").default(1499).notNull(),
		zip_file_key: varchar("zip_file_key", { length: 500 }),
		zip_file_size: bigint("zip_file_size", { mode: "number" }),
		sort_order: integer("sort_order").default(0).notNull(),
		created_at: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
	},
	(table) => [
		index("categories_slug_idx").on(table.slug),
		index("categories_sort_order_idx").on(table.sort_order),
	]
);

// Vision images table - images belonging to a category (for preview)
export const visionImages = pgTable(
	"vision_images",
	{
		id: varchar("id", { length: 36 }).primaryKey().default(sql`gen_random_uuid()`),
		category_id: varchar("category_id", { length: 36 }).notNull().references(() => categories.id, { onDelete: "cascade" }),
		title: varchar("title", { length: 200 }).notNull(),
		title_cn: varchar("title_cn", { length: 200 }),
		thumbnail_url: varchar("thumbnail_url", { length: 500 }).notNull(),
		hd_image_key: varchar("hd_image_key", { length: 500 }).notNull(),
		sort_order: integer("sort_order").default(0).notNull(),
		created_at: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
	},
	(table) => [
		index("vision_images_category_id_idx").on(table.category_id),
	]
);

// Orders table - purchase of a category image pack
export const orders = pgTable(
	"orders",
	{
		id: varchar("id", { length: 36 }).primaryKey().default(sql`gen_random_uuid()`),
		email: varchar("email", { length: 255 }),
		category_id: varchar("category_id", { length: 36 }).notNull().references(() => categories.id),
		category_name: varchar("category_name", { length: 100 }).notNull(),
		amount_cents: integer("amount_cents").notNull(),
		currency: varchar("currency", { length: 10 }).default("usd").notNull(),
		stripe_session_id: varchar("stripe_session_id", { length: 255 }).notNull().unique(), // stores PayPal order ID
		stripe_payment_intent: varchar("stripe_payment_intent", { length: 255 }), // stores PayPal capture ID
		status: varchar("status", { length: 20 }).default("pending").notNull(),
		download_token: varchar("download_token", { length: 36 }).unique().default(sql`gen_random_uuid()`),
		download_expires_at: timestamp("download_expires_at", { withTimezone: true }),
		download_count: integer("download_count").default(0).notNull(),
		max_downloads: integer("max_downloads").default(3).notNull(),
		created_at: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
		updated_at: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
	},
	(table) => [
		index("orders_category_id_idx").on(table.category_id),
		index("orders_stripe_session_id_idx").on(table.stripe_session_id),
		index("orders_status_idx").on(table.status),
		index("orders_download_token_idx").on(table.download_token),
		index("orders_email_idx").on(table.email),
	]
);
