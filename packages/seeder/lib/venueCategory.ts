import Surreal from "surrealdb";

import categories from "../data/venueCategories.json";

export async function seed(db: Surreal) {
    await db.query(
        `
        FOR $category IN $payload {
            CREATE type::thing($category.id);
        };
        `,
        {
            payload: categories[0],
        },
    );
}
