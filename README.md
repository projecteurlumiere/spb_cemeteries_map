# Summary
This repository contains a static website generator featuring an interactive map of active and lost cemeteries in St. Petersburg. 
It is being worked on in collaboration with [whatiscemetery](https://whatiscemetery.com/) project.

The data is going to be eventually published elsewhere.

## How it works

- The website is generated from a spreadsheet (csv/xlsx) which contains geographic coordinates and trivia.
- The build step also fetches vintage photos belonging to geographic boundaries of each cemetery
 from [PastVu](https://pastvu.com/) using [my gem](https://github.com/projecteurlumiere/pastvu)
 - While every cemetery is just a fixed HTML page, 
 Hotwire's turbo-frames provide SPA-like expirience when navigating from one cemetery to another.

Ideally, the map is to be deployed on [Cloudflare Pages](https://pages.dev),
which is completely free and allows using Ruby for static website building.
However, given the Russian government banned the hosting, alternative solutions are being considered.

## Screenshots
<details>
  <summary>Cemetery page: object's summary is on the left, and colorful polygons mark other cemeteries on the map</summary>

  ![1](https://github.com/user-attachments/assets/e922bdb2-c511-4581-9edf-02b29f7a0501)

</details>

## What's done:
- [x] Find geographic data on existing and historic cemeteries
- [x] Allow building from Excel/CSV files
- [x] Add dynamic image fetching from PastVu on every build stage

## What's to be done:
- [ ] Implement a more appropriate thematic design
- [ ] Compose textual desciprition data
- [ ] Add data fetching from a 3rd party server (Google Drive) 
- [ ] Deploy

# Technicalities

## Dependencies
- Ruby 3.2.2

## Launching development server
Development server:
```sh
  bundle exec middleman
```

## Building
Building project:
```sh
  bundle exec middleman build
```

## Helper tasks

### Data import from file
```sh
  rake data:clean  # removes every file in data/ except files starting with sample_ and subdirectories
  rake data:csv    # from csv
  rake data:xlsx   # from xlsx

```

### Fetching images from PastVu
```sh
  rake img:append  # loads new images only without removing or rewriting loaded ones
  rake img:clean   # rm rf images/vendor completely & removes photos from data yml files
  rake img:load    # downloads images for every entry's geometry from pastvu into images/vendor/:path_name
  rake img:reload  # calls image:clean & image:load
  rake img:update  # loads new images and rewrites previous ones if anything has changed
```
