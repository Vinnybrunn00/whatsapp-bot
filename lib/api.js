const { decryptMedia } = require('@open-wa/wa-automate')
const fs = require('fs').promises
const fsF = require('fs')
const gTTS = require('gtts');
const os = require('os')
const youTube = require('ytdl-core');
const path = require('path')
const tesseract = require('node-tesseract-ocr');
const https = require('https');

// constants
const constants = require('../constants/constants').msg
let regExp = constants.regExp

// paths
const pathOwner = path.resolve(__dirname, '../data/owner/owner.json')
const pathBlockDm = path.resolve(__dirname, '../data/users/dm_block.json')
const pathRegister = path.resolve(__dirname, '../data/users/register.json')
const pathVideo = path.resolve(__dirname, '../src/video')
const pathAudio = path.resolve(__dirname, '../src/audio')
const pathVoice = path.resolve(__dirname, '../src/voice')
const pathVideoTk = path.resolve(__dirname, '../src/video_tk')
const pathMedia = path.resolve(__dirname, '../media')
const pathLog = path.resolve(__dirname, '../logs/logfile.log')
const pathCmd = path.resolve(__dirname, '../data/cmd_block/command_block.json')
const pathReact = path.resolve(__dirname, '../flags/on_react.json')

class BotApiUtils {
    constructor() {
        this.timeLog = this.hourLog()
    }

    async setPhotoGroup(message, bot) {
        try {
            const participants = message.chat.groupMetadata.participants
            for (let i = 0; i < participants.length; i++) {
                const isAdmin = participants[i]['isAdmin']
                if (message.author === participants[i]['id']) {
                    if (!isAdmin) {
                        return '• Você precisa ser admin para usar este comando ❗'
                    }
                    const setImage = await decryptMedia(message)
                    const fmImage = `data:${message.mimetype};base64,${setImage.toString('base64')}`
                    await bot.setGroupIcon(message.from, fmImage)
                    return '• Imagem do grupo atualizada ✅'
                }
            }
        } catch (err) {
            await this.saveLogError(this.timeLog, err, message.chat.name, 'setPhotoGroup()')
            return 'Erro ao settar imagem do grupo, tente novamente.'
        }
    }

    async isBlock(contact) {
        let readfile = await fs.readFile(pathCmd)
        const isBlock = JSON.parse(readfile)
        for (let conct of isBlock) {
            if (contact === conct.contact) return true
        }
        return false
    }

    async removeUser(kickNumber, message, bot) {
        const participants = message.chat.groupMetadata.participants
        for (let i = 0; i < participants.length; i++) {
            const userAdmin = participants[i]['isAdmin']
            const getUser = participants[i]['id']
            if (message.author === getUser) {
                if (userAdmin) {
                    for (let j = 0; j < participants.length; j++) {
                        const botAdmin = participants[j]['isAdmin']
                        const getUser = participants[j]['id']
                        if (message.to === getUser) {
                            if (botAdmin) {
                                let isRemove = await bot.removeParticipant(message.from, `${kickNumber.replace('@', '')}@c.us`)
                                if (isRemove) {
                                    return '• Usuario removido ✅'
                                }
                            }
                            return '• O bot precisa ser admin para executar este comando ❗';
                        }
                    }
                }
                return '• Você precisa ser admin para usar este comando ❗';
            }
        }
    }

    async removeBlock(author) {
        try {
            let readfile = await fs.readFile(pathCmd)
            let cmd = JSON.parse(readfile)

            let index = cmd.indexOf(author)
            if (index !== -1) {
                cmd.splice(index, 1)
                await fs.writeFile(pathCmd, JSON.stringify(cmd), { flag: 'w' })
                return `• ${author} removido da lista de bloqueados`;
            }
            return `• ${author} não está na lista de bloqueados`
        } catch (err) {
            throw err
        }
    }

