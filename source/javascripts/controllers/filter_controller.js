import { Controller } from "stimulus"

export default class extends Controller {
  static values = {
    filtered: Boolean
  }

  connect() {
    let nodes = document.querySelectorAll(".layer");

    nodes.forEach(e => {
      if (Array.from(e.classList).includes("hidden")) {
        this.filteredValue = true
        return
      }
    });

    this.filteredValue = false
  }

  toggleType(e) {
    console.log("toggle called");
    let nodes = document.querySelectorAll(e.params.class);

    nodes.forEach(e => {
      e.classList.toggle("hidden");
      if (Array.from(e.classList).includes("hidden")) this.filteredValue = true
    });
  }

  toggleAll(){
    console.log("toggle all called");
    let nodes = document.querySelectorAll(".layer");

    if (this.filteredValue === true) {
      nodes.forEach(e => {
        e.classList.remove("hidden");
        this.filteredValue = false
      });
    } else {
      nodes.forEach(e => {
        e.classList.add("hidden");
        this.filteredValue = true
      });
    }
  }
}
