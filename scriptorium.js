//import { use } from "react";

async function getFile(url,f=(v)=>v.text()) {
    return await fetch(url)
        .then(response => f(response))
}

export { getFile }

var game = undefined;
function setGame(newGame) {
    game = newGame;
    gameKeys.game = game;
}

export { setGame }


class Game {
    constructor(src,lang,playerGender,playerName) {
        this.src = src;
        this.lang = lang;
        this.choices = document.querySelector('#choices');
        this.next = document.querySelector('#next');
        this.player = {
            gender:playerGender,
            name:playerName
        };
        this.DOM = {
            img:document.querySelector('#img'),
            subject:document.querySelector('#subject'),
            text:document.querySelector('#text'),
            title: document.querySelector('#title h1'),
            sub: document.querySelector('#title h2')
        }

        this.end = true // Speak
    }
    async choice(c) {
        this.choices.innerHTML = '';

        return new Promise(resolve => {
            Object.keys(c).forEach(ch => {
                let btn = document.createElement('button');
                btn.textContent = ch;
                this.choices.appendChild(btn);

                setTimeout(() => btn.classList.add('ready'),10);

                btn.addEventListener('click', () => {
                    Array.from(this.choices.children).forEach((b) => {
                        b.disabled = true;
                        b.classList.remove('ready');
                        setTimeout(() => {
                            b.remove()
                        }, 1500)
                    })
                    resolve(c[ch]);
                },{once:true});
            });
        });
    }
    async speak(line) {
        if (this.end == false) {
            this.timeouts.forEach(t => {
                clearTimeout(t)
            });
            this.DOM.text.textContent = line.conversation;
            this.end = true;
        }
        else {
            if (line.images === undefined) {
                this.DOM.img.classList.add('hide');
            } else {
                this.DOM.img.classList.remove('hide');
                this.DOM.img.src = line.images.join('');
            }
            if (line.subject == '') {
                this.DOM.subject.classList.add('hide');
            } else {
                this.DOM.subject.classList.remove('hide');
                this.DOM.subject.textContent = line.subject;
            }

            this.DOM.text.textContent = '';
            this.timeouts = [];
            this.end = false;
            Array.from(line.conversation).forEach((l,t) => {
                this.timeouts.push(
                    setTimeout(() => {
                        this.DOM.text.textContent = this.DOM.text.textContent + l;
                        if (t==line.conversation.length-1) {
                            this.end = true;
                            this.timeouts = [];
                        }
                    }, t*20)
                )
            })
        }
        return new Promise(resolve => {
            this.next.addEventListener('click', () => {
                resolve(this.end);
            },{once:true})
        })
    }
}

export { Game }



function concat(t,useGet=true) {
    if (!Array.isArray(t)) return readLine(t,useGet);
    return t.map((_) => {
        return readLine(_,useGet)
    }).join('')
}

class Conversation {
    constructor(args) {
        if (args.length < 2) {
            throw new Error('Bad evocation of Conversation')
        } else {
            if (args[0] != '') {
                this.images = concat(args[0]);
            } else {
                this.images = undefined;
            }
        }
        this.subject = args[1];
        this.conversation = args[2];
    }
    evoke() {
        this.subject = concat(this.subject);
        this.conversation = concat(this.conversation)
    }
}

class Command {
    constructor(args) {
        this.font = args.font;
        this.setFont = args.setFont;
        this.fontSize = args.fontSize;
        this.background = args.background;
        this.set = args.set;
        this.titleFont = args.titleFont;
        this.titleFontSize = args.titleFontSize;
    }
}

class Condition {
    constructor(args,useGet=true) {
        this.condition = readLine(args['.condition'],useGet);
        this.true = args['.true'];
        this.false = args['.false']
    }
}

class Operation {
    constructor(args,useGet=true) {
        this.a = args['.a'];
        this.b = args['.b'];
        this.operation = args['.operation'];
    }
    evaluate() {
        if (this.operation == 'equal') {
            return concat(this.a) == concat(this.b)
        }
        if (this.operation == 'exactly-equal') {
            return concat(this.a) === concat(this.b)
        }
        throw new Error(`Unknown operation: ${this.operation}`)
    }
}

var gameKeys = {
};

class GET {
    constructor(line) {
        this.line = line;
    }
    get() {
        let path = this.line['.get'].split('.');
        console.log(path);
        console.log(gameKeys);
        let nwkys = gameKeys;
        path.forEach(p => {
            nwkys = nwkys[p];
        });
        return nwkys;
    }
}

function Censor(value) {
    if (game.censor) {
        return '*'.repeat(value.length);
    } else {
        return value;
    }
}

class Choice {
    constructor(line) {
        this.choices = Object.fromEntries(Object.keys(line).filter(v=>v!='.type').map(k=>[k,line[k]]))
    }
}

class Title {
    constructor(line) {
        this.title = line.title;
        this.sub = line.sub;
        this.color = line.fontColor;
        this.font = line.font;
        this.fontSize = line.fontSize;
    }
}



export { Conversation, Command, Condition, Operation, GET, Censor, Choice, Title }




function readLine(line,useGet=true) {
    if (Array.isArray(line)) {
        line = new Conversation(line);
    } else if (typeof line == 'object') {
        line = getCommand(line,useGet)
    }
    if (line instanceof GET && useGet) {
        return line.get();
    }
    return line;
}

