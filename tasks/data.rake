require "csv"
require "yaml"

namespace :data do
  # requires name of the csv file as the default
  desc "parses csv file in the data/source into several yaml in data/"
  task :csv do
    ARGV.each { |a| task a.to_sym do ; end }

    input_file_path = "data/source/" + ARGV[1]

    raise StandardError.new("no file to parse") unless File.exist?(input_file_path)

    output_path = ARGV[2] || "data/"
    parsed_entries = []

    # beware of character ord 65279
    i = 1
    CSV.foreach(input_file_path, "r:bom|utf-8", headers: true, col_sep: ";") do |row|
      row = row.to_hash
      next if row["path"].nil?

      row["id"] = i
      row["path"].downcase!

      File.write("#{output_path}/#{row["path"]}.yml", YAML.dump(row))
      parsed_entries << row["path"]
      i += 1
    end

    File.write("#{output_path}/catalogue.yml", YAML.dump(parsed_entries))
  end

  desc "removes every file in data/ except files starting with sample_ and subdirectories"
  task :clean do
    dir = "data/"
    Dir.entries(dir).select do |entry|
      next if entry.start_with?("sample_")
      path = dir + entry
      File.delete(path) if File.file?(path)
    end
  end

  task :update do

  end
end