"use client";

import { Calendar, Clock, MapPin, Ticket, Users } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { Event } from "@/lib/types";
import { useSession } from "next-auth/react";
import { checkRegistrationStatus } from "@/actions/registration";

interface EventCardProps {
  event: Event;
}

export function EventCard({ event }: EventCardProps) {
  const {
    id,
    title,
    description,
    date,
    time,
    location,
    image,
    category,
    attendees,
  } = event;

  // Get session directly in the component to ensure reactivity
  const { data: sessionData, status } = useSession();
  const isSignedIn = status === "authenticated";
  
  // State to track if user is registered for this event
  const [registrationStatus, setRegistrationStatus] = useState({
    isRegistered: false,
    isLoading: true,
  });

  // Check if user is registered for this event
  useEffect(() => {
    const checkIfRegistered = async () => {
      if (isSignedIn && id) {
        try {
          const status = await checkRegistrationStatus(id);
          setRegistrationStatus({
            isRegistered: !!status?.isRegistered,
            isLoading: false,
          });
        } catch (error) {
          console.error("Error checking registration status:", error);
          setRegistrationStatus({
            isRegistered: false,
            isLoading: false,
          });
        }
      } else {
        setRegistrationStatus({
          isRegistered: false,
          isLoading: false,
        });
      }
    };

    checkIfRegistered();
  }, [isSignedIn, id]);

  // Format date
  const formattedDate = new Date(date).toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });

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
        <p className="mb-3 line-clamp-2 text-sm text-muted-foreground">
          {description}
        </p>
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
          registrationStatus.isLoading ? (
            <Button className="w-full rounded-full" disabled>
              Loading...
            </Button>
          ) : registrationStatus.isRegistered ? (
            <div className="space-y-2 w-full">
              <Badge className="w-full justify-center py-1.5 bg-green-600 hover:bg-green-700 text-white">
                <Ticket className="h-3.5 w-3.5 mr-1" />
                Registered
              </Badge>
              <Link href={`/events/${id}`} className="w-full">
                <Button variant="outline" className="w-full rounded-full">
                  View Details
                </Button>
              </Link>
            </div>
          ) : (
            <Link href={`/events/${id}`} className="w-full">
              <Button className="button-gradient w-full rounded-full">
                Register
              </Button>
            </Link>
          )
        ) : (
          <Link href="/auth/signin" className="w-full">
            <Button
              variant="outline"
              className="button-outline-gradient w-full rounded-full"
            >
              Sign in to register
            </Button>
          </Link>
        )}
      </div>
    </div>
  );
}