function getCommand(line,useGet=true) {
    if (line['.type'] == 'COMMAND') return new Command(line);
    if (line['.type'] == 'CONDITION') return new Condition(line,useGet);
    if (line['.type'] == 'GET') return new GET(line);
    if (line['.type'] == 'OPERATION') return new Operation(line,useGet);
    if (line['.type'] == 'CENSOR') return Censor(line['.text']);
    if (line['.type'] == 'CHOOSE') return new Choice(line);
    if (line['.type'] == 'TITLE') return new Title(line);
    console.log(line['.type'])
    throw new Error(`Unexpected command: ${line['.type']}`);
    return line
}

function readLines(lines,useGet=true) {
    let ans = [];
    lines.forEach(line => {
        ans.push(
            readLine(line,useGet)
        )
    });
    return ans;
}

function parseScript(script,useGet=true) {
    let ans = readLines(script,useGet);
    return ans
}

function setCommand(k, v) {
    let keys = k.split('.');
    let obj = gameKeys;  // Referencia al objeto raíz

    for (let i = 0; i < keys.length; i++) {
        let key = keys[i];

        // Si estamos en la última clave, asignamos el valor
        if (i === keys.length - 1) {
            obj[key] = v;
        } else {
            // Si la propiedad no existe o no es objeto, creamos un objeto
            if (typeof obj[key] !== 'object' || obj[key] === null) {
                obj[key] = {};
            }
            obj = obj[key];  // Bajamos un nivel en la jerarquía
        }
    }
}


async function readScript(script,index=0,condition=()=>true) {
    let line = script[index];
    if (index >= script.length || !condition(index)) {
        return;
    }

    let solved = true;
    if (line instanceof Conversation) {
        line.evoke();
        solved = await game.speak(line);
    }
    if (line instanceof Condition) {
        if (line.condition.evaluate()) {
            await readScript(parseScript(line.true));
            console.log('TRUE')
        } else {
            await readScript(parseScript(line.false));
            console.log('FALSE')
        }
    }
    if (line instanceof Choice) {
        game.next.classList.add('hide');
        let response = await game.choice(line.choices);
        response = parseScript(response);
        game.next.classList.remove('hide');
        await readScript(response);
    }
    if (line instanceof Command) {
        if (line.setFont != undefined) {
            document.head.appendChild(document.createElement('style')).innerText = `@font-face { font-family:"${line.setFont[0]}";src:url("${formatURL(line.setFont[1])}") }`
        }
        if (line.font != undefined) {
            document.body.style.setProperty('--font',`"${line.font}"`)
        }
        if (line.fontSize != undefined) {
            document.body.style.setProperty('--font-size',`${line.fontSize}px`);
        }
        if (line.titleFont != undefined) {
            document.body.style.setProperty('--title-font',`"${line.titleFont}"`)
        }
        if (line.titleFontSize != undefined) {
            document.body.style.setProperty('--title-font-size',`${line.titleFontSize}px`)
        }
        if (line.background != undefined) {
            document.body.style.setProperty('--alpha',1);
            setTimeout(() => {
                document.body.style.backgroundImage = `url(${game.src}/${line.background})`
                document.body.style.setProperty('--alpha',0);
            }, 500);
        }
        if (line.set != undefined) {
            setCommand(line.set[0],line.set[1]);
        }
    }
    if (line instanceof Title) {
        game.DOM.title.parentElement.style.transition = `opacity .5s;`;

        game.DOM.title.parentElement.style.opacity = 0;
        setTimeout(() => {
            game.DOM.title.parentElement.style.transition = `none;`;
            game.DOM.title.textContent = line.title;
            game.DOM.sub.textContent = line.sub;
            game.DOM.title.parentElement.style.setProperty('--color',line.color);
            game.DOM.title.style.textShadow = `0 0 10px ${line.color}`;
            game.DOM.sub.style.textShadow = `0 0 10px ${line.color}`;
            game.DOM.title.parentElement.style.fontFamily = line.font;
            game.DOM.title.style.fontSize = line.fontSize;
            game.DOM.sub.style.fontSize = line.fontSize - 15;
            game.DOM.title.parentElement.style.scale = 2;
            game.DOM.title.parentElement.classList.add('no-animation');
            void game.DOM.title.parentElement.offsetWidth;
            game.DOM.title.parentElement.style.setProperty('--dist','150px');
            void game.DOM.title.parentElement.offsetWidth;
            game.DOM.title.parentElement.classList.remove('no-animation');

            setTimeout(() => {
                game.DOM.title.parentElement.style.transition = `all .5s`;
                game.DOM.title.parentElement.style.scale = 1;
                game.DOM.title.parentElement.style.opacity = 1;
                game.DOM.title.parentElement.style.setProperty('--dist','0px');
            },50);
        }, 550);
    }
    await readScript(script,index+solved);
}

export { parseScript, readScript, readLine };

function formatURL(url) {
  if (/^https?:\/\//.test(url)) {
    return url;
  } else {
    return game.src + '/' + url;
  }
}


document.addEventListener('keydown',(event) => {
    if (event.key == ' ' || event.key == 'Enter') {
        game.next.click()
    }
})