    async setPromote(participantId, message, bot) {
        try {
            await bot.getGroupAdmins(message.from)
                .then(async getAdmins => {
                    if (getAdmins.includes(`${participantId.replace('@', '')}@c.us`)) {
                        await bot.sendReplyWithMentions(message.chat.id, `• ${participantId} Já é um administrador ❗`, message.id)
                        return;
                    }
                    let participants = message.chat.groupMetadata.participants
                    for (let i = 0; i < participants.length; i++) {
                        const isAdmin = participants[i]['isAdmin']
                        const getId = participants[i]['id']
                        if (message.author === getId) {
                            if (isAdmin) {
                                for (let i = 0; i < participants.length; i++) {
                                    const isAdmin = participants[i]['isAdmin']
                                    const getId = participants[i]['id']
                                    if (message.to === getId) {
                                        if (isAdmin) {
                                            await bot.promoteParticipant(message.from, `${participantId.replace('@', '')}@c.us`)
                                                .then(async isPromote => {
                                                    if (isPromote) {
                                                        await bot.sendReplyWithMentions(message.from, `• ${participantId} agora é um administrador ✅`, message.id)
                                                        return;
                                                    }
                                                })
                                            return;
                                        }
                                        await bot.reply(message.from, '• O bot precisa ser admin para executar este comando ❗', message.id)
                                        return;
                                    }
                                }
                            }
                            await bot.reply(message.from, '• Você precisa ser admin para usar este comando ❗', message.id)
                            return;
                        }
                    }
                });
        } catch (err) {
            await this.saveLogError(this.timeLog, err, message.chat.name, 'setPromote()')
            return `Erro ao promover ${participantId}, tente novamente`
        }
    }

    async setDescription(description, message, bot) {
        if (description < 1) return;
        let att;
        try {
            let listAdms = await message.chat.groupMetadata.participants
            for (let i = 0; i < listAdms.length; i++) {
                let isAdmin = listAdms[i]['isAdmin']
                if (message.author === listAdms[i]['id']) {
                    if (!isAdmin) {
                        return '• Você precisa ser admin para usar este comando ❗'
                    }
                    await bot.setGroupDescription(message.from, description)
                        .then(async setdesc => {
                            if (setdesc) {
                                att = '• Descrição do grupo atualizada, envie *!desc* para ler. ✅'
                            }
                        });
                    return att
                }
            }
        } catch (err) {
            await this.saveLogError(this.timeLog, err, message.chat.name, 'setDescription()')
            return 'Erro ao configurar nova descrição'
        }
    }

    async sendVoice(text, lang, message, bot) {
        if (os.platform() !== 'linux') return;
        if (lang.length === 0 && (text.length < 4 || text.length > 60)) return;
        try {
            let gtts = new gTTS(text, lang)
            gtts.save(`${pathVoice}/voice.mp3`, async function (isError, _) {
                if (isError) {
                    return '❌ Erro ao converter áudio, tente novamente ❌'
                }
                await bot.sendPtt(message.from, `${pathVoice}/voice.mp3`, message.id)
                return;
            });
        } catch (err) {
            await this.saveLogError(this.timeLog, err, message.chat.name, 'sendVoice()')
            return `❌ Lingua não reconhecida, tente: \n›• !audio --pt frase ou \`\`\`!lang \`\`\``
        }
    }

    async setDemote(participantId, message, bot) {
        if (participantId <= 16 && participantId >= 18) return constants.invalidContact
        if (participantId === '') return constants.emptyContact
        let arrayAdmins;
        let demote;

        await bot.getGroupAdmins(message.from)
            .then(async admins => {
                arrayAdmins = admins
            });

        if (arrayAdmins !== undefined) {
            if (arrayAdmins.includes(`${participantId.replace('@', '')}@c.us`)) {
                let participants = message.chat.groupMetadata.participants
                for (let i = 0; i < participants.length; i++) {
                    const isAdmin = participants[i]['isAdmin']
                    const getId = participants[i]['id']
                    if (message.author === getId) {
                        if (isAdmin) {
                            for (let i = 0; i < participants.length; i++) {
                                const isAdmin = participants[i]['isAdmin']
                                const getId = participants[i]['id']
                                if (message.to === getId) {
                                    if (isAdmin) {
                                        await bot.demoteParticipant(message.from, `${participantId.replace('@', '')}@c.us`)
                                            .then(async demoted => {
                                                if (demoted) {
                                                    demote = `• ${participantId} Não é mais um administrador ❌`;
                                                }
                                            });
                                        return demote;
                                    }
                                    return '• O bot precisa ser admin para executar este comando ❗';
                                }
                            }
                        }
                        return '• Você precisa ser admin para usar este comando ❗';
                    }
                }
            }
            return `• ${participantId} Não está na lista de admins ❗`
        }
    }

