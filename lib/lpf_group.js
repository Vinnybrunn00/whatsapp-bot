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
        let _rounds = [];
        await fetch(`${this.baseUrl}/campeonatos/10/rodadas/${round}`)
            .then(async response => {
                let rounds = await response.json()
                for (let games of rounds.partidas) {
                    if (games.status !== 'finalizado') {
                        _rounds.push(`~${jogos.placar}~\n`)
                        return;
                    }
                    _rounds.push(jogos.placar + '\n')
                    return;
                }
            })
        return _rounds.toString()
    }

    resolveClass(pos, sigla, games, wins, loser, sg, points) {
        return `${pos}º *${sigla}*     ${games}  |  ${wins}  |  ${loser}  |  ${sg}  |  *${points}*`
    }

    resolveBanner(name, timers, status, round, statusRound) {
        return `----------〘 ${name} 〙----------\n\n \`\`\`[${timers}]\`\`\` ➜ *Rodada em ${status}*\n➜ ${round}º Rodada - *${statusRound}*\n\nTimes        j       v       d       sg       p\n${'-'.repeat(34)}\n`
    }

    resolveRounds(timers, round, clashes) {
        return `----------〘 Brasileirão 2024 〙----------\n\n\`\`\`[${timers}]\`\`\` ➜ Confrontos\n*${round}º Rodada*\n\n${clashes}`
    }
}

exports.LpfGroup = LpfGroup;