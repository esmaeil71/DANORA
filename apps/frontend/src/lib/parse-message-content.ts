export type MessageSegment =
  | { type: "text"; value: string }
  | { type: "code"; value: string; lang?: string };

const COMMAND_START =
  /^(curl\b|wget\b|npm\b|npx\b|pnpm\b|yarn\b|git\b|docker\b|sudo\b|cd\b|export\b|ssh\b|pip\b|python3?\b|apt\b|dnf\b|pacman\b)/i;

export function parseMessageSegments(input: string): MessageSegment[] {
  const segments: MessageSegment[] = [];
  let i = 0;

  while (i < input.length) {
    const fenceStart = input.indexOf("```", i);
    if (fenceStart === -1) {
      segments.push(...parsePlainText(input.slice(i)));
      break;
    }
    if (fenceStart > i) {
      segments.push(...parsePlainText(input.slice(i, fenceStart)));
    }

    const afterOpen = fenceStart + 3;
    const langEnd = input.indexOf("\n", afterOpen);
    if (langEnd === -1) {
      segments.push(...parsePlainText(input.slice(fenceStart)));
      break;
    }

    const lang = input.slice(afterOpen, langEnd).trim();
    const codeStart = langEnd + 1;
    const fenceEnd = input.indexOf("```", codeStart);
    if (fenceEnd === -1) {
      segments.push(...parsePlainText(input.slice(fenceStart)));
      break;
    }

    segments.push({
      type: "code",
      value: input.slice(codeStart, fenceEnd).replace(/\n$/, ""),
      lang: normalizeLang(lang),
    });
    i = fenceEnd + 3;
  }

  return segments;
}

function normalizeLang(lang: string | undefined): string | undefined {
  if (!lang) return undefined;
  const l = lang.toLowerCase();
  if (l === "shell" || l === "sh" || l === "zsh") return "bash";
  return l;
}

function parsePlainText(text: string): MessageSegment[] {
  const segments: MessageSegment[] = [];
  const blocks = text.split(/\n{2,}/);

  for (const block of blocks) {
    const trimmed = block.trim();
    if (!trimmed) continue;

    if (!block.includes("\n") && isLikelyCommand(trimmed)) {
      segments.push({ type: "code", value: trimmed, lang: "bash" });
      continue;
    }

    const lines = block.split("\n");
    if (lines.length > 1 && lines.every((ln) => isLikelyCommand(ln.trim()) || !ln.trim())) {
      const code = lines
        .map((ln) => ln.trim())
        .filter(Boolean)
        .join("\n");
      if (code) {
        segments.push({ type: "code", value: code, lang: "bash" });
        continue;
      }
    }

    segments.push({ type: "text", value: block });
  }

  return segments;
}

function isLikelyCommand(line: string): boolean {
  if (!line) return false;
  if (/^\$\s*\S/.test(line)) return true;
  if (COMMAND_START.test(line)) return true;
  return false;
}

export type InlinePart =
  | { kind: "plain"; text: string }
  | { kind: "inline"; text: string };

export function splitInlineCode(text: string): InlinePart[] {
  const parts: InlinePart[] = [];
  const re = /`([^`\n]+)`/g;
  let last = 0;
  let m: RegExpExecArray | null;
  while ((m = re.exec(text)) !== null) {
    if (m.index > last) {
      parts.push({ kind: "plain", text: text.slice(last, m.index) });
    }
    parts.push({ kind: "inline", text: m[1] });
    last = m.index + m[0].length;
  }
  if (last < text.length) {
    parts.push({ kind: "plain", text: text.slice(last) });
  }
  if (parts.length === 0) {
    parts.push({ kind: "plain", text });
  }
  return parts;
}
