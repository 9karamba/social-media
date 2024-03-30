import {join} from 'path';
import * as dotenv from 'dotenv';
import Fastify, {FastifyInstance, FastifyReply, FastifyRequest} from 'fastify';
import cors from '@fastify/cors';
import DBHandler from "./components/DBHandler";
import {ILoginBody, IRegisterBody} from "./support/Interfaces";
import User from "./models/User";
import Auth from "./controllers/Auth";

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

        await DBHandler.getInstance();

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

                const authController = new Auth();
                const result = await authController.login(String(id), password);

                return response.status(result.status).send(result);
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

                const authController = new Auth();
                const result = await authController.register(request.body);

                return response.status(result.status).send(result);
            } catch (e) {
                console.log(e);
                response.code(500).send({ error: 'Внутренняя ошибка сервера' });
            }
        })

    }

    public async getUserEndpoint(): Promise<void> {
        this.app.get('/user/get/:id', async (request: FastifyRequest<{
            Header: { authorization: string; };
            Params: { id: string | undefined }
        }>, response: FastifyReply) => {
            try {
                const { id } = request.params;
                const token = request.headers.authorization?.split(' ')[1];

                if (typeof id !== 'string' || token === undefined) {
                    return response.status(400).send({ error: 'Невалидные данные' });
                }

                const authController = new Auth();
                if (!(await authController.canLogin(token))) {
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

    public async searchUserEndpoint(): Promise<void> {
        this.app.get('/user/search', async (request: FastifyRequest<{
            Header: { authorization: string; };
            Querystring: { first_name?: string; last_name?: string; }
        }>, response: FastifyReply) => {
            try {
                const { first_name, last_name } = request.query;
                const token = request.headers.authorization?.split(' ')[1];

                if (token === undefined) {
                    return response.status(400).send({ error: 'Невалидные данные' });
                }

                const authController = new Auth();
                if (!(await authController.canLogin(token))) {
                    return response.status(400).send({ error: 'Невалидные данные' });
                }

                const userModel = new User();
                const user = await userModel.search(first_name ?? '', last_name ?? '');
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

server.searchUserEndpoint().then(() => {
    console.log('Search user endpoint is up')
})

server.abortOnErrors();