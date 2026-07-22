import React from "react";
import Link from "next/link";
import { ShieldCheck } from "lucide-react";

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-border bg-card mt-auto w-full border-t py-6">
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-4 sm:px-6 md:flex-row lg:px-8">
        {/* Left column - Copyright */}
        <div className="flex flex-col items-center gap-2 md:items-start">
          <p className="text-muted-foreground text-sm">
            &copy; {currentYear} ResQNet AI. Enterprise Disaster Response &
            Resource Management.
          </p>
        </div>

        {/* Center column - Status badge */}
        <div className="border-accent/20 bg-accent/5 text-accent flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-medium">
          <ShieldCheck className="size-3.5" />
          <span>ResQNet Systems: Online</span>
        </div>

        {/* Right column - Footer Navigation */}
        <nav className="text-muted-foreground flex gap-4 text-sm">
          <Link
            href="#terms"
            className="hover:text-foreground transition-colors"
          >
            Terms
          </Link>
          <Link
            href="#privacy"
            className="hover:text-foreground transition-colors"
          >
            Privacy
          </Link>
          <Link
            href="#support"
            className="hover:text-foreground transition-colors"
          >
            Support Center
          </Link>
        </nav>
      </div>
    </footer>
  );
}

export default Footer;
