import {IRegisterBody, IUser} from "../support/Interfaces";
import DBHandler from "../components/DBHandler";

export default class User {
    public async get(id: number | string): Promise<IUser | null> {
        const result = await DBHandler.client?.query({
            text: `SELECT *
                   FROM "${DBHandler.userTable}"
                   WHERE id = $1`,
            values: [id],
        }).catch(async (err) => {
            console.log("error get user: " + err);
        });

        if (result?.rows[0] !== undefined) return result.rows[0];
        return null;
    }

    public async create(userData: Array<string | object>): Promise<number | null> {
        const result = await DBHandler.client?.query({
            text: `INSERT INTO "${DBHandler.userTable}" (
                     password,
                     firstName,
                     secondName,
                     birthdate,
                     gender,
                     biography,
                     city
            ) VALUES($1, $2, $3, $4, $5, $6, $7) RETURNING id`,
            values: userData,
        }).catch(async (err) => {
            console.log("error create user: " + err);
        });

        if (result?.rows[0] !== undefined) return result.rows[0]["id"];
        return null;
    }
}