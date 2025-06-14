import { FastifyRequest, FastifyReply } from "fastify";
import { prisma } from "../lib/prisma";

export async function requestLoggerHook(request: FastifyRequest) {
  try {
    await prisma.requestLog.create({
      data: {
        method: request.method,
        url: request.url,
        headers: request.headers as any,
        body: request.body as any,
        query_params: request.query as any,
        ip: request.ip,
        user_agent: request.headers["user-agent"] || null,
      },
    });
  } catch (error) {
    console.error("Error logging request:", error);
  }
}
