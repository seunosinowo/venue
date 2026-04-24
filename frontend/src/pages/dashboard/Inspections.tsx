import { useEffect, useState } from "react";
import { Check, X, Mail, Phone, Users, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { api } from "@/lib/api";
import { toast } from "sonner";
import { format } from "date-fns";

type Booking = {
  id: string;
  guestName: string;
  guestEmail: string;
  guestPhone: string;
  guests: number;
  bookingDate: string;
  inspectionDate: string | null;
  status: string;
  venue: { name: string };
};

const Inspections = () => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadBookings();
  }, []);

  const loadBookings = async () => {
    try {
      const data = await api.bookings.getAll();
      setBookings(data);
    } catch (err) {
      toast.error("Failed to load bookings");
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id: string) => {
    try {
      await api.bookings.approve(id);
      toast.success("Approved — guest notified");
      loadBookings();
    } catch (err) {
      toast.error("Failed to approve");
    }
  };

  const handleDecline = async (id: string) => {
    try {
      await api.bookings.decline(id);
      toast.success("Request declined");
      loadBookings();
    } catch (err) {
      toast.error("Failed to decline");
    }
  };

  if (loading) return <div className="p-8">Loading...</div>;

  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h1 className="font-display text-4xl font-semibold">Inspection requests</h1>
        <p className="text-sm text-muted-foreground">Approve or decline incoming requests. Guests are notified by email.</p>
      </div>

      {bookings.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">No booking requests yet.</div>
      ) : (
        <div className="space-y-4">
          {bookings.map((r) => (
            <div key={r.id} className="rounded-2xl border border-border bg-card p-5 shadow-soft">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 font-medium text-primary">
                      {r.guestName[0]}
                    </div>
                    <div>
                      <p className="font-medium">{r.guestName}</p>
                      <p className="text-xs text-muted-foreground">{r.venue.name}</p>
                    </div>
                  </div>
                  <div className="mt-4 grid gap-2 text-sm text-muted-foreground sm:grid-cols-2 lg:grid-cols-4">
                    <span className="flex items-center gap-1.5"><Mail className="h-3.5 w-3.5" />{r.guestEmail}</span>
                    <span className="flex items-center gap-1.5"><Phone className="h-3.5 w-3.5" />{r.guestPhone}</span>
                    <span className="flex items-center gap-1.5"><Users className="h-3.5 w-3.5" />{r.guests} guests</span>
                    <span className="flex items-center gap-1.5"><Calendar className="h-3.5 w-3.5" />{r.bookingDate ? format(new Date(r.bookingDate), "MMM d, h:mm a") : "TBD"}</span>
                  </div>
                </div>
                {r.status === "PENDING" && (
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => handleDecline(r.id)}>
                      <X className="h-4 w-4" /> Decline
                    </Button>
                    <Button size="sm" className="bg-primary hover:bg-primary-glow" onClick={() => handleApprove(r.id)}>
                      <Check className="h-4 w-4" /> Approve
                    </Button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Inspections;
