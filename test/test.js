const yt = require('ytdl-core')

//const down = yt('https://www.youtube.com/watch?v=QWGaqUdRvBM')

async function test() {
    getInfors = await yt.getInfo('https://www.youtube.com/watch?v=QWGaqUdRvBM')
    return getInfors.player_response.videoDetails.title
}

async function main(){
    console.log(await test())
}

main()