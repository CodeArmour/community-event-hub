import { Calendar, Clock, Users } from "lucide-react"
import { Badge } from "@/components/ui/badge"

interface EventHeaderProps {
  event: {
    id: string
    title: string
    date: string | Date
    time: string
    category: string
    attendees: number
  }
  isRegistered: boolean
}

export default function EventHeader({ event, isRegistered }: EventHeaderProps) {
  // Format date
  const eventDate = event.date instanceof Date ? event.date : new Date(event.date)
  const formattedDate = eventDate.toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  })

  return (
    <div className="mb-6">
      <div className="mb-2 flex items-center gap-2">
        <Badge className="category-badge">{event.category}</Badge>
        {isRegistered && (
          <Badge variant="outline" className="border-green-500 text-green-500">
            Registered
          </Badge>
        )}
      </div>
      <h1 className="mb-2 text-3xl font-bold tracking-tight md:text-4xl">{event.title}</h1>
      <div className="flex flex-wrap gap-4 text-muted-foreground">
        <div className="flex items-center gap-1">
          <Calendar className="h-4 w-4" />
          <span>{formattedDate}</span>
        </div>
        <div className="flex items-center gap-1">
          <Clock className="h-4 w-4" />
          <span>{event.time}</span>
        </div>
        <div className="flex items-center gap-1">
          <Users className="h-4 w-4" />
          <span>{event.attendees} attending</span>
        </div>
      </div>
    </div>
  )
}