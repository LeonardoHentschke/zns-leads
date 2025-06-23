import { FastifyRequest, FastifyReply } from "fastify";
import { env } from "../env";

const VALID_TOKENS = new Set([env.API_TOKEN]);

export async function authenticate(
  request: FastifyRequest,
  reply: FastifyReply
) {
  const authorization = request.headers.authorization;

  if (!authorization) {
    return reply.status(401).send({
      error: "Token de autorização é obrigatório",
      message: "Envie o header Authorization: Bearer {token}",
    });
  }

  if (!authorization.startsWith("Bearer ")) {
    return reply.status(401).send({
      error: "Formato de token inválido",
      message: "Use o formato: Bearer {token}",
    });
  }

  const token = authorization.replace("Bearer ", "");

  if (!VALID_TOKENS.has(token)) {
    return reply.status(401).send({
      error: "Token inválido",
      message: "Token fornecido não é válido",
    });
  }
}
