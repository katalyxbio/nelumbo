/* eslint-disable @typescript-eslint/no-require-imports */
// Rendered-page checks: axe-core contrast + Material Symbols glyphs missing from the subset. Needs the docs server on :3000.
const { chromium } = require("playwright")
const axe = require.resolve("axe-core/axe.min.js")
;(async () => {
  const b = await chromium.launch()
  let total = 0
  for (const path of ["/", "/components/button", "/components/icon-button", "/components/segmented-button", "/components/button-group", "/components/split-button", "/components/fab", "/components/input", "/components/textarea", "/components/switch", "/components/checkbox", "/components/radio-group", "/components/slider", "/components/card", "/components/chip"])
    for (const scheme of ["light", "dark"]) {
      const p = await b.newPage({ colorScheme: scheme })
      await p.goto("http://localhost:3000" + path, { waitUntil: "networkidle" })
      await p.waitForTimeout(300)
      await p.evaluate(() => document.fonts.ready)
      // A ligature that didn't resolve renders as text far wider than 1em.
      const missing = await p.evaluate(() => {
        const out = []
        for (const e of document.querySelectorAll("[data-slot=icon]")) {
          const r = document.createRange()
          r.selectNodeContents(e)
          if (r.getBoundingClientRect().width > e.getBoundingClientRect().width * 1.5) out.push(e.textContent)
        }
        return out
      })
      // Glyph alignment: the line box must equal the icon box, or the glyph drifts.
      const misaligned = await p.evaluate(() =>
        [...document.querySelectorAll("[data-slot=icon]")]
          .filter((e) => {
            if (!e.getClientRects().length) return false // hidden (display: none)
            const cs = getComputedStyle(e)
            return Math.abs(parseFloat(cs.lineHeight) - parseFloat(cs.fontSize)) > 0.5 || Math.abs(e.offsetHeight - parseFloat(cs.fontSize)) > 1
          })
          .map((e) => `${e.textContent} (line-height ${getComputedStyle(e).lineHeight}, font-size ${getComputedStyle(e).fontSize})`)
      )
      for (const m of new Set(misaligned)) {
        total++
        console.log(`${scheme.padEnd(5)} ${path.padEnd(19)} icon ${m} is not vertically centered`)
      }
      for (const m of new Set(missing)) {
        total++
        console.log(`${scheme.padEnd(5)} ${path.padEnd(19)} icon "${m}" is not in the font subset (run npm run icons)`)
      }
      await p.addScriptTag({ path: axe })
      const res = await p.evaluate(() => axe.run(document, { runOnly: ["color-contrast"] }))
      for (const v of res.violations)
        for (const n of v.nodes) {
          total++
          const d = n.any[0]?.data || {}
          console.log(`${scheme.padEnd(5)} ${path.padEnd(19)} ${String(d.contrastRatio).padEnd(5)} need ${d.expectedContrastRatio}  ${n.target.join(" ").slice(0, 70)}  "${(n.html.match(/>([^<]{1,40})</) || [, ""])[1]}"`)
        }
      await p.close()
    }
  console.log(total ? `\n${total} problems` : "No contrast violations, no missing icons.")
  process.exitCode = total ? 1 : 0
  await b.close()
})()
