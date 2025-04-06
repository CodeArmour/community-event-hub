"use client"

import Link from "next/link"
import { Calendar, Clock, MapPin, Users } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useState } from "react"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog"

interface EventSidebarProps {
  event: {
    title: string
    date: string | Date
    time: string
    location: string
    attendees: number
    capacity: number
  }
  isSignedIn: boolean
  isRegistered: boolean
  onRegister: () => void
  onCancelRegistration: () => void
}

export default function EventSidebar({ 
  event, 
  isSignedIn, 
  isRegistered, 
  onRegister, 
  onCancelRegistration 
}: EventSidebarProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Format date
  const eventDate = event.date instanceof Date ? event.date : new Date(event.date)
  const formattedDate = eventDate.toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  })

  const spotsRemaining = event.capacity - event.attendees;
  const isFull = spotsRemaining <= 0;

  const handleRegister = async () => {
    setIsSubmitting(true)
    try {
      await onRegister()
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleCancelRegistration = async () => {
    setIsSubmitting(true)
    try {
      await onCancelRegistration()
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div>
      <Card className="glass-card sticky top-24">
        <CardHeader>
          <CardTitle>Event Details</CardTitle>
          <CardDescription>Information about the event</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h3 className="mb-1 font-medium">Location</h3>
            <div className="flex items-start gap-2 text-muted-foreground">
              <MapPin className="mt-0.5 h-4 w-4 flex-shrink-0" />
              <span>{event.location}</span>
            </div>
          </div>

          <div>
            <h3 className="mb-1 font-medium">Date & Time</h3>
            <div className="space-y-1 text-muted-foreground">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                <span>{formattedDate}</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                <span>{event.time}</span>
              </div>
            </div>
          </div>

          <div>
            <h3 className="mb-1 font-medium">Capacity</h3>
            <div className="flex items-center gap-2 text-muted-foreground">
              <Users className="h-4 w-4" />
              <span>
                {event.attendees} / {event.capacity} attendees
                {!isFull && (
                  <span className="ml-1 text-sm text-green-600 dark:text-green-400">
                    ({spotsRemaining} spots left)
                  </span>
                )}
              </span>
            </div>
          </div>

          <div className="pt-4">
            {isSignedIn ? (
              isRegistered ? (
                <div className="space-y-4">
                  <div className="rounded-lg bg-green-50 p-4 text-center dark:bg-green-900/20">
                    <p className="font-medium text-green-600 dark:text-green-400">You're registered for this event!</p>
                    <p className="mt-1 text-sm text-green-600/80 dark:text-green-400/80">
                      We look forward to seeing you there
                    </p>
                  </div>
                  
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="outline" className="w-full rounded-full text-red-500 hover:bg-red-50 hover:text-red-600">
                        Cancel Registration
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Cancel Registration</AlertDialogTitle>
                        <AlertDialogDescription>
                          Are you sure you want to cancel your registration for this event? This action cannot be undone.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Keep Registration</AlertDialogCancel>
                        <AlertDialogAction 
                          onClick={handleCancelRegistration}
                          className="bg-red-500 hover:bg-red-600"
                          disabled={isSubmitting}
                        >
                          {isSubmitting ? "Cancelling..." : "Yes, Cancel Registration"}
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              ) : isFull ? (
                <Button disabled className="w-full rounded-full">
                  Event Full
                </Button>
              ) : (
                <Button 
                  onClick={handleRegister} 
                  className="button-gradient w-full rounded-full"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Registering..." : "Register for Event"}
                </Button>
              )
            ) : (
              <Link href="/auth/signin" className="w-full">
                <Button variant="outline" className="button-outline-gradient w-full rounded-full">
                  Sign in to register
                </Button>
              </Link>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}