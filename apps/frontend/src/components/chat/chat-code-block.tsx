import { Check, Copy } from "lucide-react";
import { useCallback, useState } from "react";
import { copyToClipboard } from "@/lib/copy-to-clipboard";

function ShellLine({ line }: { line: string }) {
  const sudoMatch = line.match(/^(sudo\s+)(.*)$/);
  if (sudoMatch) {
    return (
      <>
        <span className="chat-code-kw">{sudoMatch[1]}</span>
        {sudoMatch[2]}
      </>
    );
  }
  return <>{line}</>;
}

export function ChatCodeBlock({
  code,
  lang,
}: {
  code: string;
  lang?: string;
}) {
  const [copied, setCopied] = useState(false);
  const label = (lang ?? "bash").toLowerCase();

  const onCopy = useCallback(async () => {
    const ok = await copyToClipboard(code);
    if (ok) {
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    }
  }, [code]);

  const lines = code.split("\n");

  return (
    <div className="chat-code-block" dir="ltr">
      <div className="chat-code-block-header">
        <span className="chat-code-block-lang">{label}</span>
        <button
          type="button"
          onClick={() => void onCopy()}
          className="chat-code-copy"
          aria-label={copied ? "کپی شد" : "کپی کد"}
          title={copied ? "کپی شد" : "کپی"}
        >
          {copied ? (
            <Check className="size-4 shrink-0" aria-hidden />
          ) : (
            <Copy className="size-4 shrink-0" aria-hidden />
          )}
        </button>
      </div>
      <pre className="chat-code-pre">
        <code className="block">
          {lines.map((line, i) => (
            <span key={i} className="chat-code-line">
              {label === "bash" || label === "sh" || label === "shell" ? (
                <ShellLine line={line} />
              ) : (
                line || " "
              )}
            </span>
          ))}
        </code>
      </pre>
    </div>
  );
}