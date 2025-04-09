"use client";

import { useState, useEffect } from "react";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { toast } from "@/components/ui/toast";
import EventHeader from "@/components/event-header";
import EventImageCarousel from "@/components/event-image-carousel";
import EventDescription from "@/components/event-description";
import EventTicket from "@/components/event-ticket";
import EventSidebar from "@/components/event-sidebar";
import { getEventById } from "@/actions/event";
import {
  createRegistration,
  cancelRegistration,
  checkRegistrationStatus,
} from "@/actions/registration";
import { useSession } from "next-auth/react";
import { SessionProvider } from "next-auth/react";

export default function EventPage({ params }: { params: { id: string } }) {
  return (
    <SessionProvider>
      <EventPageContent params={params} />
    </SessionProvider>
  );
}

function EventPageContent({ params }: { params: { id: string } }) {
  // Direct access to session without intermediate state
  const { data: session, status } = useSession();

  // Event and registration states
  const [isRegistered, setIsRegistered] = useState(false);
  const [event, setEvent] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [registrationId, setRegistrationId] = useState<string | null>(null);

  // Effect for loading event data
  useEffect(() => {
    const fetchEventData = async () => {
      try {
        const eventData = await getEventById(params.id);
        setEvent(eventData);
      } catch (error) {
        console.error("Error loading event:", error);
        toast.error({
          title: "Error",
          description: "Failed to load event details",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchEventData();
  }, [params.id, toast]);

  // Effect for checking registration status
  useEffect(() => {
    const checkRegistration = async () => {
      // Only check if user is authenticated
      if (status === "authenticated" && session && params.id) {
        try {
          const result = await checkRegistrationStatus(params.id);
          if (result) {
            setIsRegistered(result.isRegistered);
            setRegistrationId(result.id);
          } else {
            setIsRegistered(false);
            setRegistrationId(null);
          }
        } catch (error) {
          console.error("Error checking registration:", error);
        }
      } else if (status === "unauthenticated") {
        // Reset registration state
        setIsRegistered(false);
        setRegistrationId(null);
      }
    };

    checkRegistration();
  }, [status, session, params.id]);

  // Event images
  const eventImages = event?.images?.length
  ? event.images.map((img: any) => ({
      src: img.url,
      alt: img.caption || event.title,
    }))
  : [
      {
        src:
          event?.image ||
          `/placeholder.svg?height=400&width=600&text=${encodeURIComponent(
            event?.title || "Event"
          )}`,
        alt: event?.title || "Event",
      },
    ];

  const handleRegister = async () => {
    if (status !== "authenticated" || !session) {
      toast.warning({
        title: "Authentication Required",
        description: "Please sign in to register for events",
      });
      return;
    }

    try {
      const result = await createRegistration(params.id);

      if (result.success) {
        setIsRegistered(true);
        if (result.registration) {
          setRegistrationId(result.registration.id);
        }

        // Refresh event data
        const updatedEvent = await getEventById(params.id);
        setEvent(updatedEvent);

        toast.success({
          title: "Success",
          description: result.success,
        });
      } else if (result.error) {
        toast.error({
          title: "Registration Failed",
          description: result.error,
        });
      }
    } catch (error) {
      toast.error({
        title: "Error",
        description: "Failed to register for the event",
      });
    }
  };

  const handleCancelRegistration = async () => {
    if (status !== "authenticated" || !session) return;

    try {
      const result = await cancelRegistration(params.id);

      if (result.success) {
        setIsRegistered(false);
        setRegistrationId(null);

        // Refresh event data
        const updatedEvent = await getEventById(params.id);
        setEvent(updatedEvent);

        toast.success({
          title: "Success",
          description: result.success,
        });
      } else if (result.error) {
        toast.warning({
          title: "Cancellation Failed",
          description: result.error,
        });
      }
    } catch (error) {
      toast.error({
        title: "Error",
        description: "Failed to cancel registration",
      });
    }
  };

  // Show loading state while event data is loading
  if (loading) {
    return (
      <div className="container mx-auto flex h-96 items-center justify-center px-4 py-8">
        <div className="text-center">
          <p className="text-xl font-medium">Loading event details...</p>
        </div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="container mx-auto flex h-96 items-center justify-center px-4 py-8">
        <div className="text-center">
          <p className="text-xl font-medium">Event not found</p>
          <Link
            href="/events"
            className="mt-4 inline-flex items-center text-sm text-primary hover:underline"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to events
          </Link>
        </div>
      </div>
    );
  }

  // Calculate attendees count - now directly using the count from our modified query
  const attendeesCount = event.attendeesCount || 0;

  // Direct use of session data for auth state
  const isSignedIn = status === "authenticated" && !!session;
  const isAuthLoading = status === "loading";

  return (
    <div className="container mx-auto px-4 py-8">
      <Link
        href="/my-events"
        className="mb-6 inline-flex items-center text-sm text-muted-foreground hover:text-primary"
      >
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
              attendees: attendeesCount,
            }}
            isRegistered={isRegistered}
          />

          {/* Event Images Carousel */}
          <EventImageCarousel images={eventImages} />


          {/* Event Description */}
          <EventDescription event={event} />

          {/* QR Code Ticket - Only shown after registration */}
          {isRegistered && registrationId && (
            <EventTicket ticketId={registrationId} />
          )}
        </div>

        {/* Event Sidebar */}
        <div>
          <EventSidebar
            event={{
              ...event,
              attendees: attendeesCount,
            }}
            isSignedIn={isSignedIn}
            isAuthLoading={isAuthLoading}
            isRegistered={isRegistered}
            onRegister={handleRegister}
            onCancelRegistration={handleCancelRegistration}
          />
        </div>
      </div>
    </div>
  );
}
