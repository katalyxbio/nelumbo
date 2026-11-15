"use client"

import * as React from "react"
import {
  Sidebar,
  SidebarCollapsible,
  SidebarCollapsibleContent,
  SidebarCollapsibleTrigger,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupAction,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuAction,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuChevron,
  SidebarMenuItem,
  SidebarMenuSkeleton,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarProvider,
  SidebarRail,
  SidebarSeparator,
  SidebarTrigger,
  useSidebar,
} from "@/registry/velvet/ui/sidebar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/registry/velvet/ui/dropdown-menu"
import { Avatar } from "@/registry/velvet/ui/avatar"
import { Icon, type IconName } from "@/registry/velvet/ui/icon"
import { Skeleton } from "@/registry/velvet/ui/skeleton"
import { Code, PageHeader, PropsTable, Section } from "@/components/docs/primitives"

type Variant = "sidebar" | "floating" | "inset"
type Collapsible = "offcanvas" | "icon" | "none"

const TEAMS = [
  { name: "Acme Inc", plan: "Enterprise" },
  { name: "Acme Labs", plan: "Startup" },
  { name: "Evil Corp", plan: "Free" },
]

const PLATFORM: { id: string; icon: IconName; label: string; badge?: number }[] = [
  { id: "dashboard", icon: "dashboard", label: "Dashboard" },
  { id: "inbox", icon: "inbox", label: "Inbox", badge: 12 },
  { id: "reports", icon: "query_stats", label: "Reports" },
]

const PROJECTS = ["Overview", "Roadmap", "Archive"]

function TeamSwitcher() {
  const { isMobile } = useSidebar()
  const [team, setTeam] = React.useState(TEAMS[0])
  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton size="lg" tooltip="Switch team">
              <Avatar name={team.name} shape="rounded" color="auto" size="sm" />
              <div className="grid flex-1 text-left">
                <span className="truncate type-label-lg">{team.name}</span>
                <span className="truncate type-body-sm text-muted-foreground">{team.plan}</span>
              </div>
              <Icon name="unfold_more" className="ml-auto text-muted-foreground" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent side={isMobile ? "bottom" : "right"} align="start" className="min-w-56">
            <DropdownMenuLabel>Teams</DropdownMenuLabel>
            {TEAMS.map((t) => (
              <DropdownMenuItem key={t.name} onSelect={() => setTeam(t)}>
                <Avatar name={t.name} shape="rounded" color="auto" size="xs" />
                {t.name}
              </DropdownMenuItem>
            ))}
            <DropdownMenuItem>
              <Icon name="add" />
              Add team
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}

function UserMenu() {
  const { isMobile } = useSidebar()
  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton size="lg" tooltip="Maya Kowalski">
              <Avatar name="Maya Kowalski" color="auto" size="sm" />
              <div className="grid flex-1 text-left">
                <span className="truncate type-label-lg">Maya Kowalski</span>
                <span className="truncate type-body-sm text-muted-foreground">maya@acme.com</span>
              </div>
              <Icon name="more_horiz" className="ml-auto text-muted-foreground" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent side={isMobile ? "bottom" : "right"} align="end" className="min-w-56">
            <DropdownMenuGroup>
              <DropdownMenuItem>
                <Icon name="account_circle" />
                Account
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Icon name="notifications" />
                Notifications
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuItem>
              <Icon name="logout" />
              Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}

