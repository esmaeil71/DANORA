import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4 px-4 text-center">
      <h1 className="text-2xl font-semibold">صفحه پیدا نشد</h1>
      <Link href="/" className="text-primary hover:underline">
        بازگشت به خانه
      </Link>
    </div>
  );
}