"use client"

import * as React from "react"
import { Icon } from "@/registry/velvet/ui/icon"
import { Button } from "@/registry/velvet/ui/button"
import { cn } from "@/lib/utils"

export function PageHeader({ eyebrow, title, children }: { eyebrow: string; title: string; children?: React.ReactNode }) {
  return (
    <header className="flex max-w-2xl flex-col gap-3 pb-10">
      <p className="type-label-md text-primary">{eyebrow}</p>
      <h1 className="type-display-sm text-balance">{title}</h1>
      {children && <div className="type-body-lg text-muted-foreground">{children}</div>}
    </header>
  )
}

export function Section({ title, description, children, id }: { title: string; description?: React.ReactNode; children: React.ReactNode; id?: string }) {
  return (
    <section id={id} className="flex flex-col gap-5 border-t border-border py-10">
      <div className="flex max-w-2xl flex-col gap-1.5">
        <h2 className="type-headline-sm text-balance">{title}</h2>
        {description && <div className="type-body-md text-muted-foreground">{description}</div>}
      </div>
      {children}
    </section>
  )
}

export function Preview({ children, className, label }: { children: React.ReactNode; className?: string; label?: string }) {
  return (
    <div className="flex flex-col gap-2">
      {label && <p className="type-label-md text-muted-foreground">{label}</p>}
      <div className={cn("flex flex-wrap items-center gap-3 rounded-3xl bg-surface-container-low p-6 dark:bg-surface-container-lowest", className)}>
        {children}
      </div>
    </div>
  )
}

export function Code({ children, className }: { children: string; className?: string }) {
  const [copied, setCopied] = React.useState(false)
  return (
    <div className={cn("relative min-w-0 rounded-2xl bg-inverse-surface text-inverse-foreground dark:bg-surface-container-high dark:text-foreground", className)}>
      <pre className="overflow-x-auto p-4 pr-14 font-mono text-[0.8125rem] leading-relaxed">
        <code>{children}</code>
      </pre>
      <Button
        size="icon-xs"
        variant="ghost"
        aria-label="Copy code"
        className="absolute top-3 right-3 text-inverse-foreground dark:text-foreground"
        onClick={() => {
          navigator.clipboard?.writeText(children).then(
            () => {
              setCopied(true)
              setTimeout(() => setCopied(false), 1400)
            },
            () => {}
          )
        }}
      >
        {copied ? <Icon name="check" /> : <Icon name="content_copy" />}
      </Button>
    </div>
  )
}

export function PropsTable({ rows, note }: { rows: [string, string, string, string][]; note?: string }) {
  return (
    <div className="overflow-x-auto rounded-2xl border border-border">
      <table className="w-full min-w-[640px] text-left type-body-sm">
        <thead className="bg-surface-container-low type-label-md text-muted-foreground dark:bg-surface-container">
          <tr>
            <th className="px-4 py-3">Prop</th>
            <th className="px-4 py-3">Type</th>
            <th className="px-4 py-3">Default</th>
            <th className="px-4 py-3">{note ?? "Notes"}</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {rows.map(([name, type, def, n]) => (
            <tr key={name}>
              <td className="px-4 py-3 font-mono type-label-md">{name}</td>
              <td className="px-4 py-3 font-mono type-label-sm text-muted-foreground">{type}</td>
              <td className="px-4 py-3 font-mono type-label-sm">{def}</td>
              <td className="px-4 py-3 type-body-sm text-muted-foreground">{n}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
