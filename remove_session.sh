
folder="./_IGNORE_BOT"
filejson="BOT.data.json"

if [ -e $folder ] || [ -e $filejson ]; then
    sudo rm -rf $folder && sudo rm -rf $filejson
    echo "$folder e $filejson removidos."
else
    echo "[!] Arquivos inexistente."
fi