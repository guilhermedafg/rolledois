# rolle — plano de analytics (Mixpanel do zero) [PROPOSTA]

Substitui a parte de eventos do `08`. O tracking antigo foi feito em cima de uma interface que não existe mais e será apagado.

---

## 1. Qual o valor disso para o rolle

Não é "ter dados". O Mixpanel serve para responder **4 perguntas**, e cada uma se liga a uma meta:

| # | pergunta | por que importa | meta |
|---|---|---|---|
| 1 | **as pessoas voltam?** | É o sinal nº 1 de que o produto funciona (product-market fit) | captação |
| 2 | **o que faz elas voltarem?** | Achar o "momento aha" do rolle e empurrar todo mundo até ele | usuários |
| 3 | **onde elas travam?** | Saber o que consertar primeiro, com 2 pessoas no time | usuários/criadores |
| 4 | **quanto cada criador gera?** | Vira produto (relatório para o criador) e argumento para investidor | criadores + captação |

**Sobre o journey** (o relatório *Flows* do Mixpanel): ele é montado **a partir dos eventos**. Se os eventos forem só "viu página X", o caminho mostra só páginas. Se forem ações ("salvou um lugar vindo da lista da @fulana"), o caminho mostra **comportamento**. Eventos bons = journey bom.

**O ângulo mais interessante para o rolle (pergunta 4):** o dado do Mixpanel vira **produto**. É exatamente a "coleta de informação" que o criador quer: "sua lista teve 340 visitas, 58 pessoas salvaram lugares e 21 clicaram em 'como chegar'". No começo, isso pode ser um relatório mensal feito à mão com os dados do Mixpanel, entregue como parte do concierge. Depois vira painel dentro do app.

---

## 2. O que o mercado diz

### Retenção é o que importa (Stanford / Y Combinator)
Na aula de growth do curso *How to Start a Startup* (Stanford CS183 / Y Combinator), Alex Schultz, VP de Growth do Facebook, diz que **retenção é a coisa mais importante para crescer**. Se a curva de retenção **para de cair e fica reta** acima de zero, existe um negócio viável. Se ela cai até zero, é preciso rever proposta de valor, onboarding ou experiência antes de investir em aquisição.
Ele também fala do **"momento mágico"**: o ponto em que a pessoa vê valor pela primeira vez. No Facebook foi **adicionar 7 amigos em 10 dias**.

### Momentos "aha" famosos
- Facebook: 7 amigos em 10 dias.
- Twitter: seguir 30 contas.
- Slack: 2.000 mensagens trocadas por time.

⚠️ O próprio Mixpanel alerta: esses números são **hipóteses úteis, não ciência**. Correlação não é causa. O certo é testar: empurrar um grupo até o marco e ver se ele retém mais que um grupo controle.

### Benchmarks de retenção
- **a16z (social apps)**, retenção por dia:

  | | D1 | D7 | D30 |
  |---|---|---|---|
  | ok | 50% | 35% | 20% |
  | bom | 60% | 40% | 25% |
  | ótimo | 70% | 50% | 30% |

- **Lenny Rachitsky** (média de 20+ especialistas e investidores), usuários ativos **6 meses depois** do cadastro:
  - consumer social: 25% bom, 45% ótimo
  - consumer transacional: 30% bom, 50% ótimo
- **Sequoia (Measuring Product Health)**: além de "voltou ou não", olhar **quantos dias por mês** a pessoa usa (L28, ou "power user curve"). Isso mostra se o uso é diário, semanal ou ocasional, e qual métrica faz sentido acompanhar.
- **HBR / Bain**: aumentar a retenção em 5% aumenta o lucro de 25% a 95%.

**Para o rolle:** o uso natural é **semanal** (decidir o rolê da semana ou do fim de semana), não diário. Então a métrica certa é **retenção semanal**, e não comparar com D1 de rede social.

