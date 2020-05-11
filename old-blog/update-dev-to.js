const axios = require('axios');
const fs = require('fs');
const path = require('path');
const levenshtein = require('fast-levenshtein');
const _ = require('lodash');
const fm = require('front-matter');

const devToApi = axios.create({
    baseURL: "https://dev.to/api",
    headers: {
        'api-key': process.env.DEV_TO_API_KEY
    }
});

async function listLocalPosts() {
    const baseDir = path.join(__dirname, "_posts");
    const postsFiles = (await fs.promises.readdir(baseDir)).map(name => path.join(baseDir, name));
    const result = [];
    for (const filePath of postsFiles) {
        const fileStat = await fs.promises.stat(filePath);
        if (!fileStat.isDirectory()) {
            result.push({
                path: filePath,
                content: (await fs.promises.readFile(filePath, 'utf8'))
            })
        }
    }
    return result
}

function slugFromBlogPostPath(blogPostPath) {
    const blogPostName = path.basename(blogPostPath, '.md').replace(/^\d\d\d\d-\d?\d-\d?\d-/, '');
    return blogPostName;
}

function levenshteinDistanceToLocalFileName(article) {
    return async function (blogPost) {
        const nameToMatch = article.slug.replace(/-[^-]+$/, '');
        const blogPostName = slugFromBlogPostPath(blogPost.path);
        if (blogPostName.includes(nameToMatch) || nameToMatch.includes(blogPostName)) {
            return 0
        }
        const nameDistance = levenshtein.get(nameToMatch, blogPostName);
        if (nameDistance <= 10) {
            return nameDistance
        }

        if (nameDistance >= nameToMatch.length) {
            return 100000000
        }

        const localBody = blogPost.content.replace(/^---[\s\S]*---\s*/, '');
        let remoteBody = article.body_markdown.replace(/^---[\s\S]*---\s*/, '');
        // try {
        //     remoteBody = fm(article.body_markdown).body;
        // } catch (e) {
        //     console.log('Did not extract front matter for article', article, e)
        // }
        const distance = levenshtein.get(localBody, remoteBody);
        // console.log(blogPostName, 'distance to', nameToMatch, 'is', distance)
        return distance
    }
}

async function allArticles() {
    let page = 0;
    let allResults = [];
    let lastResult = [];
    do {
        page += 1;
        lastResult = (await devToApi.get(`/articles/me?page=${page}`)).data;
        allResults = allResults.concat(lastResult);
    } while (lastResult.length === 30);
    return allResults;
}

async function allArticlesWithContent() {
    const all = await allArticles();
    const published = all.filter(a => a.published);
    const publishedWithContent = (await Promise.all(published)).map(async (article) => {
        const axiosResponse = await devToApi.get(`/articles/${article.id}`);
        return axiosResponse.data;
    });
    const publishedById = _.keyBy(publishedWithContent, article => article.id)
    return all.map(article => {
        return {
            ...article,
            ...(publishedById[article.id])
        }
    });
}

function canonicalUrlForBlogPostPath(blogPostPath) {
    return `https://brightinventions.pl/blog/${slugFromBlogPostPath(blogPostPath)}/`;
}

async function syncCanonicalUrls() {
    const myArticles = await allArticlesWithContent();
    const blogPosts = await listLocalPosts();

    for (const article of myArticles) {
        if (!/^https:\/\/brightinventions\.pl/.test(article.canonical_url)) {
            const distance = levenshteinDistanceToLocalFileName(article);
            const blogPostsWithDistance = await Promise.all(blogPosts.map(async post => ({ post, distance: await distance(post) })));
            const closestMatch = _.orderBy(blogPostsWithDistance, 'distance');
            console.log('Article', article.slug, 'has invalid cannonical url', article.canonical_url);
            if (closestMatch[0].distance > 600) {
                console.log('Article', article.slug, 'matching blog posts', closestMatch[0].distance, closestMatch[0].post);
            } else {
                const updated = (await devToApi.put(`/articles/${article.id}`, {
                    article: {
                        canonical_url: canonicalUrlForBlogPostPath(closestMatch[0].post)
                    }
                })).data;
                console.log('Article', article.slug, 'updated to ', updated);
            }
        }
    }
}

async function delayMs(millis) {
    return new Promise(resolve => setTimeout(resolve, millis))
}

async function sendUnpublishedArticles() {
    const myArticles = await allArticlesWithContent();
    const articlesByPath = _.keyBy(myArticles, (article) => {
        return article.canonical_url.replace("https://brightinventions.pl/blog/", "")
            .replace(/\/$/, '.md')
    });

    const localPosts = await listLocalPosts();
    for (const postFile of localPosts) {
        if (!Object.keys(articlesByPath).some(published => postFile.path.endsWith(published))) {
            const canonicalUrl = canonicalUrlForBlogPostPath(postFile.path);
            console.log(`Not published article`, postFile.path, `will push at`, canonicalUrl);
            const front = fm(postFile.content);
            let mainImage = front.attributes.image;
            if (mainImage && !/^http/.test(mainImage)) {
                mainImage = `https://brightinventions.pl/images/${mainImage.replace(/^\//, '')}`;
            }
            const contentWithoutModifiedDate = postFile.content.replace(/^modified:.*[\s]*/m, '')
            try {
                const result = (await devToApi.post("/articles", {
                    article: {
                        title: front.attributes.title,
                        published: false,
                        body_markdown: contentWithoutModifiedDate,
                        canonical_url: canonicalUrl,
                        main_image: mainImage
                    }
                })).data;
                console.log(`Created`, result);
                // break;
            } catch (e) {
                console.log(`Failed to create post`, e);
            }
            //
            await delayMs(3000);
        }
    }
}

async function main() {
    await sendUnpublishedArticles();
    // await syncCanonicalUrls();
}


main().catch(err => {
    console.log(err);
    process.exit(1)
});
