import { Controller } from "stimulus"
import PhotoSwipeLightbox from "photoswipe-lightbox";
import PhotoSwipe from "photoswipe";

export default class extends Controller {

  connect() {
    const lightbox = new PhotoSwipeLightbox({
      gallery: "#gallery",
      children: "a",
      pswpModule: () => PhotoSwipe
    });

    lightbox.init();
  }
}