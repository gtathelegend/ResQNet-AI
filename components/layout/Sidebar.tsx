"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import {
  LayoutDashboard,
  AlertTriangle,
  Package,
  Activity,
  Settings,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  LucideIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface SidebarItem {
  label: string;
  href: string;
  icon: LucideIcon;
}

const sidebarItems: SidebarItem[] = [
  { label: "Dashboard", href: "/", icon: LayoutDashboard },
  { label: "Incidents", href: "#incidents", icon: AlertTriangle },
  { label: "Resources", href: "#resources", icon: Package },
  { label: "Deployments", href: "#deployments", icon: Activity },
  { label: "Settings", href: "#settings", icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <motion.aside
      className={cn(
        "border-border bg-card sticky top-16 left-0 z-30 flex h-[calc(100vh-4rem)] flex-col border-r transition-all duration-300",
        isCollapsed ? "w-16" : "w-64"
      )}
      layout="position"
    >
      {/* Sidebar Items */}
      <nav className="flex-1 space-y-1 p-3">
        {sidebarItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link key={item.label} href={item.href} passHref>
              <span
                className={cn(
                  "group hover:bg-muted/50 hover:text-foreground relative mb-1 flex cursor-pointer items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all",
                  isActive
                    ? "bg-primary/10 text-primary hover:bg-primary/15"
                    : "text-muted-foreground"
                )}
              >
                {/* Active Indicator Line */}
                {isActive && (
                  <motion.div
                    className="bg-primary absolute top-1/4 bottom-1/4 left-0 w-1 rounded"
                    layoutId="activeIndicator"
                    transition={{ type: "spring", stiffness: 380, damping: 30 }}
                  />
                )}

                <item.icon
                  className={cn(
                    "size-5 shrink-0",
                    isActive
                      ? "text-primary"
                      : "text-muted-foreground group-hover:text-foreground"
                  )}
                />

                {!isCollapsed && (
                  <motion.span
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -10 }}
                    transition={{ duration: 0.15 }}
                  >
                    {item.label}
                  </motion.span>
                )}
              </span>
            </Link>
          );
        })}
      </nav>

      {/* Collapse Toggle Footer */}
      <div className="border-border flex flex-col gap-3 border-t p-3">
        {!isCollapsed && (
          <div className="text-muted-foreground flex items-center gap-2 px-2 text-xs font-semibold">
            <ShieldCheck className="text-accent size-4" />
            <span>HQ Mode Active</span>
          </div>
        )}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="text-muted-foreground hover:text-foreground hover:bg-muted flex h-8 w-full items-center justify-center"
        >
          {isCollapsed ? (
            <ChevronRight className="size-4" />
          ) : (
            <ChevronLeft className="size-4" />
          )}
        </Button>
      </div>
    </motion.aside>
  );
}

export default Sidebar;
