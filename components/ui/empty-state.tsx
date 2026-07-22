"use client";

import { motion } from "framer-motion";
import { LucideIcon, Info } from "lucide-react";
import { Button } from "@/components/ui/button";

interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
}

export function EmptyState({
  icon: Icon = Info,
  title,
  description,
  actionLabel,
  onAction,
}: EmptyStateProps) {
  return (
    <motion.div
      className="border-border bg-card/50 flex flex-col items-center justify-center rounded-xl border border-dashed p-12 text-center shadow-sm backdrop-blur-sm"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      {/* Icon Container with subtle animation */}
      <motion.div
        className="bg-primary/10 text-primary flex size-14 items-center justify-center rounded-full"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <Icon className="size-7" />
      </motion.div>

      {/* Text Info */}
      <h3 className="text-foreground mt-6 text-lg font-semibold tracking-tight">
        {title}
      </h3>
      <p className="text-muted-foreground mt-2 max-w-sm text-sm">
        {description}
      </p>

      {/* Optional CTA Action */}
      {actionLabel && onAction && (
        <motion.div className="mt-6" whileHover={{ y: -1 }} whileTap={{ y: 0 }}>
          <Button onClick={onAction} variant="default" size="sm">
            {actionLabel}
          </Button>
        </motion.div>
      )}
    </motion.div>
  );
}

export default EmptyState;
