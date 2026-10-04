import { writeFileSync } from "node:fs";
import { messages } from "../src/i18n/messages.source.ts";
for (const [language, directory] of [["en", "en"], ["zh", "zh-CN"]] as const) {
  const catalog = Object.fromEntries(Object.entries(messages).map(([key, pair]) => [key, pair[language]]));
  writeFileSync(`messages/${directory}/messages.json`, JSON.stringify(catalog, null, 2) + "\n");
}
