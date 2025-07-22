import { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import { z } from "zod";
import { prisma } from "../lib/prisma";
import { WebhookService } from "../services/webhook";
import { env } from "../env";

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
          clicked_whatsapp_button: z.boolean().optional(),
          pages_visited: z.record(z.string(), z.string()).optional(),
          ip: z.string().optional(),
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
            clicked_whatsapp_button: z.boolean().nullable(),
            ip: z.string().nullable(),
            pages_visited: z.any().nullable(),
            created_at: z.date(),
            updated_at: z.date(),
          }),
        },
      },
    },
    async (request, reply) => {
      try {
        const clientIp =
          request.body.ip ||
          request.headers["x-forwarded-for"] ||
          request.headers["x-real-ip"] ||
          request.socket.remoteAddress ||
          request.ip;

        const ip =
          typeof clientIp === "string" ? clientIp : clientIp?.[0] || null;

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
            clicked_whatsapp_button: request.body.clicked_whatsapp_button,
            ip: ip,
            pages_visited: request.body.pages_visited,
            webhook_sent: false,
          },
        });

        WebhookService.sendAthletesRightsWebhook(athleteRight).catch(
          (error) => {
            console.error(
              "Erro ao enviar webhook de direito dos atletas:",
              error
            );
          }
        );

        await prisma.athletesRights.update({
          where: { id: athleteRight.id },
          data: { webhook_sent: true },
        });

        return reply.status(201).send(athleteRight);
      } catch (error) {
        throw new Error("Erro ao criar lead de direito dos atletas");
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
            clicked_whatsapp_button: z.boolean().nullable(),
            webhook_sent: z.boolean().nullable(),
            ip: z.string().nullable(),
            pages_visited: z.any().nullable(),
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
        throw new Error("Erro ao buscar lead de direito dos atletas");
      }
    }
  );
}

export async function createLeadAthletesRightFromForm(app: FastifyInstance) {
  app.post(
    "/api/athletes-rights/form",
    {
      schema: {
        summary: "Cadastro via Formulário",
        description:
          "Cadastrar um lead no direito dos atletas a partir de dados de formulário",
        tags: ["Leads - Direito dos Atletas"],
        consumes: ["application/x-www-form-urlencoded"],
        response: {
          201: z.object({
            success: z.boolean(),
            message: z.string(),
            id: z.number(),
          }),
          400: z.object({
            success: z.boolean(),
            message: z.string(),
          }),
        },
      },
    },
    async (request, reply) => {
      try {
        const body = request.body as Record<string, string>;

        if (env.LOG_REQUEST_BODY) {
          console.dir(body, { depth: null });
        }

        const parseBoolean = (
          value: string | undefined
        ): boolean | undefined => {
          if (!value) return undefined;
          const lowerValue = value.toLowerCase().trim();
          if (
            lowerValue === "sim" ||
            lowerValue === "yes" ||
            lowerValue === "true"
          )
            return true;
          if (
            lowerValue === "não" ||
            lowerValue === "nao" ||
            lowerValue === "no" ||
            lowerValue === "false"
          )
            return false;
          return undefined;
        };

        const name = body["Nome completo"] || undefined;
        const phone = body["WhatsApp"] || undefined;

        const isRegisteredClt = parseBoolean(
          body[
            "Você foi registrado oficialmente como jogador de futebol na sua carteira de trabalho?"
          ]
        );
        const hadInjuryDuringCareer = parseBoolean(
          body[
            "Você sofreu alguma lesão séria durante sua carreira como jogador de futebol?"
          ]
        );
        const injuryDescription =
          body[
            "Descreva a lesão grave que você teve enquanto atuava como jogador profissional."
          ] || undefined;
        const injuryTiming =
          body[
            "A lesão ocorreu antes, durante ou depois de você ser formalmente registrado como jogador de futebol na carteira de trabalho?"
          ] || undefined;
        const injuryDate =
          body["Informe o mês e ano em que você sofreu a lesão grave"] ||
          undefined;
        const injuryClub =
          body["Qual clube você defendia na época da lesão grave?"] ||
          undefined;

        const clientIp =
          body["Remote IP"] ||
          request.headers["x-forwarded-for"] ||
          request.headers["x-real-ip"] ||
          request.socket.remoteAddress ||
          request.ip;

        const ip =
          typeof clientIp === "string" ? clientIp : clientIp?.[0] || null;

        const pagesVisited = {
          pageUrl: body["Page URL"],
          userAgent: body["User Agent"],
          date: body["Date"],
          time: body["Time"],
          formData: body["Data e Hora"],
          poweredBy: body["Powered by"],
          formId: body["form_id"],
          formName: body["form_name"],
          injuryDate: injuryDate,
          injuryClub: injuryClub,
        };

        if (env.LOG_REQUEST_BODY) {
          console.log({
            name: name,
            phone: phone,
            is_registered_clt: isRegisteredClt,
            had_injury_during_career: hadInjuryDuringCareer,
            injury_description: injuryDescription,
            injury_timing: injuryTiming,
            ip: ip,
            pages_visited: pagesVisited,
            webhook_sent: false,
          });
        }

        const athleteRight = await prisma.athletesRights.create({
          data: {
            name: name,
            phone: phone,
            is_registered_clt: isRegisteredClt,
            had_injury_during_career: hadInjuryDuringCareer,
            injury_description: injuryDescription,
            injury_timing: injuryTiming,
            ip: ip,
            pages_visited: pagesVisited,
            webhook_sent: false,
          },
        });

        WebhookService.sendAthletesRightsWebhook(athleteRight).catch(
          (error) => {
            console.error(
              "Erro ao enviar webhook de direito dos atletas:",
              error
            );
          }
        );

        await prisma.athletesRights.update({
          where: { id: athleteRight.id },
          data: { webhook_sent: true },
        });

        return reply.status(200).send();
      } catch (error) {
        console.error(
          "Erro ao processar formulário de direito dos atletas:",
          error
        );
        return reply.status(400).send({
          success: false,
          message: "Erro ao processar dados do formulário",
        });
      }
    }
  );
}
