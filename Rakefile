namespace :data do
  task :csv do
    ARGV.each { |a| task a.to_sym do ; end }
    require "csv"
    require "yaml"

    input_file_path = "data/source/" + ARGV[1]

    raise StandardError.new("no file to parse") unless File.exist?(input_file_path)

    output_path = ARGV[2] || "data/"
    parsed_entries = []

    # beware of character ord 65279
    CSV.foreach(input_file_path, "r:bom|utf-8", headers: true, col_sep: ";") do |row|
      row = row.to_hash
      next if row["path"].nil?

      row["path"].downcase!

      File.write("#{output_path}/#{row["path"]}.yml", YAML.dump(row))
      parsed_entries << row["path"]
    end

    File.write("#{output_path}/catalogue.yml", YAML.dump(parsed_entries))
  end
end