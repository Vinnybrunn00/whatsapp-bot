const gnoseWebp = require('../constants/gnose_constants').gnoseWebpObj
const gnoseReact = require('../constants/gnose_constants').objReact
const impr = require('../constants/gnose_constants').impr
const msgGnose = require('../constants/gnose_constants').msgGnose
const audioGnose = require('../constants/gnose_constants').audioGnoseObj
const msgMentGnose = require('../constants/gnose_constants').msgMentionsGnose
const quotedMsg = require('../constants/gnose_constants').sendQuotedMsg
const msgPolice = require('../constants/gnose_constants').msgPolice
const interrog = require('../constants/gnose_constants').interrog

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

    async policeSendMsg(body, groupId) {
        if (groupId === this.groupId) {
            if (body.includes('estupro')) {
                return msgPolice
            }
        }
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

    async sendMsgGnose(body, chatFrom, type) {
        if (chatFrom !== this.groupId) return;
        if (type === 'video' || type === 'image') return;
        let _msgGnose;
        for (let i = 0; i < impr.length; i++) {
            if (body.includes(impr[i])) {
                let _gen = Math.floor((Math.random() * msgGnose.length))
                _msgGnose = msgGnose[_gen]
            }
        }
        return _msgGnose
    }

    async interrogation(body, from) {
        if (from != this.groupId) return;
        if (body.slice(0).includes('?')) {
            let _gen = Math.floor((Math.random() * interrog.length))
            return interrog[_gen]
        }
    }

    async sendReactquoted(message, chatFrom) {
        try {
            let _quotedMsg;
            let isBotMention = message.quotedMsg.sender.isMe
            if (isBotMention && chatFrom === this.groupId) {
                let _gen = Math.floor((Math.random() * quotedMsg.length))
                _quotedMsg = quotedMsg[_gen]
            }
            return _quotedMsg
        } catch (err) {
            throw err
        }
    }

    async sendMentionGnose(body, from) {
        if (from !== this.groupId) return;
        let _mentionGonose;
        if (body.includes('@55')) {
            let _gen = Math.floor((Math.random() * msgMentGnose.length))
            _mentionGonose = msgMentGnose[_gen]
        }
        return _mentionGonose
    }
}

exports.GnoseGroup = GnoseGroup;