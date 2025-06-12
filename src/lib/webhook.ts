import axios from "axios";
import { env } from "../env";

interface WebhookPayload {
  type: "retired" | "athletes-rights";
  data: any;
  timestamp: string;
}

export class WebhookService {
  private static async sendWebhook(
    url: string,
    payload: WebhookPayload
  ): Promise<void> {
    try {
      await axios.post(url, payload);

      console.log(`Webhook enviado com sucesso para: ${url}`);
    } catch (error) {
      console.error(`Erro ao enviar webhook para ${url}:`, error);
    }
  }

  static async sendRetiredWebhook(data: any): Promise<void> {
    if (!env.WEBHOOK_RETIRED_URL) {
      console.log("URL do webhook para aposentados não configurada");
      return;
    }

    const payload: WebhookPayload = {
      type: "retired",
      data,
      timestamp: new Date().toISOString(),
    };

    await this.sendWebhook(env.WEBHOOK_RETIRED_URL, payload);
  }

  static async sendAthletesRightsWebhook(data: any): Promise<void> {
    if (!env.WEBHOOK_ATHLETES_RIGHTS_URL) {
      console.log("URL do webhook para direito dos atletas não configurada");
      return;
    }

    const payload: WebhookPayload = {
      type: "athletes-rights",
      data,
      timestamp: new Date().toISOString(),
    };

    await this.sendWebhook(env.WEBHOOK_ATHLETES_RIGHTS_URL, payload);
  }
}
