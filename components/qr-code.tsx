"use client";

import { useEffect, useState } from "react";
import { QRCodeSVG } from "qrcode.react";

interface QRCodeProps {
  value: string;
  size?: number;
  level?: "L" | "M" | "Q" | "H";
  includeMargin?: boolean;
  id?: string; // Add ID prop
}

export default function QRCode({
  value,
  size = 200,
  level = "H",
  includeMargin = true,
  id, // Add ID to props
}: QRCodeProps) {
  const [isMounted, setIsMounted] = useState(false);

  // Ensure component only renders on client-side
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Return null during SSR to prevent hydration errors
  if (!isMounted) {
    return (
      <div
        style={{
          width: size,
          height: size,
          backgroundColor: "#f3f4f6",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <span>Loading QR Code...</span>
      </div>
    );
  }

  // Generate registration data for QR code
  const qrData = JSON.stringify({
    ticketId: value,
    timestamp: new Date().toISOString(),
  });

  return (
    <QRCodeSVG
      value={qrData}
      size={size}
      level={level}
      includeMargin={includeMargin}
      className="mx-auto"
      id={id} // Apply the ID to the SVG
    />
  );
}
