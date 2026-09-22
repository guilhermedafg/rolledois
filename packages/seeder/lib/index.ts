import Surreal from "surrealdb";

import * as address from "./address";
// import * as venue from "./venue";
// import * as venueCategory from "./venueCategory";
import * as user from "./user";
// import * as list from "./list";

export async function seed(db: Surreal) {
    // NOTE: THE ORDER MATTER!

    // await venueCategory.seed(db);
    await address.seed(db);
    // await venue.seed(db);
    await user.seed(db);
    // await list.seed(db);
}
