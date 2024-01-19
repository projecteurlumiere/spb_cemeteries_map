import { Controller } from "stimulus"

export default class extends Controller {
  static values = {
    "searching": Boolean
  }

  static targets = [
    "input",
    "clear"
  ]

  filter(){
    this.#toggleClear(this.inputTarget.value);

    let searchInput = this.inputTarget.value.trim().toLowerCase();

    Array.from(document.querySelectorAll(".preview")).forEach(preview => {
      let previewText = preview.innerText.trim().toLowerCase();

      if ((searchInput === "") || (previewText.includes(searchInput))) {
        preview.classList.remove("hidden");
      } else {
        preview.classList.add("hidden");
      }
    })
  }

  clear(e){
    this.inputTarget.value = "";
    if (e.params.filter === true){
      this.filter();
    } else if (this.searchingValue === true) {
      this.#hideClear();
      this.#showAll();
    }
  }

  dispatchInput(){
    this.dispatch("input");
  }

  #toggleClear(input){
    input === "" ? this.#hideClear() : this.#showClear();
  }

  #showClear(){
    this.clearTarget.classList.remove("hidden");
    this.searchingValue = true;
  }

  #hideClear(){
    this.clearTarget.classList.add("hidden");
    this.searchingValue = false;
  }

  #showAll(){
    Array.from(document.querySelectorAll(".preview")).forEach(preview => {
      preview.classList.remove("hidden");
    })
  }
}