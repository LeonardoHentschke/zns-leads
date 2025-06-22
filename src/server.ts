import fastify from "fastify";

import fastifySwagger from "@fastify/swagger";
import fastifySwaggerUI from "@fastify/swagger-ui";
import fastifyCors from "@fastify/cors";
import fastifyBearerAuth from "@fastify/bearer-auth";

import {
  serializerCompiler,
  validatorCompiler,
  jsonSchemaTransform,
  ZodTypeProvider,
} from "fastify-type-provider-zod";
import { env } from "./env";
import { authenticate } from "./auth";
import {
  requestLoggerHook,
  errorLoggerHook,
} from "./middleware/request-logger";

import {
  createLeadAthletesRight,
  getLeadAthletesRightById,
} from "./routes/athletes-rights";
import { createLeadRetired, getLeadRetiredById } from "./routes/retired";

export const app = fastify().withTypeProvider<ZodTypeProvider>();

// Health check endpoint
app.get("/health", async (request, reply) => {
  return { status: "ok", timestamp: new Date().toISOString() };
});

app.register(fastifyCors);

app.register(fastifyBearerAuth, {
  keys: new Set([env.API_TOKEN]),
  addHook: false,
});

app.register(fastifySwagger, {
  swagger: {
    consumes: ["application/json"],
    produces: ["application/json"],
    info: {
      title: "Registro de leads - ZNS Advogados",
      description: "",
      version: "1.0.0",
    },
    securityDefinitions: {
      bearerAuth: {
        type: "apiKey",
        name: "Authorization",
        in: "header",
        description: "Digite: Bearer {seu-token}",
      },
    },
    security: [{ bearerAuth: [] }],
  },
  transform: jsonSchemaTransform,
});

app.register(fastifySwaggerUI, {
  routePrefix: "/docs",
});

app.setValidatorCompiler(validatorCompiler);
app.setSerializerCompiler(serializerCompiler);

app.addHook("preHandler", requestLoggerHook);

app.register(async function protectedRoutes(fastify) {
  fastify.addHook("preHandler", authenticate);

  await fastify.register(createLeadAthletesRight);
  await fastify.register(getLeadAthletesRightById);
  await fastify.register(createLeadRetired);
  await fastify.register(getLeadRetiredById);
});

app.setErrorHandler(async (error, request, reply) => {
  try {
    await errorLoggerHook(request, reply, error);
  } catch (logError) {
    console.error("Erro ao registrar detalhes do erro:", logError);
  }

  const statusCode = error.statusCode || 400;
  reply.status(statusCode).send({
    message: error.message,
  });
});

app.listen({ port: env.PORT }).then(() => {
  console.log("HTTP server running!");
});
