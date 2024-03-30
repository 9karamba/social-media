import {Pool} from 'pg';
import User from "../models/User";

interface ITable {
    name: string;
    query: string;
}

class DBHandler {
    private static instance: DBHandler;
    private static client: Pool | undefined;

    public static async getInstance(): Promise<DBHandler> {
        if (!this.instance) {
            this.instance = new DBHandler();
        }
        await this.awaitClient();
        return this.instance;
    }

    private constructor() {
        const client: Pool = new Pool({
            user: process.env.PG_USER,
            password: process.env.PG_PASS,
            host: process.env.PG_HOST ?? "localhost",
            port: 5432,
            database: process.env.PG_DB
        })

        client?.connect(async (err) => {
            if (err) {
                throw new Error(`connection error: ${err.stack}`);
            } else {
                DBHandler.client = client;
                await this.createTables();
                return console.log('connected')
            }
        });
    }

    public static getClient() {
        return this.client;
    }

    private async createTables(): Promise<void>
    {
        const tables = this.getDataForCreateTables();

        for (const table of tables) {
            await DBHandler.client
                ?.query(table.query)
                .then(res => console.log(`${table.name} table created`))
                .catch(e => console.error(e.stack))
        }
    }

    private getDataForCreateTables(): Array<ITable> {
        return [
            {
                name: User.tableName,
                query: `CREATE TABLE IF NOT EXISTS "${User.tableName}" (
                    id serial PRIMARY KEY,
                    password VARCHAR(100),
                    firstName VARCHAR(100),
                    secondName VARCHAR(100),
                    birthdate DATE,
                    gender VARCHAR(10),
                    biography TEXT,
                    city VARCHAR(50)
                );`
            }
        ];
    }

    private static awaitClient (timeout: number = 20, timeInterval: number = 100): Promise<Pool> {
        return new Promise<Pool>(((resolve, reject) => {
            let timer: number = 0;
            const interval = setInterval(() => {
                const client = DBHandler.getClient();
                if (client) {
                    clearInterval(interval);
                    resolve(client);
                }
                timeout < timer++ && reject(`Couldn't get client`);
            }, timeInterval);
        }));
    }

}

export default DBHandler;