    async downloadYt(link, format, message, bot) {
        if (link.length === 0 && format.length === 0) return;
        let match = link.match(regExp)
        if (match && match[2].length == 11) {
            try {
                let info = await youTube.getInfo(link)
                const title = info.player_response.videoDetails.title
                youTube(link, {
                    filter: format === 'mp4' ? 'videoandaudio' : 'audioonly',
                    format: format,
                }).pipe(fsF.createWriteStream(format === 'mp4' ? `${pathVideo}/download.mp4` : `${pathAudio}/download.mp3`))
                    .on('finish', async () => {
                        if (format !== 'mp4') {
                            await bot.reply(message.from, 'Baixando o áudio, aguarde...⌛', message.id)
                            await bot.sendAudio(message.chat.id, `${pathAudio}/download.mp3`)
                            return;
                        }
                        await bot.reply(message.chat.id, 'Baixando o vídeo, aguarde...⌛', message.id)
                        await bot.sendFile(message.chat.id, `${pathVideo}/download.mp4`, "download", title)
                        return;
                    });
            } catch (err) {
                await this.saveLogError(this.timeLog, err, message.chat.name, 'downloadYt()')
                return 'Erro inesperado, tente novamente. ❌ => ' + err;
            }
        }
    }

    async resolveDownloads(url, message, bot) {
        try {
            https.get(url, (response) => {
                let save = fsF.createWriteStream(`${pathVideoTk}/video.mp4`)
                response.pipe(save)
                save.on('finish', async () => {
                    await bot.sendFile(message.from, `${pathVideoTk}/video.mp4`, 'video', 'Video tiktok')
                    console.log('ok')
                    save.close()
                    return;
                });
            });
        } catch (_) {
            throw 'Erro desconhecido, tente novamente!'
        }
    }

    async sendResolveSticker(mimetype, quotedMsg, type, timer, message, bot) {
        try {
            await bot.sendReplyWithMentions(message.from, this.sendRequestSticker(timer, message.notifyName), message.id)
            let decryp = quotedMsg === undefined ? message : quotedMsg
            const decrypt = await decryptMedia(decryp)
            return `data:${mimetype};base64,${decrypt.toString('base64')}`
        } catch (err) {
            await this.saveLogError(this.timeLog, err, message.chat.name, 'sendResolveSticker()')
            throw `Erro ao converter ${type} em sticker, tente novamente.`
        }
    }

    async saveLogInfo(timerlog, doing) {
        let infoLog = `${timerlog}: INFO - [log] ➜ ${doing}`
        await fs.writeFile(pathLog, infoLog + '\n', { flag: 'a' })
        return;
    }

    async saveLogError(timerlog, erroLog, group, method) {
        let args = `${timerlog}: ERROR - [> ${erroLog} <] "${group}" ➜ ${method}`
        await fs.writeFile(pathLog, args + '\n', { flag: 'a' })
    }

    async mentionsAll(nameGroup, countGroup, timer, message, bot) {
        let users = []
        const participants = message.chat.groupMetadata.participants
        for (let i = 0; i < participants.length; i++) {
            const admin = participants[i]['isAdmin']
            if (message.author === participants[i]['id']) {
                if (admin) {
                    for (let j = 0; j < participants.length; j++) {
                        let members = participants[j]['id']
                        let newMembers = members.replace('@c.us', '')
                        users.push(`› *@${newMembers}*\n`)
                    }
                    users = users.toString()
                    await bot.sendReplyWithMentions(message.from, this.sendMetionAll(timer, nameGroup, countGroup, users))
                    return;

                }
                return '❗ Apenas administradores são autorizados a usar este comando. ❗';
            }
        }
    }

