const fs = require('fs').promises
const fss = require('fs')
const path = require('path')

class ApiClashOfClans {
    constructor(baseUrl, apiKey, groupId) {
        this.baseUrl = baseUrl
        this.apiKey = apiKey
        this.header = {
            'Authorization': `Bearer ${this.apiKey}`
        }
        this.groupId = groupId
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

    async sendWelcome(bot) {
        try {
            let _link;
            await bot.onParticipantsChanged(this.groupId, async changeEvent => {
                if (changeEvent.action === 'add') {
                    let link = await bot.getGroupInfo(this.groupId)
                    await bot.sendTextWithMentions(this.groupId, `Bem vindo, *@${changeEvent.who.replace('@c.us', '')}*`)
                    _link = link['description']
                    return;
                }
                await bot.sendText(groupChatId, '👋 Menos um');
                return;
            });
            return _link
        } catch (err) {
            throw err
        }
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