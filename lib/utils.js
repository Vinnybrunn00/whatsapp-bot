const fs = require('fs').promises;
const tesseract = require('node-tesseract-ocr');

class Utils {
    constructor(){}

    async saveLog(path, args) {
        await fs.writeFile(path, args + '\n', { flag: 'a' })
        return true
    }

    async extract(img) {
        if (img){
            const text = await tesseract.recognize(img, {lang: "por"})
            return text
        }
        return false
    }

    async changePrefix(path, prefix){
        await fs.writeFile(path, prefix)
        return true;
    }

    async setHour(path, hour){
        await fs.writeFile(path, hour)
        return true;
    } 
}

exports.Utils = Utils;