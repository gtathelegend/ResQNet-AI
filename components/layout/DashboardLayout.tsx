"use client";

import React from "react";
import { motion } from "framer-motion";
import { Navbar } from "./Navbar";
import { Sidebar } from "./Sidebar";
import { Footer } from "./Footer";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  return (
    <div className="bg-background text-foreground flex min-h-screen flex-col transition-colors duration-200">
      {/* Top sticky Navbar */}
      <Navbar />

      {/* Main panel: Sidebar + Content */}
      <div className="flex flex-1">
        {/* Navigation Sidebar */}
        <Sidebar />

        {/* Content area */}
        <div className="flex flex-1 flex-col">
          <main className="mx-auto w-full max-w-7xl flex-1 p-6 md:p-8">
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, ease: "easeOut" }}
              className="space-y-6"
            >
              {children}
            </motion.div>
          </main>

          {/* Footer inside content panel to keep it scrollable/aligned */}
          <Footer />
        </div>
      </div>
    </div>
  );
}

export default DashboardLayout;
