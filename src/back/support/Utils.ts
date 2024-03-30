import jwt from "jsonwebtoken";

export async function jwtVerify(token: string): Promise<jwt.JwtPayload> {
    return new Promise((resolve) => {
        jwt.verify(token, process.env.SECRET_KEY ?? "", (err: jwt.VerifyErrors | null, decoded: jwt.JwtPayload | string | undefined) => {
            if (err || typeof decoded !== "object") {
                resolve({ error: 'Невалидные данные' });
            }

            resolve(decoded as jwt.JwtPayload);
        });
    });
}