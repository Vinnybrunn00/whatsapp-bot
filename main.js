const wa = require('@open-wa/wa-automate');
const { decryptMedia } = require('@open-wa/wa-automate');
const { setTimeout } = require('timers/promises');
const { help } = require('./menus/help')
const { langs } = require('./menus/lang')
const tesseract = require('node-tesseract-ocr')
const fs = require('fs')
const yt = require('ytdl-core')
const gTTS = require('gtts')
const path = require('path')
const number = '557488700196'
const pathDir = path.resolve(__dirname, './data/db/users/db.json')
const pathBlock = path.resolve(__dirname, './data/db/users/blocks.json')
const db = JSON.parse(fs.readFileSync(pathDir))
const blocks = JSON.parse(fs.readFileSync(pathBlock))
const programmer_msg = `*❗ Mensagem do Desenvolvedor* ❗\n\n "Comandos ou mensagens não funcionam no privado, crie grupos com o bot para usa-los"`
const administradores = '❗ Apenas administradores são autorizados a usar este comando. ❗'
const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=|\?v=)([^#\&\?]*).*/
const gttsMessageError = `❌ Lingua não reconhecida, tente: \n›• !audio --pt frase ou \`\`\`!lang \`\`\``
const userAdminRequireMsg = '• Você precisa ser admin para usar este comando ❗'
const msgRequire = '❌ Você precisa se registrar primeiro antes de usar este comando! ❌'
const botAdminRequireMsg = '• O bot precisa ser admin para executar este comando ❗'

wa.create({
    sessionId: "COVID_HELPER",
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
    preprocFilter: "m=> m.caption===`!scan` && m.type===`image`"
}).then(bot => start(bot));

const extract = async (img) => {
    if (img) {
        const text = await tesseract.recognize(img, { lang: "por" })
        return text
    }
    return false
}

function start(bot) {
    bot.onMessage(async message => {
        console.log(message.body)
        const time = new Date()
        const timers = `${String(time.getHours()).padStart('2', '0')}:${String(time.getMinutes()).padStart('2', '0')}`
        const isRegister = db.includes(message.author)
        const isBlocked = blocks.includes(message.author)
        try {
            if (message.body === '$debug') {
                if (message.author === `${number}@c.us`) {
                    await bot.simulateTyping(message.chat.id, true)
                    await bot.reply(message.chat.id, `\`\`\`[200] - OK 🤖 ✔️ \`\`\``, message.id)
                }
            }

            if (!message.chat.isGroup) {
                if (isBlocked) return;
                await bot.simulateTyping(message.chat.id, true)
                await bot.sendText(message.chat.id, programmer_msg)
                blocks.push(message.author)
                fs.writeFileSync(pathBlock, JSON.stringify(blocks))
                return;
            }

            //register
            if (message.body === '!register') {
                if (message.chat.isGroup) {
                    if (isRegister) {
                        await bot.simulateTyping(message.chat.id, true)
                        await bot.reply(message.chat.id, '• Você já está registrado ❗', message.id)
                        return;
                    }
                    db.push(message.author)
                    fs.writeFileSync(pathDir, JSON.stringify(db))
                    await bot.sendTextWithMentions(message.chat.id, `• @${message.author} registrado com sucesso ✅`)
                }
            }

            // add participant
            let command = message.body
            if (command.slice(0, 4) === '!add') {
                if (message.chat.isGroup) {
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
                                                    return;
                                                }
                                            } catch {
                                                await bot.simulateTyping(message.chat.id, true)
                                                await bot.sendText(message.chat.id, '• Ocorreu algum problema ao adicionar o usuário, tente novamente ❌')
                                                return;
                                            }
                                        }
                                        await bot.simulateTyping(message.chat.id, true)
                                        await bot.reply(message.chat.id, botAdminRequireMsg, message.id)
                                        return;
                                    }
                                }
                            }
                            await bot.simulateTyping(message.chat.id, true)
                            await bot.reply(message.chat.id, userAdminRequireMsg, message.id)
                            return;
                        }
                    }
                }
            }

            // remove participant
            if (command.slice(0, 7) === '!remove') {
                if (message.chat.isGroup) {
                    const participants = message.chat.groupMetadata.participants
                    for (i = 0; i < participants.length; i++) {
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
                                                return;
                                            }
                                        }
                                        await bot.simulateTyping(message.chat.id, true)
                                        await bot.reply(message.chat.id, botAdminRequireMsg, message.id)
                                    }
                                }
                            }
                            await bot.simulateTyping(message.chat.id, true)
                            await bot.reply(message.chat.id, userAdminRequireMsg, message.id)
                        }
                    }
                }
            }

            // send audio google
            if (command.slice(0, 6) === '!audio') {
                if (!isRegister) return await bot.reply(message.chat.id, msgRequire, message.id);
                if (message.chat.isGroup) {
                    const lang = command.slice(7, 9)
                    const text = command.slice(10)
                    if (lang.length !== 2) return;
                    if (text.length < 4 || text.length > 45) return;
                    try {
                        let gtts = new gTTS(text, lang)
                        gtts.save('audio.mp3', async function (error, _) {
                            if (error) {
                                await bot.simulateRecording(message.chat.id, true)
                                await bot.sendText(message.chat.id, '❌ Erro ao converter áudio, tente novamente ❌')
                                return;
                            }
                            await bot.simulateRecording(message.chat.id, true)
                            await bot.sendPtt(message.chat.id, 'audio.mp3', message.id)
                        })
                    } catch {
                        await bot.simulateTyping(message.chat.id, true)
                        await bot.reply(message.chat.id, gttsMessageError, message.id)
                    }
                }
            }

            // download video youtube
            if (command.slice(0, 9) === '!download') {
                if (message.chat.isGroup) {
                    let link = command.slice(10)
                    let match = link.match(regExp)
                    if (match && match[2].length == 11) {
                        try {
                            yt(link, { filter: 'videoandaudio', format: "mp4" }).pipe(fs.createWriteStream('download.mp4')).on('finish', async () => {
                                await bot.sendFile(message.chat.id, 'download.mp4', "download", 'video')
                            })
                        } catch (err) {
                            await bot.simulateTyping(message.chat.id, true)
                            await bot.reply(message.chat.id, '❌ Erro ao baixar o vídeo, tente novamente. ❌', message.id)
                        }
                    }
                }
            }

            // promote participant
            if (command.slice(0, 8) === '!promote') {
                if (message.chat.isGroup) {
                    const isAdm = await bot.getGroupAdmins(message.chat.id)
                    let participantId = command.slice(9)
                    if (isAdm.includes(`${participantId.replace('@', '')}@c.us`)) {
                        await bot.simulateTyping(message.chat.id, true)
                        await bot.sendReplyWithMentions(message.chat.id, `• ${participantId} Já é um administrador ❗`, message.id)
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
                                                return;
                                            }
                                            await bot.simulateTyping(message.chat.id, true)
                                            await bot.reply(message.chat.id, botAdminRequireMsg, message.id)
                                        }
                                    }
                                }
                                await bot.simulateTyping(message.chat.id, true)
                                await bot.reply(message.chat.id, userAdminRequireMsg, message.id)
                            }
                        } catch {
                            await bot.simulateTyping(message.chat.id, true)
                            await bot.reply(message.chat.id, '❌ Algo deu errado, tente novamente.', message.id)
                        }
                    }
                }
            }

            // demote participant
            if (command.slice(0, 7) === '!demote') {
                if (message.chat.isGroup) {
                    const isAdm = await bot.getGroupAdmins(message.chat.id)
                    let participantId = command.slice(8)
                    if (!isAdm.includes(`${participantId.replace('@', '')}@c.us`)) {
                        await bot.simulateTyping(message.chat.id, true)
                        await bot.sendReplyWithMentions(message.chat.id, `• ${participantId} Não está na lista de admins ❗`, message.id)
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
                                                return;
                                            }
                                            await bot.simulateTyping(message.chat.id, true)
                                            await bot.reply(message.chat.id, botAdminRequireMsg, message.id)
                                            return;
                                        }
                                    }
                                }
                                await bot.simulateTyping(message.chat.id, true)
                                await bot.reply(message.chat.id, userAdminRequireMsg, message.id)
                                return;
                            }
                        } catch {
                            await bot.simulateTyping(message.chat.id, true)
                            await bot.reply(message.chat.id, '❌ Algo deu errado, tente novamente.', message.id)
                        }
                    }
                }
            }

            // set description group
            if (command.slice(0, 8) === '!setdesc') {
                if (message.chat.isGroup) {
                    const listAdm = await message.chat.groupMetadata.participants
                    const setDesc = command.slice(9)
                    if (setDesc < 1) return;
                    for (let i = 0; i < listAdm.length; i++) {
                        const users = listAdm[i]['id']
                        const isAdmin = listAdm[i]['isAdmin']
                        if (message.author === users) {
                            if (!isAdmin) {
                                await bot.simulateTyping(message.chat.id)
                                await bot.reply(message.chat.id, userAdminRequireMsg, message.id)
                                return;
                            }
                            await bot.setGroupDescription(message.chat.id, setDesc)
                            await bot.simulateTyping(message.chat.id)
                            await bot.sendText(message.chat.id, '• Descrição do grupo atualizada, envie *!desc* para ler. ✅')
                        }
                    }
                }
            }

            // get description group
            if (message.body === '!desc') {
                if (message.chat.isGroup) {
                    const getInfo = await bot.getGroupInfo(message.chat.id)
                    await bot.simulateTyping(message.chat.id)
                    await bot.reply(message.chat.id, `*${getInfo['description']}*`, message.id)
                }
            }

            // get admins
            if (message.body === '!admins') {
                if (message.chat.isGroup) {
                    const nameGroup = message.chat.name
                    const getAdmins = await bot.getGroupAdmins(message.chat.id)
                    let listAdmins = []
                    for (let i = 0; i < getAdmins.length; i++) {
                        const users = getAdmins[i]
                        const nUser = users.replace('@c.us', '')
                        listAdmins.push(`› *@${nUser.replace(',', '')}*\n`)
                    }
                    const getListAdmins = listAdmins.toString()
                    await bot.sendReplyWithMentions(message.chat.id, `------〘 _ADMINS MENCIONADOS_ 〙 ------\n\n \`\`\`[${timers}]\`\`\` ➣ *${nameGroup}*\n ➣ *${getAdmins.length} Admins*\n\n${getListAdmins.replace(/,/g, '')}`, message.id)
                }
            }
            // extract text image
            if (message.type === 'image') {
                if (message.caption === '!scan') {
                    if (message.chat.isGroup) {
                        try {
                            const pathMedia = path.resolve('./media')
                            const image = fs.readdirSync(pathMedia)
                            for (let i = 0; i < image.length; i++) {
                                const getImage = `${pathMedia}/${image[i]}`
                                const getText = await extract(getImage)

                                await bot.reply(message.chat.id, getText, message.id)
                                return fs.unlinkSync(getImage)
                            }
                        } catch {
                            await bot.simulateTyping(message.chat.id, true)
                            await bot.reply(message.chat.id, '• Erro ao converter imagem para texto, tente novamente')
                        }
                    }
                }
            }

            // set photo group
            if (message.type === 'image') {
                if (message.caption === '!set') {
                    if (message.chat.isGroup) {
                        const participants = message.chat.groupMetadata.participants
                        for (let i = 0; i < participants.length; i++) {
                            const isAdmin = participants[i]['isAdmin']
                            const getId = participants[i]['id']
                            if (message.author === getId) {
                                if (!isAdmin) {
                                    await bot.simulateTyping(message.chat.id, true)
                                    await bot.reply(message.chat.id, userAdminRequireMsg, message.id)
                                    return;
                                }
                                const setImage = await decryptMedia(message)
                                const fmImage = `data:${message.mimetype};base64,${setImage.toString('base64')}`
                                await bot.setGroupIcon(message.chat.id, fmImage)
                                await bot.sendText(message.chat.id, '• Imagem do grupo atualizada ✅')
                            }
                        }
                    }
                }
            }

            // send help
            if (message.body === '!help') {
                if (message.chat.isGroup) {
                    await bot.simulateTyping(message.chat.id, true)
                    await bot.reply(message.chat.id, help(), message.id)
                    setTimeout(() => {
                        bot.sendText(`${number}@c.us`, `\`\`\`[${timers}]\`\`\` - *${message.sender.pushname}* | _${message.sender.id.replace('@c.us', '')}_ - Commands: _!help_ 🤖`)
                    }, 1000)
                }
            }

            // send code language
            if (message.body === '!lang') {
                if (message.chat.isGroup) {
                    await bot.simulateTyping(message.chat.id, true)
                    await bot.reply(message.chat.id, langs(), message.id)
                }
            }

            //send contact owner
            if (message.body === '!criador') {
                if (message.chat.isGroup) {
                    await bot.sendContact(message.chat.id, `${number}@c.us`)
                }
            }

            // send link group
            if (message.body === '!link') {
                if (message.chat.isGroup) {
                    try {
                        let link = await bot.getGroupInviteLink(message.chat.id)
                        await bot.reply(message.chat.id, link, message.id)
                        await bot.simulateTyping(message.chat.id, true)
                        await bot.sendText(message.chat.id, 'Aqui está o link do grupo!')
                        setTimeout(() => {
                            bot.sendText(`${number}@c.us`, `\`\`\`[${timers}]\`\`\` - Link do grupo ${message.chat.name} gerado ✔️`)
                        }, 1000);
                    } catch {
                        await bot.reply(message.chat.id, 'O bot precisa ser admin ❌', message.id)
                        setTimeout(() => {
                            bot.sendText(`${number}@c.us`, `\`\`\`[${timers}]\`\`\` - Comandos de link => Not Admin ❌`)
                        }, 800);
                    }
                }
            }

            // revoke link group
            if (message.body === '!revogar') {
                if (message.chat.isGroup) {
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
                                                await bot.sendText(message.chat.id, 'Link resetado 🤖 ✔️')
                                                setTimeout(() => {
                                                    bot.sendText(`${number}@c.us`, `\`\`\`[${timers}]\`\`\` - Link do grupo ${message.chat.name} redefinido ✔️`)
                                                }, 1000);
                                                return;
                                            }
                                        }
                                        await bot.simulateTyping(message.chat.id, true)
                                        await bot.reply(message.chat.id, botAdminRequireMsg, message.id)
                                    }
                                }
                            }
                            await bot.simulateTyping(message.chat.id, true)
                            await bot.reply(message.chat.id, userAdminRequireMsg, message.id)
                        }
                    }
                }
            }

            // send sticker image
            if (message.type === 'image') {
                if (message.caption === '!sticker') {
                    if (message.chat.isGroup) {
                        await bot.sendReplyWithMentions(message.chat.id, `\`\`\`[${timers}] - Solicitado por ${message.notifyName}\`\`\` \n\nAguarde...⌛`, message.id)
                        const imagem = await decryptMedia(message)
                        const sticker = `data:${message.mimetype};base64,${imagem.toString('base64')}`
                        await bot.sendImageAsSticker(message.chat.id, sticker, {
                            author: `${message.notifyName}`,
                            keepScale: true,
                            pack: 'hubberBot',
                        })
                        setTimeout(() => {
                            bot.sendText(`${number}@c.us`, `\`\`\`[${timers}]\`\`\` - *${message.notifyName}* | _${message.author.replace('@c.us', '')}_ - Gerou uma figurinha 🤖`)
                        }, 1000);
                    }
                }
            }

            // send sticker video/gif
            else if (message.type === 'video') {
                if (message.caption === '!sticker') {
                    if (message.chat.isGroup) {
                        await bot.sendReplyWithMentions(message.chat.id, `\`\`\`[${timers}] - Solicitado por ${message.notifyName}\`\`\` \n\nAguarde...⌛`, message.id)
                        const video = await decryptMedia(message)
                        const stickerV = `data:${message.mimetype};base64,${video.toString('base64')}`
                        await bot.sendMp4AsSticker(message.chat.id, stickerV, {
                            endTime: '00:00:07.0',
                        }, {
                            author: `${message.notifyName}`,
                            pack: 'hubberBot'
                        })
                        setTimeout(() => {
                            bot.sendText(`${number}@c.us`, `\`\`\`[${timers}]\`\`\` - *${message.notifyName}* | _${message.author.replace('@c.us', '')}_ - Tentou gerar uma figurinha com vídeo 🤖`)
                        }, 1000);
                    }
                }
            }

            if (message.body === '!sticker') {
                try {
                    if (message.quotedMsg.type === 'image') {
                        if (message.chat.isGroup) {
                            await bot.sendReplyWithMentions(message.chat.id, `\`\`\`[${timers}] - Solicitado por ${message.notifyName}\`\`\` \n\nAguarde...⌛`, message.id)
                            const dp1 = await decryptMedia(message.quotedMsg)
                            const sticker1 = `data:${message.quotedMsg.mimetype};base64,${dp1.toString('base64')}`
                            await bot.sendImageAsSticker(message.chat.id, sticker1, {
                                author: `${message.notifyName}`,
                                keepScale: true,
                                pack: 'hubberBot',
                            })
                        }
                    }
                    else if (message.quotedMsg.type === 'video') {
                        if (message.chat.isGroup) {
                            await bot.sendReplyWithMentions(message.chat.id, `\`\`\`[${timers}] - Solicitado por ${message.notifyName}\`\`\` \n\nAguarde...⌛`, message.id)
                            const dp2 = await decryptMedia(message.quotedMsg)
                            const sticker2 = `data:${message.quotedMsg.mimetype};base64,${dp2.toString('base64')}`
                            await bot.sendMp4AsSticker(message.chat.id, sticker2, {
                                endTime: '00:00:07.0',
                            }, {
                                author: `${message.notifyName}`,
                                pack: 'hubberBot'
                            })
                            setTimeout(() => {
                                bot.sendText(`${number}@c.us`, `\`\`\`[${timers}]\`\`\` - *${message.notifyName}* | _${message.author.replace('@c.us', '')}_ - Tentou gerar uma figurinha com vídeo marcado 🤖`)
                            }, 1000);
                        }
                    }
                } catch (e) {
                    await bot.simulateTyping(message.chat.id, true)
                    await bot.sendReplyWithMentions(message.chat.id, `[*${timers}*] Metadados error ❌\n\n› Este comando necessita de uma imagem ou vídeo.`, message.id)
                }
            }

            const impropes = []
            for (let i = 0; i < impropes.length; i++) {
                if (message.body.includes(`${impropes[i]}`)) {
                    await bot.deleteMessage(message.chat.id, message.id)
                    await bot.sendText(message.chat.id, '✅ - Mensagem imprópria deletada')
                    setTimeout(() => {
                        bot.sendText(`${number}@c.us`, `\`\`\`[${timers}]\`\`\` - *${message.notifyName}* | _${message.author.replace('@c.us', '')}_ > Xingamento no grupo!`)
                    }, 1000);
                }
            }

            // all mentions
            if (message.body === '!all') {
                if (message.chat.isGroup) {
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
                                return;
                            }
                            await bot.simulateTyping(message.chat.id, true)
                            await bot.reply(message.chat.id, administradores, message.id)
                        }
                    }
                }
            }
        } catch {
            //debug
            setTimeout(() => {
                bot.sendText(`${number}@c.us`, `\`\`\`[${timers}]\`\`\` - O meu código teve algum erro 🤖`)
            }, 1000);
        }
    });

    // welcome
    const groupChatId = "5521995133045-1602090760@g.us";
    bot.onParticipantsChanged(
        groupChatId,
        async (changeEvent) => {
            try {
                if (changeEvent.action == "add") {
                    const descGroup = await bot.getGroupInfo(groupChatId)
                    await bot.sendTextWithMentions(groupChatId, `Bem vindo, *@${changeEvent.who.replace('@c.us', '')}*`)
                    await bot.simulateTyping(groupChatId, true)
                    await bot.sendText(groupChatId, `${descGroup['description']}\n\nOBS: Digite *!help* para mais informações`)
                    setTimeout(() => {
                        bot.sendText(`${number}@c.us`, `\`\`\`[${String(hora).padStart('2', '0')}:${String(minutos).padStart('2', '0')}]\`\`\` - Alguem entrou no grupo 🤖`)
                    }, 1000);
                }
                if (changeEvent.action == "remove") {
                    await bot.sendText(groupChatId, '👋 Menos um')
                    setTimeout(() => {
                        bot.sendText(`${number}@c.us`, `\`\`\`[${String(hora).padStart('2', '0')}:${String(minutos).padStart('2', '0')}]\`\`\` - Alguem saiu do grupo 🤖`)
                    }, 1000);
                }
            }
            catch {
                setTimeout(() => {
                    bot.sendText(`${number}@c.us`, `\`\`\`[${String(hora).padStart('2', '0')}:${String(minutos).padStart('2', '0')}]\`\`\` - O meu código teve algum erro 🤖`)
                }, 1000);
            }
        }
    );
}