// read all the md files in the docs folder and replace the image with a regex expression
const fs = require('fs');
const path = require('path');

const docsPath = path.join(__dirname, '../docs');
const regex = /!\[.*?\]\(((?!http).*?\/)?([^\/)]+)\)/g;

fs.readdir(docsPath, { recursive: true }, (err, files) => {
    if (err) {
        console.error('Could not list the directory.', err);
        process.exit(1);
    }

    files.filter(x => x.toLowerCase().endsWith(".md")).forEach((file, index) => {
        const filePath = path.join(docsPath, file);
        console.log(filePath);
        fs.readFile(filePath, 'utf-8', (err, data) => {
            if (err) {
                console.error('Could not read the file.', err);
                process.exit(1);
            }

            const result = data.replace(regex, (match, p1, p2) => {
                return `![](https://cdn.jsdelivr.net/gh/chenxizhang/kustobible@master/docs/images/${p2})`;
            });

            fs.writeFile(filePath, result, 'utf-8', (err) => {
                if (err) {
                    console.error('Could not write the file.', err);
                    process.exit(1);
                }
            });
        });
    });
});