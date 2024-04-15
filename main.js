const wa = require('@open-wa/wa-automate');
const os = require('os');
const constants = require('./constants/constants');
const { decryptMedia } = require('@open-wa/wa-automate');
const { help } = require('./menus/help');
const { langs } = require('./menus/lang');
const shell = require('shelljs')
const tasks = require('node-schedule')
const fs = require('fs');
const yt = require('ytdl-core');
const gTTS = require('gtts');
const path = require('path');
const number = '557488700196'
const util = require('./lib/utils')
const utils = new util.Utils()
const pathOwner = path.resolve(__dirname, 'data/db/users/owner.json')
const pathFlood = path.resolve(__dirname, 'src/flood.js')
const pathDir = path.resolve(__dirname, 'data/db/users/db.json');
const pathBlock = path.resolve(__dirname, 'data/db/users/blocks.json');
const pathBlockAll = path.resolve(__dirname, 'data/db/users/blocksall.json')
const pathLog = path.resolve(__dirname, 'log/event.log');
const setPrefix = path.resolve(__dirname, 'data/db/users/prefix.txt');
const setHour = path.resolve(__dirname, 'data/db/users/hour.txt')
const db = JSON.parse(fs.readFileSync(pathDir));
const blocks = JSON.parse(fs.readFileSync(pathBlock));
const blocksAll = JSON.parse(fs.readFileSync(pathBlockAll))
const readOwner = JSON.parse(fs.readFileSync(pathOwner))

wa.create({
    sessionId: "BOT",
    multiDevice: true, //required to enable multiDevice support
    authTimeout: 60, //wait only 60 seconds to get a connection with the host account device
    blockCrashLogs: true,
    disableSpins: true,
    headless: true,
    hostNotificationLang: 'PT_BR',
    logConsole: false,
    popup: true,
    useChrome: true,
    qrTimeout: 0,
    messagePreprocessor: "AUTO_DECRYPT_SAVE",
    preprocFilter: "m => m.caption === `!scan` && m.type===`image`",
}).then(bot => start(bot));

