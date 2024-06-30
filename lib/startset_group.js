const search = require("lyria-npm");

class StartsetGroup {
    async sendLyrics(lyrics) {
        let getLyrics;
        await search(lyrics).then(async lyricsObj => {
            getLyrics = 'Spotify: ' + '_' + lyricsObj.Escuchar[0]['link'] + '_' + '\n\n' + '*' + lyricsObj.letra + '*'
        }).catch(async _ => {
            getLyrics = `- Letra da música _${lyrics}_ não encontrada, tente outra.`
        });
        return getLyrics;
    }
}

exports.StartsetGroup = StartsetGroup