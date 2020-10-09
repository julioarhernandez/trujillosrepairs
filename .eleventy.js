const eleventyNavigationPlugin = require("@11ty/eleventy-navigation");

module.exports = function (eleventyConfig) {    
    eleventyConfig.addPlugin(eleventyNavigationPlugin);
    eleventyConfig
        .addPassthroughCopy("./src/assets/images")
        .addPassthroughCopy("./src/favicon*")
        .addPassthroughCopy("./src/assets/css")
        .addPassthroughCopy("./src/assets/js")
        .addPassthroughCopy("./src/admin");

    eleventyConfig.addLayoutAlias("posts", "layouts/posts.njk");
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




