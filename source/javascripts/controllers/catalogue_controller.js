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

    this.#processEntryData();

    if (typeof this.initialEntryId != "undefined") {
      this.dispatch("initialEntryFound", { detail: {
        id: this.initialEntryId,
      }});
    }
  }

  // removes trailing slashes
  #preparePath(){
    let path = window.location.pathname.substring(1);
    let lastSymbolIndex = path.length - 1;

    return path[lastSymbolIndex] === "/" ? path.substring(0, lastSymbolIndex) : path
  }

  #processEntryData(){
    let length = this.cemeteryTargets.length
    let i = 1
    this.cemeteryTargets.forEach(e => {
      e = e.dataset;

      this.dispatch("process", { detail: {
        id: e.id,
        path: e.path,
        type: e.type,
        last: i === length ? true : false,
        coordinates: e.coordinates,
      }});

      if (this.path === e.path) this.initialEntryId = e.id;

      i++
    });
  }
}
