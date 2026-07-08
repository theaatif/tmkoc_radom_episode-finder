import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-canvas px-6 text-center">
      <span className="text-6xl font-black text-brand-coral/20 select-none">404</span>
      <h2 className="text-xl font-bold text-ink mt-4">Page Not Found</h2>
      <p className="text-sm text-muted-text mt-2 max-w-sm">
        The page you are looking for doesn&apos;t exist or has been moved.
      </p>
      <Link href="/">
        <Button variant="cyan" className="mt-6 px-8">
          Go Home
        </Button>
      </Link>
    </div>
  );
}
