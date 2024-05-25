const gnoseWebp = require('../constants/gnose_constants').gnoseWebpObj

class GnoseGroup {
    constructor(groupId) {
        this.groupId = groupId;
    }

    async sendWebp(prompt, message) {
        if (message.chat.id === this.groupId) {
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