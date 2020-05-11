const yaml = require('yaml');
const fs = require('fs');
const fmt = require('front-matter');
const readline = require('readline');
const path = require('path');

const authorsFromData = yaml.parse(fs.readFileSync('_data/authors_.yml', 'utf8'));

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

function question(question) {
    return new Promise((resolve) => {
        rl.question(question, resolve)
    });
}


async function main() {

    for (const authorId of Object.keys(authorsFromData)) {
        const author = authorsFromData[authorId];
        const fileName = author.name.toLowerCase().replace(/\s/g, '-') + '.md';
        const firstName = author.name.split(/\s/)[0];
        const title = firstName;
        let data = {
            id: authorId,
            title,
            ...author
        };
        let regularHtml = `${firstName.toLocaleLowerCase()}.html`;
        if (!fs.existsSync(regularHtml)) {
            regularHtml = await question(`Provide existing html path for ${author.name}`)
        }
        if (fs.existsSync(regularHtml)) {
            const existingFrontMatter = fmt(fs.readFileSync(regularHtml, 'utf8'));
            data = {
                ...data,
                ...existingFrontMatter.attributes,
                redirect_from: `/${path.basename(regularHtml, '.html')}`
            };
        }

        fs.writeFileSync(path.join('_members', fileName), `---
${yaml.stringify(data)}
---

`);

    }
}

main().catch((err) => {
    console.log(err);
    process.exit(1);
});
