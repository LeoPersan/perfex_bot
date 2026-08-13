/**
 * Divide uma mensagem extensa em múltiplos blocos (chunks) respeitando o limite máximo de caracteres (ex: 2000 no Discord).
 * Prioriza a quebra por parágrafos ("\n\n"), fazendo fallback para linhas simples ("\n") ou fatiamento de caracteres se necessário.
 */
export function splitMessage(text: string, maxLength: number = 2000): string[] {
  if (!text || text.length <= maxLength) {
    return [text];
  }

  const chunks: string[] = [];
  let currentChunk = '';

  const pushCurrent = () => {
    if (currentChunk.length > 0) {
      chunks.push(currentChunk);
      currentChunk = '';
    }
  };

  const paragraphs = text.split('\n\n');

  for (const paragraph of paragraphs) {
    if (paragraph.length > maxLength) {
      pushCurrent();

      const lines = paragraph.split('\n');
      for (const line of lines) {
        if (line.length > maxLength) {
          pushCurrent();
          for (let i = 0; i < line.length; i += maxLength) {
            chunks.push(line.slice(i, i + maxLength));
          }
        } else {
          if (currentChunk.length === 0) {
            currentChunk = line;
          } else if (currentChunk.length + 1 + line.length <= maxLength) {
            currentChunk += '\n' + line;
          } else {
            pushCurrent();
            currentChunk = line;
          }
        }
      }
    } else {
      if (currentChunk.length === 0) {
        currentChunk = paragraph;
      } else if (currentChunk.length + 2 + paragraph.length <= maxLength) {
        currentChunk += '\n\n' + paragraph;
      } else {
        pushCurrent();
        currentChunk = paragraph;
      }
    }
  }

  pushCurrent();

  return chunks;
}
