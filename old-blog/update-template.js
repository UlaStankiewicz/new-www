const commandLineArgs = require("command-line-args");
const path = require("path");
const fs = require("fs");
const JSZip = require("jszip");
const minimatch = require("minimatch");
const cheerio = require("cheerio");
const extractFrontMatter = require("front-matter");

const extractHtmlOptions = { decodeEntities: false, xmlMode: false, normalizeWhitespace: true, lowerCaseTags: false, lowerCaseAttributeNames: false };

const actionTypes = {
    fixLinks: async function ({}, context) {
        const $ = cheerio.load(context.content, extractHtmlOptions);
        const anchors = $('a');
        anchors.each((ix, element) => {
            const anchor = $(element);
            let href = anchor.attr("href");
            if (href && !/^(https?:|mailto:|javascript:|blob:|#)/.test(href)) {
                href = `{{ site.url }}/${href}`;
                anchor.attr("href", href)
            }

            if (href && /\.html$/.test(href)) {
                href = href.replace("index.html", "")
                    .replace(".html", "");
                anchor.attr("href", href)
            }
        });
        $('img').each((ix, element) => {
            const anchor = $(element);
            const src = anchor.attr("src");
            if (src && !/^(https?|blob):/.test(src)) {
                anchor.attr("src", `{{ site.url }}/${src}`)
            }
        });
        return {
            ...context,
            content: $.html(extractHtmlOptions)
        };
    },
    includePartial: async function ({ selector, partial, treatAsOneMatch = true }, context) {
        const $ = cheerio.load(context.content, extractHtmlOptions);
        const matches = $(selector);
        const partialFilePath = path.join("_includes", partial);
        if (!fs.existsSync(partialFilePath)) {
            const newPartialContent = $.html(matches.first(), extractHtmlOptions);
            await fs.promises.writeFile(partialFilePath, newPartialContent)
        }
        if (treatAsOneMatch) {
            matches.first().replaceWith(`{% include ${partial} %}`);
            matches.each((index, element) => {
                $(element).remove();
            })
        } else {
            matches.replaceWith(`{% include ${partial} %}`);
        }
        return {
            ...context,
            content: $.html(extractHtmlOptions)
        };
    },
    wrapLayout: async function ({ selector, layout = "default" }, context) {
        const $ = cheerio.load(context.content, extractHtmlOptions);
        const match = $(selector);
        if (!match.length) {
            console.warn("Failed to find selector", selector, "in context", context);
            return context;
        }
        const existingFileContent = await fs.promises.readFile(context.filePath, 'utf8').catch(() => null);
        const frontMatter = existingFileContent ? extractFrontMatter(existingFileContent) : {
            frontmatter: `layout: default`
        };

        let layoutContent = match.html()
        if (match.attr('class')) { // preserve class of matched element but change tag to div if body
            if (match.is('body')) {
                match.each((index, element) => {
                    element.tagName = 'div';
                });
            }
            layoutContent = $.html(match, extractHtmlOptions);
        }

        return {
            ...context,
            content: `---
${frontMatter.frontmatter}
---

${layoutContent}`
        };
    },
    removeElement: async function ({ selector }, context) {
        const $ = cheerio.load(context.content, extractHtmlOptions);
        const match = $(selector);
        match.remove();
        return {
            ...context,
            content: $.html(extractHtmlOptions)
        };
    }
};

async function main() {
    const options = commandLineArgs([{
        name: "template-zip",
        type: (value) => path.resolve(value),

    }, {
        name: "config",
        type: (value) => path.resolve(value)
    }]);

    const config = JSON.parse(await fs.promises.readFile(options.config, "utf8"));
    const templateZip = await fs.promises.readFile(options["template-zip"]);

    console.log(config, templateZip);

    const zip = await JSZip.loadAsync(templateZip);
    const resultDir = path.join(process.cwd(), "tmp");

    for (const zippedFile of Object.values(zip.files)) {
        if (!zippedFile.dir) {
            const fileRelativePath = zippedFile.name;
            if (!/images/.test(fileRelativePath)) {
                console.log("Process", zippedFile);
            }
            const outputFile = path.join(resultDir, fileRelativePath);
            await fs.promises.mkdir(path.dirname(outputFile), { recursive: true });
            const content = await zippedFile.async("nodebuffer");

            let context = {
                filePath: fileRelativePath,
                content: content
            };

            for (const fileMatch of config.filesMatching) {
                if (minimatch(fileRelativePath, fileMatch.glob)) {
                    const actions = fileMatch.actions;
                    for (const actionDefinition of actions) {
                        console.log("Apply action", actionDefinition, "to context", context);
                        const actionFunction = actionTypes[actionDefinition.type];
                        context = await actionFunction(actionDefinition, context);
                    }
                }
            }
            await fs.promises.writeFile(outputFile, context.content);
        }
    }
}

main().catch((err) => {
    console.log(err);
    process.exit(1)
});



