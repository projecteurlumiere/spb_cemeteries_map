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

helpers do
  def locals_for_gallery_pic(cemetery, photo, index)
    link = "images/vendor/#{cemetery.path}/"
    original_path = link + "#{photo.cid}_original.jpg"
    basic_locals = {
      photo:              photo,
      original_path:      original_path,
      custom_placeholder: nil,
      custom_attributes:  nil
    }

    custom_locals = if index == 5
      {
        custom_placeholder: "Ещё #{cemetery.photos.count - 5} фото",
        custom_attributes: { class: "gallery-n-more-link lightbox-opener" }
      }
    elsif index > 5
      {
      custom_placeholder: ""
      }
    end

    custom_locals&.reverse_merge(basic_locals) || basic_locals
  end
end