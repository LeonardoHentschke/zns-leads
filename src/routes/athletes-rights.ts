import { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import { z } from "zod";
import { prisma } from "../lib/prisma";
import { BadRequest } from "./_errors/bad-request";

export async function createLeadAthletesRight(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().post(
    "/api/athletes-rights",
    {
      schema: {
        summary: "Cadastro",
        description: "Cadastrar um lead no direito dos atletas",
        tags: ["Leads - Direito dos Atletas"],
        body: z.object({
          name: z.string().optional(),
          phone: z.string().optional(),
          is_registered_clt: z.boolean().optional(),
          had_injury_during_career: z.boolean().optional(),
          injury_description: z.string().optional(),
          injury_timing: z.string().optional(),
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
            is_registered_clt: z.boolean().nullable(),
            had_injury_during_career: z.boolean().nullable(),
            injury_description: z.string().nullable(),
            injury_timing: z.string().nullable(),
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
        const athleteRight = await prisma.athletesRights.create({
          data: {
            name: request.body.name,
            phone: request.body.phone,
            is_registered_clt: request.body.is_registered_clt,
            had_injury_during_career: request.body.had_injury_during_career,
            injury_description: request.body.injury_description,
            injury_timing: request.body.injury_timing,
            utm_source: request.body.utm_source,
            utm_medium: request.body.utm_medium,
            utm_campaign: request.body.utm_campaign,
            utm_content: request.body.utm_content,
            utm_term: request.body.utm_term,
          },
        });

        return reply.status(201).send(athleteRight);
      } catch (error) {
        throw new BadRequest("Erro ao criar lead de direito dos atletas");
      }
    }
  );
}

export async function getLeadAthletesRightById(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().get(
    "/api/athletes-rights/:id",
    {
      schema: {
        summary: "Buscar por ID",
        description: "Buscar um lead do direito dos atletas por ID",
        tags: ["Leads - Direito dos Atletas"],
        params: z.object({
          id: z.string().transform((val) => parseInt(val, 10)),
        }),
        response: {
          200: z.object({
            id: z.number(),
            name: z.string().nullable(),
            phone: z.string().nullable(),
            is_registered_clt: z.boolean().nullable(),
            had_injury_during_career: z.boolean().nullable(),
            injury_description: z.string().nullable(),
            injury_timing: z.string().nullable(),
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

        const athleteRight = await prisma.athletesRights.findUnique({
          where: { id },
        });

        if (!athleteRight) {
          return reply.status(404).send({
            message: "Lead de direito dos atletas não encontrado",
          });
        }

        return reply.status(200).send(athleteRight);
      } catch (error) {
        throw new BadRequest("Erro ao buscar lead de direito dos atletas");
      }
    }
  );
}
