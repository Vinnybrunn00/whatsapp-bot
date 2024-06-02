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
        if (await api.isBlock(message.author)) return;

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
                await api.saveLogError(timeLog, err, message.chat.name, '$debug')
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

        // get players - COC
        if (message.body.startsWith('!tag')) {
            if (!message.chat.isGroup) return;
            await apiCoc.getPlayers(message.body.slice(5))
                .then(async isEvent => {
                    try {
                        if (isEvent !== undefined) {
                            await bot.sendFile(message.from, `data/members/${isEvent}.json`, `${isEvent}.json`, '• Info Player')
                            return;
                        }
                    } catch (err) {
                        await api.saveLogError(timeLog, err, message.chat.name, 'get players - COC')
                        await bot.reply(message.from, isEvent, message.id)
                        return;
                    }
                });
        }

        if (message.body.startsWith('!block')) {
            await api.isOwner(message.author).then(async isOwner => {
                if (isOwner !== undefined && isOwner) {
                    await api.blockCommands(message.body.slice(7)).then(async isBlock => {
                        await bot.sendReplyWithMentions(message.from, isBlock, message.id)
                            .then(async _ => {
                                await api.saveLogInfo(timeLog, `${message.notifyName} Bloqueado...`)
                                return;
                            }).catch(async err => {
                                if (err !== undefined) {
                                    await api.saveLogError(timeLog, err, message.chat.name, '!block')
                                    return;
                                }
                            });
                        return;
                    });
                }
            });
        }

        await gnose.sendAudioGnose(message.body, message)
            .then(async audio => {
                if (audio !== undefined) {
                    await bot.sendAudio(message.from, audio)
                    return;
                }
            })

        await gnose.sendMsgGnose(message.body.toLowerCase(), message)
            .then(async msgGnose => {
                if (msgGnose !== undefined) {
                    await bot.reply(message.from, msgGnose, message.id)
                    return;
                }
            });

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
                await api.saveLogError(timeLog, err, message.chat.name, 'sendWebp - gnose')
                return;
            });

        if (message.body.startsWith('!demote')) {
            if (!message.chat.isGroup) return;

            let contact = message.body.slice(8)
            await api.setDemote(contact, message, bot)
                .then(async msg => {
                    if (msg !== undefined) {
                        await bot.sendReplyWithMentions(message.from, msg, message.id)
                            .then(async _ => {
                                await api.saveLogInfo(timeLog, `${contact} provido...`)
                                return;
                            }).catch(async err => {
                                await api.saveLogError(timeLog, err, message.chat.name, '!demote')
                                return;
                            })
                        return;
                    }
                });
        }

        if (message.body.startsWith('!desblock')) {
            if (!message.chat.isGroup) return;
            let contact = message.body.slice(10)
            await api.removeBlock(contact)
                .then(async msg => {
                    await bot.sendReplyWithMentions(message.from, msg, message.id)
                        .then(async _ => {
                            await api.saveLogInfo(timeLog, `${contact} desbloqueado...`)
                            return;
                        })
                    return;
                }).catch(async err => {
                    await api.saveLogError(timeLog, err, message.chat.name, '!desblock')
                    return;
                })
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
                                })
                                await api.saveLogInfo(timeLog, `${message.notifyName} gerou uma figurinha com imagem...`)
                                return;
                            }
                            await bot.sendMp4AsSticker(message.from, sticker, { endTime: '00:00:07.0' }, {
                                author: `${message.notifyName}`,
                                pack: 'hubberBot',
                            });
                            await api.saveLogInfo(timeLog, `${message.notifyName} gerou uma figurinha com vídeo...`)
                            return;
                        }
                    }).catch(async err => {
                        await bot.reply(message.from, err, message.id)
                        await api.saveLogError(timeLog, err, message.chat.name, '!sticker: video/image')
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
                                    await api.saveLogInfo(timeLog, `${message.notifyName} gerou uma figurinha com vídeo...`)
                                    return;
                                }
                                await bot.sendMp4AsSticker(message.chat.id, sticker, { endTime: '00:00:07.0', }, {
                                    author: `${message.notifyName}`,
                                    pack: 'hubberBot'
                                });
                                await api.saveLogInfo(timeLog, `${message.notifyName} gerou uma figurinha com imagem...`)
                            }
                        }).catch(async err => {
                            await bot.reply(message.from, err, message.id)
                            await api.saveLogError(timeLog, err, message.chat.name, '!sticker: quotedMsg')
                            return;
                        });
                }
            } catch (err) {
                await api.saveLogError(timeLog, err, message.chat.name, '!sticker: quotedMsg 2')
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
                            .then(async _ => {
                                await api.saveLogInfo(timeLog, `${message.notifyName} Solicitou o contato...`)
                                return;
                            })
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
                            .then(async _ => {
                                await api.saveLogInfo(timeLog, `${message.notifyName} Solicitou a descrição do grupo...`)
                                return;
                            })
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
                            .then(async _ => {
                                await api.saveLogInfo(timeLog, `${message.notifyName} Solicitou o link do grupo...`)
                                return;
                            })
                        return;
                    }
                });
        }

        if (message.body.startsWith('!lang')) {
            if (message.chat.isGroup) {
                await bot.reply(message.from, lang, message.id)
                    .then(async _ => {
                        await api.saveLogInfo(timeLog, `${message.notifyName} Solicitou as linguagens...`)
                        return;
                    })
                return;
            };
        }

        if (message.body.startsWith('!help')) {
            if (message.chat.isGroup) {
                await bot.reply(message.from, help, message.id)
                    .then(async _ => {
                        await api.saveLogInfo(timeLog, `${message.notifyName} Solicitou o help...`)
                        return;
                    })
                return;
            }
        }

        if (message.body.startsWith('!revogar')) {
            if (!message.chat.isGroup) return;
            await api.revokeLinkGroup(message, bot)
                .then(async msg => {
                    if (msg !== undefined) {
                        await bot.sendText(message.from, msg)
                            .then(async _ => {
                                await api.saveLogInfo(timeLog, `${message.notifyName} Revogou o link do grupo...`)
                                return;
                            })
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
                            .then(async _ => {
                                await api.saveLogInfo(timeLog, `${message.notifyName} Marcou todos do grupo...`)
                                return;
                            })
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
                            .then(async _ => {
                                await api.saveLogInfo(timeLog, `${message.notifyName} Solicitou os admins do grupo...`)
                                return;
                            })
                        return;
                    });
            } catch (err) {
                await api.saveLogError(timeLog, err, message.chat.name, '!admins')
                return;
            }
        }

        if (message.type === 'image' && message.caption === '!scan') {
            if (!message.chat.isGroup) return;
            api.extractText(message, bot)
                .then(async msgErr => {
                    if (msgErr !== undefined) {
                        await bot.sendText(message.from, msgErr)
                            .then(async _ => {
                                await api.saveLogInfo(timeLog, `${message.notifyName} Scanneou uma imagem...`)
                                return;
                            })
                        return;
                    }
                });
        }

        if (message.body.startsWith('!getlog')) {
            await api.isOwner(message.author)
                .then(async isOwner => {
                    if (isOwner) {
                        await bot.sendFile(message.from, 'logs/logfile.log', 'logfile.log', '• Arquivo de logs de eventos do bot!')
                            .then(async _ => {
                                await api.saveLogInfo(timeLog, `${message.notifyName} Solicitou o arquivo de log...`)
                                return;
                            })
                        return;
                    }
                });
        }

        if (message.body.startsWith('!setdesc')) {
            if (!message.chat.isGroup) return;
            await api.setDescription(message.body.slice(9), message, bot)
                .then(async msg => {
                    if (msg !== undefined) {
                        await bot.reply(message.from, msg, message.id)
                            .then(async _ => {
                                await api.saveLogInfo(timeLog, `${message.notifyName} Mudou a descrição do grupo...`)
                                return;
                            })
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
                            .then(async _ => {
                                await api.saveLogInfo(timeLog, `${message.notifyName} Registrado...`)
                                return;
                            })
                        return;
                    })
            } catch (err) {
                await api.saveLogError(timeLog, err, message.chat.name, '!register')
                return;
            }
        }

        if (message.body.startsWith('!download')) {
            if (!message.chat.isGroup) return;
            let link = message.body.slice(14)
            await api.downloadYt(link, message.body.slice(10, 13), message, bot)
                .then(async textErr => {
                    if (textErr !== undefined) {
                        await bot.sendText(message.from, textErr)
                        await api.saveLogInfo(timeLog, `${message.notifyName} Baixou ${link}...`)
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
                            .then(async _ => {
                                await api.saveLogInfo(timeLog, `${message.notifyName} Gerou um audio-voice...`)
                                return;
                            })
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
                                .then(async _ => {
                                    await api.saveLogInfo(timeLog, `${message.notifyName} removeu ${kick}`)
                                    return;
                                })
                            return;
                        }
                    });
            } catch (err) {
                await api.saveLogError(timeLog, err, message.chat.name, '!remove')
                return;
            }
        }

        if (message.type === 'image' && message.caption === '!set') {
            if (!message.chat.isGroup) return;
            if (await api.isRegister(message.author)) return;
            await api.setPhotoGroup(message, bot)
                .then(async msg => {
                    if (msg !== undefined) {
                        await bot.reply(message.from, msg, message.id)
                            .then(async _ => {
                                await api.saveLogInfo(timeLog, `${message.notifyName} Mudou a imagem do grupo...`)
                                return;
                            })
                        return;
                    }
                })
        }

        if (message.body.startsWith('!react')) {
            if (!message.chat.isGroup) return
            if (await api.isRegister(message.author)) return;
            let flag = message.body.slice(7)
            await api.reactOnOf(flag)
                .then(async msgReact => {
                    await bot.reply(message.from, msgReact, message.id)
                        .then(async _ => {
                            await api.saveLogInfo(timeLog, `${message.notifyName} Mudou a flag para ${flag}...`)
                            return;
                        });
                }).catch(async err => {
                    await api.saveLogError(timeLog, err, message.chat.name, '!react')
                    return;
                });
        }

        if (message.body.startsWith('!promote')) {
            if (!message.chat.isGroup) return;
            let user = message.body.slice(9)
            await api.setPromote(user, message, bot)
                .then(async msg => {
                    if (msg !== undefined) {
                        await bot.sendText(message.from, msg)
                            .then(async _ => {
                                await api.saveLogInfo(timeLog, `${message.notifyName} promoveu ${user} a admin...`)
                                return;
                            })
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
                                    await api.saveLogInfo(timeLog, `${message.notifyName} bloqueado da DM...`)
                                    return;
                                }
                            });
                    }
                })
            } catch (err) {
                await api.saveLogError(timeLog, err, message.chat.name, 'DM-block')
                return;
            }
        }

        gnose.reactGnose(message.author, message).then(async emoji => {
            await api.isReact()
                .then(async isOnOf => {
                    if (!isOnOf) return;
                    if (emoji !== undefined) {
                        await bot.react(message.id, emoji)
                        return;
                    }
                });
        });
    });
}