import { DataTypes } from "sequelize";
import database from "../database.ts";
import { BufferJSON, initAuthCreds, WAProto } from "baileys";

const Auth = database.define(
	"auth",
	{
		name: { type: DataTypes.STRING, primaryKey: true },
		data: { type: DataTypes.TEXT },
	},
	{ timestamps: false }
);

await Auth.sync();

export const useSqliteAuthState = async () => {
	const write = (name: string, value: any, transaction?: any) =>
		Auth.upsert(
			{ name, data: JSON.stringify(value, BufferJSON.replacer) },
			{ transaction }
		);

	const read = async (name: string) => {
		const row = await Auth.findOne({ where: { name } });
		const data = row?.get("data") as string | undefined;
		return data ? JSON.parse(data, BufferJSON.reviver) : null;
	};

	const remove = (name: string, transaction?: any) =>
		Auth.destroy({ where: { name }, transaction });

	const creds = (await read("creds")) || initAuthCreds();

	return {
		state: {
			creds,
			keys: {
				get: async (type, ids) => {
					const result: any = {};
					await Promise.all(
						ids.map(async id => {
							let value = await read(`${type}-${id}`);
							if (type === "app-state-sync-key" && value)
								value = WAProto.Message.AppStateSyncKeyData.fromObject(value);
							result[id] = value;
						})
					);
					return result;
				},
				set: async data => {
					await database.transaction(async tx => {
						for (const category in data) {
							for (const id in data[category]) {
								const value = data[category][id];
								const name = `${category}-${id}`;
								if (value) await write(name, value, tx);
								else await remove(name, tx);
							}
						}
					});
				},
			},
		},
		saveCreds: () => write("creds", creds),
	};
};
