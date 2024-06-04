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
                        info.posicao, info.time.sigla, info.jogos, info.vitorias, info.empates, info.derrotas, info.saldo_gols, info.pontos
                    );
                    ranking.push(`${infoClass}\n`)
                }
                infoClass = ranking.toString()
            }).catch(err => {
                sendError = err
            })
        return infoClass || sendError
    }

    resolveClass(pos, sigla, games, wins, draw, loser, sg, points) {
        return `Times       j       v       d       sg       p\n${'-' * 35}\n${pos}º ${sigla}    ${games}  |  ${wins}  |  ${draw}  |  ${loser}  |  ${sg}  |  *${points}*`
    }

    resolveBanner(name, timers, status, round, statusRound) {
        return `----------〘 ${name} 〙----------\n\n \`\`\`[${timers}]\`\`\` ➜ *Rodada em ${status}*\n➜ ${round}º Rodada - *${statusRound}*\n\n`
    }
}

exports.LpfGroup = LpfGroup;