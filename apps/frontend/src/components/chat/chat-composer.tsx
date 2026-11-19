import { FileText, Loader2, Mic, MicOff, Plus, Send, ShoppingBag, X } from "lucide-react";
import { FormEvent, KeyboardEvent, useEffect, useRef, useState } from "react";
import {
  type ChatAttachment,
  composeMessageWithAttachments,
  readFileAsAttachment,
} from "@/lib/chat-attachments";
import {
  buildTranscriptFromEvent,
  ensureMicPermission,
  isSecureSpeechContext,
  mapDomSpeechError,
  speechErrorMessage,
  speechRecognitionCtor,
} from "@/lib/speech-input";

export function ChatComposer({
  value,
  onChange,
  onSubmit,
  sending,
  disabled,
  disabledHint,
  placeholder,
  shopMode,
  onShopModeChange,
  footerHint,
}: {
  value: string;
  onChange: (v: string) => void;
  onSubmit: (message: string) => void;
  sending: boolean;
  disabled?: boolean;
  disabledHint?: string;
  placeholder?: string;
  shopMode?: boolean;
  onShopModeChange?: (v: boolean) => void;
  footerHint?: string;
}) {
  const fileRef = useRef<HTMLInputElement>(null);
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const voiceBaseRef = useRef("");
  const voiceFinalRef = useRef("");
  const valueRef = useRef(value);
  valueRef.current = value;
  const stopRequestedRef = useRef(false);
  const speechHadErrorRef = useRef(false);
  const [attachments, setAttachments] = useState<ChatAttachment[]>([]);
  const [attachError, setAttachError] = useState<string | null>(null);
  const [readingFiles, setReadingFiles] = useState(false);
  const [listening, setListening] = useState(false);
  const [speechSupported, setSpeechSupported] = useState(false);

  useEffect(() => {
    setSpeechSupported(Boolean(speechRecognitionCtor()));
    return () => {
      stopRequestedRef.current = true;
      recognitionRef.current?.abort();
    };
  }, []);

  function handleKeyDown(e: KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing) {
      e.preventDefault();
      submitMessage();
    }
  }

  function submitMessage() {
    const composed = composeMessageWithAttachments(value, attachments).trim();
    if (!composed || disabled) return;
    onSubmit(composed);
    onChange("");
    setAttachments([]);
    setAttachError(null);
    if (listening) {
      recognitionRef.current?.stop();
      setListening(false);
    }
  }

  async function onFilesPicked(files: FileList | null) {
    if (!files?.length) return;
    setReadingFiles(true);
    setAttachError(null);
    const errors: string[] = [];
    const added: ChatAttachment[] = [];
    for (const file of Array.from(files)) {
      const result = await readFileAsAttachment(file);
      if (result.ok) added.push(result.attachment);
      else errors.push(result.error);
    }
    if (added.length) {
      setAttachments((prev) => [...prev, ...added]);
    }
    if (errors.length) {
      setAttachError(errors[0]);
    }
    setReadingFiles(false);
    if (fileRef.current) fileRef.current.value = "";
  }

  async function toggleListening() {
    if (disabled) return;
    const SR = speechRecognitionCtor();
    if (!SR) {
      setAttachError(speechErrorMessage("not-supported"));
      return;
    }
    if (!isSecureSpeechContext()) {
      setAttachError(speechErrorMessage("insecure-context"));
      return;
    }

    if (listening) {
      stopRequestedRef.current = true;
      recognitionRef.current?.stop();
      return;
    }

    const mic = await ensureMicPermission();
    if (!mic.ok) {
      setAttachError(speechErrorMessage(mic.code));
      return;
    }

    voiceBaseRef.current = valueRef.current.trim();
    voiceFinalRef.current = "";
    stopRequestedRef.current = false;
    speechHadErrorRef.current = false;

    const recognition = new SR();
    recognition.lang = "fa-IR";
    recognition.continuous = true;
    recognition.interimResults = true;

    recognition.onresult = (event) => {
      const { finals, interim } = buildTranscriptFromEvent(event);
      if (finals) voiceFinalRef.current += finals;
      const spoken = (voiceFinalRef.current + interim).trim();
      if (!spoken) return;
      const base = voiceBaseRef.current;
      onChange(base ? `${base} ${spoken}` : spoken);
    };

    recognition.onerror = (event) => {
      const dom = event as SpeechRecognitionErrorEvent;
      const code = mapDomSpeechError(dom.error);
      if (dom.error === "aborted" || stopRequestedRef.current) {
        return;
      }
      setListening(false);
      speechHadErrorRef.current = true;
      const mapped = code === "unknown" ? "unknown" : code;
      setAttachError(speechErrorMessage(mapped));
    };

    recognition.onend = () => {
      setListening(false);
      recognitionRef.current = null;
      const tail = voiceFinalRef.current.trim();
      if (tail) {
        const base = voiceBaseRef.current;
        onChange(base ? `${base} ${tail}` : tail);
      } else if (!stopRequestedRef.current && !speechHadErrorRef.current) {
        setAttachError(speechErrorMessage("no-speech"));
      }
    };

    recognitionRef.current = recognition;
    try {
      recognition.start();
      setListening(true);
      setAttachError(null);
    } catch {
      setListening(false);
      setAttachError(speechErrorMessage("mic-unavailable"));
    }
  }

  const canSend =
    composeMessageWithAttachments(value, attachments).trim().length > 0;

  return (
    <div className="shrink-0 px-3 sm:px-4 pb-4 pt-2">
      <form
        onSubmit={(e: FormEvent) => {
          e.preventDefault();
          submitMessage();
        }}
        className="max-w-3xl mx-auto"
      >
        {attachments.length > 0 && (
          <ul className="flex flex-wrap gap-2 mb-2 justify-end">
            {attachments.map((a) => (
              <li
                key={a.id}
                className="inline-flex items-center gap-1.5 max-w-[min(100%,220px)] pl-1 pr-2 py-1 rounded-lg border border-[var(--chat-border)] bg-[var(--chat-surface)] text-xs text-[var(--chat-text)]"
              >
                <FileText className="size-3.5 shrink-0 text-[var(--chat-accent)]" />
                <span className="truncate">{a.name}</span>
                <button
                  type="button"
                  aria-label={`حذف ${a.name}`}
                  onClick={() =>
                    setAttachments((prev) => prev.filter((x) => x.id !== a.id))
                  }
                  className="size-7 rounded-md hover:bg-[var(--chat-surface-hover)] inline-flex items-center justify-center cursor-pointer shrink-0"
                >
                  <X className="size-3.5" />
                </button>
              </li>
            ))}
          </ul>
        )}

        <div className="relative flex items-end gap-1.5 sm:gap-2 rounded-2xl border border-[var(--chat-border)] bg-[var(--chat-input-bg)] px-2 sm:px-3 py-2 shadow-lg shadow-black/20">
          <input
            ref={fileRef}
            type="file"
            multiple
            accept=".txt,.md,.json,.csv,.log,.ts,.tsx,.js,.jsx,.py,.xml,.yaml,.yml,.html,.css,text/*"
            className="sr-only"
            onChange={(e) => void onFilesPicked(e.target.files)}
          />

          {onShopModeChange && (
            <button
              type="button"
              onClick={() => onShopModeChange(!shopMode)}
              aria-pressed={shopMode}
              aria-label={shopMode ? "حالت خرید فعال" : "فعال‌سازی حالت خرید"}
              title={shopMode ? "جستجوی محصول" : "حالت چت عادی"}
              className={`shrink-0 size-11 rounded-xl border cursor-pointer inline-flex items-center justify-center transition-colors ${
                shopMode
                  ? "border-[var(--chat-accent)] bg-[var(--chat-accent)]/15 text-[var(--chat-accent)]"
                  : "border-[var(--chat-border)] text-[var(--chat-muted)] hover:bg-[var(--chat-surface-hover)]"
              }`}
            >
              <ShoppingBag className="size-5" aria-hidden />
            </button>
          )}

          <button
            type="button"
            disabled={disabled || readingFiles || shopMode}
            onClick={() => fileRef.current?.click()}
            aria-label="افزودن فایل"
            className="shrink-0 size-11 rounded-xl border border-[var(--chat-border)] text-[var(--chat-muted)] hover:text-[var(--chat-text)] hover:bg-[var(--chat-surface-hover)] cursor-pointer disabled:opacity-40 inline-flex items-center justify-center transition-colors"
          >
            {readingFiles ? (
              <Loader2 className="size-5 animate-spin" aria-hidden />
            ) : (
              <Plus className="size-5" aria-hidden />
            )}
          </button>

          <label className="sr-only" htmlFor="chat-input">
            پیام
          </label>
          <textarea
            id="chat-input"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onKeyDown={handleKeyDown}
            rows={1}
            disabled={disabled}
            placeholder={
              disabled && disabledHint
                ? disabledHint
                : listening
                  ? "در حال شنیدن…"
                  : (placeholder ??
                    (shopMode
                      ? "چه محصولی می‌خواهید؟ تا چه قیمتی؟"
                      : "پیام خود را بنویسید…"))
            }
            className="flex-1 max-h-40 min-h-[2.75rem] resize-none bg-transparent px-1 py-2 text-sm text-[var(--chat-text)] placeholder:text-[var(--chat-muted)] outline-none"
          />

          <button
            type="button"
            disabled={disabled || !speechSupported}
            onClick={toggleListening}
            aria-label={listening ? "توقف ضبط صدا" : "ورودی صوتی"}
            aria-pressed={listening}
            title={
              speechSupported
                ? listening
                  ? "توقف"
                  : "صحبت کنید"
                : "مرورگر شما ورودی صوتی را پشتیبانی نمی‌کند"
            }
            className={`shrink-0 size-11 rounded-xl border cursor-pointer inline-flex items-center justify-center transition-colors disabled:opacity-40 ${
              listening
                ? "border-red-500/50 bg-red-500/15 text-red-400"
                : "border-[var(--chat-border)] text-[var(--chat-muted)] hover:text-[var(--chat-text)] hover:bg-[var(--chat-surface-hover)]"
            }`}
          >
            {listening ? (
              <MicOff className="size-5" aria-hidden />
            ) : (
              <Mic className="size-5" aria-hidden />
            )}
          </button>

          <button
            type="submit"
            disabled={sending || !canSend || disabled}
            aria-label="ارسال"
            className="shrink-0 size-11 rounded-xl bg-[var(--chat-accent)] text-white cursor-pointer transition-colors duration-200 hover:bg-[var(--chat-accent-hover)] disabled:opacity-40 disabled:cursor-not-allowed inline-flex items-center justify-center"
          >
            {sending ? (
              <Loader2 className="size-5 animate-spin" aria-hidden />
            ) : (
              <Send className="size-5" aria-hidden />
            )}
          </button>
        </div>

        {(attachError || listening) && (
          <p
            className={`text-center text-[11px] mt-2 ${attachError ? "text-red-400" : "text-[var(--chat-muted)]"}`}
            role={attachError ? "alert" : "status"}
          >
            {attachError ??
              (listening
                ? "میکروفون روشن است — پس از پایان صحبت متن در باکس ظاهر می‌شود"
                : null)}
          </p>
        )}

        <p className="text-center text-[11px] text-[var(--chat-muted)] mt-2">
          {footerHint ??
            (shopMode
              ? "نتایج از فروشگاه‌های متصل است؛ قیمت نهایی را در سایت فروشنده ببینید."
              : "پاسخ‌ها توسط هوش مصنوعی تولید می‌شوند. برای تصمیم‌های مهم منابع را بررسی کنید.")}
        </p>
      </form>
    </div>
  );
}