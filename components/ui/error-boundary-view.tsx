"use client";

import { motion } from "framer-motion";
import { AlertTriangle, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ErrorBoundaryViewProps {
  error: Error | { message?: string };
  reset: () => void;
  title?: string;
}

export function ErrorBoundaryView({
  error,
  reset,
  title = "Something went wrong",
}: ErrorBoundaryViewProps) {
  const errorMessage =
    error instanceof Error
      ? error.message
      : error?.message || "An unexpected error occurred.";

  return (
    <motion.div
      className="border-destructive/20 bg-destructive/5 flex flex-col items-center justify-center rounded-xl border p-10 text-center shadow-sm backdrop-blur-sm"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
    >
      {/* Icon Container with danger color pulsing */}
      <motion.div
        className="bg-destructive/10 text-destructive flex size-14 items-center justify-center rounded-full"
        animate={{ scale: [1, 1.04, 1] }}
        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
      >
        <AlertTriangle className="size-7" />
      </motion.div>

      {/* Error Texts */}
      <h3 className="text-foreground mt-6 text-lg font-semibold tracking-tight">
        {title}
      </h3>
      <p className="text-muted-foreground mt-2 max-w-md text-sm">
        {errorMessage}
      </p>

      {/* Diagnostic Message */}
      <div className="bg-muted/50 text-muted-foreground mt-4 max-w-sm truncate rounded px-3 py-1.5 font-mono text-xs select-all">
        Error Log: {errorMessage}
      </div>

      {/* Retry CTA */}
      <motion.div className="mt-6" whileHover={{ y: -1 }} whileTap={{ y: 0 }}>
        <Button
          onClick={reset}
          variant="destructive"
          size="sm"
          className="gap-2"
        >
          <RotateCcw className="size-4" />
          Try Again
        </Button>
      </motion.div>
    </motion.div>
  );
}

export default ErrorBoundaryView;
