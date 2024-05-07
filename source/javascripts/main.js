import "turbo"

import CatalogueController from "catalogue"
import GalleryController from "gallery"
import MapController from "map"
import FilterController from "filter"
import SearchController from "search"

import { Application } from "stimulus"

window.Stimulus = Application.start();

Stimulus.register("map", MapController);
Stimulus.register("catalogue", CatalogueController);
Stimulus.register("gallery", GalleryController);
Stimulus.register("filter", FilterController);
Stimulus.register("search", SearchController);
