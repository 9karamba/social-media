import {IRegisterBody, IUser} from "../support/Interfaces";
import DBHandler from "../components/DBHandler";

export default class User {
    public static readonly tableName = `user`;
    public async get(id: number | string): Promise<IUser | null> {
        const result = await DBHandler.getClient()?.query({
            text: `SELECT *
                   FROM "${User.tableName}"
                   WHERE id = $1`,
            values: [String(id)],
        }).catch(async (err: string) => {
            console.log("error get user: " + err);
        });

        if (result?.rows[0] !== undefined) return result.rows[0];
        return null;
    }

    public async create(userData: Array<string>): Promise<number | null> {
        const result = await DBHandler.getClient()?.query({
            text: `INSERT INTO "${User.tableName}" (
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

    public async search(firstName: string, secondName: string): Promise<Array<IUser>> {
        const result = await DBHandler.getClient()?.query({
            text: `SELECT U.id, U.firstName, U.secondName, U.birthdate, U.gender, U.biography, U.city
                   FROM "${User.tableName}" AS U
                   WHERE firstName LIKE $1 and secondName LIKE $2
                   ORDER BY U.id`,
            values: [`%${firstName}%`, `%${secondName}%`],
        }).catch(async (err) => {
            console.log("error get user: " + err);
        });

        if (result?.rows[0] !== undefined) return result.rows;
        return [];
    }
}