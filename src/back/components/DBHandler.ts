import {Pool} from 'pg';

class DBHandler {
    public static client: Pool | undefined;
    public static userTable = 'user';

    public static async connect(): Promise<void>
    {
        const client: Pool = new Pool({
            user: process.env.PG_USER,
            password: process.env.PG_PASS,
            host: process.env.PG_HOST,
            port: 5432,
            database: process.env.PG_DB
        })

        client?.connect((err) => {
            if (err) {
                throw new Error(`connection error: ${err.stack}`);
            } else {
                DBHandler.client = client;
                return console.log('connected')
            }
        });

        await DBHandler.createTables();
    }

    private static async createTables(): Promise<void>
    {
        const query = `CREATE TABLE IF NOT EXISTS "${DBHandler.userTable}" (
            id serial PRIMARY KEY,
            password VARCHAR(100) NOT NULL,
            firstName VARCHAR(100),
            secondName VARCHAR(100),
            birthdate DATE,
            gender VARCHAR(10),
            biography TEXT,
            city VARCHAR(50)
        );`;
        await DBHandler.client
            ?.query(query)
            .then(res => console.log(`${DBHandler.userTable} table created`))
            .catch(e => console.error(e.stack))
    }

}

export default DBHandler;
