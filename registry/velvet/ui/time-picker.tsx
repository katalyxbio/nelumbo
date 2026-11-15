"use client"

import * as React from "react"

import { cn } from "@/lib/utils"
import { FieldShell as Field, type FieldShellOptions as FieldProps } from "@/registry/velvet/ui/field-shell"
import { IconButton } from "@/registry/velvet/ui/icon-button"
import { Button } from "@/registry/velvet/ui/button"
import { Popover, PopoverAnchor, PopoverContent } from "@/registry/velvet/ui/popover"

/**
 * Velvet TimePicker (a Material 3 time picker, docked under a field)
 *
 *   <TimePicker label="Start" value={time} onValueChange={setTime} />
 *   <TimePicker label="Abflug" locale="de-DE" step={15} min="06:00" max="22:00" />
 *   <TimePicker label="Reminder" mode="list" />
 *
 * The value is a 24-hour string, "HH:mm" (or null), whatever the display.
 *
 * The field takes typed times in the locale's format: 12-hour with an AM/PM
 * part (en-US) or 24-hour (de-DE). "930p", "9:30 pm" and "9:30 PM" all work
 * in 12-hour; separators and the day period fill themselves in. A time is
 * accepted once it's complete and allowed; a wrong one is flagged on blur.
 *
 * The clock button (or Alt+↓) opens the picker: big hour and minute chips,
 * an AM/PM toggle for 12-hour, and a round dial with a selector hand. Drag
 * the hand or press a number; after the hour, the dial moves on to minutes.
 * The picked time is a draft until OK. 24-hour dials have two rings, 1 to 12
 * outside and 13 to 00 inside.
 *
 * Accessibility: the chips are spinbuttons (arrow keys, Home/End, typed
 * digits, aria-valuetext). The dial is a pointer aid only and is hidden from
 * assistive technology, so its numbers are not dozens of buttons. `mode="list"`
 * swaps the dial for scrollable hour and minute listboxes, for dense UIs.
 *
 * Field props (label, variant, size, icon, description, error), `min`, `max`,
 * `step` (minutes), `locale`, `hourCycle`, and `name` (submits "HH:mm").
 */

/* --------------------------------------------------------------- helpers */

const pad = (n: number) => String(n).padStart(2, "0")
const plain = (s: string) => s.replace(/[   ]/g, " ").trim()

type Clock = { h12: boolean; am: string; pm: string }

function useClock(locale: string, hourCycle?: "h11" | "h12" | "h23" | "h24"): Clock {
  return React.useMemo(() => {
    const cycle = hourCycle ?? new Intl.DateTimeFormat(locale, { hour: "numeric" }).resolvedOptions().hourCycle ?? "h12"
    const h12 = cycle === "h11" || cycle === "h12"
    const label = (h: number, fallback: string) => {
      const part = new Intl.DateTimeFormat(locale, { hour: "numeric", hour12: true }).formatToParts(new Date(2026, 0, 1, h)).find((p) => p.type === "dayPeriod")
      return plain(part?.value ?? fallback)
    }
    return { h12, am: label(9, "AM"), pm: label(15, "PM") }
  }, [locale, hourCycle])
}

/** "HH:mm" to minutes since midnight. */
function toTotal(v?: string | null): number | null {
  const match = /^(\d{1,2}):(\d{2})$/.exec(v ?? "")
  if (!match) return null
  const h = Number(match[1])
  const m = Number(match[2])
  return h < 24 && m < 60 ? h * 60 + m : null
}
const toValue = (t: number) => `${pad(Math.floor(t / 60))}:${pad(t % 60)}`

function formatTime(t: number, c: Clock) {
  const h = Math.floor(t / 60)
  const m = t % 60
  return c.h12 ? `${h % 12 || 12}:${pad(m)} ${h < 12 ? c.am : c.pm}` : `${pad(h)}:${pad(m)}`
}

const hintFor = (c: Clock) => (c.h12 ? `h:mm ${c.am}` : "HH:mm")

/** Can another digit follow this first hour digit? */
const canExtend = (d: number, c: Clock) => (c.h12 ? d < 2 : d < 3)

function hourLength(digits: string, c: Clock) {
  if (digits.length < 2) return digits.length
  const n = Number(digits.slice(0, 2))
  if (c.h12) return digits[0] === "0" || (digits[0] === "1" && n <= 12) ? 2 : 1
  return n <= 23 ? 2 : 1
}

