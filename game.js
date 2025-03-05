class Line {
    constructor(text) {
        this.value = text
        
        if (Array.isArray(this.value)) {
            this.type = 'CONVERSATION'
        } else if (typeof this.value == typeof {}) {
            if (this.value['.type'] == 'COMMAND') {
                this.type = 'COMMAND'
            } else if (this.value['.type'] == 'CONDITION') {
                this.type = 'CONDITION';
            } else if (this.value['.type'] == 'CHOOSE') {
                this.type = 'CHOICE';
            } else {
                this.type = undefined;
            }
        } else {
            this.type = undefined;
        }
    }
}

function get(v) {
    if (v['.type'] === 'GET') {
        command = v['.get'];
        attr = command.split('.');
        result = getJSON(
            game.varSet,
            attr
        )
        return result;
    }
}

function setGameVarSet(path,value) {
    let current = game.varSet;
    for (let i = 0; i < path.length - 1; i++) {
        let key = path[i];
        if (!(key in current)) current[key] = {}; // Crea si no existe
        current = current[key]; // Baja un nivel
    }
    current[path[path.length - 1]] = value; // Asigna el valor final
}

var line;
function readScript() {
    line = new Line(game.script[game.line]);

    console.info(line);

    if (line.type === undefined) {
        console.error(`UNKNOWN TYPE\n${line.value}`)
    } else if (line.type === 'COMMAND') { // Sintaxis de los comandos
        if (line.value.background) {
            document.querySelector('img#bg').style.filter = `brightness(0)`;
            setTimeout(() => {
                document.querySelector('img#bg').src = `${game.url}/${line.value.background}`;
                document.querySelector('img#bg').style.filter = `brightness(1)`;
            },500)
        };
        if (line.value.set) {
            setGameVarSet(line.value.set[0].split('.'),line.value.set[1])
        };
        if (line.value.addkey) {
            game.varSet.game.keys.push(line.value.addkey);
        }
        if (line.value.removekey) {
            if (game.varSet.game.keys.includes(line.value.removekey)) {
                game.varSet.game.keys.pop(game.varSet.game.keys.indexOf(line.value.removekey)-1);
            }
        }
        if (line.value.font) {
            document.documentElement.style.setProperty('--font',line.value.font);
        }

        game.line++;
        readScript()
    } else if (line.type === 'CONDITION') {
        key = function() {
            if (line.value['.condition']['.type'] === 'OPERATION') {
                if (line.value['.condition']['.equal']) {
                    result = get(line.value['.condition']['.value']);
                    if (result == line.value['.condition']['.equal']) {
                        return '.true';
                    } else {
                        console.log('.false')
                    }
                } else if (line.value['.condition']['has']) {
                    return getJSON(game.varSet,line.value['.condition']['value'].split('.')).includes(line.value['.condition']['has'])?'.true':'.false';
                } else {
                    console.error(`No operation\n${line.value['.condition']['.equal']}`);
                    console.info(line.value);
                }
            }
        }
        key = key();
        console.info(key);
        
        console.log(line.value);
        console.log(line.value[key]);
        game.script.splice(game.line+1, 0, ...line.value[key]);
        console.info(line.value);
        game.line++;
        readScript();

    } else if (line.type == 'CHOICE') {
        Object.entries(line.value).filter(([key,value]) => key != '.type').forEach(([k,v],i) => {
            setTimeout(function() {
                let btn = document.querySelector('.choices').appendChild(document.createElement('button'));
                console.log(btn);
                btn.classList.add('CHOICE');
                setTimeout(function() {
                    btn.classList.add('can-continue');
                },100);
                btn.innerText = k.slice(0,4)=='URI!'?formatScript(JSON.parse(decodeURIComponent(k.slice(4)))).join(''):k;
                btn.addEventListener('click',(event) => {
                    game.script.splice(game.line+1,0,...v);
                    game.line++;
                    Array.from(document.querySelector('.choices').children).forEach((child,index) => {
                        setTimeout(() => {
                            child.style.opacity = 0;
                            child.style.width = "5%";
                            setTimeout(() => {
                                child.remove();
                            },2000)
                        },index*100);
                        child.style.pointerEvents = "none";
                    })
                    readScript();
                })
            },i*100)
        })
    } else if (line.type === 'CONVERSATION') {
        console.log(line);
        dialog = document.querySelector('#dialog-box');
        nameLabel = document.querySelector('#name-label');
        dialog.textContent = '';
        conversation = formatScript(line.value.slice(1)).join('');
        conversationName = formatScript([line.value[0]]);
        console.log(conversation);
        nameLabel.textContent = conversationName;
        for (let i = 0; i < conversation.length; i++) {
			let timeout = setTimeout(() => {
				dialog.textContent = `${dialog.textContent}${conversation[i]}`;
			},i*30);
			timeouts.push(timeout);
		};
        setTimeout(() => {
            document.querySelector('#next').classList.add('ready');
        }, conversation.length*30);
    }
}

function formatScript(value) {
    console.log(value);
    return value.map((v) => {
        if (typeof v == typeof '') {
            return v;
        } else if (typeof v == typeof {}) {
            if (v['.type'] == 'GET') {
                return get(v)
            } else if (v['.type'] == 'CENSOR') {
                return game.censor?'*'.repeat(v['.text'].length):v['.text']
            } else {
                return 'UNKNOWN TYPE'
            }
        } else {
            return 'UNKNOWN FORMAT'
        }
    })
}

var conversation;

function stopScript() {
    let line = new Line(game.script[game.line]);
    if (line.type == 'CHOICE') {
        return 0;
    }
    if (dialog.textContent == conversation) {
        game.line++;
        document.querySelector('#next').classList.remove('ready');
        readScript()
        document.querySelector('#next').classList.remove('ready');
    } else {
        console.log('skip animation');
        timeouts.forEach((tm) => {
            clearTimeout(tm);
        });
        dialog.textContent = conversation;
        document.querySelector('#next').classList.add('ready');
    };
}

document.addEventListener('keydown',(event) => {
    if (event.key == 'Enter' || event.key == ' ') {
        stopScript();
    }
})

async function startGame() {
    game.lang = document.querySelector('select#lang').value;
    game.player = {};
    game.player.sex = document.querySelector('select#sex').value;
    game.player.name = document.querySelector('input#name').value;
    game.censor = document.querySelector('input#censor').checked;

    document.body.innerHTML = `<div class='choices'></div><div id="boxes"><div id="name-box"></div><p id="name-label"></p><textarea id="dialog-box"></textarea></div><button id='next' onclick="stopScript()"></button><img id="bg" />`;
    

    game.line = 0;
    game.script = await getFile(`${game.url}/lang/${gameFiles.data.langs[game.lang]}.json`,(response) => response.json());
    console.log(game.script);


    game.varSet = {
        default:{
            player:{
                gender:game.player.sex,
                name:game.player.name
            }
        },
        game:{
            keys:[]
        }
    };

    
    readScript();
}

var timeouts = [];