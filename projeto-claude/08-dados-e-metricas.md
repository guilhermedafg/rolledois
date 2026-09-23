# Rolle — Dados e métricas

> ⚠️ **Tracking atual será apagado** (feito para uma interface que não existe mais). O novo plano de eventos está em `10-plano-de-analytics.md`. A lista abaixo fica só como histórico.

## Eventos que o app envia ao Mixpanel hoje (extraídos do código)
| Evento | Quando dispara |
|---|---|
| `first_view` | Primeira visualização da sessão (com a URL; útil para origem/UTM) |
| `page_view` | Cada página vista |
| `navigation` | Troca de página (de → para) |
| `open_home_search` | Abriu a busca |
| `text_search` | Fez uma busca (com o termo) |
| `click_venue` | Clicou em um lugar |
| `click_venue_directions` | Clicou em "como chegar" (sinal forte de intenção de ir) |
| `click_venue_website` / `click_venue_socials` | Clicou no site ou nas redes do lugar |
| `click_venue_share` | Compartilhou um lugar |
| `bookmark` | Salvou um lugar |
| `click_list` / `click_list_filter` / `click_list_share` | Abriu, filtrou ou compartilhou lista |
| `click_curator` / `click_curator_from_list` | Clicou no perfil de um curador |
| `click_user_share` | Compartilhou um perfil |
| `click_user_cities_filter` / `click_user_venues_filter` | Filtros no perfil |

Usuários logados são identificados (id, e-mail, nickname). Em ambiente de desenvolvimento o rastreamento fica desligado.

## Lacunas importantes [PROPOSTA — discutir com o André]
Para acompanhar a meta de criadores e montar a história para investidores, faltam eventos de:
- `sign_up` (com método: e-mail ou Google) e `login`
- `create_list`, `add_venue_to_list`, `edit_profile`
- `already_been` (marcou "já fui")
- `follow_user`
- Propriedades de origem: UTM e referrer (ex.: veio do link na bio de qual criador)
- Propriedade `is_creator` no usuário

## Alcance na ponta (para o criador)
O criador quer saber o que acontece depois do save para vender collabs e serviços. Hoje:
- **Temos (proxies de intenção)**: `bookmark`, `click_venue_directions`, `click_venue_website`, `click_venue_socials`, `click_venue_share`, e o "já fui" (sem evento no Mixpanel ainda).
- **Não temos**: ação final, como reserva, visita confirmada ou compra. Caminhos possíveis [PROPOSTA]: integrar reservas, check-in/"já fui" incentivado, cupom rastreável por criador.
- Para atribuir ao criador, cada evento precisa carregar **de qual criador/lista o usuário veio**.

## Funil do criador [PROPOSTA]
Convidado → cadastrou → criou 1ª lista → adicionou ≥5 lugares → compartilhou link → recebeu visitas → voltou na semana seguinte.

## Funil do seguidor [PROPOSTA]
Chegou pelo link de um criador → viu perfil/lista → clicou num lugar → salvou ou "como chegar" → cadastrou → voltou.

## Métricas-chave para os próximos 3 meses [PROPOSTA]
- **Criadores ativos**: publicaram ou atualizaram lista nos últimos 30 dias.
- **Visitantes vindos de criadores**: `first_view` com origem em perfil ou lista de criador.
- **Intenção**: `bookmark` + `click_venue_directions` por visitante.
- **Retenção semanal** de usuários cadastrados.
- Candidata a North Star: **salvamentos/"como chegar" gerados por recomendação de criador por semana**. Conecta criador, usuário e a hipótese de dados de intenção.

## Como mandar dados para análise
Exporte do Mixpanel em CSV (Insights/Funnels/Retention), diga o período e a pergunta que quer responder. Números absolutos ainda serão pequenos; vamos ler tendência e comportamento, não significância estatística.
