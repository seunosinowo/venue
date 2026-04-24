import { useState, useEffect } from "react";
import { QRCodeSVG } from "qrcode.react";
import { Download, Copy, Star, QrCode } from "lucide-react";
import { Button } from "@/components/ui/button";
import { api } from "@/lib/api";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

type Venue = {
  id: string;
  name: string;
  location: string;
  maxGuests: number;
  pricePerDay: number;
  description: string;
  images: string[];
  amenities: string[];
  unavailableDates: string[];
};

const sampleFeedback = [
  { venue: "Skyline Rooftop", name: "Anna G.", rating: 5, comment: "Magical sunset view, staff were incredible." },
  { venue: "Heritage Barn", name: "Jake L.", rating: 4, comment: "Beautiful space — wish parking was closer." },
  { venue: "North Light Loft", name: "Priya S.", rating: 5, comment: "Perfect for our launch. Light was unreal." },
];

const QR = () => {
  const [venues, setVenues] = useState<Venue[]>([]);
  const [selectedVenue, setSelectedVenue] = useState<Venue | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadVenues();
  }, []);

  const loadVenues = async () => {
    try {
      const data = await api.venues.getAll();
      setVenues(Array.isArray(data) ? data : []);
      if (data.length > 0) {
        setSelectedVenue(data[0]);
      }
    } catch (err) {
      console.error("Failed to load venues");
      setVenues([]);
    } finally {
      setLoading(false);
    }
  };

  const url = selectedVenue ? `${window.location.origin}/venue/${selectedVenue.id}?feedback=1` : "";

  const copyLink = () => {
    if (url) {
      navigator.clipboard.writeText(url);
      toast.success("Link copied to clipboard!");
    }
  };

  const downloadQR = () => {
    if (!selectedVenue) return;
    
    const svg = document.getElementById("qr-code-svg");
    if (!svg) return;

    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    const img = new Image();
    
    img.onload = () => {
      canvas.width = 400;
      canvas.height = 400;
      ctx?.drawImage(img, 0, 0);
      
      const pngFile = canvas.toDataURL("image/png");
      const downloadLink = document.createElement("a");
      downloadLink.download = `${selectedVenue.name.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_qr.png`;
      downloadLink.href = pngFile;
      downloadLink.click();
      toast.success("QR code downloaded!");
    };
    
    img.src = "data:image/svg+xml;base64," + btoa(svgData);
  };

  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h1 className="font-display text-2xl font-semibold sm:text-3xl md:text-4xl">QR & Feedback</h1>
        <p className="text-sm text-muted-foreground">Generate QR codes for your venues to collect guest feedback.</p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      ) : venues.length === 0 ? (
        <div className="text-center py-12">
          <QrCode className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">No venues found</h3>
          <p className="text-muted-foreground">Create your first venue to generate QR codes.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Venue Selection */}
          <div className="rounded-2xl border border-border bg-card p-6 shadow-soft">
            <h2 className="font-display text-lg font-semibold mb-4">Select Venue</h2>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {venues.map((v) => (
                <button
                  key={v.id}
                  onClick={() => setSelectedVenue(v)}
                  className={cn(
                    "p-4 rounded-xl border-2 text-left transition-all",
                    selectedVenue?.id === v.id
                      ? "border-primary bg-primary/5 shadow-soft"
                      : "border-border hover:border-primary/50 hover:bg-secondary/50"
                  )}
                >
                  <div className="font-medium text-sm mb-1">{v.name}</div>
                  <div className="text-xs text-muted-foreground flex items-center gap-1">
                    <span>{v.location}</span>
                    <span>•</span>
                    <span>Up to {v.maxGuests} guests</span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* QR Code Display - Shows when venue is selected */}
          {selectedVenue && (
            <div className="rounded-2xl border border-border bg-card p-6 shadow-soft animate-fade-in">
              <div className="flex flex-col lg:flex-row gap-8 items-center lg:items-start">
                {/* QR Code */}
                <div className="flex-shrink-0">
                  <div className="rounded-2xl bg-white p-6 shadow-elegant">
                    <QRCodeSVG 
                      id="qr-code-svg"
                      value={url} 
                      size={200} 
                      bgColor="white" 
                      fgColor="#000000" 
                      level="M" 
                    />
                  </div>
                </div>

                {/* Venue Info and Actions */}
                <div className="flex-1 space-y-4 text-center lg:text-left">
                  <div>
                    <h3 className="font-display text-xl font-semibold mb-2">{selectedVenue.name}</h3>
                    <p className="text-sm text-muted-foreground mb-1">{selectedVenue.location}</p>
                    <p className="text-xs text-muted-foreground break-all bg-secondary/50 p-2 rounded">{url}</p>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-3 justify-center lg:justify-start">
                    <Button onClick={copyLink} variant="outline" size="sm" className="gap-2">
                      <Copy className="h-4 w-4" /> Copy Link
                    </Button>
                    <Button onClick={downloadQR} size="sm" className="gap-2 bg-primary hover:bg-primary-glow">
                      <Download className="h-4 w-4" /> Download QR
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Recent Feedback */}
          <div className="rounded-2xl border border-border bg-card p-6 shadow-soft">
            <h2 className="font-display text-lg font-semibold mb-4">Recent Feedback</h2>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {sampleFeedback.map((f, i) => (
                <div key={i} className="p-4 rounded-xl bg-secondary/30">
                  <div className="flex items-center gap-1 mb-2">
                    {Array.from({ length: f.rating }).map((_, j) => (
                      <Star key={j} className="h-4 w-4 fill-accent text-accent" />
                    ))}
                  </div>
                  <p className="text-sm mb-2">{f.comment}</p>
                  <p className="text-xs text-muted-foreground">{f.name} · {f.venue}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default QR;
