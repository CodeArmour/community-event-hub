import { ArrowLeft } from "lucide-react"
import Link from "next/link"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"

export default function NewEventPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <Link href="/admin/events" className="mb-8 flex items-center text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="mr-1 h-4 w-4" />
        Back to events
      </Link>

      <Card>
        <CardHeader>
          <CardTitle>Create New Event</CardTitle>
          <CardDescription>Fill in the details to create a new community event</CardDescription>
        </CardHeader>
        <CardContent>
          <form className="grid gap-6">
            <div className="grid gap-2">
              <Label htmlFor="title">Event Title</Label>
              <Input id="title" placeholder="Enter event title" required />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="description">Description</Label>
              <Textarea id="description" placeholder="Describe your event" rows={4} required />
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              <div className="grid gap-2">
                <Label htmlFor="date">Date</Label>
                <Input id="date" type="date" required />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="time">Time</Label>
                <Input id="time" type="time" required />
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="location">Location</Label>
              <Input id="location" placeholder="Event location" required />
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              <div className="grid gap-2">
                <Label htmlFor="category">Category</Label>
                <Input id="category" placeholder="Enter event category" required />
                <p className="text-xs text-muted-foreground">
                  Enter a category or type for your event (e.g., Tech, Business, Social)
                </p>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="capacity">Capacity</Label>
                <Input id="capacity" type="number" placeholder="Maximum attendees" min="1" />
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="image">Event Image URL</Label>
              <Input id="image" type="url" placeholder="https://..." />
              <p className="text-xs text-muted-foreground">Enter a URL for the event cover image</p>
            </div>
          </form>
        </CardContent>
        <CardFooter className="flex justify-end gap-2">
          <Button variant="outline">Cancel</Button>
          <Button>Create Event</Button>
        </CardFooter>
      </Card>
    </div>
  )
}

