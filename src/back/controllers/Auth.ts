import User from "../models/User";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import {IRegisterBody} from "../support/Interfaces";
import {jwtVerify} from "../support/Utils";

export default class Auth {
    public async login(id: string, password: string): Promise<{ token?: string; error?: string; status: number; }> {
        const userModel = new User();
        const user = await userModel.get(id);
        if (!user) return {error: 'Пользователь не найден', status: 404};

        if (!await bcrypt.compare(password, user.password)) {
            return {error: 'Невалидные данные', status: 400};
        }

        const token = jwt.sign({id: user.id, username: user.firstName}, process.env.SECRET_KEY ?? "");
        return {token, status: 200};
    }

    public async register(requestBody: IRegisterBody): Promise<{ user_id?: number; error?: string; status: number; }> {
        const {
            password,
            firstName,
            secondName,
            birthdate,
            gender,
            biography,
            city
        } = requestBody;

        const userModel = new User();
        const passwordHash = await bcrypt.hash(password, 10);

        const userId = await userModel.create([
            passwordHash,
            firstName,
            secondName,
            birthdate,
            gender,
            biography,
            city
        ]);
        if (!userId) return { error: 'Невалидные данные', status: 400 };

        return { user_id: userId, status: 200 };
    }

    public async canLogin(token: string): Promise<boolean> {
        const parsedToken= await jwtVerify(token);
        if (parsedToken.id === undefined) return false;

        const userModel = new User();
        const user = await userModel.get(parsedToken.id);

        return user !== null;
    }
}