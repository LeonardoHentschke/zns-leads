import fastify from "fastify";

import fastifySwagger from "@fastify/swagger";
import fastifySwaggerUI from "@fastify/swagger-ui";
import fastifyCors from "@fastify/cors";
import fastifyFormbody from "@fastify/formbody";

import {
  serializerCompiler,
  validatorCompiler,
  jsonSchemaTransform,
  ZodTypeProvider,
} from "fastify-type-provider-zod";
import { env } from "./env";
import {
  requestLoggerHook,
  errorLoggerHook,
} from "./middleware/request-logger";

import {
  createLeadAthletesRight,
  createLeadAthletesRightFromForm,
  getLeadAthletesRightById,
} from "./routes/athletes-rights";
import { createLeadRetired, getLeadRetiredById } from "./routes/retired";

export const app = fastify().withTypeProvider<ZodTypeProvider>();

app.register(fastifyCors);
app.register(fastifyFormbody);

app.setValidatorCompiler(validatorCompiler);
app.setSerializerCompiler(serializerCompiler);

app.addHook("preHandler", requestLoggerHook);

app.register(fastifySwagger, {
  swagger: {
    consumes: ["application/json", "application/x-www-form-urlencoded"],
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

app.register(createLeadAthletesRight);
app.register(createLeadAthletesRightFromForm);
app.register(getLeadAthletesRightById);
app.register(createLeadRetired);
app.register(getLeadRetiredById);

app.get("/health", async () => {
  return { status: "ok", timestamp: new Date().toISOString() };
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

app.listen({ port: env.PORT, host: "0.0.0.0" }).then(() => {
  console.log("HTTP server running!");
});
