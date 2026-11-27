/** Prefix every MCP token starts with; lets an agent check the clipboard without printing it. */
export const MCP_TOKEN_PREFIX = 'kzk_'

const SERVER_NAME = 'kazkioti'
const TOKEN_ENV_VAR = 'KAZKIOTI_MCP_TOKEN'

const CLIPBOARD = {
  macos: '$(pbpaste)',
  linux: '$(wl-paste 2>/dev/null || xclip -o -selection clipboard 2>/dev/null || xsel -ob)',
  windows: '$(Get-Clipboard)',
} as const

/**
 * Setup steps an editor pastes to their AI agent. They contain no secret: the
 * agent reads the token from the clipboard inside the command that stores it,
 * so the token never shows up in the chat.
 */
export function mcpAgentInstructions(mcpUrl: string): string {
  const claudeAdd = (clipboard: string) =>
    `claude mcp add --transport http --scope user ${SERVER_NAME} ${mcpUrl} --header "Authorization: Bearer ${clipboard}"`

  return `Подключи MCP-сервер админки сайта kazkioti.kz.

Имя сервера: ${SERVER_NAME}
Адрес (Streamable HTTP): ${mcpUrl}
Авторизация: заголовок Authorization: Bearer <токен>

Токен пользователь копирует в буфер обмена из админки. Правила работы с ним:
- Не проси вставить токен в чат и никогда не выводи его: не печатай буфер обмена, не показывай конфиги и переменные с токеном.
- Подставляй токен из буфера прямо в ту команду, которая его сохраняет:
  macOS: ${CLIPBOARD.macos}
  Linux: ${CLIPBOARD.linux}
  Windows (PowerShell): ${CLIPBOARD.windows}
- Сначала проверь, что в буфере токен, не показывая значение:
  macOS: pbpaste | grep -q '^${MCP_TOKEN_PREFIX}' && echo ok || echo no
  Linux: (wl-paste 2>/dev/null || xclip -o -selection clipboard) | grep -q '^${MCP_TOKEN_PREFIX}' && echo ok || echo no
  Windows: if ((Get-Clipboard) -like '${MCP_TOKEN_PREFIX}*') { 'ok' } else { 'no' }
  Если no — попроси пользователя нажать в админке «Скопировать токен» и написать «готово». Сам токен не запрашивай.

Claude Code (сервер для всех проектов):
  macOS: ${claudeAdd(CLIPBOARD.macos)}
  Linux: ${claudeAdd(CLIPBOARD.linux)}
  Windows (PowerShell): ${claudeAdd(CLIPBOARD.windows)}
  Если сервер ${SERVER_NAME} уже есть, сначала: claude mcp remove ${SERVER_NAME} --scope user
  Проверка: claude mcp list — у ${SERVER_NAME} должно быть Connected. Инструменты появятся в новой сессии.

Другой клиент (Codex, Cursor, Claude Desktop и т.п.): добавь HTTP MCP-сервер штатным способом своего клиента с этим адресом и заголовком.
  Если клиент умеет брать токен из переменной окружения, сохрани токен из буфера в постоянную переменную ${TOKEN_ENV_VAR} и сошлись на неё:
    macOS/Linux: printf '\\nexport ${TOKEN_ENV_VAR}=%s\\n' "${CLIPBOARD.macos}" >> ~/.zshrc  (на Linux — свой способ чтения буфера и ~/.bashrc, если bash)
    Windows: [Environment]::SetEnvironmentVariable('${TOKEN_ENV_VAR}', (Get-Clipboard), 'User')
  Иначе впиши токен в конфиг клиента скриптом, который читает буфер и сам ничего не печатает.

После подключения проверь вызовом инструмента list_entries с collection: tractors и скажи пользователю, что всё готово.
Если токен всё же попал в чат или в вывод команды — скажи пользователю отозвать его в админке (Пользователи → Доступ для ИИ) и создать новый.`
}
