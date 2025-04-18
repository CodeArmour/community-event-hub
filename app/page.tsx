"use client";

import { useEffect, useMemo, useState } from "react";
import { Search } from "lucide-react";
import Link from "next/link";

import EventList from "@/components/event-list";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getEvents } from "@/actions/event";
import type { Event } from "@/lib/types";
import { SessionProvider, useSession } from "next-auth/react";

// Helper function to combine date and time strings into a JavaScript Date object
function combineDateTime(dateStr: string | Date, timeStr: string): Date {
  const eventDate = new Date(dateStr);
  const [hours, minutes] = timeStr.split(':').map(Number);
  
  eventDate.setHours(hours, minutes, 0, 0);
  return eventDate;
}

// Create a separate component for the main content to use useSession hook
function HomePageContent() {
  const [events, setEvents] = useState<Event[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [tab, setTab] = useState("upcoming");
  const [page, setPage] = useState(1);
  const itemsPerPage = 8;

  // Get session with status to trigger re-renders
  const { data: session, status } = useSession();

  useEffect(() => {
    const fetchEvents = async () => {
      const data = await getEvents();
      if (data?.events) setEvents(data.events);
    };
    fetchEvents();
  }, []);

  const now = new Date();

  const filtered = useMemo(() => {
    let list = [...events];

    // Apply tab filters
    if (tab === "upcoming") {
      // Filter for upcoming events by combining date and time
      list = list.filter((e) => {
        const eventStartTime = combineDateTime(e.date, e.time);
        return eventStartTime >= now;
      });
    }
    if (tab === "popular") {
      // Also update popular tab to use the same datetime logic
      list = list.filter((e) => {
        const eventStartTime = combineDateTime(e.date, e.time);
        return eventStartTime >= now;
      });
      list = list.filter((e) => e.attendees > 0);
      list = list.sort((a, b) => b.attendees - a.attendees).slice(0, 10);
    }
    if (tab === "nearby") {
      // And update nearby tab too
      list = list.filter((e) => {
        const eventStartTime = combineDateTime(e.date, e.time);
        return eventStartTime >= now;
      });
      list = list.filter((e) => e.location === session?.user?.location);
    }

    // Apply search
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      list = list.filter((e) => e.title.toLowerCase().includes(term));
    }

    return list;
  }, [events, tab, searchTerm, session?.user?.location]);

  // Sort events by datetime (nearest first)
  const sortedAndPaginated = useMemo(() => {
    const sorted = [...filtered].sort((a, b) => {
      const dateTimeA = combineDateTime(a.date, a.time).getTime();
      const dateTimeB = combineDateTime(b.date, b.time).getTime();
      return dateTimeA - dateTimeB;
    });
    
    const start = (page - 1) * itemsPerPage;
    return sorted.slice(start, start + itemsPerPage);
  }, [filtered, page]);

  const totalPages = Math.ceil(filtered.length / itemsPerPage);

  // Using status directly for clarity
  const isAuthenticated = status === "authenticated";

  return (
    <div>
      {/* Hero Section */}
      <div className="hero-section mb-12">
        <div className="hero-pattern"></div>
        <div className="container mx-auto max-w-5xl">
          <h1 className="mb-4 text-4xl font-bold tracking-tight md:text-5xl lg:text-6xl">
            Discover Amazing Events
          </h1>
          <p className="mb-8 max-w-2xl text-lg text-white/90 md:text-xl">
            Join exciting community events, connect with like-minded people, and
            create unforgettable memories together.
          </p>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-white/70" />
              <Input
                type="search"
                placeholder="Search events..."
                value={searchTerm}
                onChange={(e) => {
                  setPage(1);
                  setSearchTerm(e.target.value);
                }}
                className="h-12 border-white/20 bg-white/10 pl-10 text-white placeholder:text-white/70 focus:border-white/30 focus:bg-white/20"
              />
            </div>
            <Link href={isAuthenticated ? "/my-events" : "/auth/signin"} className="z-10">
              <Button
                size="lg"
                className="button-gradient w-full sm:w-auto"
                variant="default"
              >
                {isAuthenticated ? "See My Events" : "Get Started"}
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Events Section */}
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">
              Community Events
            </h2>
            <p className="text-muted-foreground">
              Discover and join upcoming events in your community
            </p>
          </div>
        </div>

        <Tabs
          defaultValue="upcoming"
          value={tab}
          onValueChange={(v) => {
            setTab(v);
            setPage(1);
          }}
          className="mb-8"
        >
          <TabsList className="w-full justify-start rounded-full border p-1 sm:w-auto">
            <TabsTrigger
              value="upcoming"
              className="rounded-full data-[state=active]:bg-primary data-[state=active]:text-white"
            >
              Upcoming
            </TabsTrigger>
            <TabsTrigger
              value="popular"
              className="rounded-full data-[state=active]:bg-primary data-[state=active]:text-white"
            >
              Popular
            </TabsTrigger>
            <TabsTrigger
              value="nearby"
              className="rounded-full data-[state=active]:bg-primary data-[state=active]:text-white"
            >
              Nearby
            </TabsTrigger>
          </TabsList>

          <TabsContent value={tab}>
            <EventList events={sortedAndPaginated} />
            {totalPages > 1 && (
              <div className="mt-6 flex justify-center gap-2">
                {Array.from({ length: totalPages }).map((_, i) => (
                  <Button
                    key={i}
                    size="sm"
                    variant={page === i + 1 ? "default" : "outline"}
                    onClick={() => setPage(i + 1)}
                  >
                    {i + 1}
                  </Button>
                ))}
              </div>
            )}
            {filtered.length === 0 && (
              <div className="mt-6 text-center text-muted-foreground">
                No events found. Try adjusting your search.
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

// Main export component with SessionProvider wrapper
export default function HomePage() {
  return (
    <SessionProvider>
      <HomePageContent />
    </SessionProvider>
  );
}