require "pastvu"
require "yaml"
require "image_size"

namespace :image do
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
      Dir.mkdir(output_dir)
      collection.each_with_index do |p, i|
        original = p.download(:original, output_dir + "#{p.cid}_original.jpg")
        p.download(:standard, output_dir + "#{p.cid}_standard.jpg")
        p.download(:thumb, output_dir + "#{p.cid}_thumb.jpg")
        photo_hash = p.to_hash
        dimensions = ImageSize.new(original)

        photo_hash["height"], photo_hash["width"] = dimensions.height, dimensions.width
        entry["photos"] << photo_hash
      end

      File.write(dir + file, YAML.dump(entry))
    end
    puts "images loaded"
  end

  desc "calls image:clean & image:load"
  task :reload do
    Rake::Task["image:clean"].execute
    Rake::Task["image:load"].execute
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