const wa = require('@open-wa/wa-automate');
const msg = require('./constants/constants').msg
const lib = require('./lib/api');
const clash = require('./lib/clash')
const utils = require('./utils/utils')
const lib2 = require('./lib/gnose_group');
const { exec } = require('child_process');
const help = require('./menus/menu').help
const cocHelp = require('./menus/coc_menu').helpCoc
const lang = require('./menus/langs').langs
const config = require('./config/object').create;

let api = new lib.BotApiUtils();
let gnose = new lib2.GnoseGroup('557488562578-1624412670@g.us')
let apiCoc = new clash.ApiClashOfClans(msg.baseUrl, msg.apiKeyCoC)
let util = new utils.Utils()

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

        // Clash Of Clans - Raids attacks
        if (message.body.startsWith('!attacks')) {
            if (!message.chat.isGroup) return;
            let players = [], player, info;
            await apiCoc.resolveClans('capitalraidseasons')
                .then(async raids => {
                    for (let i = 0; i < raids.members.length; i++) {
                        let infoRaids = util.sendInfoAttacks(raids.members[i]['name'], raids.members[i]['attacks'], raids.members[i]['attackLimit'], raids.members[i]['bonusAttackLimit'])
                        if (raids.members[i]['attacks'] < 5) {
                            players.push(`› ${infoRaids}`)
                            player = players.toString();
                        }
                    }
                    info = util.headerInfoRaid(timer, raids.state, raids.startTime, raids.endTime, raids.capitalTotalLoot, raids.totalAttacks, player !== undefined ? player.replace(/,/g, '') : '', players)
                });

            if (info !== undefined) {
                await bot.reply(message.from, info, message.id)
                return;
            }
        }

        // Ranking Clã
        if (message.body.startsWith('!clan')) {
            if (!message.chat.isGroup) return;
            let _ranking = [], _names, _members;
            await apiCoc.resolveClans('members')
                .then(async members => {
                    for (let i = 0; i < members.length; i++) {
                        if (i === 10) break
                        let infoRanking = util.sendRanking(i + 1, members[i].name)
                        _ranking.push(infoRanking);
                        _members = _ranking.toString()
                    }
                    _names = util.headerRanking(timer, message.chat.name, _members.replace(/,/g, ''))
                });
            if (_names !== undefined) {
                await bot.reply(message.from, _names, message.id)
                return;
            }
        }

        // get players
        if (message.body.startsWith('!tag')) {
            if (!message.chat.isGroup) return;
            let tag = message.body.slice(5)
            await apiCoc.getPlayers(tag).then(async isEvent => {
                try {
                    if (isEvent !== undefined) {
                        await bot.sendFile(message.from, `data/members/${isEvent}.json`, `${isEvent}.json`, '• Info Player')
                        return;
                    }
                } catch (err) {
                    await bot.reply(message.from, isEvent, message.id)
                    return;
                }
            });
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
            if (!message.chat.isGroup) return;
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
            if (!message.chat.isGroup) return;
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
            if (!message.chat.isGroup) return;
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
            if (!message.chat.isGroup) return;
            await api.deteleInappropriate(msg.inappropriate, message, bot)
                .then(async msg => {
                    if (msg !== undefined) {
                        await bot.sendText(message.from, msg)
                        return;
                    }
                })
        }

        if (message.body.startsWith('!cmd')) {
            let cmd = message.body.slice(5)
            exec(cmd, async (_, stdout) => {
                await bot.sendText(message.from, stdout)
                return;
            })
        }

        if (message.body.startsWith('!criador')) {
            if (!message.chat.isGroup) return;
            await api.getOwner()
                .then(async number => {
                    if (number !== null) {
                        await bot.sendContact(message.from, number)
                        return;
                    }
                })
        }

        if (message.body.startsWith('!desc')) {
            if (!message.chat.isGroup) return;
            await bot.getGroupInfo(message.from)
                .then(async info => {
                    if (info !== null) {
                        await bot.reply(message.from, `*${info['description']}*`, message.id)
                        return;
                    }
                })
        }

        if (message.body.startsWith('!link')) {
            if (!message.chat.isGroup) return;
            await api.getLinkGroup(message, bot)
                .then(async linkOrMsg => {
                    if (linkOrMsg !== undefined) {
                        await bot.reply(message.from, linkOrMsg, message.id)
                        return;
                    }
                });
        }

        if (message.body.startsWith('!lang')) {
            if (message.chat.isGroup) {
                await bot.reply(message.from, lang, message.id)
                return;
            };
        }

        if (message.body.startsWith('!help')) {
            if (message.chat.isGroup) {
                await bot.reply(message.from, help, message.id)
                return;
            }
        }

        if (message.body.startsWith('!revogar')) {
            if (!message.chat.isGroup) return;
            await api.revokeLinkGroup(message, bot)
                .then(async msg => {
                    if (msg !== undefined) {
                        await bot.sendText(message.from, msg)
                        return;
                    }
                });
        }

        if (message.body.startsWith('!all')) {
            if (!message.chat.isGroup) return;
            await api.mentionsAll(message.chat.name, message.chat.participantsCount, timer, message, bot)
                .then(async msg => {
                    if (msg !== undefined) {
                        await bot.reply(message.from, msg, message.id)
                        return;
                    }
                });
        }

        if (message.body.startsWith('!admins')) {
            if (!message.chat.isGroup) return;
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
            if (!message.chat.isGroup) return;
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
            if (!message.chat.isGroup) return;
            await api.setDescription(message.body.slice(9), message, bot)
                .then(async msg => {
                    if (msg !== undefined) {
                        await bot.reply(message.from, msg, message.id)
                        return;
                    }
                })
        }

        if (message.body.startsWith('!register')) {
            if (!message.chat.isGroup) return;
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
            if (!message.chat.isGroup) return;
            await api.downloadYt(message.body.slice(14), message.body.slice(10, 13), message, bot)
                .then(async textErr => {
                    if (textErr !== undefined) {
                        await bot.sendText(message.from, textErr)
                        return;
                    }
                })
        }

        if (message.body.startsWith('!voice')) {
            if (!message.chat.isGroup) return;
            await api.sendVoice(message.body.slice(10), message.body.slice(7, 9), message, bot)
                .then(async msg => {
                    if (msg !== undefined) {
                        await bot.reply(message.from, msg, message.id)
                        return;
                    }
                });
        }

        if (message.body.startsWith('!remove')) {
            if (!message.chat.isGroup) return;
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
            if (!message.chat.isGroup) return;
            await api.setPhotoGroup(message, bot)
                .then(async msg => {
                    if (msg !== undefined) {
                        await bot.reply(message.from, msg, message.id)
                        return;
                    }
                })
        }

        if (message.body.startsWith('!promote')) {
            if (!message.chat.isGroup) return;
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

        gnose.reactGnose(message.author, message)
            .then(async emoji => {
                if (emoji !== undefined) {
                    await bot.react(message.id, emoji)
                    return;
                }
            });
    });
}