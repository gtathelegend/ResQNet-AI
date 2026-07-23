"use client";

import React, { useCallback, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  AlertTriangle,
  BarChart3,
  LayoutDashboard,
  Map,
  Package,
  Search,
  User,
  Users,
} from "lucide-react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

interface CommandItem {
  id: string;
  title: string;
  subtitle: string;
  category: "navigation" | "incident" | "resource" | "volunteer";
  icon: React.ReactNode;
  href?: string;
  action?: () => void;
  keywords: string[];
}

// Mock data aligned with application types
const MOCK_INCIDENTS: CommandItem[] = [
  {
    id: "inc-1",
    title: "Flooding - Sector A",
    subtitle: "High severity · 120 people affected",
    category: "incident",
    icon: <AlertTriangle className="text-destructive size-4" />,
    href: "/dashboard/incidents/inc-1",
    keywords: ["flood", "flooding", "sector a", "water"],
  },
  {
    id: "inc-2",
    title: "Fire - Industrial Zone",
    subtitle: "Critical severity · Medical emergency",
    category: "incident",
    icon: <AlertTriangle className="text-destructive size-4" />,
    href: "/dashboard/incidents/inc-2",
    keywords: ["fire", "industrial", "burn", "smoke"],
  },
  {
    id: "inc-3",
    title: "Earthquake - Downtown",
    subtitle: "Medium severity · Structural damage",
    category: "incident",
    icon: <AlertTriangle className="text-warning size-4" />,
    href: "/dashboard/incidents/inc-3",
    keywords: ["earthquake", "downtown", "quake", "structural"],
  },
  {
    id: "inc-4",
    title: "Storm - Eastern Perimeter",
    subtitle: "High severity · Power outage",
    category: "incident",
    icon: <AlertTriangle className="text-destructive size-4" />,
    href: "/dashboard/incidents/inc-4",
    keywords: ["storm", "eastern", "wind", "power"],
  },
];

const MOCK_RESOURCES: CommandItem[] = [
  {
    id: "res-1",
    title: "Emergency Food Supplies",
    subtitle: "Supplies · 500 units available · Depot Alpha",
    category: "resource",
    icon: <Package className="text-success size-4" />,
    href: "/dashboard/resources",
    keywords: ["food", "supplies", "depot alpha", "emergency"],
  },
  {
    id: "res-2",
    title: "Medical Kits",
    subtitle: "Supplies · 120 kits available · Depot Beta",
    category: "resource",
    icon: <Package className="text-success size-4" />,
    href: "/dashboard/resources",
    keywords: ["medical", "kits", "health", "depot beta"],
  },
  {
    id: "res-3",
    title: "Rescue Boats",
    subtitle: "Vehicles · 8 units available · Depot Alpha",
    category: "resource",
    icon: <Package className="text-success size-4" />,
    href: "/dashboard/resources",
    keywords: ["boat", "rescue", "water", "vehicle"],
  },
  {
    id: "res-4",
    title: "Search & Rescue Teams",
    subtitle: "Personnel · 15 teams on standby",
    category: "resource",
    icon: <Package className="text-success size-4" />,
    href: "/dashboard/resources",
    keywords: ["team", "personnel", "search", "rescue"],
  },
];

const MOCK_VOLUNTEERS: CommandItem[] = [
  {
    id: "vol-1",
    title: "Sarah Chen",
    subtitle: "Medical · On-duty · Sector B",
    category: "volunteer",
    icon: <Users className="text-primary size-4" />,
    href: "/dashboard/volunteers",
    keywords: ["sarah", "chen", "medical", "sector b"],
  },
  {
    id: "vol-2",
    title: "Mike Ross",
    subtitle: "Search & Rescue · Assigned · Industrial Zone",
    category: "volunteer",
    icon: <Users className="text-primary size-4" />,
    href: "/dashboard/volunteers",
    keywords: ["mike", "ross", "search", "rescue"],
  },
  {
    id: "vol-3",
    title: "Aisha Patel",
    subtitle: "Logistics · On-duty · Depot Alpha",
    category: "volunteer",
    icon: <Users className="text-primary size-4" />,
    href: "/dashboard/volunteers",
    keywords: ["aisha", "patel", "logistics", "depot"],
  },
];

