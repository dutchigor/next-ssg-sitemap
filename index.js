import { readdirSync, readFileSync, existsSync, createWriteStream } from 'fs'
import path from 'path'
import { URL } from 'url'
import { SitemapStream } from 'sitemap'

const defaultOptions = {
  // Default function to create the input object for a url element
  processPath(siteLink) {
    return {
      url: siteLink.url
    }
  },
  // Default values for the generate function
  exclude: ['404', '500'],
  sitemapLoc: path.join('public', 'sitemap.xml'),
  buildDir: '.next',
}


// Create the sitemap xml using the Next.js build as a template.
// Provide the page props to customise the url child elements.
export default async function generate(projectPath, baseUrl, { processPath, exclude, sitemapLoc, buildDir }) {
  // Check that the Next.js project has been built out.
  if (!existsSync(path.join(projectPath, '.next', 'BUILD_ID'))) {
    throw new Error(`${projectPath} does not contain a valid build folder. Run "next build" before executing this script.`)
  }

  // Set defaults where options have not been provided
  processPath = processPath || defaultOptions.processPath
  exclude = exclude || defaultOptions.exclude
  sitemapLoc = sitemapLoc || defaultOptions.sitemapLoc
  buildDir = buildDir || defaultOptions.buildDir

  // Start a stream to transform the url objects and save them into the sitemap xml file.
  const cleanUrl = new URL(baseUrl)
  const smStream = new SitemapStream({ hostname: cleanUrl.href })
  smStream.pipe(createWriteStream(path.join(projectPath, sitemapLoc)))

  // Add all files in folder and subfolders to the sitemap.
  async function crawlFolder(folder, urlPath) {

    // Process each file in the folder.
    const files = readdirSync(folder, { withFileTypes: true })
    for (const entry of files) {
      if (entry.isDirectory()) {
        // Crawl each sub directory iteratively, updating the url path with the folder name
        const subFolder = path.join(folder, entry.name)
        const subPage = urlPath + entry.name + '/'
        await crawlFolder(subFolder, subPage)

      } else if (path.extname(entry.name) === '.html') {
        // Add each html file to the sitemap if it is not explicitly excluded.
        const basename = path.basename(entry.name, '.html')
        if (!exclude.includes(urlPath + basename)) {
          // Create base object to map to url element object.
          const siteLink = {
            url: cleanUrl.href + urlPath + basename,
            path: urlPath + basename
          }

          // If a json file exists with the same name as the html file, import the file as props
          const propsFile = path.join(folder, basename + '.json')
          if (existsSync(propsFile)) {
            const propsString = readFileSync(propsFile, "utf8")
            const props = JSON.parse(propsString).pageProps
            siteLink.props = props
          }

          // Process the siteLink object with the provided mapping function and save the result to the sitemap.
          const urlEl = await processPath(siteLink)
          if (urlEl) smStream.write(urlEl)
        }
      }
    }
  }

  // Set and validate the base folder where the static site can be found.
  const pagesPath = path.join(projectPath, buildDir, 'server', 'pages')
  if (!existsSync(pagesPath)) throw new Error(`${projectPath} does not contain any valid pages.`)

  // Start crawling the static site folder
  await crawlFolder(pagesPath, '')

  // Finalise saving the sitemap xml.
  try {
    smStream.end()
  } catch (error) {
    console.log(error);
  }
}
