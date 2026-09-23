# Rolle — Produto

Fonte: código do repositório (setembro/2026) + conversa com o fundador.

## Em uma frase
O Rolle é onde criadores de conteúdo reúnem os lugares que recomendam em listas e perfis permanentes, compartilháveis por um link, e onde os seguidores decidem rápido para onde ir com base em quem eles confiam.

## Problema que resolve
- Recomendação de lugar hoje vive em Stories (somem em 24h) e posts (se perdem no feed). 
  - **Não usar** os números atuais da landing ("70% dos Stories desaparecem sem serem vistos", "85% dos posts não são encontrados após 48h"): não têm fonte encontrada.
  - **Números com fonte (usar estes)**:
    - Stories alcançam, em média, **de 2% a 10% dos seguidores**; quanto maior a conta, menor o alcance (contas de 1k–5k: ~10%; de 100k–1M: ~0,5%). Fonte: Socialinsider, benchmarks de Instagram Stories 2025.
    - Metade de todo o engajamento de um post no Instagram acontece nas **primeiras ~19 horas** (meia-vida de 19,04h em 2025). Fonte: Scott Graffius, "Lifespan (Half-Life) of Social Media Posts".
  - Frases sugeridas: "Mais de 90% dos seus seguidores não veem seus Stories." / "Em menos de 1 dia, seu post já recebeu metade de toda a atenção que vai ter." [PROPOSTA]
- O seguidor pergunta toda semana "onde é aquele café?", e o criador responde a mesma coisa várias vezes.
- Google Maps tem todos os lugares, mas não tem o gosto de ninguém. Linktree tem o link, mas não organiza lugares.

## O que existe e funciona hoje
- **Perfil público** do usuário/criador: `rolle.com.br/u/<nickname>`, com os lugares salvos, as listas, filtros por cidade e por lugar, e botão de compartilhar.
- **Listas**: criar, editar, capa, pública ou privada, adicionar lugares, compartilhar link.
- **Lugares (venues)**: base grande, puxada da API do Google Places. Cada lugar tem página com fotos, categoria, distância, como chegar, site, redes sociais, e **descrição + até 5 dicas geradas por IA** a partir de dados e avaliações do Google.
- **Salvar** (bookmark) e **"Já fui"**.
- **Seguir** outros usuários (curadores).
- **Busca** de lugares, listas e usuários; **mapa** com agrupamento de pontos; navegação por **categoria**.
- **Login** por e-mail/senha ou Google; recuperação de senha por e-mail.
- Funciona como app no navegador (PWA).

## Em desenvolvimento (NÃO prometer em conteúdo como pronto)
- **Integração com Instagram por DM**: a pessoa vincula a conta, manda um post por DM para o Rolle, a IA identifica os lugares da legenda, encontra no Google Places e salva no perfil dela, respondendo na DM. É a ponte "vi no post do criador → salvei em 1 toque". Status: "vai funcionar em breve".

## Previsto no modelo de dados (sem data)
- Eventos, atrações e tags.

## Dados iniciais
- Curitiba é a cidade piloto.
- Listas curadas de exemplo: Excelência em Cafés, Bares com Jogos, Pet Friendly, Opções Veganas e Vegetarianas.
- Categorias iniciais: café, torrefatores, hamburgueria, jogos, passatempos, vegano, vegetariano.

## Links e canais
- Site: rolle.com.br
- Instagram: [@todorolle](https://www.instagram.com/todorolle/)