### Cases de empresas usando Mixpanel
Fontes: as próprias páginas de clientes do Mixpanel (é material de marketing, então vale ler com filtro).
- **Kast** (comunidade): usou o relatório de retenção (semana 1, 4 e 12) e descobriu que as pessoas levam dias ou semanas para criar vínculo. Criou uma métrica própria, a "Churn 30", e **aumentou a retenção em mais de 50%**.
- **May**: **dobrou a retenção**, cresceu dois dígitos ao mês e **usou os relatórios do Mixpanel para mostrar os KPIs a fundos e captar**. É o modelo para a pergunta 4.
- **OkCredit**: achou onde os usuários travavam numa funcionalidade e aumentou em **40%** a adoção dela na primeira vez.
- **Yelp** (local business): encontrou problemas no processo de "reivindicar o negócio" e reduziu o tempo de análise de **semanas para dias**.
- **Mad Paws** (marketplace de dois lados, parecido com criador ↔ seguidor): usa o Mixpanel para acompanhar a jornada dos dois lados separadamente.

---

## 3. Princípios do novo tracking
1. **Poucos eventos, bem feitos**: cerca de 15. Cada um responde a uma das 4 perguntas; se não responde, não entra.
2. **Evento = ação de negócio, não tela.** `place_saved` continua valendo se o botão mudar de lugar. É isso que evita refazer tudo no próximo redesign.
3. **O contexto vai nas propriedades.** Toda ação carrega **de qual criador e de qual lista** a pessoa veio. É isso que permite responder a pergunta 4.
4. **Origem gravada no primeiro acesso**: UTM e o criador cujo link trouxe a pessoa.
5. **Nomes em inglês, `objeto_ação`, no passado** (`list_created`). Padrão comum que evita confusão.

---

## 4. Eventos propostos

### Propriedades enviadas em todo evento (super properties)
| propriedade | exemplo | para quê |
|---|---|---|
| `utm_source` / `utm_medium` / `utm_campaign` | instagram / bio / criadores | de onde veio |
| `entry_creator` | gaspaindica | criador cujo link trouxe a pessoa no 1º acesso |
| `is_logged_in` | true | logado ou visitante |
| `is_creator` | false | separar os dois lados |

### Aquisição e cadastro
| evento | quando | propriedades principais |
|---|---|---|
| `page_viewed` | toda página (automático do Mixpanel) | `page_type` (home, perfil, lista, lugar, busca) |
| `signed_up` | criou conta | `method` (email/google), `entry_creator` |
| `logged_in` | fez login | `method` |

### Lado do criador (ativação)
| evento | quando | propriedades principais |
|---|---|---|
| `list_created` | criou lista | `list_id`, `is_private` |
| `place_added_to_list` | adicionou lugar | `list_id`, `place_id`, `category` |
| `profile_shared` / `list_shared` | tocou em compartilhar | `channel` (copiar link, whatsapp, instagram) |

### Lado do seguidor (valor e intenção)
| evento | quando | propriedades principais |
|---|---|---|
| `profile_viewed` | abriu perfil de alguém | `creator`, `is_own_profile` |
| `list_viewed` | abriu lista | `list_id`, `creator` |
| `place_viewed` | abriu um lugar | `place_id`, `category`, `from_creator`, `from_list_id` |
| `place_saved` | salvou | `place_id`, `from_creator`, `from_list_id` |
| `directions_clicked` | "como chegar" | `place_id`, `from_creator` |
| `place_contact_clicked` | site, instagram, telefone ou reserva do lugar | `type`, `place_id`, `from_creator` |
| `already_been_marked` | "já fui" | `place_id`, `from_creator` |
| `creator_followed` | seguiu alguém | `creator` |
| `search_performed` | buscou | `query`, `results_count` |

### Integração Instagram (quando lançar)
`instagram_linked` · `post_sent_via_dm` · `places_extracted` (`count`) · `places_saved_via_dm` (`count`)

### Perfil do usuário (user properties)
`is_creator`, `creator_since`, `signup_method`, `entry_creator`, `city`. [CONFIRMAR: enviar só id e nickname, não e-mail, por privacidade/LGPD]

---

## 5. O que montar no Mixpanel (6 relatórios)
1. **Curva de retenção semanal**: cadastro → voltou e fez `place_viewed` nas semanas 1 a 8. Separada por **origem** (veio de criador × orgânico). É o gráfico da pergunta 1 e do pitch.
2. **Teste do momento aha**: comparar a retenção de quem fez X na 1ª semana com a de quem não fez. Hipóteses a testar:
   - salvou 3 ou mais lugares na 1ª semana
   - seguiu 1 ou mais criadores
   - fez "como chegar" pelo menos 1 vez
