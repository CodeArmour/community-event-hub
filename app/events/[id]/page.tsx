"use client"

import { useState, useEffect } from "react"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import { useToast } from "@/hooks/use-toast"
import EventHeader from "@/components/event-header"
import EventImageCarousel from "@/components/event-image-carousel"
import EventDescription from "@/components/event-description"
import EventTicket from "@/components/event-ticket"
import EventSidebar from "@/components/event-sidebar"
import { getEventById } from "@/actions/event"
import { createRegistration, cancelRegistration, checkRegistrationStatus } from "@/actions/registration"
import { useSession } from "next-auth/react"

export default function EventPage({ params }: { params: { id: string } }) {
  const { toast } = useToast()
  const { data: session } = useSession()
  const [isRegistered, setIsRegistered] = useState(false)
  const [event, setEvent] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [registrationId, setRegistrationId] = useState<string | null>(null)
  
  const isSignedIn = !!session?.user

  useEffect(() => {
    const fetchEventAndRegistration = async () => {
      try {
        // Get event data
        const eventData = await getEventById(params.id)
        setEvent(eventData)
        
        // Check if user is already registered
        if (isSignedIn) {
          const registrationStatus = await checkRegistrationStatus(params.id)
          
          if (registrationStatus) {
            setIsRegistered(registrationStatus.isRegistered)
            setRegistrationId(registrationStatus.id)
          }
        }
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to load event details",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    fetchEventAndRegistration()
  }, [params.id, toast, isSignedIn])

  // Event images (in a real app, these would come from the database)
  const eventImages = event ? [
    event.image || `/placeholder.svg?height=400&width=600&text=${encodeURIComponent(event.title)}`,
    `/placeholder.svg?height=400&width=600&text=Event+Photo+1`,
    `/placeholder.svg?height=400&width=600&text=Event+Photo+2`,
    `/placeholder.svg?height=400&width=600&text=Event+Photo+3`,
  ] : []

  const handleRegister = async () => {
    if (!isSignedIn) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to register for events",
        variant: "destructive",
      })
      return
    }

    try {
      const result = await createRegistration(params.id)
      
      if (result.success) {
        setIsRegistered(true)
        if (result.registration) {
          setRegistrationId(result.registration.id)
        }
        
        // Refresh event data
        const updatedEvent = await getEventById(params.id)
        setEvent(updatedEvent)
        
        toast({
          title: "Success",
          description: result.success,
          variant: "default",
        })
      } else if (result.error) {
        toast({
          title: "Registration Failed",
          description: result.error,
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to register for the event",
        variant: "destructive",
      })
    }
  }

  const handleCancelRegistration = async () => {
    if (!isSignedIn) return
    
    try {
      const result = await cancelRegistration(params.id)
      
      if (result.success) {
        setIsRegistered(false)
        setRegistrationId(null)
        
        // Refresh event data
        const updatedEvent = await getEventById(params.id)
        setEvent(updatedEvent)
        
        toast({
          title: "Success",
          description: result.success,
          variant: "default",
        })
      } else if (result.error) {
        toast({
          title: "Cancellation Failed",
          description: result.error,
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to cancel registration",
        variant: "destructive",
      })
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto flex h-96 items-center justify-center px-4 py-8">
        <div className="text-center">
          <p className="text-xl font-medium">Loading event details...</p>
        </div>
      </div>
    )
  }

  if (!event) {
    return (
      <div className="container mx-auto flex h-96 items-center justify-center px-4 py-8">
        <div className="text-center">
          <p className="text-xl font-medium">Event not found</p>
          <Link href="/events" className="mt-4 inline-flex items-center text-sm text-primary hover:underline">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to events
          </Link>
        </div>
      </div>
    )
  }

  // Calculate attendees count
  const attendeesCount = event._count?.registrations || 0;

  return (
    <div className="container mx-auto px-4 py-8">
      <Link href="/" className="mb-6 inline-flex items-center text-sm text-muted-foreground hover:text-primary">
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to events
      </Link>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Event Details */}
        <div className="lg:col-span-2">
          {/* Event Header */}
          <EventHeader 
            event={{
              ...event,
              attendees: attendeesCount
            }}
            isRegistered={isRegistered} 
          />

          {/* Event Images Carousel */}
          <EventImageCarousel images={eventImages} title={event.title} />

          {/* Event Description */}
          <EventDescription event={event} />

          {/* QR Code Ticket - Only shown after registration */}
          {isRegistered && registrationId && <EventTicket ticketId={registrationId} />}
        </div>

        {/* Registration Sidebar */}
        <EventSidebar 
          event={{
            ...event,
            attendees: attendeesCount
          }}
          isSignedIn={isSignedIn} 
          isRegistered={isRegistered} 
          onRegister={handleRegister}
          onCancelRegistration={handleCancelRegistration}
        />
      </div>
    </div>
  )
}