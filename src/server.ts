import fastify from "fastify";

import fastifySwagger from "@fastify/swagger";
import fastifySwaggerUI from "@fastify/swagger-ui";
import fastifyCors from "@fastify/cors";

import {
  serializerCompiler,
  validatorCompiler,
  jsonSchemaTransform,
  ZodTypeProvider,
} from "fastify-type-provider-zod";

import {
  createLeadAthletesRight,
  getLeadAthletesRightById,
} from "./routes/athletes-rights";
import { createLeadRetired, getLeadRetiredById } from "./routes/retired";

import { errorHandler } from "./error-handler";
import { env } from "./env";

export const app = fastify().withTypeProvider<ZodTypeProvider>();

app.register(fastifyCors, {
  origin: "*",
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
  },
  transform: jsonSchemaTransform,
});

app.register(fastifySwaggerUI, {
  routePrefix: "/docs",
});

app.setValidatorCompiler(validatorCompiler);
app.setSerializerCompiler(serializerCompiler);

app.register(createLeadAthletesRight);
app.register(getLeadAthletesRightById);
app.register(createLeadRetired);
app.register(getLeadRetiredById);

app.setErrorHandler(errorHandler);

app.listen({ port: env.PORT }).then(() => {
  console.log("HTTP server running!");
});
