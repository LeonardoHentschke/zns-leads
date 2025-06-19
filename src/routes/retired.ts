import { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import { z } from "zod";
import { prisma } from "../lib/prisma";
import { BadRequest } from "./_errors/bad-request";
import { WebhookService } from "../lib/webhook";
import { ScoreCalculatorService } from "../services/score-calculator";
import { BenefitDateCalculatorService } from "../services/benefit-date-calculator";

export async function createLeadRetired(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().post(
    "/api/retired",
    {
      schema: {
        summary: "Cadastro",
        description: "Cadastrar um lead de aposentadoria",
        tags: ["Leads - Aposentadoria"],
        body: z.object({
          name: z.string().optional(),
          phone: z.string().optional(),
          gender: z.string(),
          birth_date: z.coerce.date(),
          contribution_time: z.string(),
          is_unhealthy: z.boolean().optional(),
          is_military: z.boolean().optional(),
          utm_source: z.string().optional(),
          utm_medium: z.string().optional(),
          utm_campaign: z.string().optional(),
          utm_content: z.string().optional(),
          utm_term: z.string().optional(),
          ip: z.string().ip().optional(),
          device: z.string().optional(),
          pages_visited: z.record(z.string(), z.string()).optional(),
        }),
        response: {
          201: z.object({
            id: z.number(),
            name: z.string().nullable(),
            phone: z.string().nullable(),
            score: z.string().nullable(),
            gender: z.string().nullable(),
            birth_date: z.date().nullable(),
            contribution_time: z.string().nullable(),
            is_unhealthy: z.boolean().nullable(),
            is_military: z.boolean().nullable(),
            utm_source: z.string().nullable(),
            utm_medium: z.string().nullable(),
            utm_campaign: z.string().nullable(),
            utm_content: z.string().nullable(),
            utm_term: z.string().nullable(),
            device: z.string().nullable(),
            ip: z.string().nullable(),
            date_benefit_was_granted: z.date().nullable(),
            created_at: z.date(),
            updated_at: z.date(),
            pages_visited: z.any().nullable(),
          }),
        },
      },
    },
    async (request, reply) => {
      try {
        const calculatedScore = ScoreCalculatorService.calculateScore({
          gender: request.body.gender,
          birth_date: request.body.birth_date,
          contribution_time: request.body.contribution_time,
        });

        const calculatedBenefitDate =
          BenefitDateCalculatorService.calculateBenefitDate({
            gender: request.body.gender,
            birth_date: request.body.birth_date,
            contribution_time: request.body.contribution_time,
          });

        const retired = await prisma.retired.create({
          data: {
            name: request.body.name,
            phone: request.body.phone,
            score: calculatedScore.toString(),
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
            ip: request.body.ip,
            device: request.body.device,
            date_benefit_was_granted: calculatedBenefitDate,
            pages_visited: request.body.pages_visited,
          },
        });

        WebhookService.sendRetiredWebhook(retired).catch((error) => {
          console.error("Erro ao enviar webhook de aposentado:", error);
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
    "/api/retired/:id",
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
            score: z.string().nullable(),
            gender: z.string().nullable(),
            birth_date: z.date().nullable(),
            contribution_time: z.string().nullable(),
            is_unhealthy: z.boolean().nullable(),
            is_military: z.boolean().nullable(),
            utm_source: z.string().nullable(),
            utm_medium: z.string().nullable(),
            utm_campaign: z.string().nullable(),
            utm_content: z.string().nullable(),
            utm_term: z.string().nullable(),
            device: z.string().nullable(),
            ip: z.string().nullable(),
            date_benefit_was_granted: z.date().nullable(),
            created_at: z.date(),
            updated_at: z.date(),
            pages_visited: z.any().nullable(),
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
