// Rendered-page contrast check with axe-core. Requires the docs server on :3000.
const { chromium } = require("playwright")
const axe = require.resolve("axe-core/axe.min.js")
;(async () => {
  const b = await chromium.launch()
  let total = 0
  for (const path of ["/", "/components/button"])
    for (const scheme of ["light", "dark"]) {
      const p = await b.newPage({ colorScheme: scheme })
      await p.goto("http://localhost:3000" + path, { waitUntil: "networkidle" })
      await p.waitForTimeout(300)
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
  console.log(total ? `\n${total} contrast violations` : "No contrast violations.")
  await b.close()
})()