type Parts = { h: string; m: string; colon: boolean; period: "am" | "pm" | null }

function analyze(text: string, c: Clock): Parts {
  const letters = text.replace(/[^\p{L}]/gu, "").toLowerCase()
  let period: Parts["period"] = null
  if (c.h12 && letters) {
    if (c.am.toLowerCase().startsWith(letters) || letters.startsWith("a")) period = "am"
    else if (c.pm.toLowerCase().startsWith(letters) || letters.startsWith("p")) period = "pm"
  }
  const at = text.search(/[:.]/)
  if (at > 0 && /\d/.test(text.slice(0, at))) {
    return { h: text.slice(0, at).replace(/\D/g, "").slice(0, 2), m: text.slice(at + 1).replace(/\D/g, "").slice(0, 2), colon: true, period }
  }
  const digits = text.replace(/\D/g, "").slice(0, 4)
  const hl = hourLength(digits, c)
  return { h: digits.slice(0, hl), m: digits.slice(hl, hl + 2), colon: false, period }
}

/** Digits in; the colon and day period are added as they become due (not when deleting). */
function maskTime(text: string, c: Clock, deleting: boolean) {
  const p = analyze(text, c)
  if (!p.h) return ""
  const hourDone = p.h.length === 2 || !canExtend(Number(p.h), c)
  let out = p.h
  if (p.m || p.colon || (hourDone && !deleting)) out += ":" + p.m
  if (c.h12 && p.m.length === 2 && p.period && !deleting) out += " " + (p.period === "am" ? c.am : c.pm)
  return out
}

type Limits = { allowed: (t: number) => boolean; min: number | null; max: number | null; step: number }

type Parsed = { total: number } | { error: string }

function parseText(text: string, c: Clock): Parsed {
  const p = analyze(text, c)
  const hint = `Enter a time as ${hintFor(c)}.`
  if (!p.h || p.m.length < 2) return { error: hint }
  const h = Number(p.h)
  const m = Number(p.m)
  if (c.h12) {
    if (h < 1 || h > 12) return { error: "Hours go from 1 to 12." }
  } else if (h > 23) return { error: "Hours go from 0 to 23." }
  if (m > 59) return { error: "Minutes go from 00 to 59." }
  if (c.h12 && !p.period) return { error: `Add ${c.am} or ${c.pm}.` }
  const h24 = c.h12 ? (h % 12) + (p.period === "pm" ? 12 : 0) : h
  return { total: h24 * 60 + m }
}

function explain(t: number, l: Limits, c: Clock) {
  if (l.min !== null && t < l.min) return `Choose ${formatTime(l.min, c)} or later.`
  if (l.max !== null && t > l.max) return `Choose ${formatTime(l.max, c)} or earlier.`
  if (l.step > 1) return l.step === 60 ? "Choose a time on the hour." : `Choose a time in ${l.step}-minute steps.`
  return "That time isn't available."
}

function useControllable<T>(value: T | undefined, initial: T, onChange?: (v: T) => void) {
  const [own, setOwn] = React.useState(initial)
  const controlled = value !== undefined
  const current = controlled ? value : own
  const set = React.useCallback(
    (v: T) => {
      if (!controlled) setOwn(v)
      onChange?.(v)
    },
    [controlled, onChange]
  )
  return [current, set] as const
}

/** The allowed minutes of an hour, in order. */
const minutesOf = (h: number, ok: (t: number) => boolean) => Array.from({ length: 60 }, (_, m) => m).filter((m) => ok(h * 60 + m))
const hourOk = (h: number, ok: (t: number) => boolean) => minutesOf(h, ok).length > 0

/** The allowed minute of hour `h` closest to `m` (around the clock face), or null. */
function nearestMinute(h: number, m: number, ok: (t: number) => boolean) {
  for (let d = 0; d <= 30; d++) {
    for (const x of d === 0 ? [m] : [(m + d) % 60, (m - d + 60) % 60]) if (ok(h * 60 + x)) return x
  }
  return null
}

/** The allowed time closest to `t` within [from, to], or null. */
function nearestTime(t: number, ok: (t: number) => boolean, from = 0, to = 1439) {
  for (let d = 0; d <= to - from; d++) {
    for (const x of d === 0 ? [t] : [t + d, t - d]) if (x >= from && x <= to && ok(x)) return x
  }
  return null
}

