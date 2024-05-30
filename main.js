const wa = require('@open-wa/wa-automate');
const msg = require('./constants/constants').msg
const lib = require('./lib/api');
const lib2 = require('./lib/gnose_group')
const help = require('./menus/menu').help
const lang = require('./menus/langs').langs
const config = require('./config/object').create;

let api = new lib.BotApiUtils();
let gnose = new lib2.GnoseGroup('557488562578-1624412670@g.us')

wa.create(config).then(bot => start(bot));

function start(bot) {
    bot.onMessage(async message => {
        const timer = api.getHour()
        const timeLog = api.hourLog()

        if (message.body === '$debug') {
            try {
                await api.isOwner(message.author)
                    .then(async event => {
                        if (event) {
                            await bot.reply(message.from, msg.sendOk, message.id)
                            return;
                        }
                    });
            } catch (err) {
                await api.saveLog(timeLog, message.author, 'ERROR', err, message.chat.name, ' => $debug')
                return;
            }
        }

        await gnose.sendWebp(message.body.toLowerCase(), message)
            .then(async webp => {
                if (webp !== undefined) {
                    if (typeof webp !== 'object') {
                        await bot.sendImageAsSticker(message.from, webp)
                        return;
                    }
                    let getMsg = webp[Math.floor((Math.random() * webp.length))];
                    await bot.reply(message.chat.id, getMsg, message.id)
                    return;
                }
            }).catch(async err => {
                await api.saveLog(timeLog, message.author, 'ERROR', err, message.chat.name, ' => $debug')
                return;
            });

        if (message.body.startsWith('!demote')) {
            let contact = message.body.slice(8)
            await api.setDemote(contact, message, bot)
                .then(async msg => {
                    if (msg !== undefined) {
                        await bot.sendReplyWithMentions(message.from, msg, message.id)
                        return;
                    }
                });
        }

        if (message.type === 'image' || message.type === 'video') {
            let typeFile = message.type
            if (message.caption === '!sticker') {
                await api.sendResolveSticker(message.mimetype, undefined, typeFile, timer, message, bot)
                    .then(async sticker => {
                        if (sticker !== null) {
                            if (typeFile === 'image') {
                                await bot.sendImageAsSticker(message.from, sticker, {
                                    author: `${message.notifyName}`,
                                    keepScale: true,
                                    pack: 'hubberBot',
                                });
                                return;
                            }
                            await bot.sendMp4AsSticker(message.from, sticker, { endTime: '00:00:07.0' }, {
                                author: `${message.notifyName}`,
                                pack: 'hubberBot',
                            });
                        }
                    }).catch(async err => {
                        await bot.reply(message.from, err, message.id)
                        await api.saveLog(timeLog, message.author, 'ERROR', err, message.chat.name, ' => !sticker: video/image')
                        return;
                    });
            }
        }

        // message.quotedMsg.mimetype
        if (message.body === '!sticker') {
            try {
                let typeFile = message.quotedMsg.type
                if (message.quotedMsg.type === 'image' || message.quotedMsg.type === 'video') {
                    await api.sendResolveSticker(message.quotedMsg.mimetype, message.quotedMsg, typeFile, timer, message, bot)
                        .then(async sticker => {
                            if (sticker !== null) {
                                if (typeFile !== 'video') {
                                    await bot.sendImageAsSticker(message.chat.id, sticker, {
                                        author: `${message.notifyName}`,
                                        keepScale: true,
                                        pack: 'hubberBot',
                                    });
                                    return;
                                }
                                await bot.sendMp4AsSticker(message.chat.id, sticker, { endTime: '00:00:07.0', }, {
                                    author: `${message.notifyName}`,
                                    pack: 'hubberBot'
                                })
                            }
                        }).catch(async err => {
                            await bot.reply(message.from, err, message.id)
                            await api.saveLog(timeLog, message.author, 'ERROR', err, message.chat.name, ' => !sticker: quotedMsg')
                            return;
                        });
                }
            } catch (_) {
                await bot.reply(message.from, ' > Este comando precisa de uma imagem ou vídeo!', message.id)
                return;
            }
        }

        if (msg.inappropriate.length !== 0) {
            await api.deteleInappropriate(msg.inappropriate, message, bot)
                .then(async msg => {
                    if (msg !== undefined) {
                        await bot.sendText(message.from, msg)
                        return;
                    }
                })
        }

        if (message.body.startsWith('!criador')) {
            await api.getOwner()
                .then(async number => {
                    if (number !== null) {
                        await bot.sendContact(message.from, number)
                        return;
                    }
                })
        }

        if (message.body.startsWith('!desc')) {
            await bot.getGroupInfo(message.from)
                .then(async info => {
                    if (info !== null) {
                        await bot.reply(message.from, `*${info['description']}*`, message.id)
                        return;
                    }
                })
        }

        if (message.body.startsWith('!link')) {
            await api.getLinkGroup(message, bot)
                .then(async linkOrMsg => {
                    if (linkOrMsg !== undefined) {
                        await bot.reply(message.from, linkOrMsg, message.id)
                        return;
                    }
                });
        }

        if (message.body.startsWith('!lang')) {
            await bot.reply(message.from, lang, message.id)
            return;
        }

        if (message.body.startsWith('!help')) {
            await bot.reply(message.from, help, message.id)
            return;
        }

        if (message.body.startsWith('!revogar')) {
            await api.revokeLinkGroup(message, bot)
                .then(async msg => {
                    if (msg !== undefined) {
                        await bot.sendText(message.from, msg)
                        return;
                    }
                });
        }

        if (message.body.startsWith('!all')) {
            await api.mentionsAll(message.chat.name, message.chat.participantsCount, timer, message, bot)
                .then(async msg => {
                    if (msg !== undefined) {
                        await bot.reply(message.from, msg, message.id)
                        return;
                    }
                })
        }

        if (message.body.startsWith('!admins')) {
            try {
                let list = [];
                await bot.getGroupAdmins(message.from)
                    .then(async array => {
                        for (let users of array) {
                            const user = users.replace('@c.us', '')
                            list.push(`➜ *@${user}*\n`)
                        }
                        const nList = list.toString()
                        await bot.sendReplyWithMentions(message.from, api.sendAdminsMentions(timer, message.chat.name, array, nList), message.id)
                        return;
                    });
            } catch (err) {
                await api.saveLog(timeLog, message.author, 'ERROR', err, message.chat.name, ' => !admins')
                return;
            }
        }

        if (message.type === 'image' && message.caption === '!scan') {
            api.extractText(message, bot)
                .then(async msgErr => {
                    if (msgErr !== undefined) {
                        await bot.sendText(message.from, msgErr)
                        return;
                    }
                });
        }

        if (message.body.startsWith('!getlog')) {
            await api.isOwner(message.author)
                .then(async isOwner => {
                    if (isOwner) {
                        await bot.sendFile(message.from, 'logs/logfile.log', 'logfile.log', '• Arquivo de logs de eventos do bot!')
                        return
                    }
                });
        }

        if (message.body.startsWith('!setdesc')) {
            await api.setDescription(message.body.slice(9), message, bot)
                .then(async msg => {
                    if (msg !== undefined) {
                        await bot.reply(message.from, msg, message.id)
                        return;
                    }
                })
        }

        if (message.body.startsWith('!register')) {
            try {
                await api.registerUsers(message.notifyName,
                    message.author, message.sender.profilePicThumbObj.eurl)
                    .then(async msg => {
                        await bot.reply(message.from, msg, message.id)
                        return;
                    })
            } catch (err) {
                await api.saveLog(timeLog, message.author, 'ERROR', err, message.chat.name, ' => !register')
                return;
            }
        }

        if (message.body.startsWith('!download')) {
            await api.downloadYt(message.body.slice(14), message.body.slice(10, 13), message, bot)
                .then(async textErr => {
                    if (textErr !== undefined) {
                        await bot.sendText(message.from, textErr)
                        return;
                    }
                })
        }

        if (message.body.startsWith('!voice')) {
            await api.sendVoice(message.body.slice(10), message.body.slice(7, 9), message, bot)
                .then(async msg => {
                    if (msg !== undefined) {
                        await bot.reply(message.from, msg, message.id)
                        return;
                    }
                });
        }

        if (message.body.startsWith('!remove')) {
            try {
                let kick = message.body.slice(8)
                await api.removeUser(kick, message, bot)
                    .then(async msg => {
                        if (msg !== undefined) {
                            await bot.reply(message.from, msg, message.id)
                            return
                        }
                    });
            } catch (err) {
                await api.saveLog(timeLog, message.author, 'ERROR', err, message.chat.name, ' => !remove')
                return;
            }
        }

        if (message.type === 'image' && message.caption === '!set') {
            await api.setPhotoGroup(message, bot)
                .then(async msg => {
                    if (msg !== undefined) {
                        await bot.reply(message.from, msg, message.id)
                        return;
                    }
                })
        }

        if (message.body.startsWith('!promote')) {
            await api.setPromote(message.body.slice(9), message, bot)
                .then(async msg => {
                    if (msg !== undefined) {
                        await bot.sendText(message.from, msg)
                        return;
                    }
                })
        }

        if (!message.chat.isGroup) {
            try {
                await api.isOwner(message.author).then(async isAuthor => {
                    if (!isAuthor) {
                        await api.blockDm(message.author)
                            .then(async isBlock => {
                                if (!isBlock) {
                                    await bot.sendText(message.chat.id, msg.programmer_msg)
                                    return;
                                }
                            });
                    }
                })
            } catch (err) {
                await api.saveLog(timeLog, message.author, 'ERROR', err, message.chat.name, ' => DM-block')
                return;
            }
        }
    });
}