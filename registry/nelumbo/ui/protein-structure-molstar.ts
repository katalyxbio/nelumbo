/**
 * Mol* engine for Nelumbo's ProteinStructure.
 *
 * ProteinStructure imports this module lazily, on the client, so Mol* never
 * weighs on the first load or on pages that don't show a structure. It runs
 * Mol*'s WebGL renderer without its user interface; the component keeps its
 * own controls, legend, labels and tooltips on top.
 */
import { PluginContext } from "molstar/lib/mol-plugin/context"
import { DefaultPluginSpec } from "molstar/lib/mol-plugin/spec"
import { PluginBehaviors } from "molstar/lib/mol-plugin/behavior"
import { StructureFocusRepresentation } from "molstar/lib/mol-plugin/behavior/dynamic/selection/structure-focus-representation"
import { Color } from "molstar/lib/mol-util/color"
import { Vec3, Vec4 } from "molstar/lib/mol-math/linear-algebra"
import { StructureElement, StructureProperties, StructureSelection, type Structure } from "molstar/lib/mol-model/structure"
import { MolScriptBuilder as MS } from "molstar/lib/mol-script/language/builder"
import { Script } from "molstar/lib/mol-script/script"
import { SecondaryStructureColors } from "molstar/lib/mol-theme/color/secondary-structure"
import { ColorThemeCategory } from "molstar/lib/mol-theme/color/categories"
import { PostprocessingParams } from "molstar/lib/mol-canvas3d/passes/postprocessing"
import type { ColorTheme } from "molstar/lib/mol-theme/color"
import type { Location } from "molstar/lib/mol-model/location"
import type { StateObjectSelector } from "molstar/lib/mol-state"

type RGB = [number, number, number]
type Representation = "cartoon" | "tube" | "trace" | "ball-and-stick" | "spacefill" | "surface"
type ColorBy = "structure" | "plddt" | "rainbow" | "plain"

type Style = {
  representation: Representation
  colorBy: ColorBy
  /** null for no outline */
  outline: RGB | null
  background: RGB
  helix: RGB
  strand: RGB
  coil: RGB
  plain: RGB
  highlightColor: RGB
  /** residue numbers whose side chains are drawn as ball-and-stick */
  sideChains: number[]
  spin: boolean
  /** flat: plain colors, no lights or ambient occlusion. lit: Mol*'s lighting and occlusion. */
  shading: "flat" | "lit"
}

type Source = { pdb: string } | { url: string; format: "pdb" | "mmcif" | "bcif" }

const rgb = ([r, g, b]: RGB) => Color.fromRgb(Math.round(r), Math.round(g), Math.round(b))

const PLDDT = [
  { min: 90, hex: 0x0053d6 },
  { min: 70, hex: 0x65cbf3 },
  { min: 50, hex: 0xffdb13 },
  { min: 0, hex: 0xff7d45 },
]

/** AlphaFold's confidence bands, read from the B-factor column where AlphaFold stores pLDDT. */
function plddtBands(_ctx: unknown, props: Record<string, never>): ColorTheme<Record<string, never>> {
  return {
    factory: plddtBands as never,
    granularity: "group",
    color: (location: Location) => {
      if (!StructureElement.Location.is(location)) return Color(0xaaaaaa)
      const b = StructureProperties.atom.B_iso_or_equiv(location)
      return Color(PLDDT.find((x) => b >= x.min)!.hex)
    },
    props,
    description: "AlphaFold pLDDT in four bands.",
  }
}
const PlddtBandsTheme = {
  name: "nelumbo-plddt",
  label: "pLDDT bands",
  category: ColorThemeCategory.Validation,
  factory: plddtBands,
  getParams: () => ({}),
  defaultValues: {},
  isApplicable: () => true,
} as unknown as ColorTheme.Provider<Record<string, never>, "nelumbo-plddt">

const DROP = new Set<unknown>([
  PluginBehaviors.Representation.SelectLoci,
  PluginBehaviors.Representation.FocusLoci,
  PluginBehaviors.Camera.FocusLoci,
  PluginBehaviors.Camera.CameraAxisHelper,
  PluginBehaviors.Camera.CameraControls,
  PluginBehaviors.State.SnapshotControls,
  StructureFocusRepresentation,
])

