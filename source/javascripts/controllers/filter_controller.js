import { Controller } from "stimulus"

export default class extends Controller {
  static values = {
    filtered: Boolean
  }

  static targets = [
    "button"
  ]

  search(event){
    let searchInput = event.target.value.trim().toLowerCase();

    Array.from(document.querySelectorAll(".preview")).forEach(preview => {
      let previewText = preview.innerText.trim().toLowerCase();

      if ((searchInput === "") || (previewText.includes(searchInput))) {
        preview.classList.remove("hidden");
      } else {
        preview.classList.add("hidden");
      }
    })
  }

  // shows on the map and in the list the types which buttons have .selected class
  prepare() {
    this.buttonTargets.forEach(button => {
      let selector = button.dataset.filterSelectorParam;
      let layers = document.querySelectorAll(".layer" + selector);
      let enabled;

      if (Array.from(button.classList).includes("select")) {
        this.filteredValue = true;
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
    this.#filterPreviews(enabled, event.params.selector)
  };

  toggleAll(){
    let layers = document.querySelectorAll(".layer");
    let enabled;

    if (this.filteredValue === true) {
      layers.forEach(layer => {
        layer.classList.add("hidden");
        this.filteredValue = false;

        this.buttonTargets.forEach(button => {
          button.classList.remove("select");
        });
      });
      enabled = false
    } else {
      layers.forEach(layer => {
        layer.classList.remove("hidden");
        this.filteredValue = true;

        this.buttonTargets.forEach(button => {
          button.classList.add("select");
        });
      });
      enabled = true
    }

    this.buttonTargets.forEach(button => {
      let selector = button.dataset.filterSelectorParam
      this.#filterPreviews(enabled, selector)
    })
  }

  #filterPreviews(selected, selector) {
    let previews = document.querySelectorAll(".preview" + selector)
    debugger

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
    this.buttonTargets.forEach(button => {
      if (Array.from(button.classList).includes("select")) {
        this.filteredValue = true;
        return
      }
    });
    this.filteredValue = false
  }
}
