
const gnose = require('../constants/gnose_constants').gnoseObj
const gnoseWebp = require('../constants/gnose_constants').gnoseWebpObj

const prompt = 'aajsajsa viadoego'

async function teste() {
    let _gnose;
    const keys = Object.keys(gnoseWebp)
    keys.forEach(element => {
        if (prompt.toLowerCase().includes(element)) {
            _gnose = gnoseWebp[element]
        }
    });
    return _gnose
}

async function main() {
    await teste().then(async e => {
        if (e !== undefined) {
            if (typeof e !== 'object') {
                console.log(e)
                return
            }
            let getMsg = e[Math.floor((Math.random() * e.length))];
            console.log(getMsg)
            return
        }
    })
}

main()