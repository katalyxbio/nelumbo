"use client"

import * as React from "react"
import { DropdownMenu as MenuPrimitive } from "radix-ui"
import { type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"
import { Button, buttonVariants } from "@/registry/velvet/ui/button"
import { Icon, type IconName } from "@/registry/velvet/ui/icon"

/**
 * Velvet SplitButton (Material 3 Expressive)
 *
 * A main action and a menu of related actions, joined with a 2px gap.
 * Inner corners are small; while the menu is open the trigger rounds out
 * fully and its chevron turns over.
 *
 *   <SplitButton variant="secondary">
 *     <SplitButtonAction onClick={save}>Save</SplitButtonAction>
 *     <SplitButtonMenu label="More save options">
 *       <SplitButtonItem icon="save_as" onSelect={saveAs}>Save as</SplitButtonItem>
 *     </SplitButtonMenu>
 *   </SplitButton>
 */
type Variant = Exclude<VariantProps<typeof buttonVariants>["variant"], "link" | "ghost" | null | undefined>
type Size = Exclude<VariantProps<typeof buttonVariants>["size"], `icon${string}` | null | undefined>

const Ctx = React.createContext<{ variant: Variant; size: Size }>({ variant: "default", size: "default" })

type SplitButtonProps = React.ComponentProps<"div"> & { variant?: Variant; size?: Size }

function SplitButton({ variant = "default", size = "default", className, ...props }: SplitButtonProps) {
  return (
    <Ctx.Provider value={{ variant, size }}>
      <div
        role="group"
        data-slot="split-button"
        className={cn(
          "inline-flex w-fit items-center gap-0.5",
          "*:[--press-scale:1] *:[--btn-inner:calc(var(--btn-h)/6)]",
          className
        )}
        {...props}
      />
    </Ctx.Provider>
  )
}

function SplitButtonAction({ className, ...props }: Omit<React.ComponentProps<typeof Button>, "variant" | "size" | "shape">) {
  const { variant, size } = React.useContext(Ctx)
  return (
    <Button
      data-slot="split-button-action"
      variant={variant}
      size={size}
      className={cn("[--btn-radius-end:var(--btn-inner)]", className)}
      {...props}
    />
  )
}

type SplitButtonMenuProps = {
  /** Accessible name for the trigger, e.g. "More save options". */
  label: string
  children: React.ReactNode
  disabled?: boolean
  align?: "start" | "end"
  open?: boolean
  onOpenChange?: (open: boolean) => void
}

const TRIGGER_WIDTH: Record<Size, string> = {
  xs: "w-6",
  sm: "w-7",
  default: "w-9",
  lg: "w-11",
  xl: "w-12",
}

function SplitButtonMenu({ label, children, disabled, align = "end", open, onOpenChange }: SplitButtonMenuProps) {
  const { variant, size } = React.useContext(Ctx)
  return (
    <MenuPrimitive.Root open={open} onOpenChange={onOpenChange} modal={false}>
      <MenuPrimitive.Trigger asChild disabled={disabled}>
        <Button
          data-slot="split-button-trigger"
          aria-label={label}
          variant={variant}
          size={size}
          className={cn(
            TRIGGER_WIDTH[size],
            "group/trigger [--btn-px:0px]! [--btn-radius-start:var(--btn-inner)]",
            // open: full pill, chevron turned over
            "data-[state=open]:[--btn-radius-start:calc(var(--btn-h)/2)]"
          )}
        >
          <Icon
            name="keyboard_arrow_down"
            className="transition-[rotate] duration-300 ease-[var(--ease-spring)] group-data-[state=open]/trigger:rotate-180 motion-reduce:transition-none"
          />
        </Button>
      </MenuPrimitive.Trigger>
      <MenuPrimitive.Portal>
        <MenuPrimitive.Content
          align={align}
          sideOffset={6}
          className={cn(
            "z-50 min-w-48 origin-(--radix-dropdown-menu-content-transform-origin) rounded-2xl bg-popover p-1.5 text-popover-foreground shadow-e3",
            "ring-1 ring-border dark:bg-surface-container-high",
            "data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95",
            "data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95"
          )}
        >
          {children}
        </MenuPrimitive.Content>
      </MenuPrimitive.Portal>
    </MenuPrimitive.Root>
  )
}

type SplitButtonItemProps = React.ComponentProps<typeof MenuPrimitive.Item> & { icon?: IconName }

function SplitButtonItem({ className, icon, children, ...props }: SplitButtonItemProps) {
  return (
    <MenuPrimitive.Item
      data-slot="split-button-item"
      className={cn(
        "state-layer flex cursor-pointer items-center gap-3 rounded-xl px-3 py-2.5 type-label-lg outline-none select-none",
        "data-highlighted:after:opacity-[0.08] data-disabled:pointer-events-none data-disabled:opacity-40",
        "[--icon-size:20px] [--icon-opsz:20]",
        className
      )}
      {...props}
    >
      {icon && <Icon name={icon} className="text-muted-foreground" />}
      {children}
    </MenuPrimitive.Item>
  )
}

export { SplitButton, SplitButtonAction, SplitButtonMenu, SplitButtonItem, type SplitButtonProps }
