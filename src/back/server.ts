import {join} from 'path';
import * as dotenv from 'dotenv';
import Fastify, {FastifyInstance, FastifyReply, FastifyRequest} from 'fastify';
import cors from '@fastify/cors';
import DBHandler from "./components/DBHandler";
import {ILoginBody, IRegisterBody, IUser} from "./support/Interfaces";
import User from "./models/User";
import bcrypt from "bcrypt";
import jwt from 'jsonwebtoken';

dotenv.config({
    path: join(process.cwd(), '/../../.env')
});

let serviceAvailable = true;

class Server {
    private readonly port: number;
    public app: FastifyInstance;

    /**
     * Need for working with docker and kube. Do not change.
     *
     * @private
     */
    private readonly host = '0.0.0.0';

    constructor(port: string) {
        this.app = Fastify();
        this.port = Number(port)
    }

    public async init(): Promise<void> {
        this.app.register(cors, {
            origin: '*',
        })

        await DBHandler.connect();

        this.app.addHook('preHandler', (req: FastifyRequest, reply: FastifyReply, next: () => void) => {
            if (!serviceAvailable) {
                return reply.code(503).send({ error: 'Сервис временно недоступен' });
            }
            next();
        });

        this.app.listen({port: this.port, host: this.host}, () => {
            console.log(`Server listening on ${this.port}`)
        })
    }

    public abortOnErrors() {
        process.on('uncaughtException', (error)  => {
            console.log('Alert! ERROR : ',  error);
            process.exit(1);
        })

        process.on('unhandledRejection', (error)  => {
            console.log('Alert! ERROR : ',  error);
            process.exit(1);
        })
    }

    public async loginEndpoint(): Promise<void> {
        this.app.post('/login', async (request: FastifyRequest<{
            Body: ILoginBody;
        }>, response: FastifyReply) => {
            try {
                const { id, password } = request.body;

                if (
                    id === undefined || password === undefined ||
                    String(id).trim() === "" || String(password).trim() === ""
                ) {
                    return response.status(400).send({ error: 'Невалидные данные' });
                }

                const userModel = new User();
                const user = await userModel.get(id);
                if (!user) return response.status(404).send({ error: 'Пользователь не найден' });

                if (!await bcrypt.compare(password, user.password)) {
                    return response.status(400).send({ error: 'Невалидные данные' });
                }

                const token = jwt.sign({ id: user.id, username: user.firstName }, process.env.SECRET_KEY ?? "");
                return response.status(200).send({token});
            } catch (e) {
                console.log(e);
                response.code(500).send({ error: 'Внутренняя ошибка сервера' });
            }
        })

    }

    public async registerEndpoint(): Promise<void> {
        this.app.post('/user/register', async (request: FastifyRequest<{
            Body: IRegisterBody;
        }>, response: FastifyReply) => {
            try {
                const {
                    password,
                    firstName,
                    secondName,
                    birthdate,
                    gender,
                    biography,
                    city
                } = request.body;

                if (
                    Object.keys(request.body).some((key: string) => {
                        if ([ 'password','firstName','secondName','birthdate','gender','biography','city'].indexOf(key)) {
                            return typeof request.body[key] !== "string";
                        }
                        return false;
                    } )
                ) {
                    return response.status(400).send({ error: 'Невалидные данные' });
                }

                const userModel = new User();
                const passwordHash = await bcrypt.hash(password, 10);

                const userId = userModel.create([
                    passwordHash,
                    firstName,
                    secondName,
                    new Date(birthdate),
                    gender,
                    biography,
                    city
                ]);

                const token = jwt.sign({ id: userId, username: firstName }, process.env.SECRET_KEY ?? "");
                return response.status(200).send({user_id: token});
            } catch (e) {
                console.log(e);
                response.code(500).send({ error: 'Внутренняя ошибка сервера' });
            }
        })

    }

    public async getUserEndpoint(): Promise<void> {
        this.app.get('/user/get/:id', async (request: FastifyRequest<{
            Params: { id: number }
        }>, response: FastifyReply) => {
            try {
                const { id } = request.params;

                if (typeof id !== 'number') {
                    return response.status(400).send({ error: 'Невалидные данные' });
                }

                const userModel = new User();
                const user = await userModel.get(id);
                if (!user) return response.status(404).send({ error: 'Анкета не найдена' });

                return response.status(200).send({user});
            } catch (e) {
                console.log(e);
                response.code(500).send({ error: 'Внутренняя ошибка сервера' });
            }
        })

    }
}

const server = new Server(process.env.PORT || "8083");
server.init();

server.loginEndpoint().then(() => {
    console.log('Login endpoint is up')
})

server.registerEndpoint().then(() => {
    console.log('Register endpoint is up')
})

server.getUserEndpoint().then(() => {
    console.log('Get user endpoint is up')
})

server.abortOnErrors();