const residueQuery = (nums: number[], sideChainOnly: boolean) =>
  MS.struct.generator.atomGroups({
    "residue-test": MS.core.set.has([MS.set(...nums), MS.ammp("auth_seq_id")]),
    ...(sideChainOnly ? { "atom-test": MS.core.logic.not([MS.core.set.has([MS.set("N", "C", "O"), MS.ammp("label_atom_id")])]) } : {}),
  })

export type MolstarEngine = Awaited<ReturnType<typeof createMolstarEngine>>

/** Starts Mol* on a canvas. Resolves to null when WebGL isn't available. */
export async function createMolstarEngine(canvas: HTMLCanvasElement, container: HTMLDivElement) {
  const spec = DefaultPluginSpec()
  spec.behaviors = spec.behaviors.filter((b) => !DROP.has(b.transformer))
  const plugin = new PluginContext(spec)
  await plugin.init()
  const ok = await plugin.initViewerAsync(canvas, container)
  if (!ok || !plugin.canvas3d) {
    plugin.dispose()
    return null
  }
  plugin.representation.structure.themes.colorThemeRegistry.add(PlddtBandsTheme)

  let structureRef: StateObjectSelector | null = null
  let polymerRef: StateObjectSelector | null = null
  let reps: StateObjectSelector[] = []
  let style: Style | null = null
  let busy = Promise.resolve()

  const structureData = () => (structureRef?.cell?.obj?.data as Structure | undefined) ?? null

  async function clearReps() {
    if (!reps.length) return
    const b = plugin.state.data.build()
    for (const r of reps) b.delete(r.ref)
    reps = []
    await b.commit()
  }

  function colorTheme(s: Style) {
    switch (s.colorBy) {
      case "plddt":
        return { color: "nelumbo-plddt" as const, colorParams: {} }
      case "rainbow":
        return { color: "sequence-id" as const, colorParams: {} }
      case "plain":
        return { color: "uniform" as const, colorParams: { value: rgb(s.plain) } }
      default: {
        const helix = rgb(s.helix)
        const strand = rgb(s.strand)
        const coil = rgb(s.coil)
        const colors = Object.fromEntries(Object.keys(SecondaryStructureColors).map((k) => [k, coil])) as Record<keyof typeof SecondaryStructureColors, Color>
        Object.assign(colors, { alphaHelix: helix, threeTenHelix: helix, piHelix: helix, betaStrand: strand })
        return { color: "secondary-structure" as const, colorParams: { colors: { name: "custom", params: colors }, saturation: 0, lightness: 0 } }
      }
    }
  }

  async function build() {
    const s = style
    if (!s || !structureRef || !polymerRef) return
    await clearReps()
    // Mol*'s typings only know its built-in theme names; ours is registered at runtime
    const add = plugin.builders.structure.representation.addRepresentation.bind(plugin.builders.structure.representation) as unknown as (
      ref: StateObjectSelector,
      props: Record<string, unknown>
    ) => Promise<StateObjectSelector>
    const theme = colorTheme(s)
    const elementTheme = {
      color: "element-symbol" as const,
      colorParams: { carbonColor: { name: "uniform", params: { value: rgb(s.coil) } }, saturation: 0, lightness: 0 },
    }
    const r = s.representation
    if (r === "cartoon") reps.push(await add(polymerRef, { type: "cartoon", ...theme }))
    else if (r === "tube") reps.push(await add(polymerRef, { type: "putty", typeParams: { sizeFactor: 0.4 }, size: "uniform", sizeParams: { value: 1 }, ...theme }))
    else if (r === "trace") reps.push(await add(polymerRef, { type: "backbone", typeParams: { sizeFactor: 0.25 }, ...theme }))
    else if (r === "ball-and-stick") reps.push(await add(polymerRef, { type: "ball-and-stick", ...elementTheme }))
    else if (r === "spacefill") reps.push(await add(polymerRef, { type: "spacefill", ...elementTheme }))
    else reps.push(await add(polymerRef, { type: "molecular-surface", ...theme }))

    if (s.sideChains.length && (r === "cartoon" || r === "tube" || r === "trace")) {
      const comp = await plugin.builders.structure.tryCreateComponentFromExpression(structureRef, residueQuery(s.sideChains, true), `nelumbo-side-chains-${s.sideChains.join("-")}`)
      if (comp) {
        reps.push(comp)
        reps.push(await add(comp, { type: "ball-and-stick", ...elementTheme }))
      }
    }
  }

  function applyCanvas() {
    const s = style
    if (!s || !plugin.canvas3d) return
    const post = plugin.canvas3d.props.postprocessing
    plugin.canvas3d.setProps({
      transparentBackground: true,
      renderer: {
        ...plugin.canvas3d.props.renderer,
        backgroundColor: rgb(s.background),
        highlightColor: rgb(s.highlightColor),
        // flat: no directional light, full ambient, so every surface shows its true color
        ...(s.shading === "flat"
          ? { light: [], ambientIntensity: 1, exposure: 1 }
          : {
              light: [{ inclination: 150, azimuth: 320, color: Color.fromNormalizedRgb(1, 1, 1), intensity: 0.6 }],
              ambientIntensity: 0.4,
            }),
      },
      // hover edges are drawn by a separate marking pass with its own (pink) default
      marking: { ...plugin.canvas3d.props.marking, highlightEdgeColor: rgb(s.highlightColor), selectEdgeColor: rgb(s.highlightColor) },
      postprocessing: {
        ...post,
        occlusion:
          s.shading === "lit" ? { name: "on", params: PostprocessingParams.occlusion.map("on").defaultValue as never } : { name: "off", params: {} },
        shadow: { name: "off", params: {} },
        outline: s.outline
          ? { name: "on", params: { scale: s.shading === "flat" ? 2 : 1, threshold: 0.33, color: rgb(s.outline), includeTransparent: true } }
          : { name: "off", params: {} },
      },
      camera: {
        ...plugin.canvas3d.props.camera,
        helper: { ...plugin.canvas3d.props.camera.helper, axes: { name: "off", params: {} } },
      },
      trackball: {
        ...plugin.canvas3d.props.trackball,
        animate: s.spin ? { name: "spin", params: { speed: 0.25, axis: Vec3.create(0, 1, 0) } } : { name: "off", params: {} },
      },
    })
  }

  const queue = (f: () => Promise<void>) => (busy = busy.then(f, f))

  /** Mol*'s reset fits the whole bounding sphere with room to spare; come in a little closer, like the canvas view. */
  async function frameIt(durationMs: number) {
    const c3d = plugin.canvas3d
    if (!c3d) return
    c3d.requestCameraReset({ durationMs: 0 })
    await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)))
    const s = c3d.camera.getSnapshot()
    const dir = Vec3.sub(Vec3(), s.position, s.target)
    c3d.camera.setState({ position: Vec3.add(Vec3(), s.target, Vec3.scale(Vec3(), dir, 0.72)) }, durationMs)
  }

  return {
    plugin,

    /** Loads a structure, replacing any earlier one. */
    load(source: Source, label = "Structure") {
      return queue(async () => {
        await plugin.clear()
        reps = []
        const data =
          "pdb" in source
            ? await plugin.builders.data.rawData({ data: source.pdb, label })
            : await plugin.builders.data.download({ url: source.url, isBinary: source.format === "bcif", label })
        const trajectory = await plugin.builders.structure.parseTrajectory(data, "pdb" in source || source.format === "pdb" ? "pdb" : "mmcif")
        const model = await plugin.builders.structure.createModel(trajectory)
        structureRef = await plugin.builders.structure.createStructure(model)
        polymerRef = (await plugin.builders.structure.tryCreateComponentStatic(structureRef, "polymer")) ?? null
        await build()
        // loading resets the canvas settings, so apply ours again
        applyCanvas()
        await frameIt(0)
      })
    },

    /** Representation, colors, outline and spin. Rebuilds only what changed. */
    setStyle(next: Style) {
      const prev = style
      style = next
      applyCanvas()
      const rebuild =
        !prev ||
        prev.representation !== next.representation ||
        prev.colorBy !== next.colorBy ||
        prev.sideChains.join() !== next.sideChains.join() ||
        prev.shading !== next.shading ||
        [prev.helix, prev.strand, prev.coil, prev.plain].join() !== [next.helix, next.strand, next.coil, next.plain].join()
      const reframe = prev && prev.representation !== next.representation
      return rebuild
        ? queue(async () => {
            await build()
            applyCanvas()
            // a new representation changes the scene's bounds and Mol* re-centers; frame it the way we do on load
            if (reframe) await frameIt(0)
          })
        : Promise.resolve()
    },

    /** Highlights one residue (or none), the way hovering it would. */
    highlight(residue: number | null) {
      const s = structureData()
      if (!s) return
      if (residue == null) {
        plugin.managers.interactivity.lociHighlights.clearHighlights()
        return
      }
      const sel = Script.getStructureSelection(residueQuery([residue], false), s)
      plugin.managers.interactivity.lociHighlights.highlightOnly({ loci: StructureSelection.toLociWithSourceUnits(sel) })
    },

    /** Calls back with the residue under the pointer (number and three-letter name), or null. */
    onHover(cb: (info: { residue: number; name: string } | null) => void) {
      let last: number | null = null
      const sub = plugin.behaviors.interaction.hover.subscribe(({ current }) => {
        const loci = current.loci
        const loc = StructureElement.Loci.is(loci) && !StructureElement.Loci.isEmpty(loci) ? StructureElement.Loci.getFirstLocation(loci) : undefined
        const residue = loc ? StructureProperties.residue.auth_seq_id(loc) : null
        if (residue === last) return
        last = residue
        cb(loc && residue != null ? { residue, name: StructureProperties.atom.label_comp_id(loc) } : null)
      })
      return () => sub.unsubscribe()
    },

    /** Calls back after every frame, for overlays that follow the camera. */
    onDraw(cb: () => void) {
      const sub = plugin.canvas3d!.didDraw.subscribe(() => cb())
      return () => sub.unsubscribe()
    },

    /** Screen position (CSS px, from the top left) of a point in model space. */
    project(x: number, y: number, z: number) {
      const c3d = plugin.canvas3d!
      const out = Vec4()
      c3d.camera.project(out, Vec3.create(x, y, z))
      const ratio = c3d.webgl.pixelRatio
      const h = c3d.camera.viewport.height
      return { x: out[0] / ratio, y: (h - out[1]) / ratio }
    },

    /** Turns the camera around its target: dx sideways, dy up and down (radians). */
    turn(dx: number, dy: number) {
      const cam = plugin.canvas3d!.camera
      const s = cam.getSnapshot()
      const dir = Vec3.sub(Vec3(), s.position, s.target)
      const up = Vec3.normalize(Vec3(), s.up)
      const right = Vec3.normalize(Vec3(), Vec3.cross(Vec3(), up, dir))
      const rot = (v: Vec3, axis: Vec3, a: number) => {
        // Rodrigues' rotation
        const c = Math.cos(a)
        const sn = Math.sin(a)
        const k = Vec3.dot(axis, v)
        const cr = Vec3.cross(Vec3(), axis, v)
        return Vec3.create(v[0] * c + cr[0] * sn + axis[0] * k * (1 - c), v[1] * c + cr[1] * sn + axis[1] * k * (1 - c), v[2] * c + cr[2] * sn + axis[2] * k * (1 - c))
      }
      let d = rot(dir, up, -dx)
      let u = up
      d = rot(d, right, -dy)
      u = rot(u, right, -dy)
      cam.setState({ position: Vec3.add(Vec3(), s.target, d), up: u }, 0)
    },

    /** Moves the camera toward (f > 1) or away from (f < 1) its target. */
    zoom(f: number) {
      const cam = plugin.canvas3d!.camera
      const s = cam.getSnapshot()
      const dir = Vec3.sub(Vec3(), s.position, s.target)
      cam.setState({ position: Vec3.add(Vec3(), s.target, Vec3.scale(Vec3(), dir, 1 / f)) }, 150)
    },

    reset() {
      void frameIt(250)
    },

    resize() {
      plugin.canvas3d?.handleResize()
    },

    dispose() {
      plugin.dispose()
    },
  }
}

