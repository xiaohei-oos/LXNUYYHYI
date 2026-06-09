import { pgTable, serial, varchar, text, integer, boolean, timestamp, numeric, index } from "drizzle-orm/pg-core"
import { sql } from "drizzle-orm"


export const healthCheck = pgTable("health_check", {
	id: serial().notNull(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).defaultNow(),
});

// Categories table
export const categories = pgTable(
	"categories",
	{
		id: varchar("id", { length: 36 }).primaryKey().default(sql`gen_random_uuid()`),
		name: varchar("name", { length: 100 }).notNull(),
		slug: varchar("slug", { length: 100 }).notNull().unique(),
		description: text("description"),
		cover_image: varchar("cover_image", { length: 500 }),
		sort_order: integer("sort_order").default(0).notNull(),
		created_at: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
	},
	(table) => [
		index("categories_slug_idx").on(table.slug),
		index("categories_sort_order_idx").on(table.sort_order),
	]
);

// Vision images table
export const visionImages = pgTable(
	"vision_images",
	{
		id: varchar("id", { length: 36 }).primaryKey().default(sql`gen_random_uuid()`),
		title: varchar("title", { length: 200 }).notNull(),
		description: text("description"),
		category_id: varchar("category_id", { length: 36 }).notNull().references(() => categories.id),
		thumbnail_url: varchar("thumbnail_url", { length: 500 }).notNull(),
		hd_image_key: varchar("hd_image_key", { length: 500 }).notNull(),
		price_cents: integer("price_cents").default(299).notNull(),
		aspect_ratio: varchar("aspect_ratio", { length: 20 }),
		print_size: varchar("print_size", { length: 50 }),
		tags: text("tags"),
		is_featured: boolean("is_featured").default(false).notNull(),
		download_count: integer("download_count").default(0).notNull(),
		status: varchar("status", { length: 20 }).default("active").notNull(),
		created_at: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
	},
	(table) => [
		index("vision_images_category_id_idx").on(table.category_id),
		index("vision_images_status_idx").on(table.status),
		index("vision_images_is_featured_idx").on(table.is_featured),
		index("vision_images_created_at_idx").on(table.created_at),
	]
);

// Orders table
export const orders = pgTable(
	"orders",
	{
		id: varchar("id", { length: 36 }).primaryKey().default(sql`gen_random_uuid()`),
		email: varchar("email", { length: 255 }).notNull(),
		image_id: varchar("image_id", { length: 36 }).notNull().references(() => visionImages.id),
		stripe_session_id: varchar("stripe_session_id", { length: 255 }).notNull().unique(),
		stripe_payment_intent: varchar("stripe_payment_intent", { length: 255 }),
		amount_cents: integer("amount_cents").notNull(),
		currency: varchar("currency", { length: 10 }).default("usd").notNull(),
		status: varchar("status", { length: 20 }).default("pending").notNull(),
		download_token: varchar("download_token", { length: 36 }).unique().default(sql`gen_random_uuid()`),
		download_expires_at: timestamp("download_expires_at", { withTimezone: true }),
		download_count: integer("download_count").default(0).notNull(),
		max_downloads: integer("max_downloads").default(3).notNull(),
		created_at: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
		updated_at: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
	},
	(table) => [
		index("orders_image_id_idx").on(table.image_id),
		index("orders_stripe_session_id_idx").on(table.stripe_session_id),
		index("orders_status_idx").on(table.status),
		index("orders_download_token_idx").on(table.download_token),
		index("orders_email_idx").on(table.email),
		index("orders_created_at_idx").on(table.created_at),
	]
);
