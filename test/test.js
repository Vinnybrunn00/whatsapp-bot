
const time = new Date()

const timersLog = `${time.getFullYear()}.${time.getMonth() >= 10 ? time.getMonth() + 1 : `0${time.getMonth() + 1}`}.${time.getDate() >= 10 ? time.getDate() : `0${time.getDate()}`} ${time.getHours() >= 10 ? time.getHours() : `0${time.getHours()}`}.${time.getMinutes() >= 10 ? time.getMinutes() : `0${time.getMinutes()}`}.${time.getSeconds() >= 10 ? time.getSeconds() : `0${time.getSeconds()}`}`


console.log(timersLog)