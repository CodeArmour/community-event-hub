"use client"

import { useState } from "react"

import EventList from "@/components/event-list"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { mockEvents } from "@/lib/mock-data"

export default function MyEventsPage() {
  // In a real app, this would be fetched from an API
  const [registeredEvents] = useState(mockEvents.slice(0, 3))
  const [pastEvents] = useState(mockEvents.slice(3, 5))

  // In a real app, these would be AI-generated recommendations based on user preferences
  const recommendedEvents = mockEvents.slice(5, 8)

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">My Events</h1>
        <p className="text-muted-foreground">View and manage your registered events</p>
      </div>

      <Tabs defaultValue="upcoming" className="mb-8">
        <TabsList className="w-full justify-start rounded-full border p-1 sm:w-auto">
          <TabsTrigger
            value="upcoming"
            className="rounded-full data-[state=active]:bg-primary data-[state=active]:text-white"
          >
            Upcoming
          </TabsTrigger>
          <TabsTrigger
            value="past"
            className="rounded-full data-[state=active]:bg-primary data-[state=active]:text-white"
          >
            Past
          </TabsTrigger>
        </TabsList>
        <TabsContent value="upcoming">
          {registeredEvents.length > 0 ? (
            <div className="space-y-6">
              <EventList events={registeredEvents} isSignedIn={true} />
              <div className="flex justify-center">
                <Button className="button-gradient rounded-full">View QR Tickets</Button>
              </div>
            </div>
          ) : (
            <div className="flex h-40 items-center justify-center rounded-lg border border-dashed">
              <p className="text-muted-foreground">You haven&apos;t registered for any upcoming events</p>
            </div>
          )}
        </TabsContent>
        <TabsContent value="past">
          {pastEvents.length > 0 ? (
            <EventList events={pastEvents} isSignedIn={true} />
          ) : (
            <div className="flex h-40 items-center justify-center rounded-lg border border-dashed">
              <p className="text-muted-foreground">You haven&apos;t attended any past events</p>
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Recommended Events Section */}
      <Card className="glass-card mt-8 overflow-visible">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              Recommended For You
            </span>
            <span className="animate-pulse-slow rounded-full bg-primary/20 px-2 py-0.5 text-xs font-medium text-primary">
              AI Powered
            </span>
          </CardTitle>
          <CardDescription>Events you might be interested in based on your preferences</CardDescription>
        </CardHeader>
        <CardContent>
          <EventList events={recommendedEvents} isSignedIn={true} />
        </CardContent>
      </Card>
    </div>
  )
}

