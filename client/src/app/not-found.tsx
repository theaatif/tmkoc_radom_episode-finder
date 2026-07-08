import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="relative flex flex-col items-center justify-center min-h-screen bg-canvas px-6 text-center overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0 z-0">
        <Image
          src="/images/angry-jetha.png"
          alt="Angry Jetha Background"
          fill
          sizes="100vw"
          className="object-cover opacity-90 select-none pointer-events-none"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-canvas via-canvas/80 to-canvas" />
      </div>

      <span className="relative z-10 text-6xl font-black text-brand-coral/20 select-none">404</span>
      <p className="relative z-10 text-xl font-semibold text-ink mt-4">{`\u201cakal hai ki nhi...satvi fail\u201d`}</p>
      <h2 className="relative z-10 text-xl font-bold text-ink mt-4">Page Not Found</h2>
      <p className="relative z-10 text-sm text-muted-text mt-2 max-w-sm">
        The page you are looking for doesn&apos;t exist or has been moved.
      </p>
      <Link href="/" className="relative z-10">
        <Button variant="cyan" className="mt-6 px-8">
          Go Home
        </Button>
      </Link>
    </div>
  );
}
