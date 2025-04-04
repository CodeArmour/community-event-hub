import { Calendar, Clock, MapPin, Users } from "lucide-react"
import Image from "next/image"
import Link from "next/link"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import type { Event } from "@/lib/types"

interface EventCardProps {
  event: Event
  isSignedIn: boolean
}

export function EventCard({ event, isSignedIn }: EventCardProps) {
  const { id, title, description, date, time, location, image, category, attendees } = event

  // Format date
  const formattedDate = new Date(date).toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  })

  return (
    <div className="event-card group">
      <div className="event-card-image">
        <Image
          src={image || "/placeholder.svg?height=192&width=384"}
          alt={title}
          fill
          className="object-cover transition-transform duration-700 group-hover:scale-105"
        />
        <div className="absolute right-3 top-3">
          <Badge className="category-badge">{category}</Badge>
        </div>
      </div>
      <div className="event-card-content">
        <h3 className="mb-1 line-clamp-1 text-lg font-bold">{title}</h3>
        <div className="mb-2 flex items-center gap-1 text-sm text-muted-foreground">
          <Calendar className="h-3.5 w-3.5" />
          <span>{formattedDate}</span>
          <span className="mx-1">•</span>
          <Clock className="h-3.5 w-3.5" />
          <span>{time}</span>
        </div>
        <p className="mb-3 line-clamp-2 text-sm text-muted-foreground">{description}</p>
        <div className="mb-4 space-y-1">
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <MapPin className="h-3.5 w-3.5" />
            <span className="truncate">{location}</span>
          </div>
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <Users className="h-3.5 w-3.5" />
            <span>{attendees} attending</span>
          </div>
        </div>
        {isSignedIn ? (
          <Button className="button-gradient w-full rounded-full">Register</Button>
        ) : (
          <Link href="/auth/signin" className="w-full">
            <Button variant="outline" className="button-outline-gradient w-full rounded-full">
              Sign in to register
            </Button>
          </Link>
        )}
      </div>
    </div>
  )
}

