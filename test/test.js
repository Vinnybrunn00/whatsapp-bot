
const fs = require('fs').promises
const path = require('path')
const saveranking = path.resolve(__dirname, './../data/db/users/ranking.txt')

async function Ranking(url, header){
    const response = await fetch(url, {headers: header})
    const responseJson = await response.json()

    const listRanking = []
    let text;

    for (let i in responseJson['items']){
        const items = responseJson['items'][i]
        const rankingText = `${items['clanRank']}  ${items['name']}  ${items['townHallLevel']}  ${items['role']}\n`
        listRanking.push(rankingText)
    }

    text = listRanking.toString()

    await fs.writeFile(saveranking, 'N   Nome CV   Role\n\n' + text.replace(/,/g, ''))
}

async function main(){
    await Ranking('https://api.clashofclans.com/v1/clans/%23QLRYLCP8/members', {
        'Authorization': 'Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzUxMiIsImtpZCI6IjI4YTMxOGY3LTAwMDAtYTFlYi03ZmExLTJjNzQzM2M2Y2NhNSJ9.eyJpc3MiOiJzdXBlcmNlbGwiLCJhdWQiOiJzdXBlcmNlbGw6Z2FtZWFwaSIsImp0aSI6IjIyOWYzN2RhLTQwNWQtNDExNS1iOTQzLTc3M2M2MzkyZGY2NCIsImlhdCI6MTcxMjk4NzE2Niwic3ViIjoiZGV2ZWxvcGVyLzY2NDg1MWRiLTc3MzUtNWNmNy0xMjdjLTM0OWRjMGE5MjhlNCIsInNjb3BlcyI6WyJjbGFzaCJdLCJsaW1pdHMiOlt7InRpZXIiOiJkZXZlbG9wZXIvc2lsdmVyIiwidHlwZSI6InRocm90dGxpbmcifSx7ImNpZHJzIjpbIjE2OC4xOTQuMTA2LjQxIl0sInR5cGUiOiJjbGllbnQifV19.qrVRliSKCKdcG7wwsseBtoY0ITMwy_m9F3fG-YjI6ROVlDjonPF1lVpMT0Hke19bdc7EmgWAP08kJTiRE1WzKw'
    })
}

main()