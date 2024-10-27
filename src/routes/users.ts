import { FastifyInstance, RouteShorthandOptions } from "fastify";
import db from "../config";

const userRoutes = async (fastify: FastifyInstance, options: RouteShorthandOptions) => {
  
  fastify.get("/users",{preHandler: [fastify.authenticate]}, async (req, reply) => {
    try {

      const [rows] = await db.query("SELECT * FROM User");

      reply.send(rows);
    } catch (error) {

      fastify.log.error(error);
      reply.status(500).send({ error: "Database error" });

    }
  });
  
  fastify.get<{ Params: { id: string } }>("/users/:id", {preHandler: [fastify.authenticate]}, async (req, reply) => {

    const { id } = req.params;

    try {

      const [rows]: any = await db.query("SELECT * FROM User WHERE id = ?", [id]);

      if (rows?.length === 0) {
        return reply.status(404).send({ error: "User Not Found" });
      }

      reply.send(rows[0]);

    } catch (error) {

      fastify.log.error(error);
      reply.status(500).send({ error: "Internal Server Error" });
      
    }
  });

}

export default userRoutes;