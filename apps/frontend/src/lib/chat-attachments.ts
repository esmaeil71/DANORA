export type ChatAttachment = {
  id: string;
  name: string;
  text: string;
};

const MAX_BYTES = 512_000;

export function isTextLikeFile(file: File): boolean {
  if (file.type.startsWith("text/")) return true;
  return /\.(txt|md|json|csv|log|ts|tsx|js|jsx|py|xml|yaml|yml|html|css)$/i.test(
    file.name,
  );
}

export async function readFileAsAttachment(
  file: File,
): Promise<{ ok: true; attachment: ChatAttachment } | { ok: false; error: string }> {
  if (file.size > MAX_BYTES) {
    return { ok: false, error: `فایل «${file.name}» بزرگ‌تر از ۵۰۰ کیلوبایت است` };
  }
  if (!isTextLikeFile(file)) {
    return {
      ok: false,
      error: `فعلاً فقط فایل متنی پشتیبانی می‌شود (${file.name})`,
    };
  }
  try {
    const text = (await file.text()).trim();
    if (!text) {
      return { ok: false, error: `فایل «${file.name}» خالی است` };
    }
    const clipped =
      text.length > 24_000 ? `${text.slice(0, 24_000)}\n… [قطع شد]` : text;
    return {
      ok: true,
      attachment: {
        id: crypto.randomUUID(),
        name: file.name,
        text: clipped,
      },
    };
  } catch {
    return { ok: false, error: `خواندن فایل «${file.name}» ممکن نشد` };
  }
}

export function composeMessageWithAttachments(
  userText: string,
  attachments: ChatAttachment[],
): string {
  const blocks = attachments.map(
    (a) => `فایل پیوست «${a.name}»:\n\`\`\`\n${a.text}\n\`\`\``,
  );
  const body = userText.trim();
  if (blocks.length === 0) return body;
  if (!body) return blocks.join("\n\n");
  return `${blocks.join("\n\n")}\n\n${body}`;
}