function AppSidebar({
  variant,
  collapsible,
  active,
  setActive,
  rail,
}: {
  variant: Variant
  collapsible: Collapsible
  active: string
  setActive: (id: string) => void
  rail?: boolean
}) {
  const { state } = useSidebar()
  const inProjects = active.startsWith("projects:")
  return (
    <Sidebar variant={variant} collapsible={collapsible} aria-label="Application sidebar">
      <SidebarHeader>
        <TeamSwitcher />
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Platform</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {PLATFORM.map((item) => (
                <SidebarMenuItem key={item.id}>
                  <SidebarMenuButton tooltip={item.label} isActive={active === item.id} onClick={() => setActive(item.id)}>
                    <Icon name={item.icon} />
                    <span>{item.label}</span>
                  </SidebarMenuButton>
                  {item.badge && <SidebarMenuBadge>{item.badge}</SidebarMenuBadge>}
                </SidebarMenuItem>
              ))}
              <SidebarCollapsible asChild defaultOpen>
                <SidebarMenuItem>
                  <SidebarCollapsibleTrigger asChild>
                    <SidebarMenuButton tooltip="Projects" isActive={inProjects && state === "collapsed"}>
                      <Icon name="folder" />
                      <span>Projects</span>
                      <SidebarMenuChevron />
                    </SidebarMenuButton>
                  </SidebarCollapsibleTrigger>
                  <SidebarCollapsibleContent>
                    <SidebarMenuSub>
                      {PROJECTS.map((p) => (
                        <SidebarMenuSubItem key={p}>
                          <SidebarMenuSubButton asChild isActive={active === `projects:${p}`}>
                            <button type="button" onClick={() => setActive(`projects:${p}`)}>
                              <span>{p}</span>
                            </button>
                          </SidebarMenuSubButton>
                        </SidebarMenuSubItem>
                      ))}
                    </SidebarMenuSub>
                  </SidebarCollapsibleContent>
                </SidebarMenuItem>
              </SidebarCollapsible>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarSeparator />

        <SidebarGroup>
          <SidebarGroupLabel>Workspace</SidebarGroupLabel>
          <SidebarGroupAction aria-label="Invite people" title="Invite people">
            <Icon name="add" />
          </SidebarGroupAction>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton tooltip="Team" isActive={active === "team"} onClick={() => setActive("team")}>
                  <Icon name="group" />
                  <span>Team</span>
                </SidebarMenuButton>
                <SidebarMenuAction showOnHover aria-label="Team options">
                  <Icon name="more_horiz" />
                </SidebarMenuAction>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton tooltip="Settings" isActive={active === "settings"} onClick={() => setActive("settings")}>
                  <Icon name="settings" />
                  <span>Settings</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <UserMenu />
      </SidebarFooter>
      {rail && <SidebarRail />}
    </Sidebar>
  )
}

function titleOf(active: string) {
  if (active.startsWith("projects:")) return `Projects, ${active.slice(9)}`
  return active.charAt(0).toUpperCase() + active.slice(1)
}

/** One bounded frame with its own provider: its sidebar is laid out inside the box and Ctrl/Cmd+B only works while focus is in it. */
function Frame({
  variant = "sidebar",
  collapsible = "offcanvas",
  rail,
  defaultOpen = true,
}: {
  variant?: Variant
  collapsible?: Collapsible
  rail?: boolean
  defaultOpen?: boolean
}) {
  const [active, setActive] = React.useState("dashboard")
  return (
    <div className="h-[41rem] w-full overflow-hidden rounded-3xl bg-background shadow-e1 dark:bg-surface-container-lowest">
      <SidebarProvider contained defaultOpen={defaultOpen} cookieName={false} shortcutScope="provider">
        <AppSidebar variant={variant} collapsible={collapsible} active={active} setActive={setActive} rail={rail} />
        <SidebarInset asChild className="min-w-0">
          <div>
            <header className="flex h-14 shrink-0 items-center gap-2 px-3">
              <SidebarTrigger />
              <h3 className="type-title-md">{titleOf(active)}</h3>
            </header>
            <div className="flex min-h-0 flex-1 flex-col gap-3 overflow-hidden p-6 pt-2">
              <p className="type-body-md text-muted-foreground">Try Ctrl+B (or Cmd+B) while focus is inside this frame.</p>
              {[0.9, 0.7, 0.8, 0.55].map((w, i) => (
                <div key={i} className="h-3 rounded-full bg-surface-container-high" style={{ width: `${w * 100}%` }} />
              ))}
            </div>
          </div>
        </SidebarInset>
      </SidebarProvider>
    </div>
  )
}

