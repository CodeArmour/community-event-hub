"use client"

import { Download, Share2 } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import QRCode from "@/components/qr-code"
import { useToast } from "@/hooks/use-toast"

interface EventTicketProps {
  ticketId: string
}

export default function EventTicket({ ticketId }: EventTicketProps) {
  const { toast } = useToast()

  return (
    <Card className="glass-card mb-8 overflow-hidden">
      <CardHeader className="bg-gradient-to-r from-primary/10 to-secondary/10 pb-6">
        <CardTitle className="flex items-center justify-between">
          <span>Your Event Ticket</span>
          <Badge variant="outline" className="border-green-500 text-green-500">
            Confirmed
          </Badge>
        </CardTitle>
        <CardDescription>Present this QR code at the event entrance for check-in</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col items-center p-6">
        <div className="mb-6 flex w-full flex-col items-center justify-center rounded-xl bg-white p-6 shadow-sm dark:bg-gray-800">
          <QRCode value={ticketId} size={200} />
          <div className="mt-4 text-center">
            <p className="text-sm font-medium text-muted-foreground">Ticket ID</p>
            <p className="font-mono text-sm">{ticketId}</p>
          </div>
        </div>

        <div className="mt-2 flex w-full flex-col gap-2 sm:flex-row">
          <Button
            variant="outline"
            className="flex-1 gap-2"
            onClick={() => {
              // In a real app, this would download the QR code as an image
              toast({
                title: "Download Started",
                description: "Your ticket is being downloaded",
              })
            }}
          >
            <Download className="h-4 w-4" />
            Download Ticket
          </Button>
          <Button
            variant="outline"
            className="flex-1 gap-2"
            onClick={() => {
              // In a real app, this would open a share dialog
              toast({
                title: "Share Ticket",
                description: "Sharing functionality would open here",
              })
            }}
          >
            <Share2 className="h-4 w-4" />
            Share Ticket
          </Button>
        </div>

        <div className="mt-6 rounded-lg border border-dashed border-muted-foreground/20 p-4 text-center text-sm text-muted-foreground">
          <p>Please arrive 15 minutes before the event starts. Your ticket has been sent to your email as well.</p>
        </div>
      </CardContent>
    </Card>
  )
}

