
isNode=$(dpkg --get-selections | grep -c nodejs)
isTesseract=$(dpkg --get-selections | grep -c tesseract-ocr-por)
isPython=$(dpkg --get-selections | grep -c python3)
ispip=$(dpkg --get-selections | grep -c pip)


install_dependences_and_init_bot() {
    sudo apt-get update && sudo apt-get upgrade -y

    if [ "$isTesseract" -eq "0" ]; then
        sudo apt-get install tesseract-ocr-por -y

    if [ "$isNode" -eq "0" ]; then
        sudo apt-get install nodejs -y
    fi

    if [ "$isPython" -eq "0" ]; then
        sudo apt-get install python3 -y
        if [ "$ispip" -eq "0" ]; then
            sudo apt-get install python3-pip -y
        fi
    fi

    pip install psutil
    
    sleep 1.5
    clear
    sudo node "$PWD/src/main.js"
}   

install_dependences_and_init_bot

