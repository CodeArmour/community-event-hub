import { ArrowLeft } from "lucide-react"
import Link from "next/link"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { mockEvents } from "@/lib/mock-data"

export default function EditEventPage({ params }: { params: { id: string } }) {
  // In a real app, this would fetch the event from an API
  const event = mockEvents.find((e) => e.id === params.id) || mockEvents[0]

  return (
    <div className="container mx-auto px-4 py-8">
      <Link href="/admin/events" className="mb-8 flex items-center text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="mr-1 h-4 w-4" />
        Back to events
      </Link>

      <Card>
        <CardHeader>
          <CardTitle>Edit Event</CardTitle>
          <CardDescription>Update the details of your community event</CardDescription>
        </CardHeader>
        <CardContent>
          <form className="grid gap-6">
            <div className="grid gap-2">
              <Label htmlFor="title">Event Title</Label>
              <Input id="title" placeholder="Enter event title" defaultValue={event.title} required />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="Describe your event"
                rows={4}
                defaultValue={event.description}
                required
              />
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              <div className="grid gap-2">
                <Label htmlFor="date">Date</Label>
                <Input id="date" type="date" defaultValue={event.date} required />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="time">Time</Label>
                <Input id="time" type="time" defaultValue={event.time.split(" ")[0]} required />
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="location">Location</Label>
              <Input id="location" placeholder="Event location" defaultValue={event.location} required />
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              <div className="grid gap-2">
                <Label htmlFor="category">Category</Label>
                <Input id="category" placeholder="Enter event category" defaultValue={event.category} required />
                <p className="text-xs text-muted-foreground">Enter a category or type for your event</p>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="capacity">Capacity</Label>
                <Input
                  id="capacity"
                  type="number"
                  placeholder="Maximum attendees"
                  defaultValue={event.attendees}
                  min="1"
                />
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="image">Event Image URL</Label>
              <Input id="image" type="url" placeholder="https://..." defaultValue={event.image} />
              <p className="text-xs text-muted-foreground">Enter a URL for the event cover image</p>
            </div>
          </form>
        </CardContent>
        <CardFooter className="flex justify-end gap-2">
          <Button variant="outline">Cancel</Button>
          <Button>Update Event</Button>
        </CardFooter>
      </Card>
    </div>
  )
}

