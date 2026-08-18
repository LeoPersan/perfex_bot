# Diretrizes do Projeto - Perfex Bot

Este arquivo define as regras e orientações para o agente de IA durante o desenvolvimento, manutenção e resolução de problemas no repositório `perfex_bot`.

## 📚 Consulta Obrigatória à Documentação Oficial do Discord

Sempre que você for **planejar, projetar, implementar, refatorar ou corrigir** qualquer funcionalidade, comando, evento ou integração do Discord neste projeto:

1. **Ativar e Consultar a Skill `discord-docs`:**
   - Leia o arquivo de índice e referência da skill em [.agents/skills/discord-docs/SKILL.md](file:///home/leonardo/code/perfex_bot/.agents/skills/discord-docs/SKILL.md).
   - Identifique a seção e o tópico específico relativo à demanda (ex.: Slash Commands, Componentes de Mensagem/Modais, Eventos do Gateway, Endpoints REST, OAuth2, Permissões, Rate Limits, etc.).

2. **Pesquisar e Ler a Documentação Atualizada:**
   - Utilize a ferramenta `read_url_content` para ler as URLs de documentação oficial do Discord (dando preferência aos links `.md` brutos listados na skill).
   - Inspecione a estrutura de dados (payloads JSON), campos obrigatórios/opcionais, enums, códigos de erro e limites de taxa antes de propor ou escrever código.

3. **Planejamento Baseado nas Especificações Técnicas:**
   - O plano de implementação ou correção deve obrigatoriamente citar ou basear-se nos conceitos e especificações extraídos da documentação oficial do Discord.
   - Evite suposições sobre assinaturas de eventos, tipos de respostas a interações (`InteractionCallbackType`) ou permissões bitwise.

4. **Desenvolvimento e Verificação Automatizada (TDD):**
   - Ao adicionar ou modificar funcionalidades do bot, crie e execute testes automatizados para validar a lógica de negócio e o tratamento de interações do Discord.
   - Siga as boas práticas de testes caixa-preta (black-box) focadas no comportamento do sistema.
