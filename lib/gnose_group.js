const gnoseWebp = require('../constants/gnose_constants').gnoseWebpObj
const gnoseReact = require('../constants/gnose_constants').objReact

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
}

exports.GnoseGroup = GnoseGroup;