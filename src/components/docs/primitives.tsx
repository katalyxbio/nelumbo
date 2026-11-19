"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { CodeBlock } from "@/registry/nelumbo/ui/code-block"

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
    <div className="flex min-w-0 flex-col gap-2">
      {label && <p className="type-label-md text-muted-foreground">{label}</p>}
      <div className={cn("flex min-w-0 flex-wrap items-center gap-3 rounded-3xl bg-surface-container-low p-6 dark:bg-surface-container-lowest", className)}>
        {children}
      </div>
    </div>
  )
}

/** Docs snippets: the inverse CodeBlock. Install commands read as bash, everything else as TSX. */
export function Code({ children, className, language }: { children: string; className?: string; language?: string }) {
  const lang = language ?? (/^(npx|npm|pnpm|yarn|bun)\s/.test(children) ? "bash" : "tsx")
  return <CodeBlock variant="inverse" language={lang} code={children} className={className} />
}

export function PropsTable({ rows, note }: { rows: [string, string, string, string][]; note?: string }) {
  return (
    <div tabIndex={0} className="overflow-x-auto rounded-2xl border border-border outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring">
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
