import { Controller } from "stimulus"

export default class extends Controller {
  static values = {
    filtered: Boolean
  }

  static targets = [
    "button",
    "initial" // button
  ]

  prepare() {
    this.buttonTargets.forEach(button => {
      let layers = document.querySelectorAll(button.dataset.filterSelectorParam);

      if (Array.from(button.classList).includes("select")) {
        this.filteredValue = true;
        layers.forEach(layer => {
          layer.classList.remove("hidden");
        })
      } else {
        layers.forEach(layer => {
          layer.classList.add("hidden");
        })
      }
    });
  }

  toggle(event) {
    let layers = document.querySelectorAll(event.params.selector);
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
  };

  toggleAll(){
    let layers = document.querySelectorAll(".layer");

    if (this.filteredValue === true) {
      layers.forEach(layer => {
        layer.classList.remove("hidden");
        this.filteredValue = false;

        this.buttonTargets.forEach(button => {
          button.classList.remove("select");
        });
      });
    } else {
      layers.forEach(layer => {
        layer.classList.add("hidden");
        this.filteredValue = true;

        this.buttonTargets.forEach(button => {
          button.classList.add("select");
        });
      });
    }
  }

  #setFilteredValue() {
    this.buttonTargets.forEach(button => {
      if (button.classlist.includes("select")) {
        this.filteredValue = true;
        return
      }
    });
    this.filteredValue = false
  }
}
