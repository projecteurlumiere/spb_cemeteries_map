activate :importmap
activate :directory_indexes
activate :autoprefixer do |prefix|
  prefix.browsers = "last 2 versions"
end

page '/*.xml', layout: false
page '/*.json', layout: false
page '/*.txt', layout: false

ignore "template.html"

ready do
  proxy "index.html", "template.html", locals: { cemetery: nil }
  @app.data.catalogue.each do |cemetery|
    proxy "#{cemetery}/index.html", "template.html", locals: { cemetery: cemetery }
  end
end
