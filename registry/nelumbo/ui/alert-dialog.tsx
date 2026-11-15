"use client"

import * as React from "react"
import { AlertDialog as AlertDialogPrimitive } from "radix-ui"

import { cn } from "@/lib/utils"
import { buttonVariants } from "@/registry/nelumbo/ui/button"
import { overlayClass } from "@/registry/nelumbo/ui/dialog"
import { Icon, type IconName } from "@/registry/nelumbo/ui/icon"

/**
 * Nelumbo Alert Dialog (built on Radix AlertDialog)
 *
 * API-compatible with shadcn's AlertDialog (AlertDialog, AlertDialogTrigger,
 * AlertDialogContent, AlertDialogHeader, AlertDialogFooter, AlertDialogTitle,
 * AlertDialogDescription, AlertDialogAction, AlertDialogCancel,
 * AlertDialogPortal, AlertDialogOverlay), so shadcn code works unchanged.
 *
 *   <AlertDialog>
 *     <AlertDialogTrigger asChild><Button variant="outline">Delete</Button></AlertDialogTrigger>
 *     <AlertDialogContent>
 *       <AlertDialogHeader>
 *         <AlertDialogTitle>Are you sure?</AlertDialogTitle>
 *         <AlertDialogDescription>This can't be undone.</AlertDialogDescription>
 *       </AlertDialogHeader>
 *       <AlertDialogFooter>
 *         <AlertDialogCancel>Cancel</AlertDialogCancel>
 *         <AlertDialogAction>Continue</AlertDialogAction>
 *       </AlertDialogFooter>
 *     </AlertDialogContent>
 *   </AlertDialog>
 *
 * Nelumbo additions:
 *
 *   <AlertDialog variant="destructive">
 *     ...
 *       <AlertDialogHeader icon="delete">
 *
 * - `variant` on AlertDialog: "default" or "destructive". Destructive makes
 *   the action a destructive button and tints the icon tile red.
 * - `icon` on AlertDialogHeader: a Material Symbol in a tonal tile that pops
 *   in above the title. With an icon the header centers itself (the Material 3
 *   layout); the actions stay right-aligned.
 * - AlertDialogAction / AlertDialogCancel take Button's `variant` and `size`.
 *   Cancel is a quiet ghost button, so the action carries the weight.
 * - Footer: right-aligned; on phones the buttons stack full width with the
 *   action on top.
 * - Behaviour (Radix): role="alertdialog", focus is trapped and lands on
 *   Cancel, Escape cancels, and clicking the scrim does not dismiss it. Focus
 *   returns to the trigger.
 */

type AlertDialogVariant = "default" | "destructive"
const VariantContext = React.createContext<AlertDialogVariant>("default")

// Keyframes ship with the component (React hoists and dedupes the tag).
const CSS = `
@keyframes vlv-ad-tile { from { opacity: 0; transform: scale(0.5) rotate(-12deg) } to { opacity: 1; transform: none } }
.vlv-ad-tile { animation: vlv-ad-tile 640ms 90ms var(--ease-spring-bouncy) both }
@media (prefers-reduced-motion: reduce) { .vlv-ad-tile { animation: none } }
`

type AlertDialogProps = React.ComponentProps<typeof AlertDialogPrimitive.Root> & { variant?: AlertDialogVariant }

function AlertDialog({ variant = "default", ...props }: AlertDialogProps) {
  return (
    <VariantContext.Provider value={variant}>
      <AlertDialogPrimitive.Root data-slot="alert-dialog" {...props} />
    </VariantContext.Provider>
  )
}

function AlertDialogTrigger(props: React.ComponentProps<typeof AlertDialogPrimitive.Trigger>) {
  return <AlertDialogPrimitive.Trigger data-slot="alert-dialog-trigger" {...props} />
}

function AlertDialogPortal(props: React.ComponentProps<typeof AlertDialogPrimitive.Portal>) {
  return <AlertDialogPrimitive.Portal data-slot="alert-dialog-portal" {...props} />
}

function AlertDialogOverlay({ className, ...props }: React.ComponentProps<typeof AlertDialogPrimitive.Overlay>) {
  return <AlertDialogPrimitive.Overlay data-slot="alert-dialog-overlay" className={cn(overlayClass, className)} {...props} />
}

const SIZES = { sm: "max-w-[22rem]", default: "max-w-[26rem]" }

