require "csv"
require "yaml"
require "rubyXL"

namespace :data do
  # requires name of the csv file as the default
  desc "parses csv file (you should name it as argument) in the data/source into several yaml in data/"
  task :csv do
    input_file_path, output_path, parsed_entries = prepare_paths

    # beware of character ord 65279
    CSV.foreach(input_file_path, "r:bom|utf-8", headers: true, col_sep: ";").with_index do |row, line|
      hashed_row = row.to_hash
      next if row["path"].nil?

      modify_row! hashed_row, line

      parsed_entries = write_data_yml(output_path, hashed_row, parsed_entries)
    end

    write_catalogue_yml output_path, parsed_entries
  end

  desc "parses xlsx file (you should name it as argument) in the data/source into several yaml in data/"
  task :xlsx do
    input_file_path, output_path, parsed_entries = prepare_paths

    workbook = RubyXL::Parser.parse(input_file_path)
    worksheet = workbook.worksheets[0]

    headers = worksheet[0].cells.map { |c| c.value }

    worksheet.each_with_index do |row, line|
      next if line.zero?

      row_cells = row.cells.map{ |cell| cell.value }

      hashed_row = headers.each_with_object({}).with_index do |(header, hash), i|
        hash[header] = row_cells[i]
      end

      modify_row! hashed_row, line

      parsed_entries = write_data_yml(output_path, hashed_row, parsed_entries)
    end

    write_catalogue_yml output_path, parsed_entries
  end

  desc "removes every file in data/ except files starting with sample_ and subdirectories"
  task :clean do
    dir = "data/"
    Dir.entries(dir).select do |entry|
      next if entry.start_with?("sample_", ".keep")

      path = dir + entry
      File.delete(path) if File.file?(path)
    end
  end

  task :update do
  end
end

def prepare_paths
  ARGV.each { |a| task a.to_sym do ; end }

  input_file_path = "data/source/" + ARGV[1]

  raise StandardError.new("no file to parse") unless File.exist?(input_file_path)

  output_path = ARGV[2] || "data/"
  parsed_entries = [] # to store names for output data/*.yml files

  [input_file_path, output_path, parsed_entries]
end

def modify_row!(hashed_row, line)
  hashed_row["path"] = transliterate hashed_row["name"]
  hashed_row["id"] = line
end

def write_data_yml(output_path, hashed_row, parsed_entries)
  File.write("#{output_path}/#{hashed_row["path"]}.yml", YAML.dump(hashed_row))
  parsed_entries << { hashed_row["path"] => hashed_row["name"] }
  parsed_entries
end

def write_catalogue_yml(output_path, parsed_entries)
  parsed_entries
    .sort_by! { |e| e.values[0] }
    .map! { |e| e.keys }
    .flatten!

  File.write("#{output_path}/catalogue.yml", YAML.dump(parsed_entries))
end

def transliterate(cyrillic_string)
    ru = { "а" => "a", "б" => "b", "в" => "v", "г" => "g", "д" => "d", \
    "е" => "e", "ё" => "e", "ж" => "j", "з" => "z", "и" => "i", \
    "к" => "k", "л" => "l", "м" => "m", "н" => "n", "о" => "o", \
    "п" => "p", "р" => "r", "с" => "s", "т" => "t", "у" => "u", \
    "ф" => "f", "х" => "h", "ц" => "c", "ч" => "ch", "ш" => "sh", \
    "щ" => "shch", "ы" => "y", "э" => "e", "ю" => "u", "я" => "ya", \
    "й" => "i", "ъ" => "", "ь" => ""}

    identifier = ""

    cyrillic_string.downcase.each_char do |char|
      identifier += ru[char] ? ru[char] : char
    end

    identifier.gsub!(/[^a-z0-9_]+/, "_"); # remaining non-alphanumeric => hyphen
    identifier.gsub(/^[-_]*|[-_]*$/, ""); # remove hyphens/underscores and numbers at beginning and hyphens/underscores at end
end
