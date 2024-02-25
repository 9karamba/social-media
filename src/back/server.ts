import {join} from 'path';
import * as dotenv from 'dotenv';
import Fastify, {FastifyInstance, FastifyReply, FastifyRequest} from 'fastify';
import cors from '@fastify/cors';
import DBHandler from "./components/DBHandler";
import {ILoginBody} from "./support/Interfaces";
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

    public async startWebhooksEndpoint(): Promise<void> {
        this.app.post('/login', async (request: FastifyRequest<{
            Body: ILoginBody;
        }>, response: FastifyReply) => {
            try {
                const { id, password } = request.body;

                if (
                    id === undefined || password === undefined ||
                    String(id).trim() === "" || String(password).trim() === ""
                ) {
                    return response.status(400).send({ error: 'Неверные данные' });
                }

                const userModel = new User();
                const user = await userModel.get(id);
                if (!user) return response.status(404).send({ error: 'Пользователь не найден' });

                if (!await bcrypt.compare(password, user.password)) {
                    return response.status(400).send({ error: 'Неверные данные' });
                }

                const token = jwt.sign({ id: user.id, username: user.firstName }, process.env.SECRET_KEY ?? "");
                return response.status(200).send({token});
            } catch (e) {
                console.log(e);
                response.code(500).send({ error: 'Внутренняя ошибка сервера' });
            }
        })

    }
}

const server = new Server(process.env.PORT || "8083");
server.init();

server.startWebhooksEndpoint().then(() => {
    console.log('Webhook endpoint is up')
})

server.abortOnErrors();