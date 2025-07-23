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

        const metadata = {
          pageUrl: body["Page URL"],
          userAgent: body["User Agent"],
          date: body["Date"],
          time: body["Time"],
          formData: body["Data e Hora"],
          poweredBy: body["Powered by"],
          formId: body["form_id"],
          formName: body["form_name"],
        };

        if (env.LOG_REQUEST_BODY) {
          console.log({
            name: name,
            phone: phone,
            is_registered_clt: isRegisteredClt,
            had_injury_during_career: hadInjuryDuringCareer,
            injury_description: injuryDescription,
            injury_timing: injuryTiming,
            injury_date: injuryDate,
            injury_club: injuryClub,
            ip: ip,
            metadata: metadata,
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
            injury_date: injuryDate,
            injury_club: injuryClub,
            ip: ip,
            metadata: pagesVisited,
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
