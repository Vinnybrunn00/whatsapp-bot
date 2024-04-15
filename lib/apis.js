
const time = new Date()
const timers = `${String(time.getHours()).padStart(2, '0')}:${String(time.getMinutes()).padStart(2, '0')}`
const fs = require('fs').promises
const path = require('path')
const saveranking = path.resolve(__dirname, '../data/db/users/ranking.txt')

class ApiClashOfClans {
    constructor(url, headers) {
        this.url = url;
        this.headers = headers;
    }

    async AttackRaides() {
        const response = await fetch(this.url, { headers: this.headers })
        const responseJson = await response.json()

        const listRaides = []
        let getRaides;
        for (let i in responseJson['items']) {
            const members = responseJson['items'][i]['members']
            for (let j in members) {
                const member = members[j]
                if (member['attacks'] >= 5) {
                    const save = `*${member['name']}*\n     _Ataques:_ ${member['attacks']}\n     _Ataques Limites_: ${member['attackLimit']}\n     _Bônus ataque_: ${member['bonusAttackLimit']}\n-----------------------------\n\n`
                    listRaides.push(`› ${save}`)
                    getRaides = listRaides.toString()
                }
            }
        }
        const states = responseJson['items'][0]['state']
        const totalAttacks = responseJson['items'][0]['totalAttacks']
        const capitalTotal = responseJson['items'][0]['capitalTotalLoot']
        const sendAttacks = `--------- 〘 _5 OU MAIS ATAQUES_ 〙 ---------\n\n \`\`\`[${timers}]\`\`\`➣ *Raides ${states !== 'ongoing' ? 'fechada' : 'em andamento'}* \n ➣ *${capitalTotal} Capital Total*\n ➣ *${totalAttacks} Ataques totais*\n\n`
        const getInfo = listRaides.length <= 0 ? '❗ SEM INFORMAÇÃO NO MOMENTO ❗' : getRaides.replace(/,/g, '')

        return sendAttacks + getInfo;
    }

    async membersRankin() {
        const response = await fetch(this.url, { headers: this.headers })
        const responseJson = await response.json()

        const listRanking = []
        let text;

        for (let i in responseJson['items']) {
            const items = responseJson['items'][i]
            const rankingText = `${items['clanRank']}  ${items['name']}  ${items['townHallLevel']}  ${items['role']}\n`
            listRanking.push(rankingText)
        }

        text = listRanking.toString()

        await fs.writeFile(saveranking, 'N   Nome CV   Role\n\n' + text.replace(/,/g, ''))

    }
}

exports.ApiClashOfClans = ApiClashOfClans;