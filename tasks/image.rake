require "pastvu"
require "yaml"
require "image_size"

namespace :img do
  desc "downloads images for every entry's geometry from pastvu into images/vendor/:path_name"
  task :load do
    iterate_dir "data/"

    puts "images loaded"
  end

  desc "loads new images only without removing or rewriting loaded ones"
  task :append do
    iterate_dir "data/",
                skip_update_if: photo_exist?

    puts "images appended"
  end

  desc "loads new images and rewrites previous ones if anything has changed"
  task :update do
    iterate_dir "data/",
                skip_update_if: photo_info_identical?,
                skip_update_if_no_incoming_photos: false,
                after_download_do: clean_unreceived_photos

    puts "images updated"
  end

  desc "calls image:clean & image:load"
  task :reload do
    Rake::Task["img:clean"].execute
    Rake::Task["img:load"].execute
  end

  desc "rm rf images/vendor completely & removes photos from data yml files"
  task :clean do
    dir = "data/"
    Dir.entries(dir).select do |e_name|
      next if invalid_entry_name?(e_name)
      file_path = dir + e_name

      entry = YAML.load(File.read(file_path))
      entry["photos"] = nil

      File.write(file_path, YAML.dump(entry))
    end

    vendor_dir = "source/images/vendor/*"
    FileUtils.rm_rf(Dir.glob(vendor_dir))

    puts "images removed"
  end
end

def iterate_dir(dir, skip_update_if: nil, skip_update_if_no_incoming_photos: true, after_download_do: nil)
  Dir.entries(dir).select do |e_name|
    next if invalid_entry_name?(e_name)

    datafile_path = dir + e_name
    entry, coordinates = parse_yml(datafile_path)

    raise "points are not implemented" if coordinates["type"] == "Point"

    collection = Pastvu.by_bounds(geometry: coordinates, z: 18).photos
    next if skip_update_if_no_incoming_photos && collection.none?

    entry["photos"] ||= []

    output_dir = prepare_output_dir(entry["path"])

    iterate_photo_collection collection, entry, output_dir, skip_update_if

    after_download_do&.call output_dir, entry, collection

    entry["photos"] = entry["photos"].sort_by do |photo|
      photo["year"]
    end

    File.write(datafile_path, YAML.dump(entry))
  end
end

def invalid_entry_name?(name)
  name.start_with?("sample_", "catalogue", ".keep") || !name.end_with?(".yml")
end

def parse_yml(file_path)
  entry = YAML.load(File.read(file_path))
  coordinates = JSON.parse(entry["coordinates"])
  [entry, coordinates]
end

def prepare_output_dir(entry)
  output_dir = "source/images/vendor/#{entry}/"
  Dir.mkdir(output_dir) unless Dir.exist?(output_dir)
  output_dir
end

def iterate_photo_collection(collection, entry, output_dir, skip_update = nil)
  collection.each_with_index do |p, i|
    next if skip_update&.call(entry["photos"], p)

    original = p.download(:original, output_dir + "#{p.cid}_original.jpg")
    p.download(:standard, output_dir + "#{p.cid}_standard.jpg")
    p.download(:thumb, output_dir + "#{p.cid}_thumb.jpg")

    photo_hash = p.to_hash.transform_keys(&:to_s)
    dimensions = ImageSize.new(original)
    photo_hash["height"], photo_hash["width"] = dimensions.height, dimensions.width
    entry["photos"] << photo_hash
  end
end

def photo_exist?
  proc do |existing_photos, received_photo|
    existing_photos.any? { |existing_photo| existing_photo["cid"] == received_photo.cid }
  end
end

def photo_info_identical?
  proc do |existing_photos, received_photo|
    existing_photos.any? do |existing_photo|
      temp_height, temp_width = existing_photo["height"], existing_photo["width"]
      existing_photo["height"], existing_photo["width"] = nil, nil
      result = existing_photo.compact == received_photo.to_hash.transform_keys(&:to_s)
      existing_photo["height"], existing_photo["width"] = temp_height, temp_width
      result
    end
  end
end

def clean_unreceived_photos
  proc do |output_dir, entry, collection|
    existing_ids = collection.map { |p| p.cid.to_s }

    photos_to_remove = Dir.entries(output_dir).reject do |file|
      file.start_with?(*existing_ids, ".")
    end

    entry["photos"] = entry["photos"].select do |p|
      existing_ids.include?(p["cid"].to_s)
    end

    photos_to_remove.each do |photo_name|
      File.delete(output_dir + photo_name)
    end
  end
end