/* ------------------------------------------------------------------ dial */

const SIZE = 256
const C = SIZE / 2
const R_OUT = 104
const R_IN = 68

type PanelProps = {
  initial: number
  clock: Clock
  ok: (t: number) => boolean
  mode: "dial" | "list"
  label?: string
  onConfirm: (t: number) => void
  onCancel: () => void
}

function TimePanel({ initial, clock, ok, mode, label, onConfirm, onCancel }: PanelProps) {
  const [total, setTotal] = React.useState(initial)
  const [part, setPart] = React.useState<"hour" | "minute">("hour")
  const h = Math.floor(total / 60)
  const m = total % 60
  const pm = h >= 12
  const hintId = React.useId()
  const chips = React.useRef<Record<"hour" | "minute", HTMLDivElement | null>>({ hour: null, minute: null })
  const typed = React.useRef({ text: "", at: 0 })

  const setHour = (nh: number) => {
    if (!hourOk(nh, ok)) return
    const nm = ok(nh * 60 + m) ? m : nearestMinute(nh, m, ok)
    if (nm !== null) setTotal(nh * 60 + nm)
  }
  const setMinute = (nm: number) => {
    const x = nearestMinute(h, nm, ok)
    if (x !== null) setTotal(h * 60 + x)
  }
  const setPeriod = (toPm: boolean) => {
    const t = nearestTime(total + (toPm ? 720 : -720), ok, toPm ? 720 : 0, toPm ? 1439 : 719)
    if (t !== null) setTotal(t)
  }
  const periodOk = (toPm: boolean) => nearestTime(toPm ? 720 : 0, ok, toPm ? 720 : 0, toPm ? 1439 : 719) !== null

  // focus follows the part being edited
  React.useEffect(() => {
    if (mode === "dial") chips.current[part]?.focus()
    typed.current.text = ""
  }, [part, mode])

  const choosePart = (p: "hour" | "minute") => setPart(p)

  /* keyboard on the chips */
  const hourOrder = clock.h12 ? Array.from({ length: 12 }, (_, i) => ((i + 1) % 12) + (pm ? 12 : 0)) : Array.from({ length: 24 }, (_, i) => i)
  const stepHour = (dir: 1 | -1) => {
    const i = hourOrder.indexOf(h)
    for (let k = 1; k <= hourOrder.length; k++) {
      const cand = hourOrder[(i + dir * k + hourOrder.length * 2) % hourOrder.length]
      if (hourOk(cand, ok)) return setHour(cand)
    }
  }
  const stepMinute = (dir: 1 | -1) => {
    const list = minutesOf(h, ok)
    if (!list.length) return
    const i = list.findIndex((x) => x >= m)
    const at = i === -1 ? list.length : i
    const next = dir === 1 ? (list[at] === m ? list[(at + 1) % list.length] : list[at % list.length]) : list[(at - 1 + list.length) % list.length]
    setTotal(h * 60 + next)
  }

  const onChipKey = (which: "hour" | "minute") => (e: React.KeyboardEvent) => {
    const k = e.key
    if (k === "ArrowUp" || k === "ArrowDown") {
      e.preventDefault()
      const dir = k === "ArrowUp" ? 1 : -1
      return which === "hour" ? stepHour(dir) : stepMinute(dir)
    }
    if (k === "ArrowLeft" || k === "ArrowRight") {
      e.preventDefault()
      const rtl = getComputedStyle(e.currentTarget).direction === "rtl"
      const toward = (k === "ArrowRight") !== rtl ? "minute" : "hour"
      return setPart(toward)
    }
    if (k === "Home" || k === "End") {
      e.preventDefault()
      if (which === "hour") {
        const list = hourOrder.filter((x) => hourOk(x, ok))
        if (list.length) setHour(k === "Home" ? list[0] : list[list.length - 1])
      } else {
        const list = minutesOf(h, ok)
        if (list.length) setTotal(h * 60 + (k === "Home" ? list[0] : list[list.length - 1]))
      }
      return
    }
    if ((k === "a" || k === "A" || k === "p" || k === "P") && clock.h12 && !e.ctrlKey && !e.metaKey) {
      e.preventDefault()
      return setPeriod(k === "p" || k === "P")
    }
    if (/^\d$/.test(k) && !e.ctrlKey && !e.metaKey && !e.altKey) {
      e.preventDefault()
      const now = Date.now()
      const prev = now - typed.current.at < 1500 && typed.current.text.length === 1 ? typed.current.text : ""
      let text = prev + k
      const max = which === "hour" ? (clock.h12 ? 12 : 23) : 59
      const lo = which === "hour" && clock.h12 ? 1 : 0
      // two digits that don't make a valid number restart with the new one
      if (text.length === 2 && (Number(text) > max || Number(text) < lo)) text = k
      typed.current = { text, at: now }
      const n = Number(text)
      const done = text.length === 2 || n * 10 > max
      if (n >= lo && n <= max) {
        if (which === "hour") setHour(clock.h12 ? (n % 12) + (pm ? 12 : 0) : n)
        else setMinute(n)
      }
      if (done) {
        typed.current.text = ""
        if (which === "hour" && n >= lo && n <= max) setPart("minute")
      }
    }
  }

  /* pointer on the dial */
  const dial = React.useRef<HTMLDivElement>(null)
  const [dragging, setDragging] = React.useState(false)
  const fromPointer = (e: React.PointerEvent) => {
    const r = dial.current!.getBoundingClientRect()
    const k = SIZE / r.width
    const x = (e.clientX - r.left - r.width / 2) * k
    const y = (e.clientY - r.top - r.height / 2) * k
    const angle = (Math.atan2(x, -y) * 180) / Math.PI
    const a = (angle + 360) % 360
    if (part === "hour") {
      const idx = Math.round(a / 30) % 12
      if (clock.h12) return setHour((idx % 12) + (pm ? 12 : 0))
      const inner = Math.hypot(x, y) < (R_IN + R_OUT) / 2
      setHour(inner ? (idx === 0 ? 0 : idx + 12) : idx === 0 ? 12 : idx)
    } else setMinute(Math.round(a / 6) % 60)
  }

  // hand position: angle (kept continuous so it turns the short way), ring
  const targetAngle = part === "hour" ? (h % 12) * 30 : m * 6
  const inner = part === "hour" && !clock.h12 && (h === 0 || h > 12)
  const [rot, setRot] = React.useState(targetAngle)
  React.useLayoutEffect(() => {
    setRot((r) => r + ((((targetAngle - r) % 360) + 540) % 360) - 180)
  }, [targetAngle])

  const spokes = Array.from({ length: 12 }, (_, i) => i)
  const hourNumber = (i: number, ring: "out" | "in") => {
    if (clock.h12) return { value: (i % 12) + (pm ? 12 : 0), text: String(i === 0 ? 12 : i) }
    return ring === "out" ? { value: i === 0 ? 12 : i, text: String(i === 0 ? 12 : i) } : { value: i === 0 ? 0 : i + 12, text: pad(i === 0 ? 0 : i + 12) }
  }
  const pos = (i: number, r: number) => ({ x: C + r * Math.sin((i * Math.PI) / 6), y: C - r * Math.cos((i * Math.PI) / 6) })

  const h12 = h % 12 || 12
  const periodLabel = pm ? clock.pm : clock.am
  const offNumber = part === "minute" && m % 5 !== 0

  /* confirm with Enter, anywhere but a button */
  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !(e.target as HTMLElement).closest("button") && ok(total)) {
      e.preventDefault()
      onConfirm(total)
    }
  }

  const chip = (which: "hour" | "minute") => {
    const active = part === which
    const value = which === "hour" ? (clock.h12 ? h12 : h) : m
    return (
      <div
        ref={(el) => {
          chips.current[which] = el
        }}
        role="spinbutton"
        tabIndex={0}
        aria-label={which === "hour" ? "Hour" : "Minute"}
        aria-describedby={hintId}
        aria-valuemin={which === "hour" ? (clock.h12 ? 1 : 0) : 0}
        aria-valuemax={which === "hour" ? (clock.h12 ? 12 : 23) : 59}
        aria-valuenow={value}
        aria-valuetext={which === "hour" ? (clock.h12 ? `${h12} ${periodLabel}` : pad(h)) : `${m} ${m === 1 ? "minute" : "minutes"}`}
        data-active={active || undefined}
        onClick={() => choosePart(which)}
        onFocus={() => setPart(which)}
        onKeyDown={onChipKey(which)}
        className={cn(
          "state-layer grid h-20 w-24 cursor-pointer place-items-center rounded-lg type-display-lg tabular-nums outline-none select-none",
          "transition-[background-color,color] duration-200 ease-(--ease-standard) motion-reduce:transition-none",
          "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
          active ? "bg-primary text-primary-foreground" : "bg-surface-container-high text-foreground dark:bg-surface-container-highest"
        )}
      >
        {pad(value)}
      </div>
    )
  }

  return (
    <div onKeyDown={onKeyDown} className="flex flex-col gap-5">
      <p id={hintId} className="sr-only">
        Use the arrow keys or type digits. Enter confirms.
      </p>
      <p className="type-label-md text-muted-foreground">{label ?? "Select time"}</p>

      {mode === "dial" ? (
        <>
          <div className="flex items-center justify-center gap-1.5">
            {chip("hour")}
            <span aria-hidden className="type-display-lg -translate-y-[0.06em] text-foreground select-none">
              :
            </span>
            {chip("minute")}
            {clock.h12 && (
              <div role="group" aria-label="AM or PM" className="ms-2 flex w-14 flex-col gap-1">
                {([false, true] as const).map((isPm) => (
                  <button
                    key={String(isPm)}
                    type="button"
                    aria-pressed={pm === isPm}
                    disabled={!periodOk(isPm)}
                    onClick={() => setPeriod(isPm)}
                    className={cn(
                      "state-layer grid h-[38px] cursor-pointer place-items-center rounded-lg type-title-md outline-none select-none",
                      "transition-[background-color,color] duration-200 ease-(--ease-standard) motion-reduce:transition-none",
                      "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring disabled:pointer-events-none disabled:opacity-40",
                      pm === isPm ? "bg-secondary text-secondary-foreground" : "bg-surface-container-high text-muted-foreground dark:bg-surface-container-highest"
                    )}
                  >
                    {isPm ? clock.pm : clock.am}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div
            ref={dial}
            aria-hidden
            data-slot="time-dial"
            className="mx-auto size-64 max-w-full touch-none rounded-full bg-surface-container-high select-none dark:bg-surface-container-highest"
            onPointerDown={(e) => {
              if (e.button !== 0) return
              e.currentTarget.setPointerCapture(e.pointerId)
              setDragging(true)
              fromPointer(e)
            }}
            onPointerMove={(e) => dragging && fromPointer(e)}
            onPointerUp={() => {
              if (!dragging) return
              setDragging(false)
              if (part === "hour") setPart("minute")
              else chips.current.minute?.focus()
            }}
            onPointerCancel={() => setDragging(false)}
          >
            <svg viewBox={`0 0 ${SIZE} ${SIZE}`} className="size-full">
              {/* the hand: turns to the angle; the stem grows to the ring */}
              <g
                style={{ transform: `rotate(${rot}deg)`, transformOrigin: `${C}px ${C}px` }}
                className={cn("text-primary", !dragging && "transition-transform duration-300 ease-(--ease-spring) motion-reduce:transition-none")}
              >
                <rect
                  x={C - 1}
                  y={C - 1}
                  width={2}
                  height={1}
                  fill="currentColor"
                  style={{ transform: `scaleY(${(inner ? R_IN : R_OUT) - 1})`, transformOrigin: `${C}px ${C}px` }}
                  className={cn(!dragging && "transition-transform duration-300 ease-(--ease-spring) motion-reduce:transition-none")}
                />
                <circle
                  cx={C}
                  cy={C}
                  r={inner ? 18 : 24}
                  fill="currentColor"
                  style={{ transform: `translateY(${-(inner ? R_IN : R_OUT)}px)` }}
                  className={cn(!dragging && "transition-[transform,r] duration-300 ease-(--ease-spring) motion-reduce:transition-none")}
                />
              </g>
              <circle cx={C} cy={C} r={4} className="fill-primary" />
              {offNumber && (
                <g
                  style={{ transform: `rotate(${rot}deg)`, transformOrigin: `${C}px ${C}px` }}
                  className={cn(!dragging && "transition-transform duration-300 ease-(--ease-spring) motion-reduce:transition-none")}
                >
                  <circle cx={C} cy={C - R_OUT} r={2} className="fill-primary-foreground" />
                </g>
              )}

              {part === "hour" ? (
                <>
                  {spokes.map((i) => {
                    const n = hourNumber(i, "out")
                    const p = pos(i, R_OUT)
                    const on = h === n.value
                    return (
                      <text
                        key={`o${i}`}
                        x={p.x}
                        y={p.y}
                        dy="0.35em"
                        textAnchor="middle"
                        fontSize={16}
                        className={cn(on ? "fill-primary-foreground" : "fill-foreground", !hourOk(n.value, ok) && "opacity-40")}
                      >
                        {n.text}
                      </text>
                    )
                  })}
                  {!clock.h12 &&
                    spokes.map((i) => {
                      const n = hourNumber(i, "in")
                      const p = pos(i, R_IN)
                      const on = h === n.value
                      return (
                        <text
                          key={`i${i}`}
                          x={p.x}
                          y={p.y}
                          dy="0.35em"
                          textAnchor="middle"
                          fontSize={14}
                          className={cn(on ? "fill-primary-foreground" : "fill-foreground", !hourOk(n.value, ok) && "opacity-40")}
                        >
                          {n.text}
                        </text>
                      )
                    })}
                </>
              ) : (
                spokes.map((i) => {
                  const v = i * 5
                  const p = pos(i, R_OUT)
                  const on = m === v
                  return (
                    <text
                      key={v}
                      x={p.x}
                      y={p.y}
                      dy="0.35em"
                      textAnchor="middle"
                      fontSize={16}
                      className={cn(on ? "fill-primary-foreground" : "fill-foreground", !ok(h * 60 + v) && "opacity-40")}
                    >
                      {pad(v)}
                    </text>
                  )
                })
              )}
            </svg>
          </div>
        </>
      ) : (
        <ListColumns total={total} clock={clock} ok={ok} setHour={setHour} setMinute={setMinute} setPeriod={setPeriod} periodOk={periodOk} />
      )}

      <div className="sticky -bottom-5 z-10 -mx-5 -mb-5 flex justify-end gap-2 bg-card px-5 pt-1 pb-5 dark:bg-surface-container-high">
        <Button size="sm" variant="ghost" onClick={onCancel}>
          Cancel
        </Button>
        <Button size="sm" disabled={!ok(total)} onClick={() => onConfirm(total)}>
          OK
        </Button>
      </div>
    </div>
  )
}

/* ------------------------------------------------------------------ list */

type Option = { value: number; text: string; disabled?: boolean }

function Column({ label, options, selected, onSelect, autoFocus, className }: { label: string; options: Option[]; selected: number; onSelect: (v: number) => void; autoFocus?: boolean; className?: string }) {
  const id = React.useId()
  const ref = React.useRef<HTMLDivElement>(null)
  const first = React.useRef(true)

  React.useEffect(() => {
    const box = ref.current
    const opt = box?.querySelector<HTMLElement>(`[data-value="${selected}"]`)
    if (!box || !opt) return
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches
    box.scrollTo({ top: opt.offsetTop - (box.clientHeight - opt.offsetHeight) / 2, behavior: first.current || reduce ? "auto" : "smooth" })
    first.current = false
  }, [selected])

  React.useEffect(() => {
    if (autoFocus) ref.current?.focus({ preventScroll: true })
  }, [autoFocus])

  const move = (dir: 1 | -1) => {
    const i = options.findIndex((o) => o.value === selected)
    for (let k = i + dir; k >= 0 && k < options.length; k += dir) {
      if (!options[k].disabled) return onSelect(options[k].value)
    }
  }

  return (
    <div
      ref={ref}
      role="listbox"
      tabIndex={0}
      aria-label={label}
      aria-activedescendant={`${id}-${selected}`}
      onKeyDown={(e) => {
        if (e.key === "ArrowDown" || e.key === "ArrowUp") {
          e.preventDefault()
          move(e.key === "ArrowDown" ? 1 : -1)
        } else if (e.key === "Home" || e.key === "End") {
          e.preventDefault()
          const list = options.filter((o) => !o.disabled)
          const t = e.key === "Home" ? list[0] : list[list.length - 1]
          if (t) onSelect(t.value)
        }
      }}
      className={cn(
        "relative h-56 overflow-y-auto overscroll-contain rounded-lg bg-surface-container-high p-1 [scrollbar-width:none] outline-none dark:bg-surface-container-highest",
        "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
        className
      )}
    >
      {options.map((o) => (
        <div
          key={o.value}
          id={`${id}-${o.value}`}
          role="option"
          aria-selected={o.value === selected}
          aria-disabled={o.disabled || undefined}
          data-value={o.value}
          onClick={() => !o.disabled && onSelect(o.value)}
          className={cn(
            "state-layer grid h-10 cursor-pointer place-items-center rounded-full type-title-md tabular-nums select-none",
            "transition-[background-color,color] duration-200 ease-(--ease-standard) motion-reduce:transition-none",
            o.value === selected ? "bg-primary text-primary-foreground" : "text-foreground",
            o.disabled && "pointer-events-none opacity-40"
          )}
        >
          {o.text}
        </div>
      ))}
    </div>
  )
}

function ListColumns({ total, clock, ok, setHour, setMinute, setPeriod, periodOk }: { total: number; clock: Clock; ok: (t: number) => boolean; setHour: (h: number) => void; setMinute: (m: number) => void; setPeriod: (pm: boolean) => void; periodOk: (pm: boolean) => boolean }) {
  const h = Math.floor(total / 60)
  const m = total % 60
  const pm = h >= 12
  const hours: Option[] = clock.h12
    ? Array.from({ length: 12 }, (_, i) => {
        const v = ((i + 1) % 12) + (pm ? 12 : 0)
        return { value: v, text: String(i + 1), disabled: !hourOk(v, ok) }
      })
    : Array.from({ length: 24 }, (_, v) => ({ value: v, text: pad(v), disabled: !hourOk(v, ok) }))
  const minutes: Option[] = Array.from({ length: 60 }, (_, v) => v)
    .filter((v) => Array.from({ length: 24 }, (_, x) => x).some((x) => ok(x * 60 + v)))
    .map((v) => ({ value: v, text: pad(v), disabled: !ok(h * 60 + v) }))

  return (
    <div className="flex items-start justify-center gap-2">
      <Column label="Hour" options={hours} selected={h} onSelect={setHour} autoFocus className="w-20" />
      <Column label="Minute" options={minutes} selected={m} onSelect={setMinute} className="w-20" />
      {clock.h12 && (
        <Column
          label="AM or PM"
          options={[
            { value: 0, text: clock.am, disabled: !periodOk(false) },
            { value: 1, text: clock.pm, disabled: !periodOk(true) },
          ]}
          selected={pm ? 1 : 0}
          onSelect={(v) => setPeriod(v === 1)}
          className="h-auto w-20 self-center"
        />
      )}
    </div>
  )
}

/* ------------------------------------------------------------ TimePicker */

type TimePickerProps = Omit<FieldProps, "trailing"> & {
  /** "HH:mm" (24-hour), or null. */
  value?: string | null
  defaultValue?: string | null
  onValueChange?: (value: string | null) => void
  /** Earliest and latest allowed time, "HH:mm". */
  min?: string
  max?: string
  /** Minutes between allowed times (for example 15). Counted from `min`, or midnight. */
  step?: number
  /** BCP 47 tag; decides 12 or 24 hour and the AM/PM labels. */
  locale?: string
  /** Override the locale's hour cycle. */
  hourCycle?: "h11" | "h12" | "h23" | "h24"
  /** The picker: a clock dial, or scrollable lists for dense UIs. */
  mode?: "dial" | "list"
  name?: string
  required?: boolean
  disabled?: boolean
  id?: string
  className?: string
  placeholder?: string
  "aria-label"?: string
}

function TimePicker({
  value: valueProp,
  defaultValue = null,
  onValueChange,
  min,
  max,
  step = 1,
  locale = "en-US",
  hourCycle,
  mode = "dial",
  name,
  required,
  disabled,
  id,
  className,
  placeholder,
  error,
  label,
  variant,
  size,
  icon,
  description,
  "aria-label": ariaLabel,
}: TimePickerProps) {
  const clock = useClock(locale, hourCycle)
  const [value, setValue] = useControllable<string | null>(valueProp, defaultValue, onValueChange)
  const total = toTotal(value)
  const [text, setText] = React.useState(() => (total === null ? "" : formatTime(total, clock)))
  const [problem, setProblem] = React.useState<string | null>(null)
  const [open, setOpen] = React.useState(false)
  const inputRef = React.useRef<HTMLInputElement>(null)
  const popId = React.useId()
  const hint = hintFor(clock)

  const limits = React.useMemo<Limits>(() => {
    const lo = toTotal(min)
    const hi = toTotal(max)
    const s = Math.max(1, Math.round(step))
    const base = lo ?? 0
    return { min: lo, max: hi, step: s, allowed: (t) => (lo === null || t >= lo) && (hi === null || t <= hi) && (((t - base) % s) + s) % s === 0 }
  }, [min, max, step])

  // follow outside changes to the value, and the format
  React.useEffect(() => {
    const p = parseText(inputRef.current?.value ?? "", clock)
    const current = "total" in p ? p.total : null
    if (current !== total) setText(total === null ? "" : formatTime(total, clock))
    if (total !== null) setProblem(null)
  }, [total, clock])

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const deleting = e.target.value.length < text.length
    const next = maskTime(e.target.value, clock, deleting)
    setText(next)
    setProblem(null)
    if (!next) return setValue(null)
    const p = parseText(next, clock)
    if ("total" in p && limits.allowed(p.total)) setValue(toValue(p.total))
  }

  const onBlur = () => {
    if (!text) return setProblem(required ? "Enter a time." : null)
    const p = parseText(text, clock)
    if ("error" in p) setProblem(p.error)
    else if (!limits.allowed(p.total)) setProblem(explain(p.total, limits, clock))
    else {
      setText(formatTime(p.total, clock))
      setValue(toValue(p.total))
    }
  }

  const confirm = (t: number) => {
    setValue(toValue(t))
    setText(formatTime(t, clock))
    setProblem(null)
    setOpen(false)
  }

  // where the picker starts: the value, else now, moved to the nearest allowed time
  const startAt = () => {
    if (total !== null && limits.allowed(total)) return total
    const now = new Date()
    return nearestTime(total ?? now.getHours() * 60 + now.getMinutes(), limits.allowed) ?? limits.min ?? 0
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <Field
        {...{ label, variant, size, icon, id, className, disabled }}
        description={description ?? (label ? hint : undefined)}
        error={error ?? problem ?? undefined}
        placeholder={placeholder ?? hint}
        trailing={
          // a plain button rather than PopoverTrigger: the popover anchors to the whole field
          <IconButton
            icon="schedule"
            size="sm"
            label={total !== null ? `Choose time, ${formatTime(total, clock)}` : "Choose time"}
            disabled={disabled}
            aria-haspopup="dialog"
            aria-expanded={open}
            aria-controls={open ? popId : undefined}
            onClick={() => setOpen((o) => !o)}
          />
        }
      >
        {(control) => (
          <>
            <input
              ref={inputRef}
              {...control}
              type="text"
              inputMode="numeric"
              autoComplete="off"
              aria-label={ariaLabel}
              required={required}
              value={text}
              onChange={onChange}
              onBlur={onBlur}
              onKeyDown={(e) => {
                if (e.key === "ArrowDown" && e.altKey) {
                  e.preventDefault()
                  setOpen(true)
                }
              }}
            />
            <PopoverAnchor asChild>
              <span aria-hidden className="pointer-events-none absolute inset-0" />
            </PopoverAnchor>
            {name && <input type="hidden" name={name} value={total === null ? "" : toValue(total)} />}
          </>
        )}
      </Field>
      <PopoverContent
        id={popId}
        align="start"
        className="max-h-(--radix-popover-content-available-height) w-[20rem] gap-0 overflow-y-auto overscroll-contain p-5"
        // the panel focuses its own hour chip
        onOpenAutoFocus={(e) => e.preventDefault()}
        onCloseAutoFocus={(e) => {
          e.preventDefault()
          inputRef.current?.focus()
        }}
        // clicks on the field (its clock button included) are handled there
        onInteractOutside={(e) => {
          const t = e.target as Node | null
          if (t && inputRef.current?.closest("[data-slot=field-container]")?.contains(t)) e.preventDefault()
        }}
        aria-label={label ? `${label}: time picker` : "Time picker"}
      >
        <TimePanel initial={startAt()} clock={clock} ok={limits.allowed} mode={mode} onConfirm={confirm} onCancel={() => setOpen(false)} />
      </PopoverContent>
    </Popover>
  )
}


// lets FormItem recognise this control without importing it
TimePicker.formControl = "field" as const

export { TimePicker, type TimePickerProps }
