import { Search } from "lucide-react"
import Link from "next/link"

import EventList from "@/components/event-list"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { mockEvents } from "@/lib/mock-data"

export default function HomePage() {
  return (
    <div>
      {/* Hero Section */}
      <div className="hero-section mb-12">
        <div className="hero-pattern"></div>
        <div className="container mx-auto max-w-5xl">
          <h1 className="mb-4 text-4xl font-bold tracking-tight md:text-5xl lg:text-6xl">Discover Amazing Events</h1>
          <p className="mb-8 max-w-2xl text-lg text-white/90 md:text-xl">
            Join exciting community events, connect with like-minded people, and create unforgettable memories together.
          </p>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-white/70" />
              <Input
                type="search"
                placeholder="Search events..."
                className="h-12 border-white/20 bg-white/10 pl-10 text-white placeholder:text-white/70 focus:border-white/30 focus:bg-white/20"
              />
            </div>
            <Link href="/auth/signin">
              <Button size="lg" className="button-gradient w-full sm:w-auto" variant="default">
                Get Started
              </Button>
            </Link>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Community Events</h2>
            <p className="text-muted-foreground">Discover and join upcoming events in your community</p>
          </div>
        </div>

        <Tabs defaultValue="upcoming" className="mb-8">
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
          <TabsContent value="upcoming">
            <EventList events={mockEvents} isSignedIn={false} />
          </TabsContent>
          <TabsContent value="popular">
            <EventList events={mockEvents.slice().reverse()} isSignedIn={false} />
          </TabsContent>
          <TabsContent value="nearby">
            <EventList events={mockEvents.slice(2, 6)} isSignedIn={false} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

