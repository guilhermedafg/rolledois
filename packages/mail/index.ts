import { Resend } from "resend";
import { RolleError } from "@rolle/error";

const from = {
    noreply: "Rolle <noreply@rolle.com.br>",
};

class RolleMail {
    /**
     * Singleton instance.
     */
    private static instance: RolleMail;

    /**
     * Creates or returns singleton instance.
     */
    static getInstance(): RolleMail {
        if (!this.instance) {
            this.instance = new RolleMail();
        }

        return this.instance;
    }

    /**
     * Mailer client.
     */
    private client: Resend;

    constructor() {
        const apiKey = process.env.RESEND_API_KEY;
        if (typeof apiKey === "undefined") {
            throw new RolleError({
                code: "Rolle.Server.Internal",
                message: "Variáveis de ambiente para conexão com o `Resend` faltando.",
            });
        }
        this.client = new Resend(apiKey);
    }

    async sendText(payload: {
        from: keyof typeof from;
        to: string[];
        subject: string;
        text: string;
    }) {
        const { data, error } = await this.client.emails.send({
            ...payload,
            from: from[payload.from],
        });

        if (error) {
            throw new Error(error.message);
        }

        return data;
    }
}

export const rolleMail = RolleMail.getInstance();
