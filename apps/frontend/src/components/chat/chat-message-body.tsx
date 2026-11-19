import {
  parseMessageSegments,
  splitInlineCode,
} from "@/lib/parse-message-content";
import { ChatCodeBlock } from "./chat-code-block";

type Variant = "user" | "assistant";

function TextBlock({ value }: { value: string }) {
  const parts = splitInlineCode(value);
  return (
    <p className="chat-msg-paragraph">
      {parts.map((part, i) =>
        part.kind === "inline" ? (
          <code key={i} className="chat-inline-code" dir="ltr">
            {part.text}
          </code>
        ) : (
          <span key={i}>{part.text}</span>
        ),
      )}
    </p>
  );
}

function RichMessage({ content }: { content: string }) {
  const segments = parseMessageSegments(content.trim());
  const hasCode = segments.some((s) => s.type === "code");

  if (!hasCode) {
    const blocks = content.trim().split(/\n{2,}/).filter(Boolean);
    return (
      <>
        {blocks.map((block, index) => (
          <p key={index} className="chat-msg-paragraph">
            {block}
          </p>
        ))}
      </>
    );
  }

  return (
    <>
      {segments.map((seg, index) =>
        seg.type === "code" ? (
          <ChatCodeBlock key={index} code={seg.value} lang={seg.lang} />
        ) : (
          <TextBlock key={index} value={seg.value} />
        ),
      )}
    </>
  );
}

export function ChatMessageBody({
  content,
  variant,
}: {
  content: string;
  variant: Variant;
}) {
  const trimmed = content.trim();
  if (!trimmed) return null;

  const rootClass =
    variant === "user"
      ? "chat-msg-body chat-msg-body--user"
      : "chat-msg-body chat-msg-body--assistant";

  return (
    <div className={rootClass}>
      <RichMessage content={trimmed} />
    </div>
  );
}