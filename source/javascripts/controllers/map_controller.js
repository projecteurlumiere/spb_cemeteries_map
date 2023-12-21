import { Controller } from "stimulus"
import L from 'leaflet'
import "leaflet-sidebar-v2"

export default class extends Controller {
  static values = {
    startPoint: Array
  }

  // cityCoordinates = [59.8965, 30.3264]; // coordinates for spb city center
  polygons = {};

  connect() {
    console.log("starting connect");
    console.log(this.startPointValue);

    this.map = L.map('map').setView(this.startPointValue, 10);

    L.tileLayer(`https://tiles.stadiamaps.com/tiles/alidade_smooth_dark/{z}/{x}/{y}{r}.{ext}`, {
      minZoom: 10,
      attribution: '&copy; <a href="https://www.stadiamaps.com/" target="_blank">Stadia Maps</a> &copy; <a href="https://openmaptiles.org/" target="_blank">OpenMapTiles</a> &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      ext: 'png'
    }).addTo(this.map);

    this.sidebar = L.control.sidebar({
      container: 'sidebar', // the DOM container or #ID of a predefined sidebar container that should be used
      closeButton: true,    // whether t add a close button to the panes
      position: 'left',     // left or right
    }).addTo(this.map);

    this.sidebar.open('list');
  }

  drawPolygon(e) {
    console.log("draw polygon shots");
    console.log(e.detail);
    let polygon;

    if (e.detail.coordinates.geoJSON) {
       console.log("draw polygon geojson shots");
       polygon = L.geoJSON(JSON.parse(e.detail.coordinatesGeoJSON))
    }
    else if (e.detail.coordinates.polygon) {
      polygon = L.polygon(e.detail.coordinates, {cemetery_id: e.detail.id});
    }
    else return

    console.log("add to map is about to happen");

    polygon.addTo(this.map);

    this.polygons[e.detail.id] = polygon;

    polygon.addEventListener('click', () => {
      this.#toEntry(polygon);
      Turbo.visit(`/${e.detail.id}`, { action: 'advance', frame: 'entry-content' }); // doesn't update URL despite action: advance- apparently, rails bug
    })

  }

  // in the app view, drawPolygon fires first followed by this method:
  toInitialEntry(e) {
    if (this.isShowRequest === true && this.initialEntryId == e.detail.id) {
      this.toEntryByEvent(e);
    }
  }

  toEntryByEvent(e) {
    let polygon = this.polygons[e.target.getAttribute("data-cemetery-id-value")];
    this.#toEntry(polygon);
  }

  #toEntry(polygon){
    this.sidebar.enablePanel('entry'); // should i overoptimize this?

    this.#centerMap(polygon);
    this.sidebar.open('entry');
  }

  #centerMap(polygon) {
    try {
      if (polygon) {
        this.map.flyTo(polygon.getCenter(), 14)
      }
    } catch (error) {
      this.map.flyTo(polygon.getBounds().getCenter(), 14);

    }
  }

  #isShowRequest() {
    console.log(window.location);
    if (window.location.pathname != "/") {
      this.isShowRequest = true;
      this.initialEntryId = document.getElementById('entry-content').getAttribute('data-cemetery-id-value');
    }
    else this.isShowRequest = false
  }
}
