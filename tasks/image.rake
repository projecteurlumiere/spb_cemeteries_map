require "pastvu"
require "yaml"

namespace :image do
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
        p.download(:original, output_dir + "#{p.cid}_original.jpg")
        p.download(:standard, output_dir + "#{p.cid}_standard.jpg")
        p.download(:thumb, output_dir + "#{p.cid}_thumb.jpg")
        entry["photos"] << p.to_hash
      end

      File.write(dir + file, YAML.dump(entry))
    end
    puts "images loaded"
  end

  task :reload do
    Rake::Task["image:clean"].execute
    Rake::Task["image:load"].execute
  end

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
  end
  puts "images removed"
end