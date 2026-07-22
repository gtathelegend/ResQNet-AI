"use client";

import { motion } from "framer-motion";

export function LoadingSpinner({
  className = "size-8",
}: {
  className?: string;
}) {
  return (
    <div className={`relative flex items-center justify-center ${className}`}>
      {/* Outer spinning ring */}
      <motion.div
        className="border-primary/20 border-t-primary absolute inset-0 rounded-full border-2"
        animate={{ rotate: 360 }}
        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
      />
      {/* Inner pulsing pulse */}
      <motion.div
        className="bg-primary/40 size-1/2 rounded-full"
        animate={{ scale: [0.8, 1.2, 0.8] }}
        transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
      />
    </div>
  );
}

export function LoadingCard() {
  return (
    <div className="border-border bg-card relative overflow-hidden rounded-xl border p-6 shadow-sm">
      <div className="flex items-center gap-4">
        {/* Skeleton Avatar */}
        <div className="bg-muted size-12 animate-pulse rounded-full" />
        <div className="flex-1 space-y-2">
          {/* Skeleton Title */}
          <div className="bg-muted h-4 w-1/3 animate-pulse rounded" />
          {/* Skeleton Subtitle */}
          <div className="bg-muted h-3 w-1/2 animate-pulse rounded" />
        </div>
      </div>
      <div className="mt-6 space-y-3">
        {/* Skeleton Content Lines */}
        <div className="bg-muted h-3.5 w-full animate-pulse rounded" />
        <div className="bg-muted h-3.5 w-5/6 animate-pulse rounded" />
        <div className="bg-muted h-3.5 w-2/3 animate-pulse rounded" />
      </div>
    </div>
  );
}

export function LoadingSkeleton({ rows = 3 }: { rows?: number }) {
  return (
    <div className="w-full space-y-4">
      {Array.from({ length: rows }).map((_, i) => (
        <div
          key={i}
          className="border-border/40 flex items-center space-x-4 rounded-lg border p-4"
        >
          <div className="bg-muted size-10 animate-pulse rounded" />
          <div className="flex-1 space-y-2">
            <div className="bg-muted h-3 w-1/4 animate-pulse rounded" />
            <div className="bg-muted h-3.5 w-3/4 animate-pulse rounded" />
          </div>
          <div className="bg-muted h-6 w-16 animate-pulse rounded" />
        </div>
      ))}
    </div>
  );
}

export default function LoadingPage() {
  return (
    <div className="flex min-h-[50vh] w-full flex-col items-center justify-center gap-4 p-8">
      <LoadingSpinner className="size-12" />
      <motion.p
        className="text-muted-foreground text-sm font-medium"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        Loading ResQNet intelligence platform...
      </motion.p>
    </div>
  );
}
