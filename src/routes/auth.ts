import db from "../config";
import { FastifyInstance, RouteShorthandOptions } from "fastify";
import {User} from "../types"
import bcrypt from "bcrypt"

const authRoutes = async (fastify: FastifyInstance) => {
  fastify.post<{Body: User}>("/register", async (req, reply) => {
    const {name, email, password} = req.body;

    const hashedPassword = await bcrypt.hash(password, 10);

    try {
      const [result] = await db.query("INSERT INTO User (name, email, password) VALUES (?, ?, ?)", [name, email, hashedPassword]);

      reply.status(201).send({
        message: "User register successfully",
        data: {
          id: (result as any).insertId,
          email
        }
      })
    } catch (error) {
      fastify.log.error(error)
      reply.status(500).send({error: "Internal Server Error"})
    }
  });

  fastify.post<{Body: User}>("/login", async (req, reply) => {
    const {email, password} = req.body;

    try {
      const [users] : any = await db.query("SELECT * FROM User WHERE email = ?", [email]);
      const user = users[0];

      if (!user) {
        return reply.status(400).send({ error: "Invalid email or password" });
      }

      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        return reply.status(400).send({ error: "Invalid email or password" });
      }

      const accessToken = fastify.jwt.sign({ userId: user.id, email: user.email });
      const refreshToken = fastify.jwt.refresh.sign({userId: user.id, email: user.email }) ;

      reply.send({ accessToken, refreshToken });

    } catch (error) {

      fastify.log.error(error);
      reply.status(500).send({error: "Internal Server Error"});

    }

  });

  fastify.post<{Body: {refreshToken: string}}>("/refresh-token", async (req, reply) => {
    const {refreshToken} = req.body;

    try {
      const decoded = await fastify.jwt.refresh.verify(refreshToken) as {userId : string, email: string}  ;
      const newAccessToken = fastify.jwt.sign({userId: decoded.userId, email: decoded.email});

      return reply.status(201).send({accessToken: newAccessToken});
    } catch (error) {
      fastify.log.error(error);
      reply.status(500).send({error: "Internal Server Error"})
    }
  })
};

export default authRoutes;