const NAVIGATION_ITEMS: CommandItem[] = [
  {
    id: "nav-dashboard",
    title: "Dashboard",
    subtitle: "Go to main dashboard",
    category: "navigation",
    icon: <LayoutDashboard className="text-muted-foreground size-4" />,
    href: "/dashboard",
    keywords: ["dashboard", "home", "main"],
  },
  {
    id: "nav-map",
    title: "Live Map",
    subtitle: "View real-time incident map",
    category: "navigation",
    icon: <Map className="text-muted-foreground size-4" />,
    href: "/dashboard/map",
    keywords: ["map", "live", "location", "geo"],
  },
  {
    id: "nav-analytics",
    title: "Analytics",
    subtitle: "View response analytics and reports",
    category: "navigation",
    icon: <BarChart3 className="text-muted-foreground size-4" />,
    href: "/dashboard/analytics",
    keywords: ["analytics", "reports", "charts", "stats"],
  },
  {
    id: "nav-resources",
    title: "Resource Center",
    subtitle: "Manage inventory and allocations",
    category: "navigation",
    icon: <Package className="text-muted-foreground size-4" />,
    href: "/dashboard/resources",
    keywords: ["resources", "inventory", "supplies", "stock"],
  },
  {
    id: "nav-volunteers",
    title: "Volunteers",
    subtitle: "Coordinate volunteer assignments",
    category: "navigation",
    icon: <Users className="text-muted-foreground size-4" />,
    href: "/dashboard/volunteers",
    keywords: ["volunteers", "people", "team", "dispatch"],
  },
  {
    id: "nav-profile",
    title: "Profile",
    subtitle: "View and edit your profile",
    category: "navigation",
    icon: <User className="text-muted-foreground size-4" />,
    href: "/profile",
    keywords: ["profile", "account", "settings", "user"],
  },
];

const ALL_COMMANDS: CommandItem[] = [
  ...NAVIGATION_ITEMS,
  ...MOCK_INCIDENTS,
  ...MOCK_RESOURCES,
  ...MOCK_VOLUNTEERS,
];

const CATEGORY_LABELS: Record<string, string> = {
  navigation: "Navigation",
  incident: "Incidents",
  resource: "Resources",
  volunteer: "Volunteers",
};

const CATEGORY_ORDER = ["navigation", "incident", "resource", "volunteer"];

