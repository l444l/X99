import { Sequelize } from "sequelize";

const database = new Sequelize({
	dialect: "sqlite",
	storage: "./db/database.db",
	logging: false,

	dialectOptions: {
		mode:
			(await import("sqlite3")).OPEN_READWRITE |
			(await import("sqlite3")).OPEN_CREATE,
	},

	define: {
		freezeTableName: true,
		timestamps: true,
	},
});

await database.authenticate({});

await database.query("PRAGMA journal_mode = WAL;");
await database.query("PRAGMA synchronous = NORMAL;");
await database.query("PRAGMA cache_size = -10000;");
await database.query("PRAGMA temp_store = MEMORY;");
await database.query("PRAGMA foreign_keys = ON;");

export default database;
