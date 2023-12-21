import { Controller } from "stimulus"

// this controller (as well as others, i guess) gets called twice
// apparently, it's caused by sidebar manipulating the dom
//? are there any implications of this?

export default class extends Controller {
  static targets = [
    "cemetery"
  ]

  connect() {
    this.path = this.#preparePath();

    this.#dispatchEntryData();

    if (typeof this.initialEntryId != "undefined") {
      this.dispatch("finish", { detail: {
        id: this.initialEntryId,
      }});
    }
  }

  // removes trailing slash
  #preparePath(){
    let path = window.location.pathname;
    let lastSymbolIndex = path.length - 1;

    return path[lastSymbolIndex] === "/" ? path.substring(0, lastSymbolIndex) : path
  }

  #dispatchEntryData(){
    this.cemeteryTargets.forEach(e => {
      e = e.dataset;

      this.dispatch("process", { detail: {
        id: e.id,
        coordinates: {
          point: e.point,
          polygon: e.polygon ? JSON.parse(e.polygon) : undefined,
          geoJSON: e.geoJSON
        }
      }});

      if (this.path === e.name_url) {
        this.initialEntryId = e.id;
      }
    });
  }
}
