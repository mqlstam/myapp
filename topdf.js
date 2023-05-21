const fs = require('fs');
const path = require('path');
const puppeteer = require('puppeteer');

// Recursive function to read JS files from a directory
function getFiles(dir, fileList){
    files = fs.readdirSync(dir);
    fileList = fileList || [];
    files.forEach(function(file) {
        if(fs.statSync(path.join(dir, file)).isDirectory()) {
            fileList = getFiles(path.join(dir, file), fileList);
        } else if (file.endsWith('.js')) {
            fileList.push(path.join(dir, file));
        }
    });
    return fileList;
};

const generatePDF = async () => {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();

    let htmlContent = `<html><head><style>body { font-family: Arial, sans-serif; }</style></head><body>`;
    const files = getFiles('/Users/miquelstam/Library/CloudStorage/OneDrive-AvansHogeschool/Informatica Jaar 1/Periode 4/Programmeren 4/code/');  // use your directory path here

    for(const file of files){
        const content = fs.readFileSync(file, 'utf-8');
        htmlContent += `<h1>${file}</h1><pre><code>${content}</code></pre><hr/>`;
    }

    htmlContent += `</body></html>`;
    
    await page.setContent(htmlContent);
    await page.pdf({ path: 'output.pdf', format: 'A4' });

    await browser.close();
};

generatePDF();
