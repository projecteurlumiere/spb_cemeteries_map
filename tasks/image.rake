require "pastvu"
require "yaml"
require "image_size"

namespace :img do
  desc "downloads images for every entry's geometry from pastvu into images/vendor/:path_name"
  task :load do
    dir = "data/"
    Dir.entries(dir).select do |file|
      next if file.start_with?("sample_", "catalogue") ||
              !file.end_with?(".yml")

      entry = YAML.load(File.read(dir + file))
      coordinates = JSON.parse(entry["coordinates"])

      raise "points are not implemented" if coordinates["type"] == "Point"

      collection = Pastvu.by_bounds(geometry: coordinates, z: 18).photos
      return unless collection.any?

      entry["photos"] ||= []

      output_dir = "source/images/vendor/#{entry["path"]}/"
      Dir.mkdir(output_dir) unless Dir.exist?(output_dir)

      collection.each_with_index do |p, i|
        original = p.download(:original, output_dir + "#{p.cid}_original.jpg")
        p.download(:standard, output_dir + "#{p.cid}_standard.jpg")
        p.download(:thumb, output_dir + "#{p.cid}_thumb.jpg")
        photo_hash = p.to_hash.transform_keys(&:to_s)
        dimensions = ImageSize.new(original)

        photo_hash["height"], photo_hash["width"] = dimensions.height, dimensions.width
        entry["photos"] << photo_hash
      end

      File.write(dir + file, YAML.dump(entry))
    end
    puts "images loaded"
  end

  desc "loads new images only without removing or rewriting loaded ones"
  task :append do
    dir = "data/"
    Dir.entries(dir).select do |file|
      next if file.start_with?("sample_", "catalogue") ||
              !file.end_with?(".yml")

      entry = YAML.load(File.read(dir + file))
      coordinates = JSON.parse(entry["coordinates"])

      raise "points are not implemented" if coordinates["type"] == "Point"

      collection = Pastvu.by_bounds(geometry: coordinates, z: 18).photos
      return unless collection.any?

      entry["photos"] ||= []

      output_dir = "source/images/vendor/#{entry["path"]}/"
      Dir.mkdir(output_dir) unless Dir.exist?(output_dir)

      collection.each_with_index do |p, i|
        next if entry["photos"].any? { |existing_photo| existing_photo["cid"] == p.cid }

        original = p.download(:original, output_dir + "#{p.cid}_original.jpg")
        p.download(:standard, output_dir + "#{p.cid}_standard.jpg")
        p.download(:thumb, output_dir + "#{p.cid}_thumb.jpg")
        photo_hash = p.to_hash.transform_keys(&:to_s)
        dimensions = ImageSize.new(original)

        photo_hash["height"], photo_hash["width"] = dimensions.height, dimensions.width
        entry["photos"] << photo_hash
      end

      File.write(dir + file, YAML.dump(entry))
    end
    puts "images appended"
  end

  desc "loads new images and rewrites previous ones if anything has changed"
  task :update do
    dir = "data/"
    Dir.entries(dir).select do |file|
      next if file.start_with?("sample_", "catalogue") ||
              !file.end_with?(".yml")

      entry = YAML.load(File.read(dir + file))
      coordinates = JSON.parse(entry["coordinates"])

      raise "points are not implemented" if coordinates["type"] == "Point"

      collection = Pastvu.by_bounds(geometry: coordinates, z: 18).photos
      return unless collection.any?

      entry["photos"] ||= []

      output_dir = "source/images/vendor/#{entry["path"]}/"
      Dir.mkdir(output_dir) unless Dir.exist?(output_dir)

      collection.each_with_index do |p, i|
        next if entry["photos"].any? do |existing_photo|
          temp_height, temp_width = existing_photo["height"], existing_photo["width"]
          existing_photo["height"], existing_photo["width"] = nil, nil
          result = existing_photo.compact == p.to_hash.transform_keys(&:to_s)
          existing_photo["height"], existing_photo["width"] = temp_height, temp_width
          result
        end

        original = p.download(:original, output_dir + "#{p.cid}_original.jpg")
        p.download(:standard, output_dir + "#{p.cid}_standard.jpg")
        p.download(:thumb, output_dir + "#{p.cid}_thumb.jpg")
        photo_hash = p.to_hash.transform_keys(&:to_s)
        dimensions = ImageSize.new(original)

        photo_hash["height"], photo_hash["width"] = dimensions.height, dimensions.width
        entry["photos"] << photo_hash
      end

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

      File.write(dir + file, YAML.dump(entry))
    end
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
    Dir.entries(dir).select do |file|
      next if file.start_with?("sample_", "catalogue") ||
              !file.end_with?(".yml")

      entry = YAML.load(File.read(dir + file))
      entry["photos"] = nil

      File.write(dir + file, YAML.dump(entry))
    end

    vendor_dir = "source/images/vendor/*"
    FileUtils.rm_rf(Dir.glob(vendor_dir))
    puts "images removed"
  end
end