    async deteleInappropriate(inappropriate, message, bot) {
        let isDeleted;
        for (let impr of inappropriate) {
            const isImpropes = message.body.includes(impr)
            if (isImpropes) {
                const participant = message.chat.groupMetadata.participants
                for (let i = 0; i < participant.length; i++) {
                    const isAdmin = participant[i]['isAdmin']
                    if (message.to === participant[i]['id']) {
                        if (isAdmin) {
                            await bot.deleteMessage(message.from, message.id)
                                .then(isDelet => {
                                    if (isDelet) {
                                        isDeleted = '✅ - Mensagem deletada'
                                    }
                                })
                            return isDeleted
                        }
                    }
                }
            }
        }
    }

    async revokeLinkGroup(message, bot) {
        try {
            let groupName = message.chat.name
            let revoke;
            const participants = message.chat.groupMetadata.participants
            for (let i = 0; i < participants.length; i++) {
                const isAdmin = participants[i]['isAdmin']
                if (message.author === participants[i]['id']) {
                    if (isAdmin) {
                        for (let i = 0; i < participants.length; i++) {
                            const isAdmin = participants[i]['isAdmin']
                            if (message.to === participants[i]['id']) {
                                if (isAdmin) {
                                    await bot.revokeGroupInviteLink(message.from)
                                        .then(isRevoke => {
                                            if (isRevoke) {
                                                revoke = `Link do grupo *${groupName}* resetado 🤖 ✔️`
                                            }
                                        });
                                    return revoke
                                }
                                return '• O bot precisa ser admin para executar este comando ❗'
                            }
                        }
                    }
                    return '• Você precisa ser admin para usar este comando ❗'
                }
            }
        } catch (err) {
            await this.saveLogError(this.timeLog, err, message.chat.name, 'revokeLinkGroup()')
            return '• Erro ao revogar link do grupo, tente novamente ❗'
        }
    }

    async extractText(message, bot) {
        try {
            let image = await fs.readdir(pathMedia)
            for (let i = 0; i < image.length; i++) {
                let currentPath = `${pathMedia}/${image[i]}`
                await tesseract.recognize(currentPath, { lang: 'por' })
                    .then(async text => {
                        await bot.reply(message.chat.id, text, message.id)
                        await fs.unlink(currentPath)
                        return;
                    });
            }
        } catch (err) {
            await this.saveLogError(this.timeLog, err, message.chat.name, 'extractText()')
            return 'Erro ao extrair texto da imagem, tente novamente.'
        }
    }

    async getLinkGroup(message, bot) {
        let getLink;
        try {
            const participants = message.chat.groupMetadata.participants
            for (let i = 0; i < participants.length; i++) {
                const isAdmin = participants[i]['isAdmin']
                if (message.to === participants[i]['id']) {
                    if (isAdmin) {
                        console.log(isAdmin)
                        await bot.getGroupInviteLink(message.from)
                            .then(async link => {
                                if (typeof link === 'string') {
                                    getLink = link
                                }
                            });
                        return getLink
                    }
                    return '• O bot precisa ser admin para executar este comando ❗'
                }
            }
        } catch (err) {
            await this.saveLogError(this.timeLog, err, message.chat.name, 'getLinkGroup()')
            throw '• Erro ao capturar link do grupo, tente novamente ❗'
        }
    }

    async getOwner() {
        let readfile = await fs.readFile(pathOwner)
        const owner = JSON.parse(readfile)
        return owner[0];
    }

    async isOwner(author) {
        let readfile = await fs.readFile(pathOwner)
        const isOwner = JSON.parse(readfile)
        for (let owner of isOwner) {
            if (owner === author) return true
            return false
        }
    }

