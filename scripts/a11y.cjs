/* eslint-disable @typescript-eslint/no-require-imports */
// Rendered-page checks: axe-core contrast + Material Symbols glyphs missing from the subset. Needs the docs server on :3000.
const { chromium } = require("playwright")
const axe = require.resolve("axe-core/axe.min.js")
;(async () => {
  const b = await chromium.launch()
  let total = 0
  for (const path of ["/", "/components/button", "/components/icon-button"])
    for (const scheme of ["light", "dark"]) {
      const p = await b.newPage({ colorScheme: scheme })
      await p.goto("http://localhost:3000" + path, { waitUntil: "networkidle" })
      await p.waitForTimeout(300)
      await p.evaluate(() => document.fonts.ready)
      const missing = await p.evaluate(() =>
        [...document.querySelectorAll("[data-slot=icon]")].filter((e) => e.scrollWidth > e.clientWidth + 1).map((e) => e.textContent)
      )
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
