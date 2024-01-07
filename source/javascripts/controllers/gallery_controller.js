import { Controller } from "stimulus"
import PhotoSwipeLightbox from "photoswipe-lightbox";
import PhotoSwipe from "photoswipe";
import PhotoSwipeDynamicCaption from "photoswipe-dynamic-caption";

export default class extends Controller {

  connect() {
    const lightbox = new PhotoSwipeLightbox({
      gallery: "#gallery",
      children: "a",
      pswpModule: () => PhotoSwipe
    });


    const captionPlugin = new PhotoSwipeDynamicCaption(lightbox, {
      type: 'auto',
      captionContent: '.pswp-caption-content'
    });

    lightbox.init();
  }
}