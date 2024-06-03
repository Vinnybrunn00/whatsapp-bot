class LpfGroup {
    constructor(baseUrl, apiKey) {
        this.baseUrl = baseUrl
        this.apiKey = apiKey
        this.headers = { 'Authorization': `Bearer ${this.apiKey}` }
    }

    async getRankingCamp() {
        let infoClass, sendError;
        await fetch(`${this.baseUrl}/campeonatos/10/tabela`,
            { headers: this.headers }).then(async response => {
                if (response.status !== 200) return;
                let times = response.json()
                for (let i = 0; i < resp.length; i++) {
                    let info = times[i]
                    infoClass = this.resolveClass(
                        info.posicao, info.time.sigla, info.jogos, info.vitorias, info.derrotas, info.saldo_gols, info.pontos
                    );
                }
            }).catch(err => {
                sendError = err
            })
        return infoClass || sendError
    }

    resolveClass(pos, sigla, games, wins, loser, sg, points) {
        return `${pos}º ${sigla}  ${games} ${wins} ${loser} ${sg} *${points}*`
    }

    resolveBanner(name, timers, status, round, statusRound) {
        return `------〘 ${name} 〙------\n\n[${timers}] ➜ *Rodada em ${status}*\n➜ ${round}º Rodada - *${statusRound}*\n\n`
    }
}

exports.LpfGroup = LpfGroup;