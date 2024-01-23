# Deprecated!

This project is no longer maintained. I recommend using [next-sitemap](https://github.com/iamvishnusankar/next-sitemap) instead.

# Next.js Sitemap Generator for Statically Generated Sites

<!-- Badges -->
<!-- TOC depthfrom:2 -->

* [Introduction](#introduction)
* [Installation](#installation)
* [Usage](#usage)
  * [Create a module](#create-a-module)
  * [Add module to export script](#add-module-to-export-script)
* [Contributing](#contributing)
* [License](#license)
* [Contact](#contact)

<!-- /TOC -->

## Introduction

This package helps you to easily generate a sitemap for your Next.js project that automatically includes all the statically generated pages. This includes the dynamic pages generated using getStaticPaths. It allows you to customise the child elements of each url element in the sitemap (e.g. lastmod, changefreq, img) using the page props. The sitemap itself is generated using [sitemap.js](https://github.com/ekalinin/sitemap.js). 

## Installation

Add next-ssg-sitemap in your Next.js project as a dependency to your project

```sh
npm install next-ssg-sitemap
```

## Usage

This package works by calling a function after a Next.js site has been built but before it is exported. This allows it to pick up all the pages that have been generated and their props. The generated sitemap is then added to the public folder, to be included in the export.

Setting this up requires the following steps:
1. Create a module and call the generate function from next-ssg-sitemap
1. Add module to export script in package.json

### Create a module
Call the generate function, which is the default export from next-ssg-sitemap in a separate module. This function generates the sitemap based on your input. Most notably, you can provide a function to transform the props into a SitemapItem object understood by sitemap.js to output the desired url child elements.

#### Generate function API
The function generates the sitemap as an xml file and does not return anything. It accepts the following parameters:

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| projectPath | <code>String</code> |  | Path to the base folder of the Next.js project |
| baseUrl | <code>String</code> |  | Root of the public URL where the project will be hosted |
| options | <code>Object</code> |  |  |
| [options.processPath] | [<code>processPage</code>](#processPage) |  | Callback to create the input object for a url element. Returns just the url by default |
| [options.exclude] | <code>Array.&lt;String&gt;</code> | <code>[&#x27;404&#x27;, &#x27;500&#x27;]</code> | List of page paths to exclude from the sitemap |
| [options.sitemapLoc] | <code>String</code> | <code>public/sitemap.xml</code> | The filename and location where to store the sitemap |
| [options.buildDir] | <code>String</code> | <code>.next</code> | The folder where the built Next project can be found |

<a name="processPage"></a>
#### ProcessPage callback API
This callback is used to create the input object for a url element.

**Return**: [<code>SitemapItem</code>](https://github.com/ekalinin/sitemap.js/blob/master/api.md#sitemap-item-options) - The object to transform to a url element in the sitemap.

It accepts the following parameters:

| Param | Type | Description |
| --- | --- | --- |
| pageDetails | <code>Object</code> | Provides details for the page to add to the sitemap |
| pageDetails.url | <code>String</code> | URL of the page |
| pageDetails.path | <code>String</code> | Path to the html file for the page |
| pageDetails.props | <code>Object</code> | Props for the page as generated by getInitialProps |
#### Example
In this example, we extract all images from each page with markdown content and add them to the sitemap item for that page.
```js
// scripts/generate-sitemap.mjs
import generateSitemap from 'next-ssg-sitemap'

console.log('Creating sitemap...')

// Create a sitemap based on the static files generated in the build phase.
generateSitemap(process.cwd(), 'www.example.com', {
  // Transform each page with props to a sitemap url object.
  async processPath({ url, path, props }) {
    // Create a base sitemap url object.
    const item = {
      url,
    }

    // If markdown content is provided, create a readable tree from the markdown and extract the images.
    if (props) {
      const { revised, image, imageTitle } = props
      // If the page has props set a higher priority than the default 0.5.
      item.priority = 1

      // Include a revised date as lastmod for the URL.
      if (revised) {
        item.lastmod = revised
      }

      // If an image is provided, add the url and title to the img array in the url object.
      if (image) {
        const img = { url: props.frontmatter.image }
        if (imageTitle) img.title = imageTitle
        item.img = [img]
      }
    }

    return item
  }
})
  .then(() => console.log('Sitemap has been added to the public folder', '\n'))

```
### Add module to export script
The module should be executed after a build is completed but before the site is exported. To achieve this, execute the module as a prerequisite to the export script in package.json.

#### Example
Scripts object in an example package.json:
```json
{
    "scripts": {
    "dev": "next dev",
    "build": "next build",
    "generate-sitemap": "node scripts/generate-sitemap.mjs",
    "export": "npm run build && npm run generate-sitemap && next export",
    "start": "next start"
  },
  ...
}
````

## Contributing

Contributions are what make the open-source community such an amazing place to be, learn, inspire, and create. Any contributions you make are **greatly appreciated**.

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

Distributed under the MIT License. See `LICENSE` for more information.

## Contact

This project is maintained by Igor Honhoff. Feel free to contact me at igor@flarehub.io

<!-- ACKNOWLEDGEMENTS -->
