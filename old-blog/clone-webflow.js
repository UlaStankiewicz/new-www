const scrape = require("website-scraper");
const path = require("path");
const rimfraf = require("rimraf");
const { promisify } = require("util");
const { writeFile, readFile } = require("fs").promises;
const cheerio = require("cheerio");

const targetPath = path.join(process.cwd(), "tmp", "brightproject");

class ReplacePlugin {
    constructor(replacements) {
        this.replacements = replacements;
        this.changeText = new ChangeTextResourcePlugin(async ({ resource }) => {
            const text = resource.getText();
            return this.replacements.reduce((acc, cur) => {
                return acc.replace(cur.regex, cur.replacer);
            }, text);
        })
    }

    apply(registerAction) {
        this.changeText.apply(registerAction);
    }
}

async function saveResource(resource) {
    const filename = path.join(targetPath, resource.getFilename());
    await writeFile(filename, resource.getText());
}

class ChangeTextResourcePlugin {
    constructor(changer) {
        this.changer = changer;
    }

    apply(registerAction) {
        registerAction('onResourceSaved', async ({ resource }) => {
            const text = resource.getText();
            if (typeof text === 'string') {
                const textUpdated = await this.changer({ resource });
                if (textUpdated !== text) {
                    resource.setText(textUpdated);
                    await saveResource(resource);
                }
            }
        })
    }


}

async function downloadWebsite() {
    await promisify(rimfraf)(targetPath);

    const basePath = "https://brightproject.webflow.io/";
    const result = await scrape({
        urls: [basePath],
        directory: targetPath,
        recursive: true,
        request: {
            encoding: null
        },
        urlFilter: (url) => {
            if (url.indexOf("https://brightproject.webflow.io/post") === 0) {
                if (url.indexOf("are-we-ready-for-deep-learning-on-mobile-devices") >= 0) {
                    return true;
                }
                return false;
            }
            if (url.indexOf("brightproject.webflow") >= 0) {
                return url.indexOf("page=") < 0;
            }
            if (url.indexOf("assets-global") >= 0) {
                return true
            }
        },
        plugins: [
            {
                apply(registerAction) {
                    registerAction('afterResponse', async ({ response }) => {
                        const contentType = response.headers['content-type'];
                        const body = /text/.test(contentType) ? response.body.toString('utf8') : response.body;
                        return {
                            body: body,
                            metadata: null
                        };
                    });
                }
            },
            new ReplacePlugin([{
                regex: /https:\/\/brightproject.webflow.io\//g,
                replacer: '{{ site.url }}/'
            }, {
                regex: /src="(?!(https?:)?\/\/)\/?([^"]+)"/g,
                replacer: 'src="{{ site.url }}/$2"'
            }, {
                regex: /"(images\/[^\s]+)/g,
                replacer: '"{{ site.url }}/$1'
            }, {
                regex: / (images\/[^\s]+)/g,
                replacer: ' {{ site.url }}/$1'
            }, {
                regex: /href="(?!(https?:|javascript:)?\/\/)\/?([^"]+)"/g,
                replacer: 'href="{{ site.url }}/$2"'
            }, {
                regex: /\/index\.html"/g,
                replacer: '/"'
            }, {
                regex: /\/([^\/]+)\.html"/g,
                replacer: '/$1"'
            }]),
            new ChangeTextResourcePlugin(async ({ resource }) => {
                const resourceText = resource.getText();
                if (resource.isHtml()) {
                    const body = cheerio.load(resourceText)('body');
                    while (body.children().last().is('script') || body.children().last().html() === "") {
                        body.children().last().remove();
                    }
                    return frontMatter + body.html()
                } else {
                    return resourceText;
                }
            })
        ]
    });
    return result;
}

const frontMatter = `---
layout: default
---

`;

async function main() {
    const result = await downloadWebsite();

    const blogPath = path.join(targetPath, 'blog.html');
    const blogContent = await readFile(blogPath, 'utf-8');
    const blog$ = cheerio.load(blogContent.substr(frontMatter.length), { decodeEntities: false });

    const _postList = await readFile(path.join('_includes', '_post-list.html'), 'utf-8');

    const content = cheerio.load(_postList, { decodeEntities: false, xmlMode: true });

    const html = content.root().html();

    blog$('.w-dyn-list').replaceWith(html);

    await writeFile(blogPath, frontMatter + blog$('body').html())
}


main().catch(error => {
    console.error("failed", error)
    process.exit(1)
});
