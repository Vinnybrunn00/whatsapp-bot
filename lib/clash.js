const fs = require('fs').promises
const fss = require('fs')
const path = require('path')
const apiSchedule = require('node-schedule')

class ApiClashOfClans {
    constructor(baseUrl, apiKey) {
        this.baseUrl = baseUrl
        this.apiKey = apiKey
        this.header = {
            'Authorization': `Bearer ${this.apiKey}`
        }
    }

    async resolveClans(endpoint) {
        let resp;
        await fetch(`${this.baseUrl}/clans/%23QLRYLCP8/${endpoint}`, {
            headers: this.header
        }).then(async response => {
            const request = await response.json();
            switch (endpoint) {
                case 'capitalraidseasons':
                    for (let i = 0; i < request.items.length; i++) {
                        let items = request.items[i];
                        return resp = items
                    }
                case 'members':
                    return resp = request.items
            }
        });
        return resp
    }

    async getPlayers(tag) {
        if (tag === undefined) {
            throw new Error('"tag" argument not defined')
        }
        let _isEvent;
        await fetch(`${this.baseUrl}/players/${tag.replace('#', '%23')}`, {
            headers: this.header
        }).then(async response => {
            let resp = await response.json()
            let pathMembers = path.resolve(__dirname, `../data/members/${resp.tag}.json`)
            let isExist = fss.existsSync(pathMembers)
            if (!isExist) {
                await fs.writeFile(pathMembers, JSON.stringify(resp))
                _isEvent = resp.tag
                return;
            }
            _isEvent = resp.tag
        });
        return _isEvent !== undefined ? _isEvent : '* Tag não encontrado, tente novamente. ❗'
    }
}

exports.ApiClashOfClans = ApiClashOfClans;