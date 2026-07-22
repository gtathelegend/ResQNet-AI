"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sun,
  Moon,
  Bell,
  Menu,
  X,
  ShieldAlert,
  User,
  LogOut,
} from "lucide-react";
import { useTheme } from "@/hooks/use-theme";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface NavItem {
  label: string;
  href: string;
}

const publicNavItems: NavItem[] = [
  { label: "Mission", href: "/#mission" },
  { label: "How It Works", href: "/#how-it-works" },
  { label: "SDG Goals", href: "/#sdgs" },
  { label: "Features", href: "/#features" },
];

const dashboardNavItems: NavItem[] = [
  { label: "Dashboard", href: "/dashboard" },
  { label: "Incidents", href: "/dashboard#incidents" },
  { label: "Resources", href: "/dashboard#resources" },
  { label: "Deployments", href: "/dashboard#deployments" },
];

export function Navbar() {
  const { theme, toggleTheme } = useTheme();
  const { user, role, isAuthenticated, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  // Determine active navigation links based on routing context
  const isDashboardRoute =
    pathname?.startsWith("/dashboard") || pathname?.startsWith("/profile");
  const navItems =
    isDashboardRoute && isAuthenticated ? dashboardNavItems : publicNavItems;

  const getRoleBadge = (userRole: string | null) => {
    switch (userRole) {
      case "authority":
        return (
          <Badge variant="destructive" className="h-4 px-1.5 py-0 text-[10px]">
            HQ
          </Badge>
        );
      case "volunteer":
        return (
          <Badge variant="warning" className="h-4 px-1.5 py-0 text-[10px]">
            Volunteer
          </Badge>
        );
      case "citizen":
        return (
          <Badge variant="success" className="h-4 px-1.5 py-0 text-[10px]">
            Citizen
          </Badge>
        );
      default:
        return null;
    }
  };

  return (
    <header className="border-border bg-card/80 sticky top-0 z-40 w-full border-b backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Logo Section */}
        <div className="flex items-center gap-2">
          <Link
            href="/"
            className="flex items-center gap-2 transition-opacity hover:opacity-90"
          >
            <div className="bg-primary shadow-primary/30 flex size-10 items-center justify-center rounded-lg text-white shadow-md">
              <ShieldAlert className="size-5" />
            </div>
            <span className="text-foreground text-xl font-bold tracking-tight sm:block">
              ResQNet <span className="text-primary">AI</span>
            </span>
          </Link>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden items-center gap-1 md:flex">
          {navItems.map((item) => {
            // Filter deployments for citizen role
            if (item.label === "Deployments" && role === "citizen") return null;

            return (
              <Link
                key={item.label}
                href={item.href}
                className="text-muted-foreground hover:text-foreground hover:bg-muted/50 rounded-md px-4 py-2 text-sm font-medium transition-all"
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          {isDashboardRoute && isAuthenticated && (
            <>
              {/* Notifications Button */}
              <Button
                variant="ghost"
                size="icon"
                className="text-muted-foreground hover:text-foreground relative"
              >
                <Bell className="size-4" />
                <span className="bg-accent absolute top-1.5 right-1.5 size-2 rounded-full" />
              </Button>
            </>
          )}

          {/* Theme Toggle Button */}
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleTheme}
            className="text-muted-foreground hover:text-foreground"
          >
            {theme === "dark" ? (
              <Sun className="size-4" />
            ) : (
              <Moon className="size-4" />
            )}
          </Button>

          {isAuthenticated && user ? (
            <>
              {/* Profile Link Button */}
              <Link href="/profile" passHref>
                <Button
                  variant="outline"
                  size="sm"
                  className="border-border/80 hover:bg-muted/50 hidden cursor-pointer items-center gap-2 sm:flex"
                >
                  <User className="size-3.5" />
                  <span className="font-semibold">{user.fullName}</span>
                  {getRoleBadge(role)}
                </Button>
              </Link>

              {/* If on marketing page, show quick links back to app */}
              {!isDashboardRoute && (
                <Link href="/dashboard" passHref>
                  <Button
                    variant="default"
                    size="sm"
                    className="hidden sm:flex"
                  >
                    Go to Dashboard
                  </Button>
                </Link>
              )}

              {/* Sign Out Button (Dashboard only) */}
              {isDashboardRoute && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={logout}
                  className="text-muted-foreground hover:text-destructive hidden sm:flex"
                  title="Sign Out"
                >
                  <LogOut className="size-4" />
                </Button>
              )}
            </>
          ) : (
            <Link href="/login" passHref>
              <Button variant="default" size="sm">
                Sign In
              </Button>
            </Link>
          )}

          {/* Mobile Menu Toggle */}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="text-muted-foreground hover:text-foreground md:hidden"
          >
            {mobileMenuOpen ? (
              <X className="size-5" />
            ) : (
              <Menu className="size-5" />
            )}
          </Button>
        </div>
      </div>

      {/* Mobile Drawer menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            className="border-border bg-card border-t shadow-lg md:hidden"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
          >
            <div className="space-y-1 px-4 py-3 pb-4">
              {navItems.map((item) => {
                if (item.label === "Deployments" && role === "citizen")
                  return null;

                return (
                  <Link
                    key={item.label}
                    href={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className="text-muted-foreground hover:text-foreground hover:bg-muted/50 block rounded-md px-3 py-2 text-base font-medium transition-all"
                  >
                    {item.label}
                  </Link>
                );
              })}
              {isAuthenticated && user ? (
                <div className="border-border mt-4 flex flex-col gap-3 border-t pt-4">
                  <div className="flex items-center justify-between px-3">
                    <div className="flex flex-col">
                      <span className="text-foreground text-sm font-semibold">
                        {user.fullName}
                      </span>
                      <span className="text-muted-foreground text-xs">
                        {user.email}
                      </span>
                    </div>
                    {getRoleBadge(role)}
                  </div>
                  <div className="flex flex-col gap-2">
                    {!isDashboardRoute && (
                      <Link
                        href="/dashboard"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        <Button variant="default" size="sm" className="w-full">
                          Go to Dashboard
                        </Button>
                      </Link>
                    )}
                    <div className="flex gap-2">
                      <Link
                        href="/profile"
                        className="flex-1"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        <Button
                          variant="outline"
                          size="sm"
                          className="w-full gap-2"
                        >
                          <User className="size-3.5" />
                          View Profile
                        </Button>
                      </Link>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => {
                          setMobileMenuOpen(false);
                          logout();
                        }}
                        className="gap-2"
                      >
                        <LogOut className="size-3.5" />
                        Sign Out
                      </Button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="border-border mt-4 border-t pt-4">
                  <Link href="/login" onClick={() => setMobileMenuOpen(false)}>
                    <Button variant="default" className="w-full">
                      Sign In to Platform
                    </Button>
                  </Link>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}

export default Navbar;