    async blockCommands(contact) {
        let readfile = await fs.readFile(pathCmd)
        const userBlock = JSON.parse(readfile)
        for (let users of userBlock) {
            if (users.contact === contact) {
                return `• ${contact} já está bloqueado!`
            }
        }
        userBlock.push({ contact: contact })
        await fs.writeFile(pathCmd, JSON.stringify(userBlock))
        return `• ${contact} bloqueado com sucesso!`
    }

    async isReact() {
        let readfile = await fs.readFile(pathReact)
        let outlet = JSON.parse(readfile)
        return outlet.includes(true)
    }

    async reactOnOf(outlet) {
        let _flag = outlet === 'disabled' ? false : true
        let _msgReact;
        try {
            let readfile = await fs.readFile(pathReact)
            let onReact = JSON.parse(readfile)
            onReact.filter(async (value, index, array) => {
                if (_flag === value) {
                    _msgReact = `* ➜ As Reações já estão ${value ? 'Ativadas' : 'Desativadas'}❗`
                    return;
                }
                array.splice(index, 1)
                array.push(_flag)
                await fs.writeFile(pathReact, JSON.stringify(array))
                return;
            });
            return _msgReact !== undefined ? _msgReact : _flag ? '* Reações ativadas! ✅' : '* Reações desativadas! ❌'
        } catch (err) {
            throw err
        }
    }

    async registerUsers(name, number, photo) {
        let readfile = await fs.readFile(pathRegister)
        const register = JSON.parse(readfile)
        for (let conct of register) {
            if (conct.contact === number) {
                return 'Você ja está cadastrado!'
            }
        }
        register.push(
            {
                name: name,
                contact: number,
                photo: photo,
            }
        )
        await fs.writeFile(pathRegister, JSON.stringify(register))
        return `• ${name} Registrado com sucesso ✅`
    }

    async isRegister(contact) {
        let readfile = await fs.readFile(pathRegister)
        const isRegister = JSON.parse(readfile)
        for (let user of isRegister) {
            if (contact === user.contact) return false;
        }
        return true;
    }

    async blockDm(author) {
        let readFile = await fs.readFile(pathBlockDm)
        const dm = JSON.parse(readFile)
        if (dm.includes(author)) return true
        dm.push(author)
        await fs.writeFile(pathBlockDm, JSON.stringify(dm))
        return;
    }

    async getHour() {
        const getDate = new Date()
        return `${String(getDate.getHours()).padStart(2, '0')}:${String(getDate.getMinutes()).padStart(2, '0')}`;
    }
    sendAdminsMentions(timers, nameGroup, getAdmins, getListAdmins) {
        return `------〘 _ADMINS MENCIONADOS_ 〙 ------\n\n \`\`\`[${timers}]\`\`\` ➣ *${nameGroup}*\n ➣ *${getAdmins.length} Admins*\n\n${getListAdmins.replace(/,/g, '')}`
    }
    sendRequestSticker(timers, notifyName) {
        return `\`\`\`[${timers}] - Solicitado por ${notifyName}\`\`\` \n\nAguarde...⌛`;
    }
    sendMetionAll(timers, grupo, total, listString) {
        return `------〘 _TODOS MENCIONADOS_ 〙 ------\n\n \`\`\`[${timers}]\`\`\` ➣ *${grupo}*\n ➣ *${total} Membros*\n\n${listString.replace(/,/g, '')}`
    }
    async hourLog() {
        const getDate = new Date()
        return `${getDate.getFullYear()}.${getDate.getMonth() >= 10 ? getDate.getMonth() + 1 : `0${getDate.getMonth() + 1}`}.${getDate.getDate() >= 10 ? getDate.getDate() : `0${getDate.getDate()}`} ${getDate.getHours() >= 10 ? getDate.getHours() : `0${getDate.getHours()}`}.${getDate.getMinutes() >= 10 ? getDate.getMinutes() : `0${getDate.getMinutes()}`}.${getDate.getSeconds() >= 10 ? getDate.getSeconds() : `0${getDate.getSeconds()}`}`
    }
}

exports.BotApiUtils = BotApiUtils