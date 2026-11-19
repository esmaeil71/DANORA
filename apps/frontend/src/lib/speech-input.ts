export type SpeechEngineError =
  | "not-supported"
  | "insecure-context"
  | "mic-denied"
  | "mic-unavailable"
  | "network"
  | "no-speech"
  | "unknown";

export function speechRecognitionCtor():
  | (new () => SpeechRecognition)
  | undefined {
  if (typeof window === "undefined") return undefined;
  return window.SpeechRecognition ?? window.webkitSpeechRecognition;
}

export function isSecureSpeechContext(): boolean {
  if (typeof window === "undefined") return false;
  return window.isSecureContext;
}

export function speechErrorMessage(code: SpeechEngineError): string {
  switch (code) {
    case "not-supported":
      return "مرورگر شما ورودی صوتی را پشتیبانی نمی‌کند. از Chrome روی دسکتاپ استفاده کنید.";
    case "insecure-context":
      return "برای میکروفون باید سایت با HTTPS باز باشد (یا روی localhost).";
    case "mic-denied":
      return "دسترسی میکروفون مسدود است. در تنظیمات مرورگر برای این سایت اجازه دهید.";
    case "mic-unavailable":
      return "میکروفون پیدا نشد یا در برنامه دیگری در حال استفاده است.";
    case "network":
      return "سرویس گفتار مرورگر به سرور Google وصل می‌شود. VPN روشن کنید یا متن را تایپ کنید.";
    case "no-speech":
      return "صدایی شنیده نشد. میکروفون را چک کنید و دوباره نزدیک آن صحبت کنید.";
    default:
      return "تبدیل صدا به متن انجام نشد. مرورگر را عوض کنید یا دوباره امتحان کنید.";
  }
}

export function mapDomSpeechError(error: string): SpeechEngineError {
  switch (error) {
    case "not-allowed":
    case "service-not-allowed":
      return "mic-denied";
    case "audio-capture":
      return "mic-unavailable";
    case "network":
      return "network";
    case "no-speech":
      return "no-speech";
    case "aborted":
      return "unknown";
    default:
      return "unknown";
  }
}

export async function ensureMicPermission(): Promise<
  { ok: true } | { ok: false; code: SpeechEngineError }
> {
  if (!navigator.mediaDevices?.getUserMedia) {
    return { ok: false, code: "mic-unavailable" };
  }
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    stream.getTracks().forEach((t) => t.stop());
    return { ok: true };
  } catch (err) {
    const name = err instanceof DOMException ? err.name : "";
    if (name === "NotAllowedError" || name === "PermissionDeniedError") {
      return { ok: false, code: "mic-denied" };
    }
    return { ok: false, code: "mic-unavailable" };
  }
}

export function buildTranscriptFromEvent(event: SpeechRecognitionEvent): {
  finals: string;
  interim: string;
} {
  let finals = "";
  let interim = "";
  for (let i = event.resultIndex; i < event.results.length; i++) {
    const chunk = event.results[i][0]?.transcript ?? "";
    if (event.results[i].isFinal) finals += chunk;
    else interim += chunk;
  }
  return { finals, interim };
}