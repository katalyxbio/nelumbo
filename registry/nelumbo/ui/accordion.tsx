"use client"

import * as React from "react"
import { Accordion as AccordionPrimitive } from "radix-ui"

import { cn } from "@/lib/utils"
import { Icon, type IconName } from "@/registry/nelumbo/ui/icon"

/**
 * Nelumbo Accordion (built on Radix Accordion)
 *
 * shadcn's API, so shadcn code works unchanged:
 *
 *   <Accordion type="single" collapsible>
 *     <AccordionItem value="shipping">
 *       <AccordionTrigger>How long does shipping take?</AccordionTrigger>
 *       <AccordionContent>Two to four working days.</AccordionContent>
 *     </AccordionItem>
 *   </Accordion>
 *
 * Nelumbo additions:
 *
 *   <Accordion type="multiple" variant="segmented">
 *     <AccordionItem value="display">
 *       <AccordionTrigger icon="palette" description="Theme, text size">Display</AccordionTrigger>
 *       <AccordionContent inset>...</AccordionContent>
 *     </AccordionItem>
 *   </Accordion>
 *
 * - `variant` on Accordion: "plain" (rows on the surface, spaced apart, no
 *   divider lines) or "segmented" (each item on its own tile, 2px apart, the
 *   group's outer corners rounded like List's segmented variant). In
 *   segmented, the open tile is a touch more prominent and rounds all round.
 * - `icon` and `description` on AccordionTrigger: a leading Material Symbol
 *   and a quieter second line under the title.
 * - `inset` on AccordionContent: indent the content to line up with the
 *   title when the trigger has an icon.
 * - Chevron turns on a spring; content opens with a height animation and a
 *   fade. Reduced motion keeps only a short fade.
 * - Keyboard (Radix): Enter/Space toggle, Up/Down and Home/End move
 *   between triggers.
 */

type AccordionVariant = "plain" | "segmented"
const AccordionContext = React.createContext<AccordionVariant>("plain")

// Keyframes ship with the component (React hoists and dedupes the tag).
const CSS = `
@keyframes vlv-acc-down { from { height: 0; opacity: 0 } to { height: var(--radix-accordion-content-height); opacity: 1 } }
@keyframes vlv-acc-up { from { height: var(--radix-accordion-content-height); opacity: 1 } to { height: 0; opacity: 0 } }
@keyframes vlv-acc-fade-in { from { opacity: 0 } to { opacity: 1 } }
@keyframes vlv-acc-fade-out { from { opacity: 1 } to { opacity: 0 } }
.vlv-acc-content { overflow: hidden }
.vlv-acc-content[data-state="open"] { animation: vlv-acc-down 420ms var(--ease-emphasized) }
.vlv-acc-content[data-state="closed"] { animation: vlv-acc-up 280ms var(--ease-standard) }
@media (prefers-reduced-motion: reduce) {
  .vlv-acc-content[data-state="open"] { animation: vlv-acc-fade-in 120ms linear }
  .vlv-acc-content[data-state="closed"] { animation: vlv-acc-fade-out 120ms linear }
}
`

function Keyframes() {
  return (
    <style href="nelumbo-accordion" precedence="default">
      {CSS}
    </style>
  )
}

type AccordionProps = React.ComponentProps<typeof AccordionPrimitive.Root> & { variant?: AccordionVariant }

function Accordion({ className, variant = "plain", ...props }: AccordionProps) {
  return (
    <AccordionContext.Provider value={variant}>
      <Keyframes />
      <AccordionPrimitive.Root
        data-slot="accordion"
        data-variant={variant}
        className={cn("flex flex-col", variant === "segmented" ? "gap-0.5" : "gap-1", className)}
        {...props}
      />
    </AccordionContext.Provider>
  )
}

function AccordionItem({ className, ...props }: React.ComponentProps<typeof AccordionPrimitive.Item>) {
  const variant = React.useContext(AccordionContext)
  return (
    <AccordionPrimitive.Item
      data-slot="accordion-item"
      className={cn(
        variant === "segmented"
          ? [
              "rounded-xs bg-surface-container first:rounded-t-2xl last:rounded-b-2xl dark:bg-surface-container-high",
              "transition-[background-color,border-radius] duration-500 ease-spring motion-reduce:transition-none",
              // the open tile is a touch more prominent, and rounds all round
              "data-[state=open]:rounded-2xl data-[state=open]:bg-surface-container-high dark:data-[state=open]:bg-surface-container-highest",
            ]
          : "rounded-2xl",
        className
      )}
      {...props}
    />
  )
}

type AccordionTriggerProps = React.ComponentProps<typeof AccordionPrimitive.Trigger> & {
  /** A leading Material Symbol. */
  icon?: IconName
  /** A quieter second line under the title. */
  description?: React.ReactNode
}

function AccordionTrigger({ className, children, icon, description, ...props }: AccordionTriggerProps) {
  return (
    <AccordionPrimitive.Header className="flex">
      <AccordionPrimitive.Trigger
        data-slot="accordion-trigger"
        className={cn(
          "state-layer group/trigger flex min-h-14 flex-1 cursor-pointer items-center gap-4 rounded-[inherit] px-4 py-3 text-left text-foreground",
          "outline-none focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-ring",
          "disabled:pointer-events-none disabled:opacity-40",
          className
        )}
        {...props}
      >
        {icon && <Icon name={icon} className="text-muted-foreground" />}
        <span className="flex min-w-0 flex-1 flex-col">
          <span className="type-title-sm">{children}</span>
          {description && <span className="type-body-md text-muted-foreground">{description}</span>}
        </span>
        <span
          aria-hidden
          className="grid size-6 shrink-0 place-items-center text-muted-foreground transition-transform duration-500 ease-spring-bouncy group-data-[state=open]/trigger:rotate-180 motion-reduce:transition-none"
        >
          <Icon name="keyboard_arrow_down" />
        </span>
      </AccordionPrimitive.Trigger>
    </AccordionPrimitive.Header>
  )
}

type AccordionContentProps = React.ComponentProps<typeof AccordionPrimitive.Content> & {
  /** Indent to line up with the title of a trigger that has an icon. */
  inset?: boolean
}

function AccordionContent({ className, children, inset = false, ...props }: AccordionContentProps) {
  return (
    <AccordionPrimitive.Content data-slot="accordion-content" className="vlv-acc-content type-body-md text-muted-foreground" {...props}>
      <div className={cn("px-4 pt-0 pb-4", inset && "pl-14", className)}>{children}</div>
    </AccordionPrimitive.Content>
  )
}

export { Accordion, AccordionItem, AccordionTrigger, AccordionContent, type AccordionProps, type AccordionVariant }
