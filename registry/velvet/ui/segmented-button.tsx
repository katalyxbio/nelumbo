"use client"

import * as React from "react"
import { ToggleGroup as ToggleGroupPrimitive } from "radix-ui"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"
import { Icon, type IconName } from "@/registry/velvet/ui/icon"

/**
 * Velvet SegmentedButton
 *
 * Material 3 segmented buttons on Radix ToggleGroup (arrow-key navigation,
 * roving focus, aria-pressed). Pick one option (`type="single"`) or several
 * (`type="multiple"`). The selected segment fills with the secondary
 * container and a check mark slides in, replacing the segment's icon.
 *
 * Single select always keeps one option selected, like radio buttons: clicking
 * the selected segment again does nothing.
 */
const segmentedVariants = cva(
  // Equal columns, each as wide as the widest segment (Material 3 behavior).
  "inline-grid w-fit max-w-full auto-cols-fr grid-flow-col overflow-hidden rounded-full border border-outline-variant",
  {
    variants: {
      size: {
        sm: "h-8 [--seg-px:0.75rem] [--icon-size:16px] [--icon-opsz:20] type-label-md",
        default: "h-10 [--seg-px:1rem] [--icon-size:18px] [--icon-opsz:20] type-label-lg",
        lg: "h-12 [--seg-px:1.25rem] [--icon-size:20px] [--icon-opsz:20] type-label-lg",
      },
    },
    defaultVariants: { size: "default" },
  }
)

type Size = VariantProps<typeof segmentedVariants>["size"]
type Shared = {
  size?: Size
  className?: string
  children: React.ReactNode
  disabled?: boolean
  "aria-label"?: string
}
type SingleProps = Shared & {
  type: "single"
  value?: string
  defaultValue?: string
  onValueChange?: (value: string) => void
}
type MultipleProps = Shared & {
  type: "multiple"
  value?: string[]
  defaultValue?: string[]
  onValueChange?: (value: string[]) => void
}
type SegmentedButtonProps = SingleProps | MultipleProps

function SegmentedButton(props: SegmentedButtonProps) {
  const { size, className, children, disabled } = props
  const root = {
    "data-slot": "segmented-button",
    "aria-label": props["aria-label"],
    disabled,
    className: cn(segmentedVariants({ size }), className),
  }

  if (props.type === "single") return <SingleSegmented {...props} root={root} />

  return (
    <ToggleGroupPrimitive.Root
      type="multiple"
      value={props.value}
      defaultValue={props.defaultValue}
      onValueChange={props.onValueChange}
      {...root}
    >
      {children}
    </ToggleGroupPrimitive.Root>
  )
}

function SingleSegmented({ value, defaultValue, onValueChange, children, root }: SingleProps & { root: object }) {
  const [inner, setInner] = React.useState(defaultValue ?? "")
  const current = value ?? inner
  return (
    <ToggleGroupPrimitive.Root
      type="single"
      value={current}
      onValueChange={(v) => {
        if (!v) return // keep one option selected
        setInner(v)
        onValueChange?.(v)
      }}
      {...root}
    >
      {children}
    </ToggleGroupPrimitive.Root>
  )
}

type SegmentedButtonItemProps = React.ComponentProps<typeof ToggleGroupPrimitive.Item> & {
  /** Leading Material Symbol; the check mark replaces it while selected. */
  icon?: IconName
  /** Show a check mark on the selected segment. Default true. */
  check?: boolean
}

function SegmentedButtonItem({ className, children, icon, check = true, ...props }: SegmentedButtonItemProps) {
  return (
    <ToggleGroupPrimitive.Item
      data-slot="segmented-button-item"
      className={cn(
        "group/seg state-layer relative grid min-w-0 cursor-pointer place-items-center px-[var(--seg-px)] whitespace-nowrap text-foreground select-none",
        "border-outline-variant not-last:border-e",
        "transition-[background-color,color] duration-200 ease-standard",
        "data-[state=on]:bg-secondary data-[state=on]:text-secondary-foreground",
        // inset focus ring: the rounded container clips anything outside
        "outline-none focus-visible:outline-2 focus-visible:-outline-offset-[3px] focus-visible:outline-ring",
        "disabled:pointer-events-none disabled:text-foreground/40",
        className
      )}
      {...props}
    >
      {/* Invisible sizer: reserves room for the check on every segment, so
          selecting one never makes the whole control jump wider. */}
      {check && !icon && (
        <span aria-hidden className="invisible col-start-1 row-start-1 flex items-center gap-1.5">
          <span className="size-[var(--icon-size)]" />
          {children}
        </span>
      )}
      <span className="col-start-1 row-start-1 flex min-w-0 items-center gap-1.5">
        {icon && !check ? (
          <Icon name={icon} />
        ) : icon ? (
          // icon swaps for the check; both share one slot so the width holds
          <span className="relative inline-grid size-[var(--icon-size)] place-items-center">
            <Icon
              name={icon}
              className="col-start-1 row-start-1 transition-[opacity,scale] duration-200 group-data-[state=on]/seg:scale-50 group-data-[state=on]/seg:opacity-0"
            />
            <Icon
              name="check"
              className="col-start-1 row-start-1 scale-50 opacity-0 transition-[opacity,scale] duration-200 group-data-[state=on]/seg:scale-100 group-data-[state=on]/seg:opacity-100"
            />
          </span>
        ) : check ? (
          // no icon: the check grows in from zero width
          <span className="-me-1.5 inline-grid grid-cols-[0fr] opacity-0 transition-[grid-template-columns,opacity,margin] duration-300 ease-[var(--ease-spring)] group-data-[state=on]/seg:me-0 group-data-[state=on]/seg:grid-cols-[1fr] group-data-[state=on]/seg:opacity-100 motion-reduce:transition-none">
            <span className="overflow-hidden">
              <Icon name="check" />
            </span>
          </span>
        ) : null}
        <span className="truncate">{children}</span>
      </span>
    </ToggleGroupPrimitive.Item>
  )
}

export {
  SegmentedButton,
  SegmentedButtonItem,
  segmentedVariants,
  type SegmentedButtonProps,
  type SegmentedButtonItemProps,
}
