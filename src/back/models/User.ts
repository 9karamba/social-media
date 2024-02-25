import {IUser} from "../support/Interfaces";
import DBHandler from "../components/DBHandler";

export default class User {
    public async get(id: number | string): Promise<IUser | null> {
        const result = await DBHandler.client?.query({
            text: `SELECT *
                   FROM "${DBHandler.userTable}"
                   WHERE id = $1`,
            values: [id],
        }).catch(async (err) => {
            console.log("get token: " + err);
        });

        if (result?.rows[0] !== undefined) return result.rows[0];
        return null;
    }
}