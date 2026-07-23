import React from "react";
import Link from "next/link";
import { ShieldCheck } from "lucide-react";

function GithubIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
      <path d="M9 18c-4.51 2-5-2-7-2" />
    </svg>
  );
}

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-[#E2E8F0] bg-white w-full py-12">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="flex flex-col gap-6 md:flex-row md:justify-between md:items-start">
          {/* Logo & Tagline */}
          <div className="space-y-3 max-w-sm">
            <div className="flex items-center gap-2">
              <div className="bg-[#2563EB] flex size-8 items-center justify-center rounded-lg text-white">
                <ShieldCheck className="size-4" />
              </div>
              <span className="text-[#0F172A] text-lg font-bold tracking-tight">
                ResQNet <span className="text-[#2563EB]">AI</span>
              </span>
            </div>
            <p className="text-xs text-[#475569] font-medium leading-relaxed">
              AI-Powered Disaster Response & Resource Coordination platform designed to support incident prioritization, relief allocation, and emergency coordination.
            </p>
            <p className="text-[10px] text-[#64748B] font-semibold tracking-wide uppercase">
              Developed as a social-impact AI project.
            </p>
          </div>

          {/* Quick Links */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-8">
            <div className="space-y-3">
              <span className="text-[#0F172A] text-xs font-bold uppercase tracking-wider block">Overview</span>
              <ul className="space-y-2 text-xs font-semibold text-[#475569]">
                <li><Link href="/#problem" className="hover:text-[#0F172A] transition-colors">The Challenge</Link></li>
                <li><Link href="/#solution" className="hover:text-[#0F172A] transition-colors">Our Solution</Link></li>
                <li><Link href="/#how-it-works" className="hover:text-[#0F172A] transition-colors">How It Works</Link></li>
              </ul>
            </div>

            <div className="space-y-3">
              <span className="text-[#0F172A] text-xs font-bold uppercase tracking-wider block">System</span>
              <ul className="space-y-2 text-xs font-semibold text-[#475569]">
                <li><Link href="/#ai-system" className="hover:text-[#0F172A] transition-colors">AI Coordination</Link></li>
                <li><Link href="/#features" className="hover:text-[#0F172A] transition-colors">Capabilities</Link></li>
                <li><Link href="/#technology" className="hover:text-[#0F172A] transition-colors">Tech Stack</Link></li>
              </ul>
            </div>

            <div className="space-y-3 col-span-2 sm:col-span-1">
              <span className="text-[#0F172A] text-xs font-bold uppercase tracking-wider block">External</span>
              <ul className="space-y-2 text-xs font-semibold text-[#475569]">
                <li>
                  <a 
                    href="https://sdgs.un.org/goals" 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="hover:text-[#0F172A] transition-colors"
                  >
                    UN SDG Alignment
                  </a>
                </li>
                <li>
                  <a 
                    href="https://github.com/gtathelegend/ResQNet-AI" 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="flex items-center gap-1 hover:text-[#0F172A] transition-colors"
                  >
                    <GithubIcon className="size-3" />
                    GitHub Source
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-[#E2E8F0] pt-6 flex flex-col items-center justify-between gap-4 sm:flex-row">
          <p className="text-xs text-[#64748B] font-semibold">
            &copy; {currentYear} ResQNet AI. Designed for human-in-the-loop decision support.
          </p>

          <div className="border-[#16A34A]/20 bg-[#F0FDF4] text-[#16A34A] flex items-center gap-2 rounded-full border px-3 py-1 text-[10px] font-bold uppercase tracking-wide">
            <ShieldCheck className="size-3.5" />
            <span>Operational Integrity Verified</span>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
