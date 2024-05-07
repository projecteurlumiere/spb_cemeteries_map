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
    try {
      if (this.figures[e.detail.id] != undefined) return
      console.log(`drawing ${e.detail.path}`);

      let coordinates = JSON.parse(e.detail.coordinates);

      let figure = L.geoJSON(coordinates, {
        onEachFeature: (feature, layer) => {
          layer.setStyle({
            className: `layer ${e.detail.type.toLowerCase()} hidden`,
            // color,
            // stroke,
          });
          layer.on("click", () => { this.#turboVisitEntry(e) })
          layer.bindTooltip(e.detail.name, {
            sticky: true,
          })
        }
      })

      figure.addTo(this.map);

      this.figures[e.detail.id] = figure;
    }
    finally {
      if (e.detail.last) { console.log("last!"); this.dispatch("finishDrawing") }
    }
  }

  toEntry(e) {
    let id = e.params.id || e.detail.id;
    let figure = this.figures[id];

    this.sidebar.enablePanel("entry");
    this.sidebar.open("entry");

    if (e.type === "catalogue:initialEntryFound") {
      this.map.setView(figure.getBounds().getCenter(), 14)
    } else {
      this.map.flyTo(figure.getBounds().getCenter(), 14);
    }
  }

  #turboVisitEntry(e){
    Turbo.visit(e.detail.path, {
      frame: "entry-content"
    })
    window.history.pushState(history.state, "", e.detail.path)
    this.toEntry(e);
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
}
