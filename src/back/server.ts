import {join} from 'path';
import * as dotenv from 'dotenv';
import Fastify, {FastifyInstance, FastifyReply, FastifyRequest} from 'fastify';
import cors from '@fastify/cors';

dotenv.config({
    path: join(process.cwd(), '/../.env')
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

    public init(): void {
        this.app.register(cors, {
            origin: '*',
        })

        this.app.listen({port: this.port, host: this.host}, () => {
            console.log(`Server listening on ${this.port}`)
        })
    }

    public async startTestGetEndpoint(): Promise<void> {
        this.app.get('/test', async(request: FastifyRequest, response: FastifyReply) => {
            response.type('application/json');
            return {status: 'OK.'};
        })
    }
}

const server = new Server(process.env.PORT || "8083");
server.init();

server.startTestGetEndpoint().then(() => {
    console.log('Test endpoint is up');
});