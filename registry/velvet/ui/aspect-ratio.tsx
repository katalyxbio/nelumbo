"use client"

import { AspectRatio as AspectRatioPrimitive } from "radix-ui"
import * as React from "react"

/**
 * Velvet AspectRatio (built on Radix AspectRatio)
 *
 * shadcn's AspectRatio, unchanged: a box that keeps a width-to-height
 * ratio whatever its width. It draws nothing itself, so give the media
 * Velvet's radius (`rounded-xl` for photos, `rounded-2xl` for hero images)
 * and `object-cover` so it fills the box.
 *
 *   <AspectRatio ratio={16 / 9} className="overflow-hidden rounded-xl bg-surface-container-high">
 *     <img src="/cover.jpg" alt="" className="size-full object-cover" />
 *   </AspectRatio>
 */
function AspectRatio(props: React.ComponentProps<typeof AspectRatioPrimitive.Root>) {
  return <AspectRatioPrimitive.Root data-slot="aspect-ratio" {...props} />
}

export { AspectRatio }
