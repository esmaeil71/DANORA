export function titleFromUserMessage(text: string) {
  const t = text.trim();
  if (!t) return "گفتگوی جدید";
  return t.length > 48 ? `${t.slice(0, 48)}…` : t;
}

export function isPendingConversationId(id: string | undefined) {
  return Boolean(id?.startsWith("pending-"));
}