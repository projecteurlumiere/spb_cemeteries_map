import { Controller } from "stimulus"

export default class extends Controller {
  static values = {
    filtered: Boolean
  }

  static targets = [
    "button"
  ]

  static outlets = [
    "search"
  ]

  // shows on the map and in the list the types which buttons have .selected class
  prepare() {
    this.buttonTargets.forEach(button => {
      let selector = button.dataset.filterSelectorParam;
      let layers = document.querySelectorAll(".layer" + selector);
      let enabled;

      if (Array.from(button.classList).includes("select")) {
        layers.forEach(layer => {
          layer.classList.remove("hidden");
        })
        enabled = true;
      } else {
        layers.forEach(layer => {
          layer.classList.add("hidden");
        })
        enabled = false;
      }

      this.#setFilteredValue();
      this.#filterPreviews(enabled, selector);
    });
  }

  toggle(event) {
    this.dispatch("input");

    let layers = document.querySelectorAll(".layer" + event.params.selector);
    let enabled;

    layers.forEach(layer => {
      enabled = !layer.classList.toggle("hidden");
    })

    if (enabled) {
      event.target.classList.add("select")
   } else {
      event.target.classList.remove("select")
    }

    this.#setFilteredValue();
    this.#filterPreviews(enabled, event.params.selector);
  }

  toggleAll(){
    let wasSearching = this.searchOutlet.searchingValue;
    let enabled;

    this.dispatch("input");

    if (this.filteredValue === false && !wasSearching) {
      this.#hide();
      enabled = false;
    } else {
      this.#show();
      enabled = true;
    }

    this.buttonTargets.forEach(button => {
      let selector = button.dataset.filterSelectorParam
      this.#filterPreviews(enabled, selector)
    })
  }

  showAll() {
    this.#show();
  }

  #filterPreviews(selected, selector) {
    let previews = document.querySelectorAll(".preview" + selector)

    if (selected) {
      previews.forEach(preview => {
        preview.classList.remove("hidden");
      });
    } else {
      previews.forEach(preview => {
        preview.classList.add("hidden");
      });
    }
  }

  #setFilteredValue() {
    for (let i in this.buttonTargets) {
      let button = this.buttonTargets[i];

      if (!Array.from(button.classList).includes("select")) {
        this.filteredValue = true;
        return
      }
    }
    this.filteredValue = false
  }


  #show(layers = document.querySelectorAll(".layer")) {
    console.log("im called");

    layers.forEach(layer => {
      layer.classList.remove("hidden");

      this.buttonTargets.forEach(button => {
        button.classList.add("select");
      });
    });
    this.filteredValue = false
  }

  #hide(layers = document.querySelectorAll(".layer")) {
    layers.forEach(layer => {
      layer.classList.add("hidden");

      this.buttonTargets.forEach(button => {
        button.classList.remove("select");
      });
    });
    this.filteredValue = true
  }
}
