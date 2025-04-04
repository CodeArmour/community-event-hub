import { ArrowUpRight, Calendar, CheckCircle2, Clock, Users } from "lucide-react"
import Link from "next/link"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { mockEvents } from "@/lib/mock-data"

export default function AdminDashboardPage() {
  // In a real app, these would be calculated from actual data
  const totalEvents = mockEvents.length
  const totalRegistrations = mockEvents.reduce((sum, event) => sum + event.attendees, 0)
  const upcomingEvents = mockEvents.filter((event) => new Date(event.date) > new Date()).length
  const completedEvents = totalEvents - upcomingEvents

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Admin Dashboard</h1>
          <p className="text-muted-foreground">Manage your events and view statistics</p>
        </div>
        <Link href="/admin/events/new">
          <Button className="button-gradient rounded-full">Create New Event</Button>
        </Link>
      </div>

      <div className="mb-8 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="stats-card">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Events</CardTitle>
            <Calendar className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{totalEvents}</div>
            <p className="text-xs text-muted-foreground">{upcomingEvents} upcoming</p>
          </CardContent>
        </Card>
        <Card className="stats-card">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Registrations</CardTitle>
            <Users className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{totalRegistrations}</div>
            <p className="text-xs text-muted-foreground">
              {(totalRegistrations / totalEvents).toFixed(1)} avg. per event
            </p>
          </CardContent>
        </Card>
        <Card className="stats-card">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Upcoming Events</CardTitle>
            <Clock className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{upcomingEvents}</div>
            <p className="text-xs text-muted-foreground">Next event in 3 days</p>
          </CardContent>
        </Card>
        <Card className="stats-card">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Completed Events</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{completedEvents}</div>
            <p className="text-xs text-muted-foreground">
              {((completedEvents / totalEvents) * 100).toFixed(0)}% completion rate
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-8 md:grid-cols-2">
        <Card className="glass-card">
          <CardHeader>
            <CardTitle>Recent Events</CardTitle>
            <CardDescription>Your most recently created events</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {mockEvents.slice(0, 5).map((event) => (
                <div
                  key={event.id}
                  className="flex items-center justify-between rounded-lg p-3 transition-colors hover:bg-muted/50"
                >
                  <div>
                    <p className="font-medium">{event.title}</p>
                    <p className="text-sm text-muted-foreground">
                      {new Date(event.date).toLocaleDateString()} • {event.time}
                    </p>
                  </div>
                  <Link href={`/admin/events/${event.id}`}>
                    <Button variant="ghost" size="icon" className="rounded-full">
                      <ArrowUpRight className="h-4 w-4" />
                      <span className="sr-only">View event</span>
                    </Button>
                  </Link>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardHeader>
            <CardTitle>Popular Events</CardTitle>
            <CardDescription>Your events with the most registrations</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {mockEvents
                .slice()
                .sort((a, b) => b.attendees - a.attendees)
                .slice(0, 5)
                .map((event) => (
                  <div
                    key={event.id}
                    className="flex items-center justify-between rounded-lg p-3 transition-colors hover:bg-muted/50"
                  >
                    <div>
                      <p className="font-medium">{event.title}</p>
                      <p className="text-sm text-muted-foreground">{event.attendees} registrations</p>
                    </div>
                    <Link href={`/admin/events/${event.id}`}>
                      <Button variant="ghost" size="icon" className="rounded-full">
                        <ArrowUpRight className="h-4 w-4" />
                        <span className="sr-only">View event</span>
                      </Button>
                    </Link>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

