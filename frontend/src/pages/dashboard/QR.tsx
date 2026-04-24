import { useState } from "react";
import { QRCodeSVG } from "qrcode.react";
import { Download, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { venues } from "@/data/venues";
import { cn } from "@/lib/utils";

const sampleFeedback = [
  { venue: "Skyline Rooftop", name: "Anna G.", rating: 5, comment: "Magical sunset view, staff were incredible." },
  { venue: "Heritage Barn", name: "Jake L.", rating: 4, comment: "Beautiful space — wish parking was closer." },
  { venue: "North Light Loft", name: "Priya S.", rating: 5, comment: "Perfect for our launch. Light was unreal." },
];

const QR = () => {
  const [active, setActive] = useState(venues[0]);
  const url = `${window.location.origin}/v/${active.slug}?feedback=1`;

  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h1 className="font-display text-4xl font-semibold">QR & Feedback</h1>
        <p className="text-sm text-muted-foreground">Print a QR per venue. Guests scan to leave a quick rating.</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="rounded-2xl border border-border bg-card p-5 shadow-soft">
          <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Choose venue</p>
          <ul className="space-y-1">
            {venues.map((v) => (
              <li key={v.id}>
                <button
                  onClick={() => setActive(v)}
                  className={cn(
                    "w-full rounded-lg px-3 py-2 text-left text-sm transition-colors",
                    active.id === v.id ? "bg-primary text-primary-foreground" : "hover:bg-secondary",
                  )}
                >
                  {v.name}
                </button>
              </li>
            ))}
          </ul>
        </div>

        <div className="flex flex-col items-center justify-center rounded-2xl border border-border bg-card p-8 shadow-soft">
          <div className="rounded-2xl bg-background p-5 shadow-elegant">
            <QRCodeSVG value={url} size={180} bgColor="transparent" fgColor="hsl(160, 45%, 18%)" level="M" />
          </div>
          <p className="mt-4 font-display text-lg font-semibold">{active.name}</p>
          <p className="text-xs text-muted-foreground break-all max-w-[220px] text-center">{url}</p>
          <Button variant="outline" size="sm" className="mt-4 gap-2"><Download className="h-4 w-4" /> Download PNG</Button>
        </div>

        <div className="rounded-2xl border border-border bg-card p-5 shadow-soft">
          <h2 className="font-display text-lg font-semibold">Recent feedback</h2>
          <ul className="mt-3 space-y-4">
            {sampleFeedback.map((f, i) => (
              <li key={i} className="border-b border-border pb-3 last:border-0">
                <div className="flex items-center gap-2">
                  {Array.from({ length: f.rating }).map((_, j) => (
                    <Star key={j} className="h-3.5 w-3.5 fill-accent text-accent" />
                  ))}
                </div>
                <p className="mt-1 text-sm">{f.comment}</p>
                <p className="text-xs text-muted-foreground">{f.name} · {f.venue}</p>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default QR;
