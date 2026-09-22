import OpenAI from "openai";
import * as instagram from "./instagram";

import type { InstagramWebhookMessageResponse } from "@rolle/types";

export const client = new OpenAI({
    apiKey: process.env.OPENAI_SECRET_KEY,
});

export async function generateVenueDescription(name: string, category: string, about: unknown) {
    const response = await client.responses.create({
        model: "gpt-5-mini",
        reasoning: { effort: "high" },
        instructions: `
PORTUGUES BRASILEIRO.
1) Tom informativo, claro e simpatico.
2) Nao coloque o nome do local na descricao.
3) Nao precisa colocar todos os items listados no input.
4) Foque apenas nos atributos mais relevantes para a categoria do local.
5) Tente manter-se proximo dos 150 caracteres.
6) Nao fale sobre dinheiro.
7) Nao fale sobre delivery.
8) Nao fale sobre operacao online ou e-commerce.
9) Nao cite nome de individuos.
`,
        input: `
Escreva uma descricao para ${category} ${name}.
Dados sobre o local:
\`\`\`json
${JSON.stringify(about, null, 4)}
\`\`\`
`,
        store: false,
        text: { verbosity: "high" },
        max_output_tokens: 10000,
    });

    return response.output_text;
}

export async function generateVenueHints(reviews: string[]) {
    const response = await client.responses.create({
        model: "gpt-5-mini",
        reasoning: { effort: "high" },
        instructions: `
PORTUGUES BRASILEIRO.
1) Tom informativo, claro e confiavel.
2) Faça uma lista em itens.
3) Entregue apenas os items.
4) Cada item deve comecar com "- ".
5) Lista de no maximo 5 itens.
6) Nao numerar as dicas.
7) Cada dica deve ser independente, sem depender da anterior.
8) Foque apenas nos atributos mais relevantes para a categoria do local (ex.: ambiente, serviços, tempos, destaques, estrutura, atmosfera, etc).
9) Mantenha cada dica próxima de 50 caracteres.
10) Nao fale coisas negativas sobre.
11) Nao fale sobre dinheiro.
12) Nao fale sobre delivery.
13) Nao fale sobre atendimento.
14) Nao fale sobre horarios de atendimento.
15) Nao fale sobre operacao online ou e-commerce.
16) Nao cite nome de individuos.
17) Nao fale sobre sanitarios e banheiros.
18) Fale sobre espera e filas quando for relevante.
`,
        input: `
Escreva dicas sobre o local baseado nos reviews.
Dados sobre o local:
${reviews.join("\n")}
`,
        text: { verbosity: "medium" },
        store: false,
        max_output_tokens: 10000,
    });

    const hints = response.output_text
        .split("\n")
        .map((s) => s.trim().substring(2).replace(/\.$/, ""))
        .filter((s) => s.length > 0);

    return hints;
}

export async function extractPlacesFromInstagramPost(payload: InstagramWebhookMessageResponse) {
    if (!instagram.isMessageAttachments(payload)) {
        return;
    }

    const response = await client.responses.create({
        model: "gpt-5.4-nano",
        reasoning: {
            effort: "low",
        },
        tools: [
            {
                type: "web_search",
            },
        ],
        instructions: [
            "Extraia todos os estabelecimentos ou locais mencionados no texto fornecido.",
            "Os locais podem incluir restaurantes, bares, hotéis, casas noturnas, teatros, estádios, centros de convenções, lojas, museus e espaços para eventos.",
            "Para cada local, retorne o nome e o endereço completo.",
            "Quando o endereço estiver explicitamente presente no texto, use esse endereço.",
            "Quando o endereço não estiver presente, pesquise na web para encontrá-lo.",
            "Use informações de contexto do texto, como cidade, estado, país, bairro ou evento, para identificar corretamente o estabelecimento e evitar selecionar outra unidade com o mesmo nome.",
            "Dê preferência ao site oficial do estabelecimento, ao Google Maps ou a outras fontes confiáveis.",
            "Não invente um endereço.",
            "Não inclua a fonte.",
            "Quando não for possível identificar o endereço com segurança, retorne uma string vazia.",
            "Preserve o nome do estabelecimento conforme aparece no texto.",
            "Remova estabelecimentos duplicados.",
            "Quando nenhum estabelecimento for encontrado, retorne uma lista vazia em places.",
        ].join("\n"),
        input: payload.entry[0].messaging[0].message.attachments[0].payload.title,
        text: {
            format: {
                type: "json_schema",
                name: "venue_extraction",
                strict: true,
                schema: {
                    type: "object",
                    properties: {
                        places: {
                            type: "array",
                            items: {
                                type: "object",
                                properties: {
                                    name: {
                                        type: "string",
                                        description: "Nome do estabelecimento ou local.",
                                    },
                                    address: {
                                        type: "string",
                                        description:
                                            "Endereço mencionado no texto ou uma string vazia.",
                                    },
                                },
                                required: ["name", "address"],
                                additionalProperties: false,
                            },
                        },
                    },
                    required: ["places"],
                    additionalProperties: false,
                },
            },
        },
    });

    const result = JSON.parse(response.output_text) as {
        places: Array<{ name: string; address: string }>;
    };
    return result;
}