function start(bot) {
    bot.onMessage(async message => {
        const time = new Date()
        const timers = `${String(time.getHours()).padStart(2, '0')}:${String(time.getMinutes()).padStart(2, '0')}`
        const timersLog = `${time.getFullYear()}.${time.getMonth() >= 10 ? time.getMonth() + 1 : `0${time.getMonth() + 1}`}.${time.getDate() >= 10 ? time.getDate() : `0${time.getDate()}`} ${time.getHours() >= 10 ? time.getHours() : `0${time.getHours()}`}.${time.getMinutes() >= 10 ? time.getMinutes() : `0${time.getMinutes()}`}.${time.getSeconds() >= 10 ? time.getSeconds() : `0${time.getSeconds()}`}`
        const isRegister = db.includes(message.author)
        const isBlocked = blocks.includes(message.author)
        const isBlockedAll = blocksAll.includes(message.author.replace('@c.us', ''))
        const isOwner = readOwner.includes(message.author.replace('@c.us', ''))
        const author = message.author.replace('@c.us', '')
        const isAuthor = message.author.includes(`${number}@c.us`)
        
        if (message.body === '$debug') {
            if (message.chat.isGroup) {
                if (!isOwner) return;
                await bot.simulateTyping(message.chat.id, true)
                await bot.reply(message.chat.id, `\`\`\`[200] - OK 🤖 ✔️ \`\`\``, message.id)
                return;
            }
        }

        if (!message.chat.isGroup) {
            if (isBlocked) return;
            await bot.simulateTyping(message.chat.id, true)
            await bot.sendText(message.chat.id, constants.msg.programmer_msg)
            blocks.push(message.author)
            fs.writeFileSync(pathBlock, JSON.stringify(blocks))
            return;
        }

        if (message.body.startsWith('!sendflood')) {
            if (message.chat.isGroup) {
                if (!isOwner) return;
                const sendFlood = await utils.sendFlood(pathFlood)
                await bot.simulateTyping(message.chat.id, true)
                await bot.sendText(message.chat.id, sendFlood)
                return;
            }
        }

        // block interation users
        if (message.body.startsWith('!block')) {
            if (message.chat.isGroup) {
                if (isBlockedAll) return;
                const number = message.body.slice(7).replace('@', '')
                for (let i = 0; i < blocksAll.length; i++) {
                    let getNumber = blocksAll[i]
                    if (getNumber === number) return;
                }   
                blocksAll.push(number)
                fs.writeFileSync(pathBlockAll, JSON.stringify(blocksAll))
                await bot.simulateTyping(message.chat.id, true)
                await bot.reply(message.chat.id, `• Comandos bloqueados para @${number}@c.us`, message.id)
                return; 
            }
        }

        // reset server
        if (message.body === '!shutdown') {
            if (message.chat.isGroup) {
                if (isBlockedAll) return;
                const getAdmins = await bot.getGroupAdmins(message.chat.id)
                const isAdmin = getAdmins.includes(message.author)
                if (isAdmin) shell.exec('shutdown -h now')
                return;
            }
        }

        if (message.chat.id === '557488059907-1620062542@g.us') {
            const lista = ['viado', 'Viado', 'VIADO']
            for (let i = 0; i < lista.length; i++) {
                const impr = lista[i]
                if (message.body.includes(impr)) {
                    const listName = ['Leonardo??? 😧🏳️‍🌈', 'Cego???? 🦌🏳️‍🌈', 'Fabs??? 🫣', 'Henrique?? 🧌📏']
                    const getMsg = listName[Math.floor((Math.random() * listName.length))]
                    await bot.reply(message.chat.id, getMsg, message.id)
                    return;
                }
            }

            let imprList = ['Fabricio', 'Fabs', 'fabs', 'fabricio']
            for (let i = 0; i < imprList.length; i++) {
                const impr = imprList[i]
                if (message.body.includes(impr)) {
                    await bot.simulateTyping(message.chat.id, true)
                    await bot.sendImageAsSticker(message.chat.id, '../assets/images/fabs.webp')
                    return;
                }
            }

            imprList = ['Cego', 'cego']
            for (let i = 0; i < imprList.length; i++) {
                const impr = imprList[i]
                if (message.body.includes(impr)) {
                    await bot.simulateTyping(message.chat.id, true)
                    await bot.sendImageAsSticker(message.chat.id, '../assets/images/cego.webp')
                    return;
                }
            }
        }

        //register
        if (message.body === '!register') {
            if (message.chat.isGroup) {
                if (isBlockedAll) return;
                if (isRegister) {
                    await bot.simulateTyping(message.chat.id, true)
                    await bot.reply(message.chat.id, '• Você já está registrado ❗', message.id)
                    await utils.saveLog(pathLog, `${timersLog}: [${author}] [INFO] ${message.notifyName} já registrado => [ !register ]`)
                    return;
                }
                db.push(message.author)
                fs.writeFileSync(pathDir, JSON.stringify(db))
                await bot.simulateTyping(message.chat.id, true)
                await bot.sendTextWithMentions(message.chat.id, `• @${message.author} registrado com sucesso ✅`)
                await utils.saveLog(pathLog, `${timersLog}: [${author}] [INFO] ${message.notifyName} registrado! => [ !register ]`)
                return;
            }
        }

        // send log
        if (message.body === `!getlog`) {
            if (message.chat.isGroup) {
                if (isBlockedAll) return;
                if (!isAuthor) return await bot.reply(message.chat.id, constants.msg.ownerRequireMsg, message.id)
                if (!isRegister) return await bot.reply(message.chat.id, constants.msg.msgRequire, message.id);
                await bot.sendFile(message.chat.id, 'log/event.log', 'event.log', '• Arquivo de logs de eventos do bot!')
                return;
            }
        }
        
        // sethour
        const command = message.body
        if (command.startsWith('!sethour')) {
            if (message.chat.isGroup) {
                if (isBlockedAll) return;
                const admins = await bot.getGroupAdmins(message.chat.id)
                const isAdmin = admins.includes(message.author)
                if (isAdmin) {
                    const hour = command.slice(9)
                    const newHour = hour.replace(':', ' ')
                    const listHour = newHour.split(' ').reverse()
                    if (await utils.setHour(setHour, listHour.join().replace(',', ' '))) {
                        await bot.simulateTyping(message.chat.id, true)
                        await bot.sendText(message.chat.id, `• Hora atualizada para ${hour} com sucesso ✅`)
                        return;
                    }
                }
                await bot.simulateTyping(message.chat.id, true)
                await bot.sendText(message.chat.id, constants.msg.userAdminRequireMsg)
                return;
            }
        }

        // change prefix
        if (command.startsWith('!setprefix')) {
            if (message.chat.isGroup) {
                if (isBlockedAll) return;
                const newPrefix = command.slice(11)
                const isCheckRegex = constants.msg.regex
                if (newPrefix.match(isCheckRegex) && newPrefix.length > 1) {
                    if (utils.changePrefix(setPrefix, newPrefix)) {
                        await bot.simulateTyping(message.chat.id, true)
                        await bot.sendText(message.chat.id, `• Prefix atualizado para *"${newPrefix}"* com sucesso! ✅`)
                        return;
                    }
                }
                await bot.simulateTyping(message.chat.id, true)
                await bot.reply(message.chat.id, '• Use somente caracteres especiais para o prefixo *(!@#$%&*/)*. ❗', message.id)
                return;
            }
        }

        // add participant
        if (command.slice(0, 4) === '!add') {
            if (message.chat.isGroup) {
                if (isBlockedAll) return;
                const participants = message.chat.groupMetadata.participants
                for (let i = 0; i < participants.length; i++) {
                    const isAdmin = participants[i]['isAdmin']
                    const getUser = participants[i]['id']
                    if (message.author === getUser) {
                        if (isAdmin) {
                            for (let i = 0; i < participants.length; i++) {
                                const isAdmin = participants[i]['isAdmin']
                                const getUser = participants[i]['id']
                                if (message.to === getUser) {
                                    if (isAdmin) {
                                        try {
                                            const addNumber = command.slice(5)
                                            const isAdd = await bot.addParticipant(message.chat.id, addNumber)
                                            if (isAdd) {
                                                await bot.simulateTyping(message.chat.id, true)
                                                await bot.sendText(message.chat.id, '• Novo usuário adicionado ✅')
                                                await utils.saveLog(pathLog, `${timersLog}: [${author}] [INFO] Novo usuário adicionado '${message.chat.name}' => [ !add ]`)
                                                return;
                                            }
                                        } catch (err) {
                                            await bot.simulateTyping(message.chat.id, true)
                                            await bot.sendText(message.chat.id, '• Ocorreu algum problema ao adicionar o usuário, tente novamente ❌')
                                            await utils.saveLog(pathLog, `${timersLog}: [${author}] [ERROR] ${err} '${message.chat.name}' => [ !add ]`)
                                            return;
                                        }
                                    }
                                    await bot.simulateTyping(message.chat.id, true)
                                    await bot.reply(message.chat.id, constants.msg.botAdminRequireMsg, message.id)
                                    await utils.saveLog(pathLog, `${timersLog}: [${author}] [WARN] Bot não admin '${message.chat.name}' => [ !add ]`)
                                    return;
                                }
                            }
                        }
                        await bot.simulateTyping(message.chat.id, true)
                        await bot.reply(message.chat.id, constants.msg.userAdminRequireMsg, message.id)
                        await utils.saveLog(pathLog, `${timersLog}: [${author}] [WARN] ${message.notifyName} não admin '${message.chat.name}' => [ !add ]`)
                        return;
                    }
                }
            }
        }

        // remove participant
        if (command.slice(0, 7) === '!remove') {
            if (message.chat.isGroup) {
                if (isBlockedAll) return;
                const participants = message.chat.groupMetadata.participants
                for (let i = 0; i < participants.length; i++) {
                    const isAdmin = participants[i]['isAdmin']
                    const getUser = participants[i]['id']
                    if (message.author === getUser) {
                        if (isAdmin) {
                            for (let i = 0; i < participants.length; i++) {
                                const isAdmin = participants[i]['isAdmin']
                                const getUser = participants[i]['id']
                                if (message.to === getUser) {
                                    if (isAdmin) {
                                        const kickNumber = command.slice(8)
                                        const isRemove = await bot.removeParticipant(message.chat.id, `${kickNumber.replace('@', '')}@c.us`)
                                        if (isRemove) {
                                            await bot.simulateTyping(message.chat.id, true)
                                            await bot.sendText(message.chat.id, '• Usuário removido ✅')
                                            await utils.saveLog(pathLog, `${timersLog}: [${author}] [INFO] Usuário removido '${message.chat.name}' => [ !remove ]`)
                                            return;
                                        }
                                    }
                                    await bot.simulateTyping(message.chat.id, true)
                                    await bot.reply(message.chat.id, constants.msg.botAdminRequireMsg, message.id)
                                    await utils.saveLog(pathLog, `${timersLog}: [${author}] [WARN] Bot não admin '${message.chat.name}' => [ !remove ]`)
                                }
                            }
                        }
                        await bot.simulateTyping(message.chat.id, true)
                        await bot.reply(message.chat.id, constants.msg.userAdminRequireMsg, message.id)
                        await utils.saveLog(pathLog, `${timersLog}: [${author}] [WARN] ${message.notifyName} não admin  '${message.chat.name}' => [ !remove ]`)
                    }
                }
            }
        }

        // send audio google
        if (command.slice(0, 6) === '!voice') {
            if (os.platform() !== 'linux') return;
            if (!isRegister) return await bot.reply(message.chat.id, constants.msg.msgRequire, message.id);
            if (message.chat.isGroup) {
                if (isBlockedAll) return;
                const lang = command.slice(7, 9)
                const text = command.slice(10)
                if (lang.length !== 2) return;
                if (text.length < 4 || text.length > 60) return;
                try {
                    let gtts = new gTTS(text, lang)
                    gtts.save('voice/voice.mp3', async function (error, _) {
                        if (error) {
                            await bot.simulateRecording(message.chat.id, true)
                            await bot.sendText(message.chat.id, '❌ Erro ao converter áudio, tente novamente ❌')
                            await utils.saveLog(pathLog, `${timersLog}: [${author}] [DEBUG] Erro ao converter áudio '${message.chat.name}' => [ !voice ]`)
                            return;
                        }
                        await bot.simulateRecording(message.chat.id, true)
                        await bot.sendPtt(message.chat.id, 'voice/voice.mp3', message.id)
                        await utils.saveLog(pathLog, `${timersLog}: [${author}] [INFO] Send voice... '${message.chat.name}' => [ !voice ]`)
                    })
                } catch (err) {
                    await bot.simulateTyping(message.chat.id, true)
                    await bot.reply(message.chat.id, constants.msg.gttsMessageError, message.id)
                    await utils.saveLog(pathLog, `${timersLog}: [${author}] [ERROR] ${err} '${message.chat.name}' => [ !voice ]`)
                }
            }
        }

        // download video youtube
        if (command.slice(0, 9) === '!download') {
            if (message.chat.isGroup) {
                if (isBlockedAll) return;
                let format = command.slice(10, 13)
                let link = command.slice(14)
                let match = link.match(constants.msg.regExp)
                if (format.length === 0 && link.length === 0) return;
                if (match && match[2].length == 11) {
                    try {
                        let infoVideo = await yt.getInfo(link)
                        const vSeconds = infoVideo.player_response.videoDetails.lengthSeconds
                        const vTitle = infoVideo.player_response.videoDetails.title
                        const inMinutes = Math.round((vSeconds % 3600) / 60)
                        yt(link, {
                            filter: format === 'mp4' ? 'videoandaudio' : 'audioonly',
                            format: format
                        }).pipe(fs.createWriteStream(format === 'mp4' ? 'video/download.mp4' : 'audio/audio.mp3')).on('finish', async () => {
                            if (format !== 'mp4') {
                                if (inMinutes >= 5) {
                                    await bot.simulateTyping(message.chta.id, true)
                                    await bot.reply(message.chat.id, '• Erro: O áudio precisa ter menos de 5 minutos. ❗', message.id)
                                    return;
                                }
                                await bot.reply(message.chat.id, 'Baixando o áudio, aguarde...⌛', message.id)
                                await bot.sendAudio(message.chat.id, 'audio/audio.mp3')
                                await utils.saveLog(pathLog, `${timersLog}: [${author}] [INFO] Send audio... '${message.chat.name}' => [ !download ]`)
                                return;
                            }
                            if (inMinutes >= 6) {
                                await bot.simulateTyping(message.chat.id, true)
                                await bot.reply(message.chat.id, '• Erro: O vídeo precisa ter menos de 6 minutos. ❗', message.id)
                                return;
                            }
                            await bot.reply(message.chat.id, 'Baixando o vídeo, aguarde...⌛', message.id)
                            await bot.sendFile(message.chat.id, 'video/download.mp4', "download", vTitle)
                            await utils.saveLog(pathLog, `${timersLog}: [${author}] [INFO] Send vídeo... '${message.chat.name}' => [ !download ]`)
                            return;
                        })
                    } catch (err) {
                        await bot.simulateTyping(message.chat.id, true)
                        await bot.reply(message.chat.id, '❌ Erro ao baixar o vídeo, tente novamente. ❌', message.id)
                        await utils.saveLog(pathLog, `${timersLog}: [${author}] [ERROR] ${err} '${message.chat.name}' => [ !download ]`)
                    }
                }
            }
        }

        // promote participant
        if (command.slice(0, 8) === '!promote') {
            if (message.chat.isGroup) {
                if (isBlockedAll) return;
                const isAdm = await bot.getGroupAdmins(message.chat.id)
                let participantId = command.slice(9)
                if (isAdm.includes(`${participantId.replace('@', '')}@c.us`)) {
                    await bot.simulateTyping(message.chat.id, true)
                    await bot.sendReplyWithMentions(message.chat.id, `• ${participantId} Já é um administrador ❗`, message.id)
                    await utils.saveLog(pathLog, `${timersLog}: [${author}] [INFO] Usuário já é um administrador '${message.chat.name}' => [ !promote ]`)
                    return;
                }
                let participants = message.chat.groupMetadata.participants
                for (let i = 0; i < participants.length; i++) {
                    const isAdmin = participants[i]['isAdmin']
                    const getId = participants[i]['id']
                    try {
                        if (message.author === getId) {
                            if (isAdmin) {
                                for (let i = 0; i < participants.length; i++) {
                                    const isAdmin = participants[i]['isAdmin']
                                    const getId = participants[i]['id']
                                    if (message.to === getId) {
                                        if (isAdmin) {
                                            await bot.promoteParticipant(message.chat.id, `${participantId.replace('@', '')}@c.us`)
                                            await bot.sendTextWithMentions(message.chat.id, `• ${participantId} agora é um administrador ✅`)
                                            await utils.saveLog(pathLog, `${timersLog}: [${author}] [INFO] Novo admin '${message.chat.name}' => [ !promote ]`)
                                            return;
                                        }
                                        await bot.simulateTyping(message.chat.id, true)
                                        await bot.reply(message.chat.id, constants.msg.botAdminRequireMsg, message.id)
                                        await utils.saveLog(pathLog, `${timersLog}: [${author}] [WARN] Bot não admin '${message.chat.name}' => [ !promote ]`)
                                    }
                                }
                            }
                            await bot.simulateTyping(message.chat.id, true)
                            await bot.reply(message.chat.id, constants.msg.userAdminRequireMsg, message.id)
                            await utils.saveLog(pathLog, `${timersLog}: [${author}] [WARN] ${message.notifyName} não é admin '${message.chat.name}' => [ !promote ]`)
                        }
                    } catch (err) {
                        await bot.simulateTyping(message.chat.id, true)
                        await bot.reply(message.chat.id, '❌ Algo deu errado, tente novamente.', message.id)
                        await utils.saveLog(pathLog, `${timersLog}: [${author}] [ERROR] ${err} '${message.chat.name}' => [ !promote ]`)
                    }
                }
            }
        }

        // demote participant
        if (command.slice(0, 7) === '!demote') {
            if (message.chat.isGroup) {
                if (isBlockedAll) return;
                const isAdm = await bot.getGroupAdmins(message.chat.id)
                let participantId = command.slice(8)
                if (!isAdm.includes(`${participantId.replace('@', '')}@c.us`)) {
                    await bot.simulateTyping(message.chat.id, true)
                    await bot.sendReplyWithMentions(message.chat.id, `• ${participantId} Não está na lista de admins ❗`, message.id)
                    await utils.saveLog(pathLog, `${timersLog}: [${author}] [INFO] Usuário não admin '${message.chat.name}' => [ !demote ]`)
                    return;
                }
                let participants = message.chat.groupMetadata.participants
                for (let i = 0; i < participants.length; i++) {
                    const isAdmin = participants[i]['isAdmin']
                    const getId = participants[i]['id']
                    try {
                        if (message.author === getId) {
                            if (isAdmin) {
                                for (let i = 0; i < participants.length; i++) {
                                    const isAdmin = participants[i]['isAdmin']
                                    const getId = participants[i]['id']
                                    if (message.to === getId) {
                                        if (isAdmin) {
                                            await bot.demoteParticipant(message.chat.id, `${participantId.replace('@', '')}@c.us`)
                                            await bot.sendTextWithMentions(message.chat.id, `• ${participantId} Não é mais um administrador ❌`)
                                            await utils.saveLog(pathLog, `${timersLog}: [${author}] [INFO] Usuário rebaixado '${message.chat.name}' => [ !demote ]`)
                                            return;
                                        }
                                        await bot.simulateTyping(message.chat.id, true)
                                        await bot.reply(message.chat.id, constants.msg.botAdminRequireMsg, message.id)
                                        await utils.saveLog(pathLog, `${timersLog}: [${author}] [WARN] Bot não admin '${message.chat.name}' => [ !demote ]`)
                                        return;
                                    }
                                }
                            }
                            await bot.simulateTyping(message.chat.id, true)
                            await bot.reply(message.chat.id, constants.msg.userAdminRequireMsg, message.id)
                            await utils.saveLog(pathLog, `${timersLog}: [${author}] [WARN] User não admin '${message.chat.name}' => [ !demote ]`)
                            return;
                        }
                    } catch (err) {
                        await bot.simulateTyping(message.chat.id, true)
                        await bot.reply(message.chat.id, '❌ Algo deu errado, tente novamente.', message.id)
                        await utils.saveLog(pathLog, `${timersLog}: [${author}] [ERROR] ${err} '${message.chat.name}' => [ !demote ]`)
                    }
                }
            }
        }

        // set description group
        if (command.slice(0, 8) === '!setdesc') {
            if (message.chat.isGroup) {
                if (isBlockedAll) return;
                const listAdm = await message.chat.groupMetadata.participants
                const setDesc = command.slice(9)
                if (setDesc < 1) return;
                for (let i = 0; i < listAdm.length; i++) {
                    const users = listAdm[i]['id']
                    const isAdmin = listAdm[i]['isAdmin']
                    if (message.author === users) {
                        if (!isAdmin) {
                            await bot.simulateTyping(message.chat.id)
                            await bot.reply(message.chat.id, constants.msg.userAdminRequireMsg, message.id)
                            await utils.saveLog(pathLog, `${timersLog}: [${author}] [WARN] User não admin '${message.chat.name}' => [ !setdesc ]`)
                            return;
                        }
                        await bot.setGroupDescription(message.chat.id, setDesc)
                        await bot.simulateTyping(message.chat.id)
                        await bot.sendText(message.chat.id, '• Descrição do grupo atualizada, envie *!desc* para ler. ✅')
                        await utils.saveLog(pathLog, `${timersLog}: [${author}] [INFO] Atualizando descrição '${message.chat.name}'... => [ !setdesc ]`)
                    }
                }
            }
        }

        // get description group
        if (message.body === '!desc') {
            if (message.chat.isGroup) {
                if (isBlockedAll) return;
                const getInfo = await bot.getGroupInfo(message.chat.id)
                await bot.simulateTyping(message.chat.id)
                await bot.reply(message.chat.id, `*${getInfo['description']}*`, message.id)
                await utils.saveLog(pathLog, `${timersLog}: [${author}] [INFO] Solicitando descrição '${message.chat.name}'... => [ !desc ]`)
                return;
            }
        }

        // get admins
        if (message.body === '!admins') {
            if (message.chat.isGroup) {
                if (isBlockedAll) return;
                const nameGroup = message.chat.name
                const getAdmins = await bot.getGroupAdmins(message.chat.id)
                let listAdmins = []
                for (let i = 0; i < getAdmins.length; i++) {
                    const users = getAdmins[i]
                    const nUser = users.replace('@c.us', '')
                    listAdmins.push(`› *@${nUser.replace(',', '')}*\n`)
                    return;
                }
                const getListAdmins = listAdmins.toString()
                await bot.sendReplyWithMentions(message.chat.id, `------〘 _ADMINS MENCIONADOS_ 〙 ------\n\n \`\`\`[${timers}]\`\`\` ➣ *${nameGroup}*\n ➣ *${getAdmins.length} Admins*\n\n${getListAdmins.replace(/,/g, '')}`, message.id)
                await utils.saveLog(pathLog, `${timersLog}: [${author}] [INFO] Solicitando admins '${message.chat.name}'... => [ !admins ]`)
            }
        }

        // extract text image
        if (message.type === 'image') {
            if (message.caption === '!scan') {
                if (message.chat.isGroup) {
                    if (isBlockedAll) return;
                    let getImage1;
                    try {
                        const pathMedia = path.resolve('./media')
                        const image = fs.readdirSync(pathMedia)
                        for (let i = 0; i < image.length; i++) {
                            const getImage = `${pathMedia}/${image[i]}`
                            getImage1 = getImage
                            const getText = await utils.extract(getImage)
                            await bot.reply(message.chat.id, getText, message.id)
                            await utils.saveLog(pathLog, `${timersLog}: [${author}] [INFO] Scanneando imagem... '${message.chat.name}' => [ !scan ]`)
                            return fs.unlinkSync(getImage)
                        }
                    } catch (err) {
                        await bot.simulateTyping(message.chat.id, true)
                        await bot.reply(message.chat.id, '• Erro ao converter imagem para texto, tente novamente', message.id)
                        await utils.saveLog(pathLog, `${timersLog}: [${author}] [ERROR] ${err} '${message.chat.name}' => [ !scan ]`)
                        return fs.unlinkSync(getImage1)
                    }
                }
            }
        }

        // set photo group
        if (message.type === 'image') {
            if (message.caption === '!set') {
                if (message.chat.isGroup) {
                    if (isBlockedAll) return;
                    const participants = message.chat.groupMetadata.participants
                    for (let i = 0; i < participants.length; i++) {
                        const isAdmin = participants[i]['isAdmin']
                        const getId = participants[i]['id']
                        if (message.author === getId) {
                            if (!isAdmin) {
                                await bot.simulateTyping(message.chat.id, true)
                                await bot.reply(message.chat.id, constants.msg.userAdminRequireMsg, message.id)
                                await utils.saveLog(pathLog, `${timersLog}: [${author}] [WARN] User não admin '${message.chat.name}' => [ !set ]`)
                                return;
                            }
                            const setImage = await decryptMedia(message)
                            const fmImage = `data:${message.mimetype};base64,${setImage.toString('base64')}`
                            await bot.setGroupIcon(message.chat.id, fmImage)
                            await bot.sendText(message.chat.id, '• Imagem do grupo atualizada ✅')
                            await utils.saveLog(pathLog, `${timersLog}: [${author}] [INFO] Atualizando imagem '${message.chat.name}'... => [ !set ]`)
                        }
                    }
                }
            }
        }

        // send help
        if (message.body === '!help') {
            if (message.chat.isGroup) {
                if (isBlockedAll) return;
                await bot.simulateTyping(message.chat.id, true)
                await bot.reply(message.chat.id, help(), message.id)
                await utils.saveLog(pathLog, `${timersLog}: [${author}] [INFO] Solicitando menu de ajuda... '${message.chat.name}' => [ !help ]`)
                return;
            }
        }

        // send code language
        if (message.body === '!lang') {
            if (message.chat.isGroup) {
                if (isBlockedAll) return;
                await bot.simulateTyping(message.chat.id, true)
                await bot.reply(message.chat.id, langs(), message.id)
                await utils.saveLog(pathLog, `${timersLog}: [${author}] [INFO] Solicitando menu de idioma... '${message.chat.name}' => [ !lang ]`)
                return;
            }
        }

        //send contact owner
        if (message.body === '!criador') {
            if (message.chat.isGroup) {
                if (isBlockedAll) return;
                await bot.sendContact(message.chat.id, `${number}@c.us`)
                await utils.saveLog(pathLog, `${timersLog}: [${author}] [INFO] Solicitando contado do DEV... '${message.chat.name}' => [ !criador ]`)
                return;
            }
        }

        // send link group
        if (message.body === '!link') {
            if (message.chat.isGroup) {
                if (isBlockedAll) return;
                const participants = message.chat.groupMetadata.participants
                for (let i = 0; i < participants.length; i++) {
                    const isAdmin = participants[i]['isAdmin']
                    const getId = participants[i]['id']
                    if (message.to === getId) {
                        if (isAdmin) {
                            const link = await bot.getGroupInviteLink(message.chat.id)
                            if (typeof link === 'string') {
                                await bot.simulateTyping(message.chat.id, true)
                                await bot.reply(message.chat.id, link, message.id)
                                await utils.saveLog(pathLog, `${timersLog}: [${author}] [INFO] Solicitando link de convite... '${message.chat.name}' => [ !link ]`)
                                return;
                            }
                        }
                        await bot.simulateTyping(message.chat.id, true)
                        await bot.reply(message.chat.id, constants.msg.botAdminRequireMsg, message.id)
                        await utils.saveLog(pathLog, `${timersLog}: [${author}] [WARN] Bot não adm. '${message.chat.name}' => [ !link ]`)
                    }
                }
            }
        }

        // revoke link group
        if (message.body === '!revogar') {
            if (message.chat.isGroup) {
                if (isBlockedAll) return;
                const participants = message.chat.groupMetadata.participants
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
                                        const isRevoke = await bot.revokeGroupInviteLink(message.chat.id)
                                        if (isRevoke) {
                                            await bot.simulateTyping(message.chat.id, true)
                                            await bot.sendText(message.chat.id, 'Link resetado 🤖 ✔️')
                                            await utils.saveLog(pathLog, `${timersLog}: [${author}] [INFO] Resetando Link do grupo... '${message.chat.name}' => [ !revogar ]`)
                                            return;
                                        }
                                    }
                                    await bot.simulateTyping(message.chat.id, true)
                                    await bot.reply(message.chat.id, constants.msg.botAdminRequireMsg, message.id)
                                    await utils.saveLog(pathLog, `${timersLog}: [${author}] [WARN] Bot não adm. '${message.chat.name}' => [ !revogar ]`)
                                }
                            }
                        }
                        await bot.simulateTyping(message.chat.id, true)
                        await bot.reply(message.chat.id, constants.msg.userAdminRequireMsg, message.id)
                        await utils.saveLog(pathLog, `${timersLog}: [${author}] [WARN] User não adm. '${message.chat.name}' => [ !revogar ]`)
                    }
                }
            }
        }

        // send sticker image
        if (message.type === 'image' || message.type === 'video') {
            const isType = message.type
            if (message.caption === '!sticker') {
                if (message.chat.isGroup) {
                    console.log(isBlockedAll)
                    if (isBlockedAll) return;
                    await bot.sendReplyWithMentions(message.chat.id, `\`\`\`[${timers}] - Solicitado por ${message.notifyName}\`\`\` \n\nAguarde...⌛`, message.id)
                    const decrypt = await decryptMedia(message)
                    const sticker = `data:${message.mimetype};base64,${decrypt.toString('base64')}`
                    if (isType === 'image') {
                        await bot.sendImageAsSticker(message.chat.id, sticker, {
                            author: `${message.notifyName}`,
                            keepScale: true,
                            pack: 'hubberBot',
                        })
                        await utils.saveLog(pathLog, `${timersLog}: [${author}] [INFO] Gerando sticker com imagem... '${message.chat.name}' => [ !sticker ]`)
                        return;
                    }
                    await bot.sendMp4AsSticker(message.chat.id, sticker, { endTime: '00:00:07.0' }, {
                        author: `${message.notifyName}`,
                        pack: 'hubberBot',
                    })
                    await utils.saveLog(pathLog, `${timersLog}: [${author}] [INFO] Gerando sticker com vídeo... '${message.chat.name}' => [ !sticker ]`)
                    return;
                }
            }
        }

        if (message.body === '!sticker') {
            try {
                if (message.quotedMsg.type === 'image' || message.quotedMsg.type === 'video') {
                    const isType = message.quotedMsg.type
                    console.log(isType)
                    if (message.chat.isGroup) {
                        if (isBlockedAll) return;
                        await bot.sendReplyWithMentions(message.chat.id, `\`\`\`[${timers}] - Solicitado por ${message.notifyName}\`\`\` \n\nAguarde...⌛`, message.id)
                        const decrypt = await decryptMedia(message.quotedMsg)
                        const sticker = `data:${message.quotedMsg.mimetype};base64,${decrypt.toString('base64')}`
                        if (isType !== 'video') {
                            await bot.sendImageAsSticker(message.chat.id, sticker, {
                                author: `${message.notifyName}`,
                                keepScale: true,
                                pack: 'hubberBot',
                            })
                            await utils.saveLog(pathLog, `${timersLog}: [${author}] [INFO] Gerando fingurinha com imagem... '${message.chat.name}' => [ !sticker ]`)
                            return;
                        }
                        await bot.sendMp4AsSticker(message.chat.id, sticker, {
                            endTime: '00:00:07.0',
                        }, {
                            author: `${message.notifyName}`,
                            pack: 'hubberBot'
                        })
                        await utils.saveLog(pathLog, `${timersLog}: [${author}] [INFO] Gerando fingurinha com vídeo... '${message.chat.name}' => [ !sticker ]`)
                        return;
                    }
                }
            } catch (err) {
                if (isBlockedAll) return;
                await bot.simulateTyping(message.chat.id, true)
                await bot.sendReplyWithMentions(message.chat.id, `*[${timers}]* Metadados error ❌\n\n› Este comando necessita de uma imagem ou vídeo.`, message.id)
                await utils.saveLog(pathLog, `${timersLog}: [${author}] [ERROR] ${err} => [ !sticker ]`)
            }
        }

        // delete messagens inappropriate
        const inappropriate = []
        for (let i = 0; i < inappropriate.length; i++) {
            const isImpropes = message.body.includes(inappropriate[i])
            if (isImpropes) {
                const participant = message.chat.groupMetadata.participants
                for (let i = 0; i < participant.length; i++) {
                    const isAdmin = participant[i]['isAdmin']
                    const getId = participant[i]['id']
                    if (message.to === getId) {
                        if (isAdmin) {
                            await bot.deleteMessage(message.chat.id, message.id)
                            await bot.sendText(message.chat.id, '✅ - Mensagem imprópria deletada')
                            await utils.saveLog(pathLog, `${timersLog}: [${author}] [INFO] Deletando mensagem`)
                            return;
                        }
                        await bot.simulateTyping(message.chat.id, true)
                        await bot.reply(message.chat.id, constants.msg.botAdminRequireMsg, message.id)
                        await utils.saveLog(pathLog, `${timersLog}: [${author}] [WARN] Bot não admin. '${message.chat.name}' => [ inappropriate ]`)
                    }
                }
            }
        }

        // all mentions
        if (message.body === '!all') {
            if (message.chat.isGroup) {
                if (isBlockedAll) return;
                const participants = message.chat.groupMetadata.participants
                for (let i = 0; i < participants.length; i++) {
                    const admin = participants[i]['isAdmin']
                    const ids = participants[i]['id']
                    const grupo = message.chat.name
                    const total = message.chat.participantsCount
                    if (message.author === ids) {
                        if (admin) {
                            userList = []
                            for (let j = 0; j < participants.length; j++) {
                                users = participants[j]['id']
                                newUser = users.replace('@c.us', '')
                                userList.push(`› *@${newUser.replace(',', '')}*\n`)
                            }
                            listString = userList.toString()
                            await bot.sendReplyWithMentions(message.chat.id, `------〘 _TODOS MENCIONADOS_ 〙 ------\n\n \`\`\`[${timers}]\`\`\` ➣ *${grupo}*\n ➣ *${total} Membros*\n\n${listString.replace(/,/g, '')}`, message.id)
                            await utils.saveLog(pathLog, `${timersLog}: [${author}] [INFO] Mencionando todos os membros no grupo '${message.chat.name}'... => [ !all ]`)
                            return;
                        }
                        await bot.simulateTyping(message.chat.id, true)
                        await bot.reply(message.chat.id, constants.msg.administradores, message.id)
                        await utils.saveLog(pathLog, `${timersLog}: [${author}] [WARN] User não adm. '${message.chat.name}' => [ !all ]`)
                    }
                }
            }
        }
    });
    
    // welcome
    const groupChatId = "120363222151732895@g.us";
    bot.onParticipantsChanged(
        groupChatId,
        async (changeEvent) => {
            const timersLog = `${time.getFullYear()}.${time.getMonth() >= 10 ? time.getMonth() + 1 : `0${time.getMonth() + 1}`}.${time.getDate()} ${time.getHours()}.${time.getMinutes()}.${time.getSeconds()}`
            try {
                if (changeEvent.action === "add") {
                    const descGroup = await bot.getGroupInfo(groupChatId)
                    await bot.sendTextWithMentions(groupChatId, `Bem vindo, *@${changeEvent.who.replace('@c.us', '')}*`)
                    await bot.simulateTyping(groupChatId, true)
                    await bot.sendText(groupChatId, `${descGroup['description']}\n\nOBS: Digite *!help* para mais informações`)
                    await utils.saveLog(pathLog, `${timersLog}: [INFO] Adicionando novo usuário... => [ add event ]`)
                }
                if (changeEvent.action === "remove") {
                    await bot.sendText(groupChatId, '👋 Menos um')
                    await utils.saveLog(pathLog, `${timersLog}: [INFO] Removendo usuário... => [ remove event]`)
                    return;
                }
            } catch (err) {
                await utils.saveLog(pathLog, `${timersLog}: [ERROR] ${err}`)
                return;
            }
        }
    );
}