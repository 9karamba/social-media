export interface ILoginBody {
    id: number | string,
    password: string
}

export interface IUser {
    id: number,
    password: string,
    firstName: string,
    secondName: string,
    birthdate: string,
    gender: string,
    biography: string,
    city: string,
}