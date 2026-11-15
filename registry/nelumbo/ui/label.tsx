"use client"

import * as React from "react"
import { Label as LabelPrimitive } from "radix-ui"

import { cn } from "@/lib/utils"

/**
 * Nelumbo Label (built on Radix Label)
 *
 *   <div className="flex items-center gap-3">
 *     <Checkbox id="news" />
 *     <Label htmlFor="news">Send me product news</Label>
 *   </div>
 *
 * For controls that have no floating label of their own (Checkbox, Switch,
 * Radio Group, Slider). Text fields (Input, Select, Textarea ...) draw their
 * own label and don't need this.
 *
 * Same API as shadcn's Label. It reads as a label-lg line and dims with its
 * control: put it after a `peer` control (Checkbox, Switch and Radio Group are
 * peers) and it follows `disabled` and `aria-invalid` without extra props, or
 * wrap both in a `group` with `data-disabled="true"`. Set `data-error="true"`
 * to turn it red by hand (the form's FormLabel does).
 */
function Label({ className, ...props }: React.ComponentProps<typeof LabelPrimitive.Root>) {
  return (
    <LabelPrimitive.Root
      data-slot="label"
      className={cn(
        "flex items-center gap-2 type-label-lg text-foreground select-none",
        "transition-[color,opacity] duration-200 ease-(--ease-standard) motion-reduce:transition-none",
        "group-data-[disabled=true]:pointer-events-none group-data-[disabled=true]:opacity-40",
        "peer-disabled:cursor-not-allowed peer-disabled:opacity-40",
        "peer-aria-invalid:text-destructive data-[error=true]:text-destructive",
        className
      )}
      {...props}
    />
  )
}

export { Label }
