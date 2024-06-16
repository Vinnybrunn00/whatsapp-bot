const objReact = require('../constants/lpf_constants').objReactLpf
const gabi = require('../constants/lpf_constants').msgGabi
const members = require('../constants/lpf_constants').lpfMembers

class LpfGroup {
    constructor(baseUrl, apiKey) {
        this.baseUrl = baseUrl
        this.apiKey = apiKey
        this.headers = { 'Authorization': `Bearer ${this.apiKey}` }
    }

    async getRankingCamp() {
        let infoClass, sendError, ranking = [];
        await fetch(`${this.baseUrl}/campeonatos/10/tabela`,
            { headers: this.headers }).then(async response => {
                if (response.status !== 200) return;
                let times = await response.json()
                for (let i = 0; i < times.length; i++) {
                    let info = times[i]
                    infoClass = this.resolveClass(
                        info.posicao, info.time.sigla, info.jogos, info.vitorias, info.derrotas, info.saldo_gols, info.pontos
                    );
                    ranking.push(`${infoClass}\n`)
                }
                infoClass = ranking.toString()
            }).catch(err => {
                sendError = err
            })
        return infoClass || sendError
    }

    async getRounds(round) {
        try {
            let _rounds = [];
            if (round === undefined || round === '0') return;
            if (round.length > 0 || round.length < 3) {
                if (parseInt(round) > 38) {
                    return `> Rodada ${round} não existe!`
                }
                await fetch(`${this.baseUrl}/campeonatos/10/rodadas/${round}`,
                    { headers: this.headers }).then(async response => {
                        let rounds = await response.json()
                        for (let games of rounds.partidas) {
                            if (games.status !== 'finalizado') {
                                _rounds.push(`${games.placar}\n* ${games.data_realizacao === null || games.hora_realizacao === null ? '_Data não informada_' : `_${games.data_realizacao} ás ${games.hora_realizacao}_`}\n- 📍 _${games.estadio !== null ? games.estadio['nome_popular'] : 'N/A'}_\n\n`)
                                continue
                            }
                            _rounds.push(games.placar + ' ✅\n')
                        }
                    });
                return _rounds.toString()
            }
        } catch (err) {
            throw err
        }
    }

    async reactLpf(contact) {
        let _react;
        objReact.forEach(async element => {
            for (let i = 0; i < element.user.length; i++) {
                let user = element.user[i]
                if (contact === user[0]) {
                    _react = user[1];
                }
            }
        });
        return _react
    }

    async getTopScorer() {
        try {
            let _player = [];
            await fetch(`${this.baseUrl}/campeonatos/10/artilharia`,
                { headers: this.headers }).then(async response => {
                    let players = await response.json()
                    for (let player of players) {
                        let tsPlayer = this.resolveTS(player.atleta.nome_popular, player.gols)
                        _player.push(tsPlayer + '\n')
                    }
                });
            return _player.toString()
        } catch (err) {
            throw err
        }
    }

    async delMessage(body, author) {
        if (members.includes(author)) {
            for (let i = 0; i < gabi.length; i++) {
                if (body === gabi[i]) {
                    return true
                }
            }
        }
        return false
    }

    resolveClass(pos, sigla, games, wins, loser, sg, points) {
        return `${pos}º *${sigla}*       ${games}  |  ${wins}  |  ${loser}  |  ${sg}  |  *${points}*`
    }

    resolveTS(player, gols) {
        return `* ${player}  -  *${gols} Gols*`
    }

    resolveScorerBanner(timers, topScorer) {
        return `--------〘 Artilheiros 〙--------\n\n \`\`\`[${timers}]\`\`\` ➜ Brasileirão 2024\n\n${topScorer}`
    }

    resolveBanner(name, timers, status, round, statusRound) {
        return `----------〘 ${name} 〙----------\n\n \`\`\`[${timers}]\`\`\` ➜ *Rodada em ${status}*\n➜ ${round}º Rodada - *${statusRound}*\n\nTimes        j       v       d       sg       p\n${'-'.repeat(34)}\n`
    }

    resolveRounds(timers, round, clashes) {
        return `----------〘 Brasileirão 2024 〙----------\n\n\`\`\`[${timers}]\`\`\` ➜ Confrontos\n*${round}º Rodada*\n\n${clashes}`
    }
}

exports.LpfGroup = LpfGroup;