import {
  Map,
  MapMarker,
  MarkerContent,
  MarkerLabel,
  MarkerPopup,
} from "amapcn";
import { Button } from "@/components/ui/button";
import { Star, Navigation, Clock, ExternalLink } from "lucide-react";
import Image from "next/image";

const places = [
  {
    id: 1,
    name: "Forbidden City",
    label: "Palace",
    category: "Historic Site",
    rating: 4.9,
    reviews: 28453,
    hours: "8:30 AM - 5:00 PM",
    image:
      "https://images.unsplash.com/photo-1508804185872-d7badad00f7d?w=300&h=200&fit=crop",
    lng: 116.3974,
    lat: 39.9163,
  },
  {
    id: 2,
    name: "Bird's Nest Stadium",
    label: "Stadium",
    category: "Landmark",
    rating: 4.7,
    reviews: 9234,
    hours: "9:00 AM - 6:00 PM",
    image:
      "https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=300&h=200&fit=crop",
    lng: 116.3914,
    lat: 40.0089,
  },
  {
    id: 3,
    name: "Temple of Heaven",
    label: "Temple",
    category: "Historic Site",
    rating: 4.8,
    reviews: 15621,
    hours: "6:00 AM - 8:00 PM",
    image:
      "https://images.unsplash.com/photo-1587474260584-136574528ed5?w=300&h=200&fit=crop",
    lng: 116.4118,
    lat: 39.8823,
  },
];

export function PopupExample() {
  return (
    <div className="h-[500px] w-full">
      <Map center={[116.40, 39.93]} zoom={10}>
        {places.map((place) => (
          <MapMarker key={place.id} longitude={place.lng} latitude={place.lat}>
            <MarkerContent>
              <div className="size-5 rounded-full bg-rose-500 border-2 border-white shadow-lg cursor-pointer hover:scale-110 transition-transform" />
              <MarkerLabel position="bottom">{place.label}</MarkerLabel>
            </MarkerContent>
            <MarkerPopup className="p-0 w-62">
              <div className="relative h-32 overflow-hidden rounded-t-md">
                <Image
                  fill
                  src={place.image}
                  alt={place.name}
                  className="object-cover"
                />
              </div>
              <div className="space-y-2 p-3">
                <div>
                  <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                    {place.category}
                  </span>
                  <h3 className="font-semibold text-foreground leading-tight">
                    {place.name}
                  </h3>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <div className="flex items-center gap-1">
                    <Star className="size-3.5 fill-amber-400 text-amber-400" />
                    <span className="font-medium">{place.rating}</span>
                    <span className="text-muted-foreground">
                      ({place.reviews.toLocaleString()})
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                  <Clock className="size-3.5" />
                  <span>{place.hours}</span>
                </div>
                <div className="flex gap-2 pt-1">
                  <Button size="sm" className="flex-1 h-8">
                    <Navigation className="size-3.5 mr-1.5" />
                    Directions
                  </Button>
                  <Button size="sm" variant="outline" className="h-8">
                    <ExternalLink className="size-3.5" />
                  </Button>
                </div>
              </div>
            </MarkerPopup>
          </MapMarker>
        ))}
      </Map>
    </div>
  );
}
