"use client"

import { SetStateAction, useEffect, useState } from "react"
import { useRouter } from "next/navigation"

import EventList from "@/components/event-list"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { getUserRegistrations } from "@/actions/registration"
import { Loader2 } from "lucide-react"

export default function MyEventsPage() {
  const router = useRouter()
  const [registeredEvents, setRegisteredEvents] = useState([])
  const [pastEvents, setPastEvents] = useState([])
  const [recommendedEvents, setRecommendedEvents] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("upcoming")

  useEffect(() => {
    const fetchRegistrations = async () => {
      try {
        setLoading(true)
        
        // Fetch registered events (status: REGISTERED)
        const registeredData = await getUserRegistrations("REGISTERED")
        const registeredEventsData = registeredData.registrations.map(reg => reg.event)
        setRegisteredEvents(registeredEventsData)
        
        // Fetch attended events (status: ATTENDED)
        const attendedData = await getUserRegistrations("ATTENDED")
        const attendedEventsData = attendedData.registrations.map(reg => reg.event)
        setPastEvents(attendedEventsData)
        
        // In a real app, this would be a separate API call for AI recommendations
        // For now, we'll assume another endpoint or mock this data
        // This could be based on user interests or similar events to what they've attended
        setRecommendedEvents([]); // Replace with real recommendation API call
        
        setLoading(false)
      } catch (error) {
        console.error("Error fetching registrations:", error)
        setLoading(false)
      }
    }
    
    fetchRegistrations()
  }, [])

  const handleTabChange = (value: SetStateAction<string>) => {
    setActiveTab(value)
  }

  const handleViewTickets = (event: { id: any }) => {
    router.push(`/dashboard/tickets/${event.id}`)
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">My Events</h1>
        <p className="text-muted-foreground">View and manage your registered events</p>
      </div>

      <Tabs defaultValue="upcoming" className="mb-8" onValueChange={handleTabChange}>
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
          {loading ? (
            <div className="flex h-40 items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : registeredEvents.length > 0 ? (
            <div className="space-y-6">
              <EventList events={registeredEvents} />
              <div className="flex justify-center">
                <Button 
                  className="button-gradient rounded-full"
                  onClick={() => router.push("/dashboard/tickets")}
                >
                  View QR Tickets
                </Button>
              </div>
            </div>
          ) : (
            <div className="flex h-40 items-center justify-center rounded-lg border border-dashed">
              <p className="text-muted-foreground">You haven&apos;t registered for any upcoming events</p>
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="past">
          {loading ? (
            <div className="flex h-40 items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : pastEvents.length > 0 ? (
            <EventList events={pastEvents}/>
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
          {loading ? (
            <div className="flex h-40 items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : recommendedEvents.length > 0 ? (
            <EventList events={recommendedEvents} />
          ) : (
            <div className="flex h-40 items-center justify-center rounded-lg border border-dashed">
              <p className="text-muted-foreground">No recommendations available yet</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}