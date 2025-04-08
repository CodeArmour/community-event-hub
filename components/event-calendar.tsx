"use client"

import { useState } from "react"
import { ChevronLeft, ChevronRight, X } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useMediaQuery } from "@/hooks/use-media-query"
import { Event } from "@/lib/types" // Import the Event interface from types.ts

interface EventCalendarProps {
  events: Event[]
}

export default function EventCalendar({ events }: EventCalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedDay, setSelectedDay] = useState<number | null>(null)
  const isMobile = useMediaQuery("(max-width: 640px)")

  // Get the current month and year
  const currentMonth = currentDate.getMonth()
  const currentYear = currentDate.getFullYear()

  // Get the first day of the month
  const firstDayOfMonth = new Date(currentYear, currentMonth, 1)
  const startingDayOfWeek = firstDayOfMonth.getDay() // 0 = Sunday, 1 = Monday, etc.

  // Get the number of days in the month
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate()

  // Get the name of the month
  const monthName = currentDate.toLocaleString("default", { month: "long" })

  // Navigate to previous month
  const goToPreviousMonth = () => {
    setCurrentDate(new Date(currentYear, currentMonth - 1, 1))
    setSelectedDay(null) // Clear selected day when changing month
  }

  // Navigate to next month
  const goToNextMonth = () => {
    setCurrentDate(new Date(currentYear, currentMonth + 1, 1))
    setSelectedDay(null) // Clear selected day when changing month
  }

  // Create an array of day names
  const dayNames = isMobile
    ? ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"]
    : ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]

  // Create calendar days array
  const calendarDays = []

  // Add empty cells for days before the first day of the month
  for (let i = 0; i < startingDayOfWeek; i++) {
    calendarDays.push(null)
  }

  // Add cells for each day of the month
  for (let day = 1; day <= daysInMonth; day++) {
    calendarDays.push(day)
  }

  // Function to format date to YYYY-MM-DD for consistent comparison
  // Fix: Use UTC methods to prevent timezone issues
  const formatDateKey = (date: Date): string => {
    const d = new Date(date)
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
  }

  // Group events by date for quick lookup
  const eventsByDate: Record<string, Event[]> = {}
  events.forEach((event) => {
    const eventDate = new Date(event.date)
    const dateKey = formatDateKey(eventDate)
    if (!eventsByDate[dateKey]) {
      eventsByDate[dateKey] = []
    }
    eventsByDate[dateKey].push(event)
  })

  // Function to get events for a specific day
  const getEventsForDay = (day: number) => {
    // Create a date object for the specified day
    const dayDate = new Date(currentYear, currentMonth, day)
    const dateString = formatDateKey(dayDate)
    return eventsByDate[dateString] || []
  }

  // Handle day click
  const handleDayClick = (day: number) => {
    setSelectedDay(selectedDay === day ? null : day)
  }

  // Get selected day events
  const selectedDayEvents = selectedDay ? getEventsForDay(selectedDay) : []
  const selectedDayFormatted = selectedDay 
    ? new Date(currentYear, currentMonth, selectedDay).toLocaleDateString('en-US', { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      }) 
    : ''

  // Format time from Date object or time string
  const formatEventTime = (event: Event) => {
    if (event.time) {
      return event.time
    }
    return new Date(event.date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})
  }

  return (
    <div className="space-y-4">
      <div className="rounded-xl border bg-card p-2 shadow-sm sm:p-4">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-bold sm:text-xl">
            {monthName} {currentYear}
          </h2>
          <div className="flex gap-2">
            <Button variant="outline" size="icon" onClick={goToPreviousMonth} className="h-8 w-8 rounded-full">
              <ChevronLeft className="h-4 w-4" />
              <span className="sr-only">Previous month</span>
            </Button>
            <Button variant="outline" size="icon" onClick={goToNextMonth} className="h-8 w-8 rounded-full">
              <ChevronRight className="h-4 w-4" />
              <span className="sr-only">Next month</span>
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-7 gap-1 sm:gap-2">
          {/* Day names */}
          {dayNames.map((day) => (
            <div key={day} className="p-1 text-center text-xs font-medium text-muted-foreground sm:p-2 sm:text-sm">
              {day}
            </div>
          ))}

          {/* Calendar days */}
          {calendarDays.map((day, index) => {
            if (day === null) {
              return <div key={`empty-${index}`} className="aspect-square p-0.5 sm:p-1" />
            }

            const dayEvents = getEventsForDay(day)
            const hasEvents = dayEvents.length > 0
            const isToday = new Date().toDateString() === new Date(currentYear, currentMonth, day).toDateString()
            const isSelected = selectedDay === day

            return (
              <div
                key={`day-${day}`}
                className={`aspect-square rounded-lg border p-0.5 sm:p-1 cursor-pointer transition-colors
                  ${isToday ? "border-primary bg-primary/5" : isSelected ? "border-primary bg-primary/10" : "border-transparent hover:border-muted hover:bg-muted/5"}`}
                onClick={() => handleDayClick(day)}
              >
                <div className="flex h-full flex-col">
                  <div className={`text-right text-xs sm:text-sm ${isToday ? "font-bold text-primary" : isSelected ? "font-semibold text-primary" : ""}`}>
                    {day}
                  </div>

                  <div className="mt-0.5 flex flex-1 flex-col gap-0.5 overflow-hidden sm:mt-1 sm:gap-1">
                    {hasEvents &&
                      dayEvents.slice(0, isMobile ? 1 : 2).map((event) => (
                        <div key={event.id} className="group flex items-center">
                          <Badge
                            className="w-full truncate text-left text-xs group-hover:bg-primary group-hover:text-primary-foreground"
                            variant="outline"
                          >
                            <span className="truncate">{event.title}</span>
                          </Badge>
                        </div>
                      ))}

                    {dayEvents.length > (isMobile ? 1 : 2) && (
                      <div className="text-xs text-muted-foreground">+{dayEvents.length - (isMobile ? 1 : 2)} more</div>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Day view section */}
      {selectedDay && (
        <Card className="border bg-card/50 backdrop-blur-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-lg">{selectedDayFormatted}</CardTitle>
            <Button variant="ghost" size="icon" onClick={() => setSelectedDay(null)} className="h-8 w-8 rounded-full">
              <X className="h-4 w-4" />
              <span className="sr-only">Close day view</span>
            </Button>
          </CardHeader>
          <CardContent>
            {selectedDayEvents.length > 0 ? (
              <div className="space-y-3">
                {selectedDayEvents.map((event) => (
                  <div key={event.id} className="flex flex-col rounded-lg border p-3 hover:bg-muted/5">
                    <div className="mb-1 flex items-center justify-between">
                      <h3 className="font-medium">{event.title}</h3>
                      <Badge variant={event.category === "tech" ? "default" : "outline"} className="capitalize">
                        {event.category}
                      </Badge>
                    </div>
                    <div className="flex flex-wrap gap-2 text-sm text-muted-foreground">
                      <span>{formatEventTime(event)}</span>
                      {event.location && <span>• {event.location}</span>}
                    </div>
                    {event.description && (
                      <p className="mt-2 text-sm line-clamp-2">{event.description}</p>
                    )}
                    <div className="mt-3 flex gap-2">
                      <Link href={`/events/${event.id}`}>
                        <Button size="sm" variant="outline" className="rounded-full">View Details</Button>
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex h-20 items-center justify-center text-muted-foreground">
                No events scheduled for this day
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}