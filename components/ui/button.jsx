import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva } from "class-variance-authority";

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  `
  inline-flex items-center justify-center gap-2 whitespace-nowrap
  rounded-md text-sm font-medium
  transition-all duration-200 ease-out
  disabled:pointer-events-none disabled:opacity-50
  [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4
  shrink-0 [&_svg]:shrink-0
  outline-none
  focus-visible:ring-2 focus-visible:ring-offset-2
  active:translate-y-[1px]
  `,
  {
    variants: {
      variant: {
        /* ===== PRIMARY ===== */
        default: `
        text-white
        bg-gradient-to-br from-indigo-500 via-violet-500 to-purple-600
        shadow-[0_6px_16px_rgba(99,102,241,0.45)]
        hover:shadow-[0_10px_28px_rgba(99,102,241,0.65)]
        hover:brightness-110
        focus-visible:ring-indigo-500
        `,

        /* ===== DESTRUCTIVE ===== */
        destructive: `
        text-white
        bg-gradient-to-br from-red-500 via-rose-500 to-pink-600
        shadow-[0_6px_16px_rgba(239,68,68,0.45)]
        hover:shadow-[0_10px_28px_rgba(239,68,68,0.65)]
        hover:brightness-110
        focus-visible:ring-red-500
        `,

        /* ===== OUTLINE (NO BG FILL) ===== */
        outline: `
        border border-slate-300
        bg-transparent
        text-slate-700
        shadow-[0_4px_12px_rgba(0,0,0,0.08)]
        hover:border-indigo-400
        hover:text-indigo-600
        hover:shadow-[0_6px_18px_rgba(99,102,241,0.35)]
        focus-visible:ring-indigo-400
        dark:border-slate-600 dark:text-slate-200
        `,

        /* ===== SECONDARY ===== */
        secondary: `
        text-slate-900
        bg-gradient-to-br from-slate-200 to-slate-300
        shadow-[0_4px_12px_rgba(0,0,0,0.15)]
        hover:shadow-[0_8px_22px_rgba(0,0,0,0.25)]
        hover:brightness-105
        focus-visible:ring-slate-400
        dark:from-slate-700 dark:to-slate-600 dark:text-white
        `,

        /* ===== GHOST (NO BACKGROUND) ===== */
        ghost: `
        bg-transparent
        text-slate-700
        hover:text-indigo-600
        hover:shadow-[0_4px_16px_rgba(99,102,241,0.35)]
        focus-visible:ring-indigo-400
        dark:text-slate-300
        `,

        /* ===== LINK ===== */
        link: `
        bg-transparent
        text-indigo-600
        underline-offset-4
        hover:underline
        focus-visible:ring-indigo-400
        `,
      },

      size: {
        default: "h-9 px-4 py-2 has-[>svg]:px-3",
        sm: "h-8 rounded-md gap-1.5 px-3 has-[>svg]:px-2.5",
        lg: "h-10 rounded-md px-6 has-[>svg]:px-4",
        icon: "size-9",
        "icon-sm": "size-8",
        "icon-lg": "size-10",
      },
    },

    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);


function Button({
  className,
  variant = "default",
  size = "default",
  asChild = false,
  ...props
}) {
  const Comp = asChild ? Slot : "button"

  return (
    <Comp
      data-slot="button"
      data-variant={variant}
      data-size={size}
      className={cn(buttonVariants({ variant, size, className }))}
      {...props} />
  );
}

export { Button, buttonVariants }