type AlertDialogContentProps = React.ComponentProps<typeof AlertDialogPrimitive.Content> & { size?: keyof typeof SIZES }

function AlertDialogContent({ className, size = "default", ...props }: AlertDialogContentProps) {
  return (
    <AlertDialogPortal>
      <style href="nelumbo-alert-dialog" precedence="default">
        {CSS}
      </style>
      <AlertDialogOverlay />
      <AlertDialogPrimitive.Content
        data-slot="alert-dialog-content"
        className={cn(
          "fixed top-1/2 left-1/2 z-50 flex max-h-[calc(100dvh-2rem)] w-[calc(100%-2rem)] -translate-1/2 flex-col gap-6 overflow-y-auto rounded-3xl p-6",
          "bg-card text-card-foreground shadow-e5 outline-none dark:bg-surface-container-high",
          SIZES[size],
          "data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-[0.92] data-[state=open]:slide-in-from-bottom-3",
          "data-[state=open]:duration-[519ms] data-[state=open]:ease-(--ease-spring)",
          "data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-[0.96]",
          "data-[state=closed]:duration-150 data-[state=closed]:ease-(--ease-standard)",
          className
        )}
        {...props}
      />
    </AlertDialogPortal>
  )
}

type AlertDialogHeaderProps = React.ComponentProps<"div"> & {
  /** A Material Symbol in a tonal tile above the title; centers the header. */
  icon?: IconName
}

function AlertDialogHeader({ className, icon, children, ...props }: AlertDialogHeaderProps) {
  const variant = React.useContext(VariantContext)
  return (
    <div
      data-slot="alert-dialog-header"
      data-icon={icon ? "" : undefined}
      className={cn("flex flex-col gap-2 text-left data-icon:items-center data-icon:gap-4 data-icon:text-center", className)}
      {...props}
    >
      {icon && (
        <span
          data-slot="alert-dialog-icon"
          aria-hidden
          className={cn(
            "vlv-ad-tile grid size-14 place-items-center rounded-[1.25rem]",
            variant === "destructive"
              ? "bg-destructive-container text-destructive-container-foreground"
              : "bg-secondary text-secondary-foreground"
          )}
        >
          <Icon name={icon} size={28} fill />
        </span>
      )}
      <div className={cn("flex flex-col gap-2", icon && "items-center")}>{children}</div>
    </div>
  )
}

function AlertDialogFooter({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="alert-dialog-footer"
      className={cn("flex flex-col-reverse gap-2 max-sm:*:w-full sm:flex-row sm:justify-end", className)}
      {...props}
    />
  )
}

function AlertDialogTitle({ className, ...props }: React.ComponentProps<typeof AlertDialogPrimitive.Title>) {
  return <AlertDialogPrimitive.Title data-slot="alert-dialog-title" className={cn("type-headline-sm text-balance", className)} {...props} />
}

function AlertDialogDescription({ className, ...props }: React.ComponentProps<typeof AlertDialogPrimitive.Description>) {
  return (
    <AlertDialogPrimitive.Description
      data-slot="alert-dialog-description"
      className={cn("type-body-md text-pretty text-muted-foreground", className)}
      {...props}
    />
  )
}

type ActionProps = React.ComponentProps<typeof AlertDialogPrimitive.Action> & Pick<Parameters<typeof buttonVariants>[0] & object, "variant" | "size" | "shape">

/** The confirming button. Destructive when the AlertDialog is. */
function AlertDialogAction({ className, variant, size, shape, ...props }: ActionProps) {
  const ctx = React.useContext(VariantContext)
  return (
    <AlertDialogPrimitive.Action
      data-slot="alert-dialog-action"
      className={cn(buttonVariants({ variant: variant ?? (ctx === "destructive" ? "destructive" : "default"), size, shape }), className)}
      {...props}
    />
  )
}

/** The dismissing button. It takes focus when the dialog opens. */
function AlertDialogCancel({ className, variant = "ghost", size, shape, ...props }: ActionProps) {
  return (
    <AlertDialogPrimitive.Cancel
      data-slot="alert-dialog-cancel"
      className={cn(buttonVariants({ variant, size, shape }), className)}
      {...props}
    />
  )
}

export {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogPortal,
  AlertDialogOverlay,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogFooter,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogAction,
  AlertDialogCancel,
  type AlertDialogProps,
  type AlertDialogVariant,
}
