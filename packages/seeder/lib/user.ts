import Surreal, { RecordId } from "surrealdb";
import { hash } from "argon2";
import { TABLE_USER } from "@rolle/core";

import type { CreateUser } from "@rolle/types";

export async function seed(db: Surreal) {
    // await _seedUser(db);
    await seedRolleUser(db);
}

// async function _seedUser(db: Surreal) {
//     const passwordHash = await hash("123456");
//     const payload: CreateUser[] = new Array(12).fill({}).map((_, i) => ({
//         nickname: `test${i + 1}`,
//         email: `test${i + 1}@test.com`,
//         password: passwordHash,
//         pictureUrl:
//             "https://fastly.picsum.photos/id/129/80/80.jpg?hmac=8DCDNa08YKEzDXZnt8pbM4EZ-kAx2w90L7aLiv3rrRY",
//         name: {
//             first: "Test",
//             last: (i + 1).toString(),
//         },
//     }));
//     await db.query(`INSERT INTO ${TABLE_USER} ($payload);`, { payload });
// }

async function seedRolleUser(db: Surreal) {
    const rollePasswordHash = await hash("rolle");

    const payload = {
        id: new RecordId(TABLE_USER, "f01fneivnbjvsrzw96st"),
        nickname: "rolle",
        email: "rolle@rolle.com.br",
        password: rollePasswordHash,
        verified: true,
        pictureUrl:
            "https://rolleimages.s3.sa-east-1.amazonaws.com/user/rolle-a8d89d2a-9452-497e-acf7-01fc652d674e.webp",
        name: {
            first: "Rolle",
            last: "App",
        },
        bio: {
            short: "Onde começa seu próximo rolê",
            long: "O hub de experiências locais - descubra e compartilhe os melhores lugares com curadoria de quem vive a cidade.",
        },
    } satisfies CreateUser & { id: RecordId<typeof TABLE_USER> };

    await db.query(`INSERT INTO ${TABLE_USER} ($payload);`, { payload });
}
