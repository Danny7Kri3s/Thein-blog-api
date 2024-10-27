import { FastifyInstance, RouteShorthandOptions } from "fastify";
import db from "../config";
import { Review } from "../types";

const reviewsRoutes = async (fastify: FastifyInstance) => {
  fastify.post<{ Body: Review }>(
    "/reviews",
    { preHandler: [fastify.authenticate] },
    async (req, reply) => {

      const { user_id, post_id, comment } = req.body;

      try {

        const [result] = await db.query(
          "INSERT INTO Reviews (comment, user_id, post_id ) VALUES (?, ?, ?)",
          [comment, user_id, post_id]
        );

        reply
          .status(201)
          .send({ id: (result as any).insertId, comment, user_id, post_id });

      } catch (error) {

        fastify.log.error(error);
        reply.status(500).send({ error: "Internal Server Error" });

      }
    }
  );

  fastify.get(
    "/reviews",
    { preHandler: [fastify.authenticate] },
    async (req, reply) => {
      try {

        const [rows]: any = await db.query("SELECT * FROM Reviews");

        if (rows?.length === 0) {
          return reply.status(404).send({ error: "Reviews not available" });
        }

        reply.status(201).send(rows);

      } catch (error) {

        fastify.log.error(error);
        reply.status(500).send({ error: "Internal Server Error" });

      }
    }
  );

  fastify.get<{ Params: { id: string } }>(
    "/reviews/:id",
    { preHandler: [fastify.authenticate] },
    async (req, reply) => {

      const { id } = req.params;

      try {
        const [rows]: any = await db.query(
          "SELECT * FROM Reviews WHERE review_id = ?",
          [id]
        );

        if (rows.length === 0) {
          return reply.status(404).send({ error: "Review not found" });
        }

        reply.status(200).send(rows[0]);

      } catch (error) {

        fastify.log.error(error);
        reply.status(500).send({ error: "Internal Server Error" });

      }
    }
  );

  fastify.delete<{ Params: { id: string } }>(
    "/reviews/:id",
    { preHandler: [fastify.authenticate] },
    async (req, reply) => {

      const { id } = req.params;

      try {

        const [result]: any = await db.query(
          "DELETE FROM Reviews WHERE review_id = ?",
          [id]
        );

        if (result.affectedRows === 0) {
          return reply.status(404).send({ error: "Review Not Found" });
        }

        reply.status(201).send({ message: "Review deleted successfully" });

      } catch (error) {

        fastify.log.error(error);
        reply.status(500).send({ error: "Internal Server Error" });
        
      }
    }
  );
};

export default reviewsRoutes;
