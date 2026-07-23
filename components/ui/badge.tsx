import { mergeProps } from "@base-ui/react/merge-props";
import { useRender } from "@base-ui/react/use-render";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "group/badge inline-flex h-5 w-fit shrink-0 items-center justify-center gap-1 overflow-hidden rounded-4xl border border-transparent px-2 py-0.5 text-xs font-medium whitespace-nowrap transition-all focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 has-data-[icon=inline-end]:pr-1.5 has-data-[icon=inline-start]:pl-1.5 aria-invalid:border-destructive aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 [&>svg]:pointer-events-none [&>svg]:size-3!",
  {
    variants: {
      variant: {
        default: "bg-[#2563EB] text-white",
        secondary:
          "bg-[#F1F5F9] text-[#475569] border border-[#E2E8F0]",
        destructive:
          "bg-[#FEF2F2] text-[#DC2626] border border-[#DC2626]/20",
        success:
          "bg-[#F0FDF4] text-[#16A34A] border border-[#16A34A]/20",
        warning:
          "bg-[#FFFBEB] text-[#D97706] border border-[#D97706]/20",
        info: "bg-[#EFF6FF] text-[#2563EB] border border-[#2563EB]/20",
        outline:
          "border-[#CBD5E1] text-[#475569] bg-white",
        ghost:
          "hover:bg-[#F1F5F9] hover:text-[#0F172A]",
        link: "text-[#2563EB] underline-offset-4 hover:underline",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

function Badge({
  className,
  variant = "default",
  render,
  ...props
}: useRender.ComponentProps<"span"> & VariantProps<typeof badgeVariants>) {
  return useRender({
    defaultTagName: "span",
    props: mergeProps<"span">(
      {
        className: cn(badgeVariants({ variant }), className),
      },
      props
    ),
    render,
    state: {
      slot: "badge",
      variant,
    },
  });
}

export { Badge, badgeVariants };
