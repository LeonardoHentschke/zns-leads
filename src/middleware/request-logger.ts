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

export async function errorLoggerHook(
  request: FastifyRequest,
  reply: FastifyReply,
  error: Error
) {
  try {
    const statusCode = (error as any).statusCode || 400;

    await prisma.requestLog.create({
      data: {
        method: request.method,
        url: request.url,
        headers: request.headers as any,
        body: request.body as any,
        query_params: request.query as any,
        ip: request.ip,
        user_agent: request.headers["user-agent"] || null,
        status_code: statusCode,
        error_message: error.message,
        error_details: error.stack ? JSON.stringify({ stack: error.stack }) : "{}",
      },
    });
  } catch (logError) {
    console.error("Error logging error details:", logError);
  }
}