function LoadingFrame() {
  return (
    <div className="h-72 w-full overflow-hidden rounded-3xl bg-background shadow-e1 dark:bg-surface-container-lowest">
      <SidebarProvider contained cookieName={false} keyboardShortcut={false}>
        <Sidebar collapsible="none" aria-busy="true" aria-label="Loading navigation">
          <SidebarGroup>
            <SidebarGroupLabel>Loading</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {[0, 1, 2, 3].map((i) => (
                  <SidebarMenuItem key={i}>
                    <SidebarMenuSkeleton showIcon />
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </Sidebar>
        <div className="flex flex-1 flex-col gap-3 p-6">
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-3 w-3/4" />
          <Skeleton className="h-3 w-1/2" />
        </div>
      </SidebarProvider>
    </div>
  )
}

export default function SidebarPage() {
  return (
    <>
      <PageHeader eyebrow="Component 47" title="Sidebar">
        App navigation that collapses to icons or slides away, drop-in compatible with shadcn&apos;s Sidebar. There are
        no divider lines: the panel is a tonal surface, groups are separated by space, and the active item sits on a pill
        that springs from item to item. On phones it becomes a sheet.
      </PageHeader>

      <Section title="Install">
        <Code>{`npx shadcn@latest add @velvet/sidebar`}</Code>
      </Section>

      <Section
        title="App sidebar"
        description="A team switcher in a dropdown menu, grouped navigation with icons, a badge, an item action on hover, a collapsible sub-menu and a user menu in the footer. Pick another item and the pill springs over; open and close Projects to see the sub-menu slide and its chevron turn. The trigger slides the whole sidebar away."
      >
        <Frame rail />
      </Section>

      <Section
        title="Icon collapsible"
        description="collapsible=icon shrinks the sidebar to a rail of icons. The width eases on a spring while labels fade; the icons never move. The Inbox count becomes a dot on its icon, hovering an item names it in a tooltip, and the sub-menu folds into its parent. The strip on the sidebar's edge also toggles."
      >
        <Frame collapsible="icon" rail />
      </Section>

      <Section
        title="Floating"
        description="The panel stands off the edge with rounded corners and elevation instead of meeting it."
      >
        <Frame variant="floating" collapsible="icon" />
      </Section>

      <Section
        title="Inset"
        description="The page content becomes a raised, rounded card set into the sidebar's surface. The margin eases when the sidebar collapses."
      >
        <Frame variant="inset" />
      </Section>

      <Section
        title="Loading"
        description="SidebarMenuSkeleton stands in for rows that are still coming. Its widths are stable between server and client."
      >
        <LoadingFrame />
      </Section>

      <Section title="Usage" description="Same structure as shadcn. Put a SidebarProvider at the top of the layout; use Velvet's Icon inside buttons.">
        <Code>{`import {
  Sidebar, SidebarProvider, SidebarTrigger, SidebarInset, SidebarContent,
  SidebarGroup, SidebarGroupLabel, SidebarGroupContent,
  SidebarMenu, SidebarMenuItem, SidebarMenuButton, SidebarMenuBadge,
  SidebarCollapsible, SidebarCollapsibleTrigger, SidebarCollapsibleContent,
  SidebarMenuChevron, SidebarMenuSub, SidebarMenuSubItem, SidebarMenuSubButton,
} from "@/components/ui/sidebar"

<SidebarProvider>
  <Sidebar collapsible="icon">
    <SidebarContent>
      <SidebarGroup>
        <SidebarGroupLabel>Platform</SidebarGroupLabel>
        <SidebarGroupContent>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton asChild isActive={pathname === "/inbox"} tooltip="Inbox">
                <Link href="/inbox"><Icon name="inbox" /><span>Inbox</span></Link>
              </SidebarMenuButton>
              <SidebarMenuBadge>12</SidebarMenuBadge>
            </SidebarMenuItem>

            <SidebarCollapsible asChild defaultOpen>
              <SidebarMenuItem>
                <SidebarCollapsibleTrigger asChild>
                  <SidebarMenuButton tooltip="Projects">
                    <Icon name="folder" /><span>Projects</span><SidebarMenuChevron />
                  </SidebarMenuButton>
                </SidebarCollapsibleTrigger>
                <SidebarCollapsibleContent>
                  <SidebarMenuSub>
                    <SidebarMenuSubItem>
                      <SidebarMenuSubButton asChild isActive><Link href="/p/roadmap"><span>Roadmap</span></Link></SidebarMenuSubButton>
                    </SidebarMenuSubItem>
                  </SidebarMenuSub>
                </SidebarCollapsibleContent>
              </SidebarMenuItem>
            </SidebarCollapsible>
          </SidebarMenu>
        </SidebarGroupContent>
      </SidebarGroup>
    </SidebarContent>
  </Sidebar>
  <SidebarInset>
    <SidebarTrigger />
    {children}
  </SidebarInset>
</SidebarProvider>`}</Code>
      </Section>

      <Section
        title="Inside a card or preview"
        description="A sidebar is fixed to the viewport by default. Pass contained to the provider to lay it out inside the provider's box instead, give the box a height, and scope the shortcut so it doesn't act page-wide (this page does both)."
      >
        <Code>{`<div className="h-[41rem] overflow-hidden rounded-3xl">
  <SidebarProvider contained shortcutScope="provider" cookieName={false}>
    …
  </SidebarProvider>
</div>`}</Code>
      </Section>

      <Section title="Props" description="Every other shadcn part (Header, Footer, Content, Group, GroupLabel, GroupAction, GroupContent, Menu, MenuItem, MenuBadge, MenuSkeleton, MenuSub, MenuSubItem, Input, Separator, Rail, Trigger) takes the same props as shadcn's.">
        <PropsTable
          rows={[
            ["SidebarProvider defaultOpen / open / onOpenChange", "boolean", "true", "Uncontrolled or controlled open state"],
            ["SidebarProvider contained", "boolean", "false", "Lay the sidebar out inside the provider (absolute) instead of the viewport (fixed)"],
            ["SidebarProvider keyboardShortcut", "string | false", `"b"`, "Ctrl/Cmd plus this key toggles; false turns it off"],
            ["SidebarProvider shortcutScope", `"window" | "provider"`, `"window"`, "Provider: only while focus is inside it"],
            ["SidebarProvider cookieName", "string | false", `"sidebar_state"`, "Cookie that remembers the open state"],
            ["Sidebar side", `"left" | "right"`, `"left"`, "Which edge"],
            ["Sidebar variant", `"sidebar" | "floating" | "inset"`, `"sidebar"`, "Attached, lifted with elevation, or set into a card page"],
            ["Sidebar collapsible", `"offcanvas" | "icon" | "none"`, `"offcanvas"`, "Slides away, shrinks to icons, or never collapses"],
            ["SidebarMenuButton isActive", "boolean", "false", "Tonal pill, filled icon, aria-current=page"],
            ["SidebarMenuButton tooltip", "string | TooltipContent props", "", "Shown while collapsed to icons"],
            ["SidebarMenuButton size", `"sm" | "default" | "lg"`, `"default"`, "40px rows; lg (48px) is for avatars and two lines"],
            ["SidebarMenuButton variant", `"default" | "outline"`, `"default"`, "Outline is a raised tile"],
            ["SidebarMenuAction showOnHover", "boolean", "false", "Reveal on hover or focus"],
            ["SidebarMenuSubButton size / isActive", `"sm" | "md" / boolean`, `"md"`, ""],
            ["SidebarInset asChild", "boolean", "false", "Render your own element instead of main"],
            ["SidebarCollapsible / Trigger / Content", "Radix Collapsible", "", "Sub-menu wrapper with the accordion height animation"],
            ["useSidebar()", "object", "", "state, open, setOpen, openMobile, setOpenMobile, isMobile, toggleSidebar"],
          ]}
        />
      </Section>
    </>
  )
}
