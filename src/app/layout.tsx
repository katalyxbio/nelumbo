import type { Metadata } from "next"
import { GeistSans } from "geist/font/sans"
import { GeistMono } from "geist/font/mono"
import { StudioProvider } from "@/components/docs/studio"
import { DocsShell } from "@/components/docs/shell"
import { materialSymbolsUrl } from "@/registry/velvet/ui/icon"
import { USED_ICONS } from "@/lib/velvet/icons.generated"
import "./globals.css"

export const metadata: Metadata = {
  title: "Velvet",
  description: "A soft, tactile design system for shadcn/ui, generated from a single seed color.",
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link rel="stylesheet" href={materialSymbolsUrl(USED_ICONS)} />
      </head>
      <body className={`${GeistSans.variable} ${GeistMono.variable} font-sans`}>
        <StudioProvider>
          <DocsShell>{children}</DocsShell>
        </StudioProvider>
      </body>
    </html>
  )
}
