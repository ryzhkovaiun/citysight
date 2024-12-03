import { Component, ChangeDetectorRef } from '@angular/core';
import { AsyncPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { HttpClient } from '@angular/common/http';

import { AngularYandexMapsModule, YaReadyEvent, YaEvent } from 'angular8-yandex-maps';

interface Location {
  id: number;
  icon: string;
  name: string;
  latitude: number;
  longitude: number;
  visited: boolean;
}

interface LocationInformation {
  name: string;
  type: string;
  description: string;
  imageIds: ReadonlyArray<number>;
  visitDate: string;
}

@Component({
  standalone: true,
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
  imports: [AsyncPipe, FormsModule, RouterModule, AngularYandexMapsModule]
})
export class AppComponent {
  private readonly defaultLocation: Location = {
    id: 0,
    icon: '',
    name: '',
    latitude: 0.0,
    longitude: 0.0,
    visited: false
  };

  private readonly defaultLocationInformation: LocationInformation = {
    name: '',
    type: '',
    description: '',
    imageIds: [],
    visitDate: '1999-01-01'
  };

  map!: ymaps.Map;
  locations!: Array<Location>;
  filteredLocations: Array<Location> = [];
  searchRequest: string = '';

  sidebarOpen: boolean = false;
  movementInProgress: boolean = false;

  selectedLocation: Location = this.defaultLocation;
  locationInformation: LocationInformation = this.defaultLocationInformation;
  editedDescription: string = '';
  currentImageIndex: number = 0;

  createNewLocation: boolean = false;
  newLocationCoords: ReadonlyArray<number> = [];
  enteredName: string = '';
  enteredType: string = '';

  constructor(private http: HttpClient, public changeDetector: ChangeDetectorRef) {
    (window as any).rootComponent = {};
    (window as any).rootComponent.createNewPlacemark = this.createNewPlacemark.bind(this);

    http.get<Array<Location>>('/api/locations').subscribe(locations => {
      this.locations = locations;
      this.filteredLocations = locations;
    });
  }

  public updateDescription(): void {
    if (this.editedDescription == this.locationInformation.description) {
      return this.resetLocation();
    }

    this.http.patch(`/api/locations/${this.selectedLocation.id}`, this.editedDescription, { responseType: "text" }).subscribe(visitDate => {
      this.selectedLocation.visited = true;
      this.locationInformation.visitDate = visitDate;

      this.resetLocation();
    });
  }

  private resetLocation(): void {
    this.selectedLocation = this.defaultLocation;
    this.locationInformation = this.defaultLocationInformation;

    this.changeDetector.detectChanges();
  }

  public moveSidebar(): void {
    this.sidebarOpen = !this.sidebarOpen;
  }

  public runSearch() {
    this.filteredLocations = this.locations.filter((location) => location.name.includes(this.searchRequest), this);
  }

  public nextImage() {
    this.currentImageIndex = (this.currentImageIndex + 1) % this.locationInformation.imageIds.length;
  }

  public prevImage() {
    this.currentImageIndex = this.currentImageIndex == 0
      ? this.locationInformation.imageIds.length - 1
      : (this.currentImageIndex - 1) % this.locationInformation.imageIds.length;
  }

  public moveToLocation(location: Location): void {
    if (this.movementInProgress) {
      console.log('already in progress');
      return;
    }

    this.movementInProgress = true;
    this.sidebarOpen = false;

    this.loadLocationInformation(location.id);

    this.map.behaviors.disable('drag');
    (this.map.setCenter([location.latitude, location.longitude], undefined, { duration: 600, timingFunction: 'ease-in-out' }) as unknown as ymaps.vow.Promise).then(() => this.whenMovementEnded(location));
  }

  private whenMovementEnded(location: Location): void {
    this.movementInProgress = false;

    this.selectedLocation = location;

    this.map.behaviors.enable('drag');
  }

  public onMapReady(event: YaReadyEvent<ymaps.Map>): void {
    this.map = event.target;

    this.map.behaviors.disable('dblClickZoom');
  }

  public onMapClick({ event }: YaEvent<ymaps.Map>): void {
    var coords = event.get('coords');

    this.map.balloon.open(coords, `<button class="new-placemark-button inter-semibold" onclick="window.rootComponent.createNewPlacemark([${coords[0]}, ${coords[1]}])">Создать новую метку?</button>`);
  }

  public createNewPlacemark(coords: ReadonlyArray<number>): void {
    this.map.balloon.close(true);

    this.createNewLocation = true;
    this.newLocationCoords = coords;

    this.changeDetector.detectChanges();
  }

  public removePlacemarkPopup(): void {
    this.createNewLocation = false;
    this.changeDetector.detectChanges();
  }

  public onNewPlacemarkConfirmClick(): void {
    if (this.enteredName.length == 0 || this.enteredType.length == 0) {
      return;
    }

    var newLocation = {
      name: this.enteredName,
      type: this.enteredType,
      latitude: this.newLocationCoords[0],
      longitude: this.newLocationCoords[1]
    };

    this.enteredName = '';
    this.enteredType = '';
    this.newLocationCoords = [];

    this.http.post('/api/locations', newLocation, { responseType: 'json' }).subscribe(result => {
      var id = (result as any).id;

      this.locations.push({
        id: id,
        icon: 'tree-city',
        name: newLocation.name,
        latitude: newLocation.latitude,
        longitude: newLocation.longitude,
        visited: false
      });

      this.runSearch();

      this.removePlacemarkPopup();
    });
  }

  public onPlacemarkClick(location: Location): void {
    this.selectedLocation = location;

    this.loadLocationInformation(location.id);
  }

  public loadLocationInformation(id: number): void {
    this.http.get<LocationInformation>(`/api/locations/${id}`).subscribe(info => {
      this.locationInformation = info;
      this.editedDescription = info.description;
    });

    this.changeDetector.detectChanges();
  }
}
