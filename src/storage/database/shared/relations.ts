import { relations } from "drizzle-orm/relations";
import { categories, visionImages, orders } from "./schema";

export const categoriesRelations = relations(categories, ({ many }) => ({
	images: many(visionImages),
	orders: many(orders),
}));

export const visionImagesRelations = relations(visionImages, ({ one }) => ({
	category: one(categories, {
		fields: [visionImages.category_id],
		references: [categories.id],
	}),
}));

export const ordersRelations = relations(orders, ({ one }) => ({
	category: one(categories, {
		fields: [orders.category_id],
		references: [categories.id],
	}),
}));
