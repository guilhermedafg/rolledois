# Projeto Claude — Rolle

Fundação do "braço direito" de estratégia, conteúdo e produto do rolle.
Fonte oficial: esta pasta, no branch `claude/sleepy-ritchie-togndv` do repositório. Se algo divergir, vale o que está aqui.

## Como montar o projeto no Claude

1. Em claude.ai, crie um **Projeto** chamado `Rolle — Braço direito`.
2. Copie o conteúdo de `01-instrucoes-do-projeto.md` e cole no campo **Instruções do projeto** (Project instructions).
3. Suba os arquivos `02` a `10` em **Conhecimento do projeto** (Project knowledge). Opcional: os `.md` da pasta `conteudo/`, para ele saber o que já foi escrito.
4. Sempre que algo mudar (métricas, decisões, tom de voz), atualize o arquivo correspondente e suba de novo. O projeto só sabe o que está nesses arquivos.

## Arquivos

| Arquivo | O que tem | Onde vai |
|---|---|---|
| `01-instrucoes-do-projeto.md` | Papel, regras de trabalho, formato de resposta | Instruções |
| `02-produto.md` | O que o Rolle é e faz hoje | Conhecimento |
| `03-negocio-e-estrategia.md` | Momento, metas, hipóteses de receita, concorrência | Conhecimento |
| `04-publico-e-personas.md` | Criador de nicho (foco) e usuário final (depois) | Conhecimento |
| `05-marca-e-voz.md` | Tom de voz v1, referências, identidade visual | Conhecimento |
| `06-conteudo-instagram.md` | Pilares, formatos, cadência, séries | Conhecimento |
| `07-modelos-de-pedido.md` | Pedidos prontos pra reaproveitar | Conhecimento (e pra você copiar) |
| `08-dados-e-metricas.md` | Eventos do Mixpanel, funil, como analisar | Conhecimento |
| `09-decisoes-e-pendencias.md` | Registro de decisões e perguntas em aberto | Conhecimento (atualizar sempre) |
| `10-plano-de-analytics.md` | Mixpanel do zero: valor, benchmarks, cases, eventos, relatórios | Conhecimento |
| `11-guia-implementacao-mixpanel.md` | Onde mexer no código e o que colocar (para o André) | Só para uso; não precisa subir |
| `conteudo/` | Posts prontos e plano de prospecção | Opcional no Conhecimento |

## Convenções

- `[CONFIRMAR]` = informação que deduzi e precisa de validação.
- `[PREENCHER]` = lacuna que só você sabe.
- `[PROPOSTA]` = sugestão minha, ainda não aprovada.

## Onde usar o quê

| Use o **Projeto no claude.ai** para | Use a **sessão do Claude Code** (com o repositório) para |
|---|---|
| Ideias de post, roteiros, legendas, carrosséis, calendário | Qualquer coisa que mexa no código ou no site (Mixpanel, textos da landing, recursos novos) |
| Campanhas e DMs para criadores | Atualizar estes documentos de fundação (e salvar a versão no repositório) |
| Pensar estratégia e tomar decisões do dia a dia | Perguntas que dependem de como o produto funciona de verdade |
| Analisar exportações do Mixpanel (CSV) | Pesquisas mais longas que viram documento |
| Uso rápido, inclusive pelo celular | Revisões grandes da fundação (ex.: todo mês) |

**Como manter os dois em sincronia**
1. Decidiu algo no Projeto → peça "resuma o que decidimos no formato do 09" e guarde o texto.
2. De tempos em tempos (ou quando juntar várias decisões), traga esses resumos para a sessão do Claude Code: ele atualiza os arquivos, salva no repositório e te devolve as versões novas.
3. Substitua os arquivos no Conhecimento do Projeto.
