import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface EventDescriptionProps {
  event: {
    title: string
    description: string
    category: string
    creator?: {
      name: string
    }
  }
}

export default function EventDescription({ event }: EventDescriptionProps) {
  return (
    <Card className="glass-card mb-8">
      <CardHeader>
        <CardTitle>About This Event</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="prose max-w-none dark:prose-invert">
          <p className="mb-4">{event.description}</p>
          <p className="mb-4">
            Join us for an unforgettable experience at {event.title}. This event is perfect for anyone interested in{" "}
            {event.category.toLowerCase()} and looking to connect with like-minded individuals in the community.
          </p>
          {event.creator && (
            <p className="text-sm text-muted-foreground">
              Organized by: {event.creator.name}
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  )
}