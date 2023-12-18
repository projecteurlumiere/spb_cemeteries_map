import { Controller } from "stimulus"

export default class extends Controller {

  connect() {
    refreshFsLightbox();
    let link = document.querySelector(".lightbox-opener");
    if (link) {
      link.onclick = () => { fsLightbox.open() }
    }
  }
}