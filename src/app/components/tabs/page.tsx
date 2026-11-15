"use client"

import * as React from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/registry/nelumbo/ui/tabs"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/registry/nelumbo/ui/card"
import { Input } from "@/registry/nelumbo/ui/input"
import { Button } from "@/registry/nelumbo/ui/button"
import { Switch } from "@/registry/nelumbo/ui/switch"
import { Code, PageHeader, Preview, PropsTable, Section } from "@/components/docs/primitives"

const CITIES = ["Lisbon", "Kyoto", "Mexico City", "Copenhagen", "Cape Town", "Montréal", "Melbourne", "Seoul", "Marrakesh"]

export default function TabsPage() {
  return (
    <>
      <PageHeader eyebrow="Component 20" title="Tabs">
        Switch between views of the same subject. One indicator slides and stretches between tabs on a spring, rather
        than each tab fading on its own.
      </PageHeader>

      <Section title="Install">
        <Code>{`npx shadcn@latest add @nelumbo/tabs`}</Code>
      </Section>

      <Section title="Pill" description="The default, like shadcn's: a raised pill on a tonal track. Arrow keys move between tabs; Home and End jump to the ends.">
        <Preview className="flex-col items-stretch">
          <Tabs defaultValue="account" className="w-full max-w-md self-center">
            <TabsList>
              <TabsTrigger value="account">Account</TabsTrigger>
              <TabsTrigger value="password">Password</TabsTrigger>
              <TabsTrigger value="notifications">Notifications</TabsTrigger>
            </TabsList>
            <TabsContent value="account">
              <Card variant="outlined">
                <CardHeader>
                  <CardTitle>Account</CardTitle>
                  <CardDescription>Your name and how people reach you.</CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col gap-4">
                  <Input label="Name" defaultValue="Maya Lin" />
                  <Input label="Username" defaultValue="mayalin" />
                </CardContent>
                <CardFooter className="justify-end">
                  <Button>Save</Button>
                </CardFooter>
              </Card>
            </TabsContent>
            <TabsContent value="password">
              <Card variant="outlined">
                <CardHeader>
                  <CardTitle>Password</CardTitle>
                  <CardDescription>You&apos;ll be signed out on other devices.</CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col gap-4">
                  <Input label="Current password" type="password" />
                  <Input label="New password" type="password" />
                </CardContent>
                <CardFooter className="justify-end">
                  <Button>Update password</Button>
                </CardFooter>
              </Card>
            </TabsContent>
            <TabsContent value="notifications">
              <Card variant="outlined">
                <CardHeader>
                  <CardTitle>Notifications</CardTitle>
                  <CardDescription>Choose what reaches your inbox.</CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col gap-4">
                  {["Comments and mentions", "Weekly summary", "Product news"].map((t, i) => (
                    <label key={t} className="flex items-center justify-between gap-4 type-body-md">
                      {t}
                      <Switch defaultChecked={i < 2} />
                    </label>
                  ))}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </Preview>
      </Section>

      <Section
        title="Underline"
        description="Material's primary tabs: a 3px bar under the label on a hairline. Icons fill in on the active tab; a badge shows a count or a dot."
      >
        <Preview className="flex-col items-stretch">
          <Tabs defaultValue="inbox">
            <TabsList variant="underline" className="w-full">
              <TabsTrigger value="inbox" icon="inbox" badge={12}>
                Inbox
              </TabsTrigger>
              <TabsTrigger value="starred" icon="star">
                Starred
              </TabsTrigger>
              <TabsTrigger value="sent" icon="send">
                Sent
              </TabsTrigger>
              <TabsTrigger value="updates" icon="notifications" badge>
                Updates
              </TabsTrigger>
            </TabsList>
            <TabsContent value="inbox" className="type-body-md text-muted-foreground">
              12 unread conversations.
            </TabsContent>
            <TabsContent value="starred" className="type-body-md text-muted-foreground">
              Messages you starred show up here.
            </TabsContent>
            <TabsContent value="sent" className="type-body-md text-muted-foreground">
              Everything you&apos;ve sent in the last 30 days.
            </TabsContent>
            <TabsContent value="updates" className="type-body-md text-muted-foreground">
              Receipts, confirmations and notifications.
            </TabsContent>
          </Tabs>
        </Preview>
      </Section>

      <Section title="Full width and brand color" description="fullWidth shares the width equally. The underline can use the accent.">
        <Preview className="flex-col items-stretch gap-8">
          <Tabs defaultValue="day">
            <TabsList fullWidth>
              <TabsTrigger value="day">Day</TabsTrigger>
              <TabsTrigger value="week">Week</TabsTrigger>
              <TabsTrigger value="month">Month</TabsTrigger>
              <TabsTrigger value="year">Year</TabsTrigger>
            </TabsList>
            {["day", "week", "month", "year"].map((v) => (
              <TabsContent key={v} value={v} className="type-body-md text-muted-foreground">
                Bookings this {v}.
              </TabsContent>
            ))}
          </Tabs>
          <Tabs defaultValue="flights">
            <TabsList variant="underline" color="brand" fullWidth>
              <TabsTrigger value="flights" icon="flight">
                Flights
              </TabsTrigger>
              <TabsTrigger value="hotels" icon="hotel">
                Hotels
              </TabsTrigger>
              <TabsTrigger value="cars" icon="directions_car">
                Cars
              </TabsTrigger>
            </TabsList>
            {["flights", "hotels", "cars"].map((v) => (
              <TabsContent key={v} value={v} className="type-body-md text-muted-foreground">
                Search {v} for your trip.
              </TabsContent>
            ))}
          </Tabs>
        </Preview>
      </Section>

      <Section title="Scrolling" description="When tabs don't fit, an underline list scrolls sideways and keeps the active tab in view.">
        <Preview className="flex-col items-stretch">
          <Tabs defaultValue="Lisbon" className="w-full max-w-md self-center">
            <TabsList variant="underline" className="w-full">
              {CITIES.map((c) => (
                <TabsTrigger key={c} value={c}>
                  {c}
                </TabsTrigger>
              ))}
            </TabsList>
            {CITIES.map((c) => (
              <TabsContent key={c} value={c} className="type-body-md text-muted-foreground">
                Things to do in {c}.
              </TabsContent>
            ))}
          </Tabs>
        </Preview>
      </Section>

      <Section title="Usage">
        <Code>{`import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"

<Tabs defaultValue="inbox">
  <TabsList variant="underline">
    <TabsTrigger value="inbox" icon="inbox" badge={12}>Inbox</TabsTrigger>
    <TabsTrigger value="sent" icon="send">Sent</TabsTrigger>
  </TabsList>
  <TabsContent value="inbox">…</TabsContent>
  <TabsContent value="sent">…</TabsContent>
</Tabs>`}</Code>
      </Section>

      <Section title="Props" description="Tabs, TabsTrigger and TabsContent take Radix Tabs props (value, onValueChange, activationMode…).">
        <PropsTable
          rows={[
            ["TabsList variant", '"pill" | "underline"', '"pill"', ""],
            ["TabsList color", '"default" | "brand"', '"default"', "Underline color"],
            ["TabsList fullWidth", "boolean", "false", "Tabs share the width"],
            ["TabsTrigger icon", "IconName", "", "Fills in when active"],
            ["TabsTrigger badge", "number | boolean", "", "A count, or a dot"],
          ]}
        />
      </Section>
    </>
  )
}
