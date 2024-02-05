const wa = require('@open-wa/wa-automate');
const { decryptMedia } = require('@open-wa/wa-automate');
const { setTimeout } = require('timers/promises');
const { sendHelp } = require('./menus/help')
const { sendLang } = require('./menus/lang')
const fs = require('fs')
const yt = require('ytdl-core')
const gTTS = require('gtts')
const number = '557488700196'
const programmer_msg = `*❗ Mensagem do Desenvolvedor* ❗\n\n "Comandos ou mensagens não funcionam no privado, crie grupos com o bot para usa-los"`
const administradores = '❗ Apenas administradores são autorizados a usar este comando. ❗'
const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=|\?v=)([^#\&\?]*).*/
const gttsMessageError = `❌ Lingua não reconhecida, tente: \n›• !audio --pt frase ou \`\`\`!lang \`\`\``

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
    qrTimeout: 0, //0 means it will wait forever for you to scan the qr code
}).then(bot => start(bot));

function start(bot) {
    bot.onMessage(async message => {
        console.log(message)
        fulltime = new Date()
        hora = fulltime.getHours()
        minutos = fulltime.getMinutes()
        alltime = `${String(hora).padStart('2', '0')}:${String(minutos).padStart('2', '0')}`
        try {
            if (message.body === '$debug') {
                if (message.author === `${number}@c.us`) {
                    await bot.simulateTyping(message.chat.id, true)
                    await bot.reply(message.chat.id, `\`\`\`[200] - OK 🤖 ✔️ \`\`\``, message.id)
                }
            }

            if (!message.chat.isGroup) {
                await bot.simulateTyping(message.chat.id, true)
                await bot.sendText(message.chat.id, `${programmer_msg}`)
            }

            // send audio google
            let command = message.body
            if (command.slice(0, 6) === '!audio') {
                if (message.chat.isGroup) {
                    const lang = command.slice(7, 9)
                    const text = command.slice(10)
                    try {
                        let gtts = new gTTS(text, lang)
                        gtts.save('audio.mp3', async function (error, _) {
                            if (error) {
                                await bot.sendText(message.chat.id, '❌ Erro ao converter áudio, tente novamente ❌')
                            }
                            await bot.sendPtt(message.chat.id, 'audio.mp3', message.id)
                        })
                    } catch {
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
                                //let content = `\`\`\`[${alltime}] - Baixando do YouTube...\n\n\`\`\` › *${title}*\n\nAguarde...⌛`
                                //let urlTumb = info.videoDetails.thumbnails[3].url

                                //await bot.sendImage(message.chat.id, urlTumb, {caption: content})
                                await bot.sendFile(message.chat.id, 'download.mp4', "download", 'video')
                            })
                        } catch (err) {
                            console.log(err)
                            await bot.sendReplyWithMentions(message.chat.id, '❌ Erro ao baixar o vídeo, tente novamente. ❌', message.id)
                        }
                    }
                }
            }

            // promote participant
            if (command.slice(0, 8) === '!promote') {
                if (message.chat.isGroup) {
                    let participantId = command.slice(9)
                    let participants = message.chat.groupMetadata.participants
                    let pid = `${participantId}`
                    for (let members in participants) {
                        const isAdmin = participants[members]['isAdmin']
                        const getId = participants[members]['id']
                        try {
                            if (message.author === getId) {
                                if (!isAdmin) {
                                    await bot.simulateTyping(message.chat.id, true)
                                    await bot.reply(message.chat.id, 'Você precisa ser adm para usar este comando...', message.id)
                                }
                            }
                            if (message.to === getId) {
                                if (!isAdmin) {
                                    await bot.simulateTyping(message.chat.id, true)
                                    await bot.reply(message.chat.id, 'O bot precisa ser adm', message.id)
                                }
                                await bot.promoteParticipant(message.chat.id, `${participantId.replace('@', '')}@c.us`)
                                await bot.sendTextWithMentions(message.chat.id, `• ${pid} agora é um administrador ✅`)
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
                    let participantId = command.slice(8)
                    let participants = message.chat.groupMetadata.participants
                    let pid = `${participantId}`
                    for (let members in participants) {
                        const isAdmin = participants[members]['isAdmin']
                        const getId = participants[members]['id']
                        try {
                            if (message.author === getId) {
                                if (!isAdmin) {
                                    await bot.simulateTyping(message.chat.id, true)
                                    await bot.reply(message.chat.id, 'Você precisa ser adm para usar este comando...', message.id)
                                }
                            }
                            if (message.to === getId) {
                                if (!isAdmin) {
                                    await bot.simulateTyping(message.chat.id, true)
                                    await bot.reply(message.chat.id, 'O bot precisa ser adm', message.id)
                                }
                                await bot.demoteParticipant(message.chat.id, `${participantId.replace('@', '')}@c.us`)
                                await bot.sendTextWithMentions(message.chat.id, `• ${pid} Não é mais um administrador ❌`)
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
                    const setDesc = command.slice(9)
                    setGroupDescription(message.chat.id, setDesc)
                    await bot.sendText(message.chat.id, '• Descrição do grupo atualizada, envie *!desc* para ler. ✅')
                }
            }

            // get description group
            if (message.body === '!desc') {
                if (message.chat.isGroup) {
                    const getInfo = await bot.getGroupInfo(message.chat.id)
                    console.log(getInfo)
                    await bot.reply(message.chat.id, `*${getInfo['description']}*`, message.id)
                }
            }

            // get admins
            if (message.body === '!admins') {
                if (message.chat.isGroup) {
                    const nameGroup = message.chat.name
                    const getAdmins = await bot.getGroupAdmins(message.chat.id)
                    let listAdmins = []
                    for (let admins in getAdmins) {
                        const users = getAdmins[admins]
                        const nUser = users.replace('@c.us', '')
                        listAdmins.push(`› *@${nUser.replace(',', '')}*\n`)
                    }
                    getListAdmins = listAdmins.toString()
                    await bot.sendReplyWithMentions(message.chat.id, `------〘 _ADMINS MENCIONADOS_ 〙 ------\n\n \`\`\`[${alltime}]\`\`\` ➣ *${nameGroup}*\n ➣ *${getAdmins.length} Admins*\n\n${getListAdmins.replace(/,/g, '')}`, message.id)
                }
            }

            // set photo group
            if (message.type === 'image') {
                if (message.caption === '!set') {
                    if (message.chat.isGroup) {
                        const participants = message.chat.groupMetadata.participants
                        for (members in participants) {
                            const isAdmin = participants[members]['isAdmin']
                            const getId = participants[members]['id']
                            if (message.author === getId) {
                                if (!isAdmin) {
                                    await bot.simulateTyping(message.chat.id, true)
                                    await bot.reply(message.chat.id, 'Você precisa ser adm para usar este comando...', message.id)
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

            //help
            if (message.body === '!help') {
                if (message.chat.isGroup) {
                    await bot.simulateTyping(message.chat.id, true)
                    await bot.reply(message.chat.id, sendHelp(), message.id)
                    setTimeout(() => {
                        bot.sendText(`${number}@c.us`, `\`\`\`[${alltime}]\`\`\` - *${message.sender.pushname}* | _${message.sender.id.replace('@c.us', '')}_ - Commands: _!help_ 🤖`)
                    }, 1000)
                }
            }

            // send code language
            if (message.body === '!lang') {
                if (message.chat.isGroup) {
                    await bot.simulateTyping(message.chat.id, true)
                    await bot.reply(message.chat.id, sendLang(), message.id)
                }
            }

            //criador
            if (message.body === '!criador') {
                if (message.chat.isGroup) {
                    await bot.sendContact(message.chat.id, `${number}@c.us`)
                }
            }

            //send link group
            if (message.body === '!link') {
                if (message.chat.isGroup) {
                    try {
                        let link = await bot.getGroupInviteLink(message.chat.id)
                        await bot.reply(message.chat.id, link, message.id)
                        await bot.simulateTyping(message.chat.id, true)
                        await bot.sendText(message.chat.id, 'Aqui está o link do grupo!')
                        setTimeout(() => {
                            bot.sendText(`${number}@c.us`, `\`\`\`[${alltime}]\`\`\` - Link do grupo ${message.chat.name} gerado ✔️`)
                        }, 1000);
                    } catch {
                        await bot.reply(message.chat.id, 'O bot precisa ser admin ❌', message.id)
                        setTimeout(() => {
                            bot.sendText(`${number}@c.us`, `\`\`\`[${alltime}]\`\`\` - Comandos de link => Not Admin ❌`)
                        }, 800);
                    }
                }
            }

            // revoke link group
            if (message.body === '!revogar') {
                if (message.chat.isGroup) {
                    try {
                        let linkrevoke = await bot.revokeGroupInviteLink(message.chat.id)
                        if (linkrevoke) {
                            await bot.sendText(message.chat.id, 'Link resetado 🤖 ✔️')
                            setTimeout(() => {
                                bot.sendText(`${number}@c.us`, `\`\`\`[${alltime}]\`\`\` - Link do grupo ${message.chat.name} redefinido ✔️`)
                            }, 1000);
                        }
                    } catch {
                        await bot.reply(message.chat.id, 'O bot precisa ser admin ❌', message.id)
                        setTimeout(() => {
                            bot.sendText(`${number}@c.us`, `\`\`\`[${alltime}]\`\`\` - Comandos de link => Not Admin ❌`)
                        }, 800);
                    }
                }
            }

            // send sticker
            if (message.type === 'image') {
                if (message.caption === '!sticker') {
                    if (message.chat.isGroup) {
                        await bot.sendReplyWithMentions(message.chat.id, `\`\`\`[${alltime}] - Solicitado por ${message.notifyName}\`\`\` \n\nAguarde...⌛`, message.id)
                        const imagem = await decryptMedia(message)
                        const sticker = `data:${message.mimetype};base64,${imagem.toString('base64')}`
                        await bot.sendImageAsSticker(message.chat.id, sticker, {
                            author: `${message.notifyName}`,
                            keepScale: true,
                            pack: 'hubberBot',
                        })
                        setTimeout(() => {
                            bot.sendText(`${number}@c.us`, `\`\`\`[${alltime}]\`\`\` - *${message.notifyName}* | _${message.author.replace('@c.us', '')}_ - Gerou uma figurinha 🤖`)
                        }, 1000);
                    }
                }
            }

            else if (message.type === 'video') {
                if (message.caption === '!sticker') {
                    if (message.chat.isGroup) {
                        await bot.sendReplyWithMentions(message.chat.id, `\`\`\`[${alltime}] - Solicitado por ${message.notifyName}\`\`\` \n\nAguarde...⌛`, message.id)
                        const video = await decryptMedia(message)
                        const stickerV = `data:${message.mimetype};base64,${video.toString('base64')}`
                        await bot.sendMp4AsSticker(message.chat.id, stickerV, {
                            endTime: '00:00:07.0',
                        }, {
                            author: `${message.notifyName}`,
                            pack: 'hubberBot'
                        })
                        setTimeout(() => {
                            bot.sendText(`${number}@c.us`, `\`\`\`[${alltime}]\`\`\` - *${message.notifyName}* | _${message.author.replace('@c.us', '')}_ - Tentou gerar uma figurinha com vídeo 🤖`)
                        }, 1000);
                    }
                }
            }

            if (message.body === '!sticker') {
                try {
                    if (message.quotedMsg.type === 'image') {
                        if (message.chat.isGroup) {
                            await bot.sendReplyWithMentions(message.chat.id, `\`\`\`[${alltime}] - Solicitado por ${message.notifyName}\`\`\` \n\nAguarde...⌛`, message.id)
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
                            await bot.sendReplyWithMentions(message.chat.id, `\`\`\`[${alltime}] - Solicitado por ${message.notifyName}\`\`\` \n\nAguarde...⌛`, message.id)
                            const dp2 = await decryptMedia(message.quotedMsg)
                            const sticker2 = `data:${message.quotedMsg.mimetype};base64,${dp2.toString('base64')}`
                            await bot.sendMp4AsSticker(message.chat.id, sticker2, {
                                endTime: '00:00:07.0',
                            }, {
                                author: `${message.notifyName}`,
                                pack: 'hubberBot'
                            })
                            //await bot.sendFile(message.chat.id, 'readme.exe', 'README.exe')

                            setTimeout(() => {
                                bot.sendText(`${number}@c.us`, `\`\`\`[${alltime}]\`\`\` - *${message.notifyName}* | _${message.author.replace('@c.us', '')}_ - Tentou gerar uma figurinha com vídeo marcado 🤖`)
                            }, 1000);
                        }
                    }
                }
                catch (e) {
                    await bot.simulateTyping(message.chat.id, true)
                    await bot.sendReplyWithMentions(message.chat.id, `[*${alltime}*] Metadados error ❌\n\n› Este comando necessita de uma imagem ou vídeo.`)
                }
            }

            list_impropes = []
            for (let impropes in list_impropes) {
                if (message.body.includes(`${list_impropes[impropes]}`)) {
                    await bot.deleteMessage(message.chat.id, message.id)
                    await bot.sendText(message.chat.id, '✅ - Mensagem imprópria deletada')
                    setTimeout(() => {
                        bot.sendText(`${number}@c.us`, `\`\`\`[${alltime}]\`\`\` - *${message.notifyName}* | _${message.author.replace('@c.us', '')}_ > Xingamento no grupo!`)
                    }, 1000);
                }
            }

            // all mentions
            if (message.body === '!all') {
                if (message.chat.isGroup) {
                    num = message.chat.groupMetadata.participants
                    for (membros in num) {
                        admin = num[membros]['isAdmin']
                        ids = num[membros]['id']
                        grupo = message.chat.name
                        total = message.chat.participantsCount
                        if (message.author === ids) {
                            if (admin) {
                                userList = []
                                for (usuarios in num) {
                                    users = num[usuarios]['id']
                                    newUser = users.replace('@c.us', '')
                                    userList.push(`› *@${newUser.replace(',', '')}*\n`)
                                }
                                listString = userList.toString()
                                await bot.sendReplyWithMentions(message.chat.id, `------〘 _TODOS MENCIONADOS_ 〙 ------\n\n \`\`\`[${alltime}]\`\`\` ➣ *${grupo}*\n ➣ *${total} Membros*\n\n${listString.replace(/,/g, '')}`, message.id)
                            } else {
                                await bot.simulateTyping(message.chat.id, true)
                                await bot.reply(message.chat.id, administradores, message.id)
                            }
                        }
                    }
                }
            }
        }
        catch (e) {
            console.log(e)
            //debug
            setTimeout(() => {
                bot.sendText(`${number}@c.us`, `\`\`\`[${alltime}]\`\`\` - O meu código teve algum erro 🤖`)
            }, 1000);
        }
    })

    // Boas vindas
    const groupChatId = "GROUP_ID";
    bot.onParticipantsChanged(
        groupChatId,
        async (changeEvent) => {
            try {
                if (changeEvent.action === "add") {
                    await bot.sendTextWithMentions(groupChatId, `Bem vindo, *@${changeEvent.who.replace('@c.us', '')}*`)
                    setTimeout(() => {
                        bot.sendText(`${number}@c.us`, `\`\`\`[${String(hora).padStart('2', '0')}:${String(minutos).padStart('2', '0')}]\`\`\` - Alguem entrou no grupo 🤖`)

                    }, 1000);
                }
                if (changeEvent.action === "remove") {
                    await bot.sendText(groupChatId, '👋 Menos um')
                    setTimeout(() => {
                        bot.sendText(`${number}@c.us`, `\`\`\`[${String(hora).padStart('2', '0')}:${String(minutos).padStart('2', '0')}]\`\`\` - Alguem saiu do grupo 🤖`)

                    }, 10000);
                }
            }
            catch {
                setTimeout(() => {
                    bot.sendText(`${number}@c.us`, `\`\`\`[${String(hora).padStart('2', '0')}:${String(minutos).padStart('2', '0')}]\`\`\` - O meu código teve algum erro 🤖`)
                }, 1000);
            }
        }
    )
}