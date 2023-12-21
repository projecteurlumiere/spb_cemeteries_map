import { Controller } from "stimulus"
import L from 'leaflet'
import "leaflet-sidebar-v2"

export default class extends Controller {
  static values = {
    startPoint: Array,
    tilesProvider: String,
    attribution: String
  }

  figures = {}

  connect() {
    this.#setMap();
    this.#setSidebar();
    this.sidebar.open("list");
  }

  drawPolygon(e) {
    let coordinates = e.detail.coordinatesType === "geojson" ? e.detail.coordinates : JSON.parse(e.detail.coordinates);

    let figure = this.#figureByType(e.detail.coordinatesType, coordinates);

    figure.addTo(this.map);

    figure.getElement().dataset.action = "click->map#toEntry";
    figure.getElement().dataset.mapIdParam = e.detail.id;
    this.figures[e.detail.id] = figure;
  }

  toEntry(e) {
    let id = e.params.id || e.detail.id;
    let figure = this.figures[id];

    this.sidebar.enablePanel("entry");
    this.sidebar.open("entry");
    this.#centerMap(figure);
  }

  #setMap(){
    this.map = L.map("map").setView(this.startPointValue, 10);

    L.tileLayer(this.tilesProviderValue, {
      minZoom: 10,
      attribution: this.attributionValue,
      ext: "png"
    }).addTo(this.map);
  }

  #setSidebar(){
    this.sidebar = L.control.sidebar({
      container: "sidebar", // the DOM container or #ID of a predefined sidebar container that should be used
      closeButton: true,    // whether t add a close button to the panes
      position: "left",     // left or right
    }).addTo(this.map);
  }

  #figureByType(type, coordinates) {
    switch (type) {
      case "marker": {
        return L.marker(coordinates)
      }
      case "polygon": {
        return L.polygon(coordinates)
      }
      case "geojson":{
        return L.geoJSON(coordinates)
      }
      default: {
        console.log("no figure to draw");
        return
      }
    }
  }

  #centerMap(figure) {
    switch (true) {
      case figure instanceof L.Marker:
        this.map.flyTo(figure.getLatLng(), 14);
        break;
      case figure instanceof L.Polygon:
        this.map.flyTo(figure.getCenter(), 14);
        break
      case figure instanceof L.GeoJSON:
        this.map.flyTo(figure.getBounds().getCenter(), 14);
        break
    }
  }
}
