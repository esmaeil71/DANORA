const API_URL = (import.meta.env.VITE_API_URL ?? "http://localhost:4000").replace(
  /\/$/,
  "",
);

type FetchInit = RequestInit & { json?: unknown };

export async function api<T = unknown>(
  path: string,
  init: FetchInit = {},
): Promise<T> {
  const headers = new Headers(init.headers);
  if (init.json !== undefined) {
    headers.set("Content-Type", "application/json");
  }

  let res: Response;
  try {
    res = await fetch(`${API_URL}${path}`, {
      ...init,
      credentials: "include",
      headers,
      body: init.json !== undefined ? JSON.stringify(init.json) : init.body,
    });
  } catch {
    throw new Error(
      `اتصال به API برقرار نشد (${API_URL}). آیا backend با npm run dev روی پورت ۴۰۰۰ در حال اجراست؟`,
    );
  }

  if (!res.ok) {
    let message = res.statusText;
    try {
      const data = (await res.json()) as { message?: string | string[] };
      if (data.message) {
        message = Array.isArray(data.message)
          ? data.message.join(", ")
          : data.message;
      }
    } catch {
      /* ignore */
    }
    throw new Error(message);
  }

  if (res.status === 204) {
    return undefined as T;
  }

  const text = await res.text();
  if (!text) {
    return undefined as T;
  }
  return JSON.parse(text) as T;
}

export interface UserMe {
  id: string;
  email: string;
  plan: string;
}

export interface ModelRow {
  id: string;
  provider: string;
  displayName: string;
}

export interface ConversationRow {
  id: string;
  title: string;
  modelId: string;
  updatedAt: string;
}

export interface MessageRow {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  createdAt: string;
}

export type SseHandler = (event: {
  type: string;
  delta?: string;
  conversationId?: string;
  messageId?: string;
  message?: string;
}) => void;

export async function streamChat(
  body: { conversationId?: string; modelId: string; message: string },
  onEvent: SseHandler,
  signal?: AbortSignal,
) {
  const res = await fetch(`${API_URL}/chat/completions`, {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
    signal,
  });

  if (!res.ok || !res.body) {
    throw new Error("خطا در اتصال به سرور چت");
  }

  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    const parts = buffer.split("\n\n");
    buffer = parts.pop() ?? "";
    for (const part of parts) {
      const line = part
        .split("\n")
        .find((l) => l.startsWith("data: "));
      if (!line) continue;
      const json = line.slice(6);
      try {
        onEvent(JSON.parse(json) as Parameters<SseHandler>[0]);
      } catch {
        /* ignore parse errors */
      }
    }
  }
}