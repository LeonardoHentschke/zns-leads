import { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import { z } from "zod";
import { prisma } from "../lib/prisma";
import { BadRequest } from "./_errors/bad-request";

export async function createLeadRetired(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().post(
    "/retired",
    {
      schema: {
        summary: "Cadastro",
        description: "Cadastrar um lead de aposentadoria",
        tags: ["Leads - Aposentadoria"],
        body: z.object({
          name: z.string().optional(),
          phone: z.string().optional(),
          percentage: z.string().optional(),
          gender: z.string().optional(),
          birth_date: z.string().optional(),
          contribution_time: z.string().optional(),
          is_unhealthy: z.boolean().optional(),
          is_military: z.boolean().optional(),
          utm_source: z.string().optional(),
          utm_medium: z.string().optional(),
          utm_campaign: z.string().optional(),
          utm_content: z.string().optional(),
          utm_term: z.string().optional(),
        }),
        response: {
          201: z.object({
            id: z.number(),
            name: z.string().nullable(),
            phone: z.string().nullable(),
            percentage: z.string().nullable(),
            gender: z.string().nullable(),
            birth_date: z.string().nullable(),
            contribution_time: z.string().nullable(),
            is_unhealthy: z.boolean().nullable(),
            is_military: z.boolean().nullable(),
            utm_source: z.string().nullable(),
            utm_medium: z.string().nullable(),
            utm_campaign: z.string().nullable(),
            utm_content: z.string().nullable(),
            utm_term: z.string().nullable(),
            created_at: z.date(),
            updated_at: z.date(),
          }),
        },
      },
    },
    async (request, reply) => {
      try {
        const retired = await prisma.retired.create({
          data: {
            name: request.body.name,
            phone: request.body.phone,
            percentage: request.body.percentage,
            gender: request.body.gender,
            birth_date: request.body.birth_date,
            contribution_time: request.body.contribution_time,
            is_unhealthy: request.body.is_unhealthy,
            is_military: request.body.is_military,
            utm_source: request.body.utm_source,
            utm_medium: request.body.utm_medium,
            utm_campaign: request.body.utm_campaign,
            utm_content: request.body.utm_content,
            utm_term: request.body.utm_term,
          },
        });

        return reply.status(201).send(retired);
      } catch (error) {
        throw new BadRequest("Erro ao criar lead de aposentadoria");
      }
    }
  );
}

export async function getLeadRetiredById(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().get(
    "/retired/:id",
    {
      schema: {
        summary: "Buscar por ID",
        description: "Buscar um lead de aposentadoria por ID",
        tags: ["Leads - Aposentadoria"],
        params: z.object({
          id: z.string().transform((val) => parseInt(val, 10)),
        }),
        response: {
          200: z.object({
            id: z.number(),
            name: z.string().nullable(),
            phone: z.string().nullable(),
            percentage: z.string().nullable(),
            gender: z.string().nullable(),
            birth_date: z.string().nullable(),
            contribution_time: z.string().nullable(),
            is_unhealthy: z.boolean().nullable(),
            is_military: z.boolean().nullable(),
            utm_source: z.string().nullable(),
            utm_medium: z.string().nullable(),
            utm_campaign: z.string().nullable(),
            utm_content: z.string().nullable(),
            utm_term: z.string().nullable(),
            created_at: z.date(),
            updated_at: z.date(),
          }),
          404: z.object({
            message: z.string(),
          }),
        },
      },
    },
    async (request, reply) => {
      try {
        const { id } = request.params;

        const retired = await prisma.retired.findUnique({
          where: { id },
        });

        if (!retired) {
          return reply.status(404).send({
            message: "Lead de aposentadoria não encontrado",
          });
        }

        return reply.status(200).send(retired);
      } catch (error) {
        throw new BadRequest("Erro ao buscar lead de aposentadoria");
      }
    }
  );
}
