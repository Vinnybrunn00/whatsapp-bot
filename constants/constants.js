const api = {
    apiUrl: 'https://api.clashofclans.com/v1/clans/%23QLRYLCP8/capitalraidseasons',
    auth: {
        'Authorization': 'Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzUxMiIsImtpZCI6IjI4YTMxOGY3LTAwMDAtYTFlYi03ZmExLTJjNzQzM2M2Y2NhNSJ9.eyJpc3MiOiJzdXBlcmNlbGwiLCJhdWQiOiJzdXBlcmNlbGw6Z2FtZWFwaSIsImp0aSI6IjIyOWYzN2RhLTQwNWQtNDExNS1iOTQzLTc3M2M2MzkyZGY2NCIsImlhdCI6MTcxMjk4NzE2Niwic3ViIjoiZGV2ZWxvcGVyLzY2NDg1MWRiLTc3MzUtNWNmNy0xMjdjLTM0OWRjMGE5MjhlNCIsInNjb3BlcyI6WyJjbGFzaCJdLCJsaW1pdHMiOlt7InRpZXIiOiJkZXZlbG9wZXIvc2lsdmVyIiwidHlwZSI6InRocm90dGxpbmcifSx7ImNpZHJzIjpbIjE2OC4xOTQuMTA2LjQxIl0sInR5cGUiOiJjbGllbnQifV19.qrVRliSKCKdcG7wwsseBtoY0ITMwy_m9F3fG-YjI6ROVlDjonPF1lVpMT0Hke19bdc7EmgWAP08kJTiRE1WzKw'
    },
}

const msg = {
    programmer_msg: `*❗ Mensagem do Desenvolvedor* ❗\n\n "Comandos ou mensagens não funcionam no privado, crie grupos com o bot para usa-los"`,
    administradores: '❗ Apenas administradores são autorizados a usar este comando. ❗',
    regExp: /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=|\?v=)([^#\&\?]*).*/,
    gttsMessageError: `❌ Lingua não reconhecida, tente: \n›• !audio --pt frase ou \`\`\`!lang \`\`\``,
    userAdminRequireMsg: '• Você precisa ser admin para usar este comando ❗',
    msgRequire: '❌ Você precisa se registrar primeiro antes de usar este comando! ❌',
    botAdminRequireMsg: '• O bot precisa ser admin para executar este comando ❗',
    ownerRequireMsg: '• Apenas o desevolvedor pode usar este comando ❗',
    regex: /[^A-z0-9]/g
}

exports.api = api;
exports.msg = msg;
