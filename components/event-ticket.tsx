"use client";

import { useState, useEffect } from "react";
import { Download, Share2 } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import QRCode from "@/components/qr-code";
import { useToast } from "@/hooks/use-toast";
import { getRegistrationById } from "@/actions/registration";

interface EventTicketProps {
  ticketId: string;
}

export default function EventTicket({ ticketId }: EventTicketProps) {
  const { toast } = useToast();
  const [registration, setRegistration] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRegistration = async () => {
      try {
        const data = await getRegistrationById(ticketId);
        setRegistration(data);
      } catch (error) {
        console.error("Error fetching registration:", error);
        toast({
          title: "Error",
          description: "Could not load ticket details",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchRegistration();
  }, [ticketId, toast]);

  const handleDownload = () => {
    // Get the SVG element with correct ID
    const svgElement = document.getElementById('ticket-qr-code');
    if (!svgElement) {
      toast({
        title: "Download Failed",
        description: "Could not find QR code element",
        variant: "destructive",
      });
      return;
    }

    try {
      // Create a canvas element
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      // Set canvas dimensions - make them larger for better quality
      const scale = 2; // Increase size for better resolution
      canvas.width = svgElement.clientWidth * scale;
      canvas.height = svgElement.clientHeight * scale;
      
      // Draw white background
      ctx.fillStyle = 'white';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      // Create an image from the SVG
      const img = new Image();
      const svgData = new XMLSerializer().serializeToString(svgElement);
      const svgBlob = new Blob([svgData], { type: 'image/svg+xml' });
      const url = URL.createObjectURL(svgBlob);

      img.onload = () => {
        // Draw SVG on canvas
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        
        // Convert to data URL
        const dataUrl = canvas.toDataURL('image/png');
        
        // Create download link
        const a = document.createElement('a');
        a.href = dataUrl;
        a.download = `event-ticket-${ticketId}.png`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        
        // Clean up
        URL.revokeObjectURL(url);
        
        toast({
          title: "Download Complete",
          description: "Your ticket has been downloaded",
        });
      };
      
      img.src = url;
      
    } catch (error) {
      console.error('Error downloading QR code', error);
      toast({
        title: "Download Failed",
        description: "Could not download ticket",
        variant: "destructive"
      });
    }
  };

  const handleShare = async () => {
    if (!navigator.share) {
      toast({
        title: "Sharing Not Available",
        description: "Your browser doesn't support sharing",
      });
      return;
    }

    try {
      await navigator.share({
        title: 'My Event Ticket',
        text: `I'm attending ${registration?.event?.title}! Here's my ticket ID: ${ticketId}`,
        url: window.location.href,
      });
      
      toast({
        title: "Shared Successfully",
        description: "Your ticket has been shared",
      });
    } catch (error) {
      console.error('Error sharing', error);
      toast({
        title: "Share Cancelled",
        description: "Ticket sharing was cancelled",
      });
    }
  };

  if (loading) {
    return (
      <Card className="glass-card mb-8 overflow-hidden">
        <CardContent className="flex h-64 items-center justify-center">
          <p>Loading ticket information...</p>
        </CardContent>
      </Card>
    );
  }

  if (!registration) {
    return (
      <Card className="glass-card mb-8 overflow-hidden">
        <CardContent className="flex h-64 items-center justify-center">
          <p>Ticket not found or access denied</p>
        </CardContent>
      </Card>
    );
  }

  const eventDate = new Date(registration.event.date).toLocaleDateString();
  
  return (
    <Card className="glass-card mb-8 overflow-hidden">
      <CardHeader className="bg-gradient-to-r from-primary/10 to-secondary/10 pb-6">
        <CardTitle className="flex items-center justify-between">
          <span>Your Event Ticket</span>
          <Badge variant="outline" className="border-green-500 text-green-500">
            {registration.status === "ATTENDED" ? "Attended" : "Confirmed"}
          </Badge>
        </CardTitle>
        <CardDescription>Present this QR code at the event entrance for check-in</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col items-center p-6">
        <div className="mb-6 flex w-full flex-col items-center justify-center rounded-xl bg-white p-6 shadow-sm dark:bg-gray-800">
          <div id="registration-qr-code">
            <QRCode value={ticketId} size={200} id="ticket-qr-code" />
          </div>
          <div className="mt-4 text-center">
            <p className="text-sm font-medium text-muted-foreground">Ticket ID</p>
            <p className="font-mono text-sm">{ticketId}</p>
          </div>
        </div>
        
        <div className="w-full rounded-lg border p-4 text-sm">
          <div className="mb-2 grid grid-cols-2 gap-2">
            <div>
              <p className="text-xs text-muted-foreground">Event</p>
              <p className="font-medium">{registration.event.title}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Date</p>
              <p className="font-medium">{eventDate}</p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <p className="text-xs text-muted-foreground">Time</p>
              <p className="font-medium">{registration.event.time}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Location</p>
              <p className="font-medium">{registration.event.location}</p>
            </div>
          </div>
        </div>

        <div className="mt-4 flex w-full flex-col gap-2 sm:flex-row">
          <Button
            variant="outline"
            className="flex-1 gap-2"
            onClick={handleDownload}
          >
            <Download className="h-4 w-4" />
            Download Ticket
          </Button>
          <Button
            variant="outline"
            className="flex-1 gap-2"
            onClick={handleShare}
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
  );
}