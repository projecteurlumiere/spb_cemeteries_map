import "turbo"
import "fslightbox"

import CemeteryController from "cemetery"
import GalleryController from "gallery"
import MapController from "map"

import { Application } from "stimulus"

window.Stimulus = Application.start();

Stimulus.register("map", MapController);
Stimulus.register("cemetery", CemeteryController);
Stimulus.register("gallery", GalleryController);
