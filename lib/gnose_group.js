const gnoseWebp = require('../constants/gnose_constants').gnoseWebpObj
const gnoseReact = require('../constants/gnose_constants').objReact
const impr = require('../constants/gnose_constants').impr
const msgGnose = require('../constants/gnose_constants').msgGnose
const audioGnose = require('../constants/gnose_constants').audioGnoseObj

class GnoseGroup {
    constructor(groupId) {
        this.groupId = groupId;
    }

    async reactGnose(contact, message) {
        if (message.from !== this.groupId) return;
        let _react;
        gnoseReact.forEach(async element => {
            for (let i = 0; i < element.user.length; i++) {
                let user = element.user[i]
                if (contact === user[0]) {
                    _react = user[1]
                }
            }
        });
        return _react
    }

    async sendWebp(prompt, message) {
        if (message.from === this.groupId) {
            try {
                let _gnoseWebp;
                const keys = Object.keys(gnoseWebp)
                keys.forEach(element => {
                    if (prompt.includes(element)) {
                        _gnoseWebp = gnoseWebp[element];
                    }
                })
                return _gnoseWebp
            } catch (err) {
                throw err
            }
        }
    }

    async sendAudioGnose(command, message) {
        if (message.from !== this.groupId) return;
        let _audio;
        const keys = Object.keys(audioGnose)
        keys.forEach(async element => {
            _audio = audioGnose[element][command]
        });
        return _audio
    }

    async sendMsgGnose(body, chatFrom) {
        if (chatFrom !== this.groupId) return;
        let _msgGnose;
        for (let i = 0; i < impr.length; i++) {
            if (body.includes(impr[i])) {
                _msgGnose = msgGnose
            }
        }
        return _msgGnose
    }
}

exports.GnoseGroup = GnoseGroup;