import {join} from 'path';
import * as dotenv from 'dotenv';
import Fastify, {FastifyInstance, FastifyReply, FastifyRequest} from 'fastify';
import cors from '@fastify/cors';
import DBHandler from "./components/DBHandler";

dotenv.config({
    path: join(process.cwd(), '/../../.env')
});

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
}

const server = new Server(process.env.PORT || "8083");
server.init();

server.abortOnErrors();