const eleventyNavigationPlugin = require("@11ty/eleventy-navigation");
const Image = require("@11ty/eleventy-img");

module.exports = function (eleventyConfig) {    
    eleventyConfig.addPlugin(eleventyNavigationPlugin);
    eleventyConfig
        .addPassthroughCopy("./src/assets/images")
        .addPassthroughCopy("./src/favicon*")
        .addPassthroughCopy("./src/assets/css")
        .addPassthroughCopy("./src/assets/js")
        .addPassthroughCopy("./src/admin");

    eleventyConfig.addLayoutAlias("posts", "layouts/posts.njk");
    eleventyConfig.addNunjucksAsyncShortcode("myImage", async function(src, alt, className, width=[350,650], outputFormat = "jpeg") {
        if(alt === undefined) {
          // You bet we throw an error on missing alt (alt="" works okay)
          throw new Error(`Missing \`alt\` on myImage from: ${src}`);
        }
        var source = `./src${src}`;
        // returns Promise
        let stats = await Image(source, {
          formats: [outputFormat],
          // This uses the original image width
          widths: width,
          urlPath: "/assets/images/optim/",
          outputDir: "_site/assets/images/optim/",
        });

        let prop = stats[outputFormat].pop();

        return `<img src="${prop.url}" width="${prop.width}" height="${prop.height}" alt="${alt}">`;
      });
    eleventyConfig.addFilter('dump', obj => {
        const getCircularReplacer = () => {
            const seen = new WeakSet();
            return (key, value) => {
            if (typeof value === "object" && value !== null) {
                if (seen.has(value)) {
                return;
                }
                seen.add(value);
            }
            return value;
            };
        };
        
        return JSON.stringify(obj, getCircularReplacer(), 4);
        });

    return {
        passthroughFileCopy: true,
        markdownTemplateEngine: "njk",
        templateFormats: ["html", "md", "njk", "eot", "ttf", "woff", "woff2", "svg", "jpg", "png", "css", "svg", "yml", "gif"],
        dir: {
            input: "src",
            output: "_site",
            includes: "_includes"
        }
    }
};