3. **Funil do criador**: `signed_up` → `list_created` → 5 `place_added_to_list` → `list_shared` → recebeu visitas.
4. **Funil do seguidor**: `profile_viewed` (vindo de criador) → `place_viewed` → `place_saved` ou `directions_clicked` → `signed_up`.
5. **Journey (Flows)**: o que as pessoas fazem depois de `profile_viewed` e antes de sair. Vale comparar quem voltou com quem não voltou.
6. **Relatório por criador**: visitas, saves, "como chegar" e contatos por `from_creator`. A base do relatório mensal que vai para o criador.

---

## 6. Com poucos usuários: como usar de verdade
- Números pequenos não dão estatística; o que eles dão é **comportamento**. Olhe **pessoas**: o Mixpanel mostra a sequência de eventos de cada usuário, e o plano gratuito tem **session replay** (gravação da sessão) com 10 mil sessões por mês.
- **Ritual semanal de 30 min** (Guilherme + André): retenção da semana, funis, 5 sessões assistidas e 1 decisão.
- Combine com conversa: quem voltou, você chama para conversar e pergunta por quê.

## 7. Custo
- **Gratuito** até 1 milhão de eventos por mês, com usuários ilimitados no time.
- **Startup Program**: 1º ano grátis no plano pago para empresas com menos de 5 anos e até US$ 8 milhões captados.

---

## Decisões em aberto
- [ ] Aprovar a lista de eventos (ou cortar ou adicionar).
- [ ] Métrica principal (North Star). Opções:
  - (a) salvos + "como chegar" vindos de criador por semana
  - (b) usuários ativos por semana
  - (c) criadores ativos
- [ ] Qual hipótese de momento aha testar primeiro.
- [ ] Fazer o relatório mensal manual para criadores como parte do concierge?
- [ ] Mapear na interface nova. Preciso ver as telas: link do Figma ou prints.

## Fontes
- [Alex Schultz, Stanford CS183 / YC: How to Get Users and Grow](https://www.youtube.com/watch?v=n_yHZ_vKjno) · [resumo](https://thinkapps.com/blog/post-launch/how-start-startup-growth/)
- [a16z: Do You Have Lightning in a Bottle? How to Benchmark Your Social App](https://a16z.com/do-you-have-lightning-in-a-bottle-how-to-benchmark-your-social-app/)
- [Lenny Rachitsky: What is good retention](https://www.lennysnewsletter.com/p/what-is-good-retention-issue-29) · [resumo no X](https://x.com/lennysan/status/1277620704146423809)
- [Sequoia: Measuring Product Health](https://www.sequoiacap.com/article/measuring-product-health) · [a16z: The Power User Curve](https://a16z.com/the-power-user-curve-the-best-way-to-understand-your-most-engaged-users/)
- [HBR: The Value of Keeping the Right Customers](https://hbr.org/2014/10/the-value-of-keeping-the-right-customers)
- [Mixpanel: Magic numbers are an illusion](https://mixpanel.com/blog/magic-numbers-are-an-illusion/)
- [Mixpanel: 8 use cases from customer stories](https://mixpanel.com/blog/mixpanel-analytics-use-cases-customer-stories/) · [Kast](https://mixpanel.com/customers/kast-improved-user-retention-by-50-with-mixpanel/) · [OkCredit](https://mixpanel.com/customers/okcredit-relies-on-mixpanel-to-increase-user-engagement-and-long-term-retention/) · [Yelp](https://mixpanel.com/customers/how-yelp-reduced-data-analysis-cycle-mixpanel/) · [Mad Paws](https://mixpanel.com/customers/how-mad-paws-uses-mixpanel-to-track-user-journeys-across-its-dual-sided-marketplace/)
- [Mixpanel Startup Program](https://docs.mixpanel.com/docs/pricing/startup-program) · [preços](https://www.usercall.co/post/mixpanel-pricing)
