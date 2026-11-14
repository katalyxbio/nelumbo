import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

/**
 * Velvet ButtonGroup
 *
 * Lays out Buttons and IconButtons as one unit (Material 3 Expressive).
 *
 *  - `standard`: separate buttons. Pressing one widens it while its
 *    neighbors give up a little space, so the row feels physically linked.
 *  - `connected`: a tight row with small inner corners. A selected toggle
 *    (IconButton with `toggle`) rounds out fully.
 *
 * Everything works through CSS variables the buttons already read
 * (--btn-px-delta, --btn-radius-start/end, --press-scale), so the group
 * adds no JavaScript and any Velvet button can be a child.
 */
const buttonGroupVariants = cva("inline-flex w-fit items-center", {
  variants: {
    variant: {
      standard: [
        "gap-2",
        // the group's own motion replaces the per-button squeeze
        "*:[--press-scale:1]",
        "*:active:[--btn-px-delta:0.5rem]",
        "[&:has(>:active)>:not(:active)]:[--btn-px-delta:-0.25rem]",
      ],
      connected: [
        "gap-0.5",
        "*:[--press-scale:1]",
        // inner corners: small. Outer corners keep the button's own radius.
        // (declared on each child: --btn-h only exists on the button itself)
        "*:[--btn-radius-start:calc(var(--btn-h)/5)] *:[--btn-radius-end:calc(var(--btn-h)/5)]",
        "*:first:[--btn-radius-start:var(--btn-radius)] *:last:[--btn-radius-end:var(--btn-radius)]",
        // a selected toggle becomes a full pill; the doubled attribute outranks :first/:last
        "[&>[data-state=on][data-state]]:[--btn-radius-start:calc(var(--btn-h)/2)] [&>[data-state=on][data-state]]:[--btn-radius-end:calc(var(--btn-h)/2)]",
      ],
    },
  },
  defaultVariants: { variant: "standard" },
})

type ButtonGroupProps = React.ComponentProps<"div"> & VariantProps<typeof buttonGroupVariants>

function ButtonGroup({ className, variant, ...props }: ButtonGroupProps) {
  return (
    <div
      role="group"
      data-slot="button-group"
      data-variant={variant ?? "standard"}
      className={cn(buttonGroupVariants({ variant }), className)}
      {...props}
    />
  )
}

export { ButtonGroup, buttonGroupVariants, type ButtonGroupProps }
