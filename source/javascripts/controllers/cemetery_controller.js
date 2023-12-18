import { Controller } from "stimulus"

export default class extends Controller {
  static values = {
    coordinates: String,
    coordinatesGeoJson: String,
    boundingbox: String,
    id: Number,
  }

  connect() {
    let parsedCoordinates;

    if (this.coordinatesValue) {
      parsedCoordinates = JSON.parse(this.coordinatesValue);
    }

    console.log("i'm about to show coordinatesgeo-json")
    console.log(this.coordinatesGeoJsonValue);

    this.dispatch('connect', { detail: {
      coordinates: parsedCoordinates,
      coordinatesGeoJSON: this.coordinatesGeoJsonValue,
      boundingbox: this.boundingboxValue,
      id: this.idValue
    }})
  }
}
