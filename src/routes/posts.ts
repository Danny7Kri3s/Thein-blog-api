import { FastifyInstance, RouteShorthandOptions } from "fastify";
import db from "../config";
import { Post } from "../types";

const postsRoute = async (fastify: FastifyInstance) => {
  fastify.get("/posts", {preHandler: [fastify.authenticate]}, async (req, reply) => {
    try {
      const [rows]: any = await db.query("SELECT * FROM Posts");

      if (rows?.length === 0) {
        return reply.status(404).send({ error: "Posts not available" });
      }

      reply.status(201).send(rows);

    } catch (error) {

      fastify.log.error(error);
      reply.status(500).send({ error: "Internal Server Error" });
    }
  });
  
  fastify.post<{ Body: Post }>("/posts", {preHandler: [fastify.authenticate]}, async (req, reply) => {
    const { title, content, user_id } = req.body;

    try {
      const [result] = await db.query(
        "INSERT INTO Posts (title, content, user_id) VALUES (?, ?, ?)",
        [title, content, user_id]
      );
  
      reply
        .status(201)
        .send({ id: (result as any).insertId, title, content, user_id });

    } catch (error) {
      fastify.log.error(error)
      reply.status(500).send({error: "Internal Server Error"})
    }
  });
  
  fastify.get<{Params: {post_id: string}}>("/posts/:post_id", {preHandler: [fastify.authenticate]}, async (req, reply) => {
    const {post_id} = req.params;

    try {
      const [rows] : any = await db.query(
        "SELECT * FROM Posts WHERE post_id = ?", [post_id]
      );

      if (rows?.length === 0) {
        return reply.status(404).send({ error: "Post Not Found" });
      }
  
      reply.status(201).send(rows[0]);

    } catch (error) {
      
      fastify.log.error(error);
      reply.status(500).send({error: "Internal Server Error"})
    }
  });
}

export default postsRoute;