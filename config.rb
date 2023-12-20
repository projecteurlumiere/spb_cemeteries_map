activate :importmap
activate :directory_indexes
activate :autoprefixer do |prefix|
  prefix.browsers = "last 2 versions"
end

page '/*.xml', layout: false
page '/*.json', layout: false
page '/*.txt', layout: false

after_configuration do
  proxy "index.html", "template.html", locals: { cemetery: nil }
  @app.data.cemeteries.each do |cemetery|
    proxy "#{cemetery}/index.html", "template.html", locals: { cemetery: cemetery }
  end
end


# Helpers
# Methods defined in the helpers block are available in templates
# https://middlemanapp.com/basics/helper-methods/

# helpers do
#   def some_helper
#     'Helping'
#   end
# end

# Build-specific configuration
# https://middlemanapp.com/advanced/configuration/#environment-specific-settings

# configure :build do
#   activate :minify_css
#   activate :minify_javascript
# end
