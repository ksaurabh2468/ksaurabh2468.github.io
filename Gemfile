source "https://rubygems.org"

# GitHub Pages builds the site with this gem set. Pinning to `github-pages`
# keeps the local build identical to what GitHub runs in production, and brings
# in a GitHub-Pages-compatible Jekyll plus the whitelisted plugins below.
# (Do NOT also pin `jekyll` directly — it conflicts with this gem's pin.)
gem "github-pages", group: :jekyll_plugins

group :jekyll_plugins do
  gem "jekyll-feed"
  gem "jekyll-seo-tag"
end

# Windows / JRuby lack bundled zoneinfo — provide tzinfo data.
platforms :mingw, :mswin, :x64_mingw, :jruby do
  gem "tzinfo", ">= 1", "< 3"
  gem "tzinfo-data"
end

# Faster directory watching on Windows during `jekyll serve`.
gem "wdm", "~> 0.1.1", :platforms => [:mingw, :mswin, :x64_mingw]

# Ruby 3.4+ no longer bundles these as default gems.
gem "webrick", "~> 1.8"
