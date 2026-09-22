import Surreal, { ConnectionStatus, RecordId } from "surrealdb";
import { TABLE_MIGRATION } from "@rolle/core";
import { logger } from "$lib";
import path from "path";
import fs from "fs";
import type { Migration } from "@rolle/types";
import { RolleError } from "@rolle/error";

const db = new Surreal();

// Define the database configuration interface
interface DbConfig {
    url?: string;
    namespace?: string;
    database?: string;
    username?: string;
    password?: string;
}

// Define the default database configuration
const DEFAULT_CONFIG: DbConfig = {
    url: process.env.SURREAL_URL,
    namespace: process.env.SURREAL_NS,
    database: process.env.SURREAL_DB,
    username: process.env.SURREAL_USERNAME,
    password: process.env.SURREAL_PASSWORD,
};

function sleep(ms: number) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Responsible for initializing the database connection.
 */
export async function initDb(config: DbConfig = DEFAULT_CONFIG): Promise<Surreal> {
    if (Object.values(config).some((value) => typeof value === "undefined")) {
        throw new RolleError({
            code: "Rolle.Server.Internal",
            message: "Variáveis de ambiente para conexão com o banco de dados faltando.",
        });
    }

    let tries = 0;
    while (db.status === ConnectionStatus.Disconnected) {
        tries += 1;
        logger.info(`Try number ${tries} to connect to the SurrealDB...`);
        try {
            await db.connect(config.url!, {
                auth: { username: config.username!, password: config.password! },
                namespace: config.namespace,
                database: config.database,
            });
            logger.info("SurrealDB connection successfully established.");
            return db;
        } catch (err) {
            if (tries >= 5) {
                logger.error(
                    "Failed to establish connection to SurrealDB:",
                    err instanceof Error ? err.message : String(err),
                );
                await db.close();
                throw err;
            }
            await sleep(1000);
        }
    }

    return db;
}

export async function handleDbMigration() {
    const migDbConn = new Surreal();
    await migDbConn.connect(DEFAULT_CONFIG.url!, {
        auth: { username: DEFAULT_CONFIG.username!, password: DEFAULT_CONFIG.password! },
        namespace: DEFAULT_CONFIG.namespace,
        database: DEFAULT_CONFIG.database,
    });

    try {
        /**
         * Build schema, database setup section.
         */
        const [buildSchema] = await migDbConn.query<[Migration | undefined]>(
            "SELECT * FROM ONLY $migrationId;",
            { migrationId: new RecordId(TABLE_MIGRATION, "0000") },
        );

        if (typeof buildSchema === "undefined") {
            logger.info("Starting database build up...");
            const schemaFilePath = path.resolve("./surreal/surreal.surql");
            const schema = fs.readFileSync(schemaFilePath, "utf8");
            await migDbConn.create(new RecordId(TABLE_MIGRATION, "0000"));
            await migDbConn.query(schema);
            logger.info("Database successfully built.");
            // Re-authentication is needed after this schema run...
            await sleep(500);
            await migDbConn.connect(DEFAULT_CONFIG.url!, {
                auth: { username: DEFAULT_CONFIG.username!, password: DEFAULT_CONFIG.password! },
                namespace: DEFAULT_CONFIG.namespace,
                database: DEFAULT_CONFIG.database,
            });
        }

        /**
         * Migration schemas, database migrations section.
         */
        const migrationsDirPath = path.resolve("./surreal/migrations/");
        const migrationFiles = fs.readdirSync(migrationsDirPath);

        for (const migrationFile of migrationFiles) {
            const migrationNumber = migrationFile.match(/\d+/)![0];
            const [migration] = await migDbConn.query<[Migration | undefined]>(
                "SELECT * FROM ONLY $migrationId;",
                {
                    migrationId: new RecordId(TABLE_MIGRATION, migrationNumber),
                },
            );

            if (typeof migration !== "undefined") {
                continue;
            }

            const migrationFilePath = path.resolve(`./surreal/migrations/${migrationFile}`);
            const migrationFileContent = fs.readFileSync(migrationFilePath, { encoding: "utf8" });

            logger.info(`New migration detected! Running -> ${migrationFile}`);
            try {
                await migDbConn.query(migrationFileContent);
                await migDbConn.create(new RecordId(TABLE_MIGRATION, migrationNumber));
                logger.info(`${migrationFile} successfully ran.`);
            } catch (e) {
                logger.error(`Failed while trying to run migration ${migrationNumber}`, e);
            }
        }
    } finally {
        migDbConn.close();
    }
}

export async function getDb(): Promise<Surreal> {
    switch (db.status) {
        case ConnectionStatus.Disconnected: {
            return await initDb();
        }
        case ConnectionStatus.Connecting: {
            await db.ready;
            return db;
        }
        case ConnectionStatus.Connected: {
            return db;
        }
        case ConnectionStatus.Error: {
            return db;
        }
        case ConnectionStatus.Reconnecting: {
            return db;
        }
    }
}
