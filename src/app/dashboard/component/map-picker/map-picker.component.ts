import {
  Component,
  Input,
  Output,
  EventEmitter,
  AfterViewInit,
  OnChanges,
  SimpleChanges,
  OnDestroy,
  NgZone,
  ViewEncapsulation,
  HostBinding,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import * as L from 'leaflet';

export interface MapLocation {
  latitude: number;
  longitude: number;
  address: string;
}

const markerIcon = L.icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

@Component({
  selector: 'app-map-picker',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './map-picker.component.html',
  styleUrl: './map-picker.component.css',
  encapsulation: ViewEncapsulation.None,
})
export class MapPickerComponent implements AfterViewInit, OnChanges, OnDestroy {
  @HostBinding('style.display') display = 'block';

  @Input() initialLat?: number | null;
  @Input() initialLng?: number | null;
  @Input() initialAddress?: string | null;

  @Output() locationSelected = new EventEmitter<MapLocation>();

  searchQuery = '';
  searchResults: any[] = [];
  searching = false;

  private map!: L.Map;
  private marker!: L.Marker;
  private mapInitialized = false;

  constructor(private zone: NgZone) {}

  ngAfterViewInit(): void {
    this.zone.runOutsideAngular(() => this.initMap());
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (!this.mapInitialized) return;
    if ((changes['initialLat'] || changes['initialLng']) && this.initialLat && this.initialLng) {
      this.placeMarker(this.initialLat, this.initialLng, this.initialAddress || '');
    }
  }

  ngOnDestroy(): void {
    this.map?.remove();
  }

  private initMap(): void {
    const lat = this.initialLat || 25.2048;
    const lng = this.initialLng || 55.2708;

    // Pass string ID — same as the working StackBlitz sample.
    // Leaflet does document.getElementById() internally which always
    // finds the real painted element, avoiding ViewChild timing issues.
    this.map = L.map('mapContainer', {
      zoomControl: true,
      maxZoom: 19,
      minZoom: 2,
    }).setView([lat, lng], 12);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors',
      maxZoom: 19,
    }).addTo(this.map);

    this.marker = L.marker([lat, lng], { icon: markerIcon, draggable: true })
      .addTo(this.map);

    if (this.initialLat && this.initialLng) {
      this.searchQuery = this.initialAddress || '';
    } else {
      this.marker.setOpacity(0);
    }

    this.marker.on('dragend', () => {
      const pos = this.marker.getLatLng();
      this.zone.run(() => this.reverseGeocode(pos.lat, pos.lng));
    });

    this.map.on('click', (e: L.LeafletMouseEvent) => {
      this.marker.setLatLng(e.latlng).setOpacity(1);
      this.zone.run(() => this.reverseGeocode(e.latlng.lat, e.latlng.lng));
    });

    this.mapInitialized = true;
  }

  onSearchInput(): void {
    if (this.searchQuery.length < 3) {
      this.searchResults = [];
      return;
    }
    clearTimeout((this as any)._searchTimer);
    (this as any)._searchTimer = setTimeout(() => this.doSearch(), 400);
  }

  private doSearch(): void {
    this.searching = true;
    fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(this.searchQuery)}&limit=5`,
      { headers: { 'Accept-Language': 'en' } }
    )
      .then((r) => r.json())
      .then((results) => {
        this.zone.run(() => {
          this.searchResults = results;
          this.searching = false;
        });
      })
      .catch(() => this.zone.run(() => { this.searching = false; }));
  }

  selectResult(result: any): void {
    const lat = parseFloat(result.lat);
    const lng = parseFloat(result.lon);
    this.placeMarker(lat, lng, result.display_name);
    this.searchResults = [];
  }

  private placeMarker(lat: number, lng: number, address: string): void {
    this.marker.setLatLng([lat, lng]).setOpacity(1);
    this.map.setView([lat, lng], 15);
    this.searchQuery = address;
    this.locationSelected.emit({ latitude: lat, longitude: lng, address });
  }

  private reverseGeocode(lat: number, lng: number): void {
    fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`,
      { headers: { 'Accept-Language': 'en' } }
    )
      .then((r) => r.json())
      .then((result) => {
        const address = result.display_name || `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
        this.zone.run(() => this.placeMarker(lat, lng, address));
      })
      .catch(() => this.zone.run(() =>
        this.placeMarker(lat, lng, `${lat.toFixed(6)}, ${lng.toFixed(6)}`)
      ));
  }
}
