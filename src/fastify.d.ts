import 'fastify';
import '@fastify/jwt';

declare module 'fastify' {
  interface FastifyJWT {
    payload: { userId: string; email: string }; // Adjust based on your payload
    refresh: {
      sign: (payload: object | string, options?: import('@fastify/jwt').SignOptions) => string;
      verify: (token: string, options?: import('@fastify/jwt').VerifyOptions) => Promise<any>;
    };
  }

  interface FastifyInstance {
    jwt: {
      sign: (payload: object | string, options?: import('@fastify/jwt').SignOptions) => string;
      verify: (token: string, options?: import('@fastify/jwt').VerifyOptions) => Promise<any>;
      refresh: FastifyJWT['refresh']; // Reference to the refresh type defined above
    };
    authenticate: (request: FastifyRequest, reply: FastifyReply) => Promise<void>;
  }
}