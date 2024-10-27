import fastify, { FastifyRequest, FastifyReply } from "fastify";
import userRoutes from "./routes/users";
import postsRoute from "./routes/posts";
import dotenv from "dotenv"
import jwt from "@fastify/jwt"
import authRoutes from "./routes/auth";
import reviewsRoutes from "./routes/reviews";
dotenv.config();

const server = fastify({ logger: true });

// jwt secret
const jwtSecret = process.env.JWT_SECRET;
if (!jwtSecret) {
  console.error("JWT_SECRET is not defined in .env file");
  process.exit(1);
}

const refreshJwtSecret = process.env.JWT_REFRESH_SECRET as string;

if (!refreshJwtSecret) {
  console.error("JWT_REFRESH_SECRET is not defined in .env file");
  process.exit(1)
}

server.register(jwt, {
  secret: jwtSecret,
  sign: {expiresIn: "15m"}
});

// refresh jwt secret

server.register(jwt, {
  namespace: "refresh",
  secret: refreshJwtSecret,
  sign: {expiresIn: "7d"}
});

server.decorate("authenticate", async (request, reply) => {
  try {
    // Verify the JWT token from the request
    await request.jwtVerify();
  } catch (err) {
    reply.send(err);
  }
});

server.register(authRoutes);
server.register(userRoutes);
server.register(postsRoute);
server.register(reviewsRoutes);

const start = async () => {
  try {
    await server.listen({ port: 3000});
    server.log.info(`Server is running at http://localhost:3000`);
  } catch (error) {
    server.log.error(error);
    process.exit(1);
  }
};

start();
