"use client"

import * as React from "react"
import { Equation, Formula } from "@/registry/nelumbo/ui/math"
import { Textarea } from "@/registry/nelumbo/ui/textarea"
import { Code, PageHeader, Preview, PropsTable, Section } from "@/components/docs/primitives"

const r = String.raw

function Playground() {
  const [tex, setTex] = React.useState(r`\Delta G = \Delta G^{\circ\prime} + RT \ln \frac{[\mathrm{ADP}][\mathrm{P_i}]}{[\mathrm{ATP}]}`)
  return (
    <div className="grid min-w-0 gap-6 md:grid-cols-2 md:items-center">
      <Textarea label="TeX" value={tex} onChange={(e) => setTex(e.target.value)} className="font-mono" spellCheck={false} />
      <Equation copyable={false}>{tex}</Equation>
    </div>
  )
}

export default function MathPage() {
  return (
    <>
      <PageHeader eyebrow="Component 88" title="Math">
        TeX math typeset with KaTeX. Formula sits inside a sentence; Equation stands on its own line, numbered and
        captioned when you want. Screen readers get real MathML, and chemistry is one <code className="font-mono">\ce</code> away.
      </PageHeader>

      <Section title="Install">
        <Code>{`npx shadcn@latest add @nelumbo/math`}</Code>
      </Section>

      <Section title="Usage">
        <Code>{`import { Equation, Formula } from "@/components/ui/math"

// String.raw keeps backslashes as written
<p>The rate is <Formula>{String.raw\`v = \\frac{V_{max}[S]}{K_m + [S]}\`}</Formula>.</p>

<Equation number={1} caption="Michaelis–Menten">
  {String.raw\`v = \\frac{V_{\\max}[S]}{K_m + [S]}\`}
</Equation>`}</Code>
      </Section>

      <Section title="Inline" description="Formula takes the size of the text around it and sits on its baseline.">
        <Preview className="block">
          <p className="max-w-[68ch] type-body-lg text-pretty">
            At low substrate the rate is nearly linear, <Formula>{r`v \approx \tfrac{V_{\max}}{K_m}[S]`}</Formula>, and it
            saturates at <Formula>{r`V_{\max}`}</Formula> when <Formula>{r`[S] \gg K_m`}</Formula>. A buffer works best
            within one unit of its <Formula>{r`\mathrm{p}K_a`}</Formula>, where{" "}
            <Formula>{r`[\mathrm{A^-}] \approx [\mathrm{HA}]`}</Formula>.
          </p>
        </Preview>
      </Section>

      <Section title="Numbered equations" description="number puts a reference on the right; caption names the equation. Hover or focus to copy the TeX.">
        <Preview className="flex-col items-stretch gap-6">
          <Equation number={1} caption="Michaelis–Menten kinetics">{r`v = \frac{V_{\max}\,[S]}{K_m + [S]}`}</Equation>
          <Equation number={2} caption="Hill equation, cooperative binding">{r`\theta = \frac{[L]^{n_H}}{K_d + [L]^{n_H}}`}</Equation>
          <Equation number={3} caption="Henderson–Hasselbalch">{r`\mathrm{pH} = \mathrm{p}K_a + \log_{10} \frac{[\mathrm{A^-}]}{[\mathrm{HA}]}`}</Equation>
        </Preview>
      </Section>

      <Section title="Aligned derivations" description="aligned lines several steps up on their equals signs. This is the steady-state derivation of Michaelis–Menten.">
        <Preview className="block">
          <Equation number="4">
            {r`\begin{aligned}
k_1[E][S] &= (k_{-1} + k_2)[ES] \\
[E] &= [E]_0 - [ES] \\
[ES] &= \frac{[E]_0 [S]}{K_m + [S]}, \qquad K_m = \frac{k_{-1} + k_2}{k_1} \\
v = k_2[ES] &= \frac{V_{\max}[S]}{K_m + [S]}
\end{aligned}`}
          </Equation>
        </Preview>
      </Section>

      <Section title="Populations, light and membranes" description="Fractions, sums, derivatives, cases and Greek letters.">
        <div className="grid min-w-0 gap-3 md:grid-cols-2">
          {[
            ["Hardy–Weinberg equilibrium", r`p^2 + 2pq + q^2 = 1`],
            ["Logistic growth", r`\frac{dN}{dt} = rN\left(1 - \frac{N}{K}\right)`],
            ["Beer–Lambert law", r`A = \varepsilon\, \ell\, c = \log_{10} \frac{I_0}{I}`],
            ["Nernst potential", r`E_{\mathrm{K}} = \frac{RT}{zF} \ln \frac{[\mathrm{K^+}]_{\text{out}}}{[\mathrm{K^+}]_{\text{in}}}`],
            ["Shannon information, per position of a sequence logo", r`R_i = \log_2 4 - \left(-\sum_{b \in \{A,C,G,T\}} f_{b,i} \log_2 f_{b,i}\right)`],
            [
              "DESeq2 count model",
              r`K_{ij} \sim \mathrm{NB}(\mu_{ij}, \alpha_i), \quad \log_2 q_{ij} = \sum_r x_{jr} \beta_{ir}`,
            ],
          ].map(([cap, tex]) => (
            <div key={cap} className="flex min-w-0 flex-col justify-center rounded-3xl bg-surface-container-low p-5 dark:bg-surface-container-lowest">
              <Equation caption={cap}>{tex}</Equation>
            </div>
          ))}
        </div>
      </Section>

      <Section title="Chemistry" description="mhchem is built in: \ce writes reactions with proper arrows, charges and states, and \pu writes units.">
        <Preview className="flex-col items-stretch gap-6">
          <Equation caption="ATP hydrolysis">{r`\ce{ATP + H2O -> ADP + P_i} \qquad \Delta G^{\circ\prime} = \pu{-30.5 kJ mol-1}`}</Equation>
          <Equation caption="Bicarbonate buffer">{r`\ce{CO2 + H2O <=> H2CO3 <=> H+ + HCO3-}`}</Equation>
          <Equation caption="Glucose oxidation">{r`\ce{C6H12O6 + 6 O2 -> 6 CO2 + 6 H2O}`}</Equation>
        </Preview>
      </Section>

      <Section title="Matrices and cases" description="Rotation about z, used to turn a structure, and a piecewise dose response.">
        <Preview className="flex-col items-stretch gap-6">
          <Equation>{r`R_z(\theta) = \begin{pmatrix} \cos\theta & -\sin\theta & 0 \\ \sin\theta & \cos\theta & 0 \\ 0 & 0 & 1 \end{pmatrix}`}</Equation>
          <Equation>{r`E(c) = \begin{cases} 0 & c < c_{\text{th}} \\ E_{\max}\,\dfrac{c^{h}}{EC_{50}^{h} + c^{h}} & c \ge c_{\text{th}} \end{cases}`}</Equation>
        </Preview>
      </Section>

      <Section title="Try it" description="Type TeX and it typesets as you go. An error shows the source and what went wrong, instead of breaking the page.">
        <Preview className="block">
          <Playground />
        </Preview>
      </Section>

      <Section title="Props">
        <PropsTable
          rows={[
            ["children / tex", "string", "—", "The TeX source. String.raw saves escaping backslashes."],
            ["macros", "Record<string, string>", "—", 'Shortcuts, e.g. { "\\\\R": "\\\\mathbb{R}" }.'],
            ["Equation number", "ReactNode", "—", "Reference at the right, in parentheses."],
            ["Equation caption", "ReactNode", "—", "A short caption under the equation."],
            ["Equation align", '"center" | "start"', '"center"', "Where the equation sits."],
            ["Equation copyable", "boolean", "true", "A button that copies the TeX source."],
          ]}
        />
      </Section>
    </>
  )
}