export function CommandPalette() {
  const router = useRouter();
  const [open, setOpenState] = useState(false);
  const [query, setQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const hasOpenedRef = useRef(false);

  const setOpen = useCallback(
    (value: boolean) => {
      setOpenState(value);
      if (value) {
        setQuery("");
        setSelectedIndex(0);
        hasOpenedRef.current = true;
        requestAnimationFrame(() => {
          inputRef.current?.focus();
        });
      }
    },
    [setOpenState, setQuery, setSelectedIndex]
  );

  // Toggle on Cmd+K / Ctrl+K
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setOpenState((prev) => {
          const next = !prev;
          if (next) {
            setQuery("");
            setSelectedIndex(0);
            requestAnimationFrame(() => {
              inputRef.current?.focus();
            });
          }
          return next;
        });
      }
      if (e.key === "Escape") {
        setOpenState(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Filter commands based on query
  const filtered = useMemo(() => {
    if (!query.trim()) return ALL_COMMANDS;
    const q = query.toLowerCase();
    return ALL_COMMANDS.filter(
      (item) =>
        item.title.toLowerCase().includes(q) ||
        item.subtitle.toLowerCase().includes(q) ||
        item.keywords.some((kw) => kw.toLowerCase().includes(q))
    );
  }, [query]);

  // Group by category
  const grouped = useMemo(() => {
    const groups: Record<string, CommandItem[]> = {};
    for (const item of filtered) {
      if (!groups[item.category]) groups[item.category] = [];
      groups[item.category].push(item);
    }
    return groups;
  }, [filtered]);

  // Flat list for keyboard navigation
  const flatItems = useMemo(() => {
    const items: CommandItem[] = [];
    for (const cat of CATEGORY_ORDER) {
      if (grouped[cat]) {
        items.push(...grouped[cat]);
      }
    }
    return items;
  }, [grouped]);

  // Clamp selection during render to avoid setState in effect
  const validSelectedIndex = Math.min(
    selectedIndex,
    Math.max(0, flatItems.length - 1)
  );

  const handleSelect = (item: CommandItem) => {
    setOpen(false);
    setQuery("");
    if (item.href) {
      router.push(item.href);
    } else if (item.action) {
      item.action();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % flatItems.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex(
        (prev) => (prev - 1 + flatItems.length) % flatItems.length
      );
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (flatItems[validSelectedIndex]) {
        handleSelect(flatItems[validSelectedIndex]);
      }
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent
        className="max-w-lg gap-0 overflow-hidden p-0"
        showCloseButton={false}
        onKeyDown={handleKeyDown}
      >
        <DialogTitle className="sr-only">Command Palette</DialogTitle>
        {/* Search Input */}
        <div className="border-border flex items-center gap-3 border-b px-4 py-3">
          <Search className="text-muted-foreground size-5 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            placeholder="Search incidents, resources, volunteers, or navigate..."
            className="placeholder:text-muted-foreground flex-1 bg-transparent text-sm outline-none"
            aria-label="Command palette search"
          />
          <kbd className="bg-muted text-muted-foreground hidden rounded px-1.5 py-0.5 text-xs font-medium md:inline-block">
            ESC
          </kbd>
        </div>

        {/* Results */}
        <div className="max-h-[60vh] overflow-y-auto py-2">
          {flatItems.length === 0 ? (
            <div className="text-muted-foreground px-4 py-8 text-center text-sm">
              No results found for &quot;{query}&quot;
            </div>
          ) : (
            CATEGORY_ORDER.map((cat) => {
              const items = grouped[cat];
              if (!items || items.length === 0) return null;

              return (
                <div key={cat} className="px-2">
                  <div className="text-muted-foreground px-2 py-1.5 text-xs font-semibold tracking-wider uppercase">
                    {CATEGORY_LABELS[cat]}
                  </div>
                  {items.map((item) => {
                    const globalIndex = flatItems.findIndex(
                      (i) => i.id === item.id
                    );
                    const isSelected = globalIndex === selectedIndex;

                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => handleSelect(item)}
                        onMouseEnter={() => setSelectedIndex(globalIndex)}
                        className={cn(
                          "flex w-full items-center gap-3 rounded-lg px-2 py-2 text-left text-sm transition-colors",
                          isSelected
                            ? "bg-primary text-primary-foreground"
                            : "hover:bg-muted"
                        )}
                      >
                        <span
                          className={cn(
                            "flex size-8 shrink-0 items-center justify-center rounded-md",
                            isSelected ? "bg-primary-foreground/20" : "bg-muted"
                          )}
                        >
                          {item.icon}
                        </span>
                        <div className="min-w-0 flex-1">
                          <div className="truncate font-medium">
                            {item.title}
                          </div>
                          <div
                            className={cn(
                              "truncate text-xs",
                              isSelected
                                ? "text-primary-foreground/80"
                                : "text-muted-foreground"
                            )}
                          >
                            {item.subtitle}
                          </div>
                        </div>
                        {item.category === "navigation" && item.href && (
                          <kbd
                            className={cn(
                              "shrink-0 rounded px-1.5 py-0.5 text-xs",
                              isSelected
                                ? "bg-primary-foreground/20 text-primary-foreground"
                                : "bg-muted text-muted-foreground"
                            )}
                          >
                            ↵
                          </kbd>
                        )}
                      </button>
                    );
                  })}
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="border-border bg-muted/50 text-muted-foreground flex items-center justify-between border-t px-4 py-2 text-xs">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1">
              <kbd className="bg-background ring-border rounded px-1 py-0.5 ring-1 ring-inset">
                ↑
              </kbd>
              <kbd className="bg-background ring-border rounded px-1 py-0.5 ring-1 ring-inset">
                ↓
              </kbd>
              <span>to navigate</span>
            </span>
            <span className="flex items-center gap-1">
              <kbd className="bg-background ring-border rounded px-1 py-0.5 ring-1 ring-inset">
                ↵
              </kbd>
              <span>to select</span>
            </span>
          </div>
          <span>{flatItems.length} results</span>
        </div>
      </DialogContent>
    </Dialog>
  );
}
