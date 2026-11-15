"use client"

import * as React from "react"
import { Avatar } from "@/registry/velvet/ui/avatar"
import { cn } from "@/lib/utils"

const MAIL = [
  ["Ines Moreau", "Revised floor plan", "I moved the pantry wall 40 cm east so the island fits.", "9:41"],
  ["Tomás Reyes", "Invoice 2026-114", "Attached. Net 30 as usual, thanks for the quick turnaround.", "9:12"],
  ["Priya Natarajan", "Thursday standup", "Can we push to 10:30? I have a site visit at 9.", "8:47"],
  ["Jonas Berg", "Tile samples", "The matte grey arrived. The terracotta is back-ordered until December.", "Yesterday"],
  ["Hana Sato", "Permit update", "The city approved the window change. Stamped drawings attached.", "Yesterday"],
  ["Leo Martins", "Lighting plan", "Two options for the hallway. I lean towards the recessed one.", "Yesterday"],
  ["Mira Okafor", "Site visit notes", "Photos from the kitchen are in the shared folder, the plaster is dry.", "Mon"],
  ["Daniel Costa", "Quote for joinery", "Oak veneer is 12 percent over; walnut is within the budget you set.", "Mon"],
  ["Aisha Bello", "Welcome pack", "Draft of the client welcome pack. Tell me if the tone is too formal.", "Sun"],
  ["Ravi Iyer", "Budget vs actuals", "We are two percent under on materials and four over on labour.", "Sun"],
  ["Sofía Ramírez", "Delivery window", "The sink arrives Friday between 8 and 12. Someone needs to be there.", "Sat"],
  ["Kenji Watanabe", "Render v3", "Warmer light in the living room, as discussed. Cabinet doors are matte.", "Sat"],
  ["Léa Martin", "Paint codes", "Final list below. The hallway grey is the one that tested best.", "Fri"],
  ["Omar Haddad", "Scaffolding", "The scaffold comes down on the 14th, weather permitting.", "Fri"],
  ["Maya Kowalski", "Moodboard", "Added the stone references. The honed finish photographs better.", "Thu"],
  ["Tomás Novák", "Survey results", "Eleven of fourteen clients preferred the shorter proposal format.", "Thu"],
  ["Ines Moreau", "Re: Revised floor plan", "Works for me. Can you check the clearance to the fridge?", "Wed"],
  ["Jonas Berg", "Grout colour", "Sending a sample board with three options by courier tomorrow.", "Wed"],
]

/** A phone-like frame with its own scroller, so a bar's scroll behavior is visible without hijacking the docs page. */
export function PhoneFrame({
  label,
  className,
  children,
}: {
  label: string
  className?: string
  children: (scroller: React.RefObject<HTMLDivElement | null>) => React.ReactNode
}) {
  const scroller = React.useRef<HTMLDivElement>(null)
  return (
    <div className={cn("h-[560px] w-[22rem] max-w-full overflow-hidden rounded-[2.25rem] border-[6px] border-inverse-surface bg-background shadow-e3 dark:border-surface-container-highest", className)}>
      {/* focusable so keyboard users can scroll it */}
      <div
        ref={scroller}
        tabIndex={0}
        role="region"
        aria-label={label}
        data-frame
        className="relative h-full overflow-y-auto overscroll-contain outline-none [scrollbar-width:none] focus-visible:-outline-offset-4 focus-visible:outline-2 focus-visible:outline-ring"
      >
        {children(scroller)}
      </div>
    </div>
  )
}

/** Realistic inbox rows. */
export function InboxList({ count = MAIL.length, className }: { count?: number; className?: string }) {
  return (
    <ul className={cn("flex flex-col gap-1 px-2 pb-4", className)}>
      {MAIL.slice(0, count).map(([from, subject, preview, time], i) => (
        <li key={from + subject} className="flex gap-3 rounded-2xl px-3 py-2.5">
          <Avatar name={from} color="auto" />
          <div className="flex min-w-0 flex-1 flex-col">
            <div className="flex items-baseline justify-between gap-2">
              <span className={cn("truncate type-title-sm", i > 2 && "font-medium")}>{from}</span>
              <span className="shrink-0 type-label-sm text-muted-foreground">{time}</span>
            </div>
            <span className="truncate type-body-md">{subject}</span>
            <span className="line-clamp-1 type-body-sm text-muted-foreground">{preview}</span>
          </div>
        </li>
      ))}
    </ul>
  )
}
