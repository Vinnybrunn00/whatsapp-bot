## Clone the repository in Ubuntu

``` shell
> git clone https://github.com/Vinnybrunn00/Bot_Whatsapp_Sticker.git
```

```shell
> cd Bot_Whatsapp_Sticker
```

## Cloning the repository in Windows

- If you don't have Git installed on Windows, [install here](https://github.com/git-for-windows/git/releases/download/v2.37.1.windows.1/Git-2.37.1-64-bit.exe)

```shell
> git clone https://github.com/Vinnybrunn00/Bot_Whatsapp_Sticker.git
```

```shell
> cd Bot_Whatsapp_Sticker
```

## Install tesseract in portuguese - Ubuntu

- [See the languages](https://stackoverflow.com/questions/52891563/how-to-install-language-in-tesseract-ocr)

```shell
> sudo apt-get install tesseract-ocr-por -y
```

> [!note]
> Note that in the code, there is a condition that prevents it from running on Windows, tesseract uses command lines, so I don't know if it will work well on Windows.

#### Code:

```javascript

// send audio google
if (command.slice(0, 6) === '!voice') {
    if (os.platform() !== 'linux') return;
...
}
```

## Installation


#### ATTENTION: When cloning the [Bot_Whatsapp_Sticker](https://github.com/Vinnybrunn00/Bot_Whatsapp_Sticker) install the modules:


```shell
> npm i
```
If there is an error in the installation, delete the file. ```package.json``` and install again:

```shell
> npm i --save @open-wa/wa-automate@latest
```

Full API documentation [here](https://github.com/open-wa/wa-automate-nodejs)


## Functionality

| Sticker Gerator |                Functionality    |
| :-----------: | :--------------------------------:|
|       ✅       | Send Photo with Caption          |
|       ✅       | Send video/gif with Caption      |
|       ✅       | Reply A Photo                    |
|       ✅       | Reply A video/gif                |


| Group  |                     Functionality         |
| :-----------: | :--------------------------------: |
|       ✅        |   Mention all member             |
|       ✅        |   Welcome to new members         |
|       ✅        |   Welcome kick                   |
|       ❌        |   Send flood                     |
|       ✅        |   Generate invite link           |
|       ✅        |   Revoke link group              |
|       ✅        |   Send Link Group                |
|       ✅        |   Owner bot                      |
|       ✅        |   Swearing - Delete message      |
|       ✅        |   Add Member Group	            |
|       ✅        |   Kick Member Group	            |
|       ✅        |   Send Audio With Google Voice   |
|       ✅        |   Send Code Language	            |
|       ✅        |   Download Video YouTube	        |
|       ✅        |   Promote Participant	        |
|       ✅        |   Demote Participant	            |
|       ✅        |   Set Description Group	        |
|       ✅        |   Get Description Group          |
|       ✅        |   Get Admins	                    |
|       ✅        |   Set Photo Group	            |
|       ✅        |   Get Host Settings              |

| Debug Mode  |                     Functionality    |
| :-----------: | :--------------------------------: |
|       ✅        | The bot saves events to a log file |
|       ✅        | Send log file                    |
