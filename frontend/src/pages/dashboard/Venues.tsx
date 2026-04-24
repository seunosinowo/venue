import { useEffect, useState, useRef } from "react";
import { Link } from "react-router-dom";
import { format } from "date-fns";
import { Edit2, Trash2, MapPin, Users, Plus, Share2, Upload, X, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { api } from "@/lib/api";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Calendar as DateCalendar } from "@/components/ui/calendar";

type Venue = {
  id: string; slug: string; name: string; location: string; maxGuests: number;
  pricePerDay: number; description: string; images: string[]; amenities: string[];
  unavailableDates: string[];
};

const Venues = () => {
  const [venues, setVenues] = useState<Venue[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [editingVenue, setEditingVenue] = useState<Venue | null>(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [datePickerMode, setDatePickerMode] = useState<"create" | "edit">("create");
  const [selectedDate, setSelectedDate] = useState<Date | undefined>();
  const [newVenue, setNewVenue] = useState({ name: "", location: "", maxGuests: 50, pricePerDay: 500, description: "", slug: "", images: [] as string[], unavailableDates: [] as string[] });
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    loadVenues();
  }, []);

  const loadVenues = async () => {
    try {
      const data = await api.venues.getAll();
      setVenues(data);
    } catch (err) {
      toast.error("Failed to load venues");
    } finally {
      setLoading(false);
    }
  };

  const share = (slug: string) => {
    navigator.clipboard.writeText(`${window.location.origin}/v/${slug}`);
    toast.success("Share link copied");
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, isEdit = false) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async () => {
      const base64 = reader.result as string;
      try {
        const { url } = await api.upload.image(base64);
        if (isEdit && editingVenue) {
          setEditingVenue({ ...editingVenue, images: [...editingVenue.images, url] });
        } else {
          setNewVenue({ ...newVenue, images: [...newVenue.images, url] });
        }
        toast.success("Image uploaded!");
      } catch (err) {
        toast.error("Upload failed");
      }
    };
    reader.readAsDataURL(file);
  };

  const removeImage = (url: string, isEdit = false) => {
    if (isEdit && editingVenue) {
      setEditingVenue({ ...editingVenue, images: editingVenue.images.filter((img) => img !== url) });
    } else {
      setNewVenue({ ...newVenue, images: newVenue.images.filter((img) => img !== url) });
    }
  };

  const openDatePicker = (mode: "create" | "edit") => {
    setDatePickerMode(mode);
    setSelectedDate(undefined);
    setShowDatePicker(true);
  };

  const addUnavailableDate = () => {
    if (!selectedDate) return;
    const dateStr = format(selectedDate, "yyyy-MM-dd");
    if (datePickerMode === "edit" && editingVenue) {
      if (!editingVenue.unavailableDates.includes(dateStr)) {
        setEditingVenue({ ...editingVenue, unavailableDates: [...editingVenue.unavailableDates, dateStr] });
      }
    } else {
      if (!newVenue.unavailableDates.includes(dateStr)) {
        setNewVenue({ ...newVenue, unavailableDates: [...newVenue.unavailableDates, dateStr] });
      }
    }
    setSelectedDate(undefined);
  };

  const removeUnavailableDate = (dateStr: string, isEdit = false) => {
    if (isEdit && editingVenue) {
      setEditingVenue({ ...editingVenue, unavailableDates: editingVenue.unavailableDates.filter((d) => d !== dateStr) });
    } else {
      setNewVenue({ ...newVenue, unavailableDates: newVenue.unavailableDates.filter((d) => d !== dateStr) });
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.venues.create(newVenue);
      toast.success("Venue created!");
      setShowCreate(false);
      setNewVenue({ name: "", location: "", maxGuests: 50, pricePerDay: 500, description: "", slug: "", images: [], unavailableDates: [] });
      loadVenues();
    } catch (err) {
      toast.error("Failed to create venue");
    }
  };

  const handleEdit = async () => {
    if (!editingVenue) return;
    try {
      await api.venues.update(editingVenue.id, {
        name: editingVenue.name,
        slug: editingVenue.slug,
        location: editingVenue.location,
        maxGuests: editingVenue.maxGuests,
        pricePerDay: editingVenue.pricePerDay,
        description: editingVenue.description,
        images: editingVenue.images,
        unavailableDates: editingVenue.unavailableDates
      });
      toast.success("Venue updated!");
      setEditingVenue(null);
      loadVenues();
    } catch (err) {
      toast.error("Failed to update venue");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this venue?")) return;
    try {
      await api.venues.delete(id);
      toast.success("Venue deleted");
      loadVenues();
    } catch (err) {
      toast.error("Failed to delete venue");
    }
  };

  if (loading) return <div className="p-8">Loading...</div>;

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-4xl font-semibold">Venues</h1>
          <p className="text-sm text-muted-foreground">Manage your spaces, availability, and pricing.</p>
        </div>
        <Button onClick={() => setShowCreate(true)} className="gap-2 bg-primary hover:bg-primary-glow">
          <Plus className="h-4 w-4" /> New venue
        </Button>
      </div>

      {venues.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">No venues yet. Create your first one!</div>
      ) : (
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {venues.map((v) => (
            <div key={v.id} className="overflow-hidden rounded-2xl border border-border bg-card shadow-soft transition-smooth hover:shadow-elegant">
              <div className="aspect-[16/10] overflow-hidden bg-muted">
                {v.images?.[0] ? <img src={v.images[0]} alt={v.name} loading="lazy" className="h-full w-full object-cover" /> : <div className="flex h-full items-center justify-center text-muted-foreground">No image</div>}
              </div>
              <div className="p-5">
                <h3 className="font-display text-xl font-semibold">{v.name}</h3>
                <div className="mt-2 flex flex-wrap gap-3 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{v.location}</span>
                  <span className="flex items-center gap-1"><Users className="h-3 w-3" />{v.maxGuests}</span>
                </div>
                <div className="mt-4 flex items-center gap-2">
                  <Link to={`/v/${v.slug}`} className="flex-1">
                    <Button variant="outline" size="sm" className="w-full">View</Button>
                  </Link>
                  <Button variant="outline" size="icon" onClick={() => share(v.slug)}><Share2 className="h-4 w-4" /></Button>
                  <Button variant="outline" size="icon" onClick={() => setEditingVenue(v)}><Edit2 className="h-4 w-4" /></Button>
                  <Button variant="outline" size="icon" className="text-destructive hover:text-destructive" onClick={() => handleDelete(v.id)}><Trash2 className="h-4 w-4" /></Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <Dialog open={showCreate} onOpenChange={setShowCreate}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create New Venue</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleCreate} className="space-y-4">
            <div><Label>Name</Label><Input value={newVenue.name} onChange={(e) => setNewVenue({...newVenue, name: e.target.value})} required /></div>
            <div><Label>Slug</Label><Input value={newVenue.slug} onChange={(e) => setNewVenue({...newVenue, slug: e.target.value})} required placeholder="my-venue" /></div>
            <div><Label>Location</Label><Input value={newVenue.location} onChange={(e) => setNewVenue({...newVenue, location: e.target.value})} required /></div>
            <div className="grid grid-cols-2 gap-4">
              <div><Label>Max Guests</Label><Input type="number" value={newVenue.maxGuests} onChange={(e) => setNewVenue({...newVenue, maxGuests: +e.target.value})} required /></div>
              <div><Label>Price/Day (₦)</Label><Input type="number" value={newVenue.pricePerDay} onChange={(e) => setNewVenue({...newVenue, pricePerDay: +e.target.value})} required /></div>
            </div>
            <div><Label>Description</Label><Input value={newVenue.description} onChange={(e) => setNewVenue({...newVenue, description: e.target.value})} required /></div>
            
            <div>
              <Label>Venue Photos</Label>
              <div className="mt-2 flex flex-wrap gap-2">
                {newVenue.images.map((img, i) => (
                  <div key={i} className="relative w-20 h-20 rounded-lg overflow-hidden border">
                    <img src={img} alt="" className="w-full h-full object-cover" />
                    <button type="button" onClick={() => removeImage(img)} className="absolute top-1 right-1 bg-black/50 rounded-full p-0.5">
                      <X className="h-3 w-3 text-white" />
                    </button>
                  </div>
                ))}
                <label className="w-20 h-20 rounded-lg border border-dashed border-border flex items-center justify-center cursor-pointer hover:bg-muted">
                  <Upload className="h-5 w-5 text-muted-foreground" />
                  <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={(e) => handleImageUpload(e)} />
                </label>
              </div>
            </div>

            <div>
              <Label>Unavailable Dates (blocked dates)</Label>
              <p className="text-xs text-muted-foreground mb-2">Select dates when the venue is not available for booking</p>
              <div className="flex flex-wrap gap-1 mb-2">
                {newVenue.unavailableDates.map((d, i) => (
                  <span key={i} className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-muted text-xs">
                    {new Date(d).toLocaleDateString()}
                    <button type="button" onClick={() => removeUnavailableDate(d)} className="hover:text-destructive">
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                ))}
                {newVenue.unavailableDates.length === 0 && <span className="text-xs text-muted-foreground">No blocked dates</span>}
              </div>
              <Button type="button" variant="outline" size="sm" onClick={() => openDatePicker("create")}>
                <Calendar className="h-4 w-4 mr-1" /> Block dates
              </Button>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setShowCreate(false)}>Cancel</Button>
              <Button type="submit" className="bg-primary hover:bg-primary-glow">Create</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={!!editingVenue} onOpenChange={(o) => !o && setEditingVenue(null)}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Venue</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div><Label>Name</Label><Input value={editingVenue?.name || ""} onChange={(e) => setEditingVenue({...editingVenue!, name: e.target.value})} /></div>
            <div><Label>Slug</Label><Input value={editingVenue?.slug || ""} onChange={(e) => setEditingVenue({...editingVenue!, slug: e.target.value})} /></div>
            <div><Label>Location</Label><Input value={editingVenue?.location || ""} onChange={(e) => setEditingVenue({...editingVenue!, location: e.target.value})} /></div>
            <div className="grid grid-cols-2 gap-4">
              <div><Label>Max Guests</Label><Input type="number" value={editingVenue?.maxGuests || 0} onChange={(e) => setEditingVenue({...editingVenue!, maxGuests: +e.target.value})} /></div>
              <div><Label>Price/Day ($)</Label><Input type="number" value={editingVenue?.pricePerDay || 0} onChange={(e) => setEditingVenue({...editingVenue!, pricePerDay: +e.target.value})} /></div>
            </div>
            <div><Label>Description</Label><Input value={editingVenue?.description || ""} onChange={(e) => setEditingVenue({...editingVenue!, description: e.target.value})} /></div>

            <div>
              <Label>Venue Photos</Label>
              <div className="mt-2 flex flex-wrap gap-2">
                {editingVenue?.images.map((img, i) => (
                  <div key={i} className="relative w-20 h-20 rounded-lg overflow-hidden border">
                    <img src={img} alt="" className="w-full h-full object-cover" />
                    <button type="button" onClick={() => removeImage(img, true)} className="absolute top-1 right-1 bg-black/50 rounded-full p-0.5">
                      <X className="h-3 w-3 text-white" />
                    </button>
                  </div>
                ))}
                <label className="w-20 h-20 rounded-lg border border-dashed border-border flex items-center justify-center cursor-pointer hover:bg-muted">
                  <Upload className="h-5 w-5 text-muted-foreground" />
                  <input type="file" accept="image/*" className="hidden" onChange={(e) => handleImageUpload(e, true)} />
                </label>
              </div>
            </div>

            <div>
              <Label>Unavailable Dates (blocked dates)</Label>
              <p className="text-xs text-muted-foreground mb-2">Select dates when the venue is not available for booking</p>
              <div className="flex flex-wrap gap-1 mb-2">
                {editingVenue?.unavailableDates.map((d, i) => (
                  <span key={i} className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-muted text-xs">
                    {new Date(d).toLocaleDateString()}
                    <button type="button" onClick={() => removeUnavailableDate(d, true)} className="hover:text-destructive">
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                ))}
                {editingVenue?.unavailableDates.length === 0 && <span className="text-xs text-muted-foreground">No blocked dates</span>}
              </div>
              <Button type="button" variant="outline" size="sm" onClick={() => openDatePicker("edit")}>
                <Calendar className="h-4 w-4 mr-1" /> Block dates
              </Button>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setEditingVenue(null)}>Cancel</Button>
              <Button onClick={handleEdit} className="bg-primary hover:bg-primary-glow">Save changes</Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={showDatePicker} onOpenChange={setShowDatePicker}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Block Dates</DialogTitle>
          </DialogHeader>
          <div className="flex justify-center py-4">
            <DateCalendar
              mode="single"
              selected={selectedDate}
              onSelect={setSelectedDate}
              disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDatePicker(false)}>Cancel</Button>
            <Button onClick={addUnavailableDate} disabled={!selectedDate} className="bg-primary hover:bg-primary-glow">
              Block this date
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Venues;
