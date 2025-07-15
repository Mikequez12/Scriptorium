import { parseScript, Game, setGame, readLine } from "./scriptorium.js";
import { Conversation, Command, Condition, Operation, GET, Censor, Choice, Title } from "./scriptorium.js";

function makeVar(el) {
    el = readLine(el,false);
    let obj = document.createElement('variable');
    if (el instanceof GET) {
        obj.id = 'GET';
        obj.innerHTML = `
        GET <input />
        `;
        obj.querySelector('input').value = el.line['.get'];
    } else if (typeof el == 'string') {
        obj.innerHTML = `<input />`;
        obj.querySelector('input').value = el;
    } else {
        obj.textContent = el.constructor.name;
    }
    return obj
}

function concat(obj,t) {
    let con = document.createElement('variable');
    con.id = 'concat';
    for (let el of t) {
        let en = con.appendChild(document.createElement('entry'));
        en.appendChild(makeVar(el));
    }
    obj.appendChild(con);
}

function makeEditor(
    lines,
    parent,
) {
    lines.forEach(line => {
        let block = document.createElement('block');
        parent.appendChild(block);

        if (line instanceof Title) {
            block.id = 'title';
            block.innerHTML = `
                <h2>Title</h2>
                <div><b>font: </b><input id="font" /></div>
                <div><b>fontSize: </b><input id="fontSize" /></div>
                <div><b>title: </b><input id="title" /></div>
                <div><b>sub: </b><input id="sub" /></div>
                <div><b>fontColor: </b><input id="fontColor" /></div>
            `;
            block.querySelector('#font').value = line.font;
            block.querySelector('#fontSize').value = line.fontSize;
            block.querySelector('#title').value = line.title;
            block.querySelector('#sub').value = line.sub;
            block.querySelector('#fontColor').value = line.color;
        }
        if (line instanceof Conversation) {
            block.id = 'conversation';
            block.innerHTML = `
                <h2>Conversation</h2>
                <img alt="icon" />
                <entry id="subject"></entry>
                <span>says</span>
                <entry id="content"></entry>
            `;
            concat(block.querySelector('#subject'),line.subject);
            concat(block.querySelector('#content'),line.conversation);
        }
        if (line instanceof Command) {
            block.id = 'command';

            block.innerHTML = `
            <h2>Command</h2>
            <div><input checked type="checkbox"><b>setFont: </b>
                <div style="display:flex;width:calc(100% - 105px);margin:0;">
                    <input id="setFont1" style="width:10%;margin-right:5px;" />
                    <input id="setFont2" style="width:calc(90% - 5px)" />
                </div>
            </div>
            <div><input checked type="checkbox"><b>font: </b><input id="font" /></div>
            <div><input checked type="checkbox"><b>fontSize: </b><input id="fontSize" /></div>
            <div><input checked type="checkbox"><b>titleFont: </b><input id="titleFont" /></div>
            <div><input checked type="checkbox"><b>titleFontSize: </b><input id="titleFontSize" /></div>
            <div><input checked type="checkbox"><b>background: </b><input id="background" /></div>
            <div><input checked type="checkbox"><b>set: </b>
                <div style="display:flex;width:calc(100% - 105px);margin:0;">
                    <input id="set1" style="width:10%;margin-right:5px;" />
                    <input id="set2" style="width:calc(90% - 5px)"  />
                </div>
            </div>
            `;

            if (line.set!=undefined) console.log(line);

            if (line.setFont!=undefined) {
                block.querySelector('input#setFont1').value = line.setFont[0];
                block.querySelector('input#setFont2').value = line.setFont[1];
            } else {
                block.querySelector('div:has(input#setFont1) > input[type="checkbox"]').checked = false
            };
            if (line.font!=undefined) {
                block.querySelector('input#font').value = line.font;
            } else {
                block.querySelector('div:has(input#font) > input[type="checkbox"]').checked = false
            };
            if (line.fontSize!=undefined) {
                block.querySelector('input#fontSize').value = line.fontSize;
            } else {
                block.querySelector('div:has(input#fontSize) > input[type="checkbox"]').checked = false
            };
            if (line.titleFont!=undefined) {
                block.querySelector('input#titleFont').value = line.titleFont;
            } else {
                block.querySelector('div:has(input#titleFont) > input[type="checkbox"]').checked = false
            };
            if (line.titleFontSize!=undefined) {
                block.querySelector('input#titleFontSize').value = line.titleFontSize;
            } else {
                block.querySelector('div:has(input#titleFontSize) > input[type="checkbox"]').checked = false
            };
            if (line.background!=undefined) {
                block.querySelector('input#background').value = line.background;
            } else {
                block.querySelector('div:has(input#background) > input[type="checkbox"]').checked = false
            };
            if (line.set!=undefined) {
                block.querySelector('input#set1').value = line.set[0];
                block.querySelector('input#set2').value = line.set[1];
            } else {
                block.querySelector('div:has(input#set1) input[type="checkbox"]').checked = false
            };
        }
        if (line instanceof Condition) {
            block.id = 'condition';

            block.innerHTML = `
            <h2>Condition</h2>
            <div><b>Condition: </b><entry></entry></div>
            <div><b>True: </b><div id="true"></div></div>
            <div><b>False: </b><div id="false"></div></div>
            `;
            let condition = block.querySelector('entry').appendChild(document.createElement('variable'));
            if (line.condition instanceof Operation) {
                condition.innerHTML = `Operation <entry id='a'></entry> <select>
                <option>equal</option><option>exactly-equal</option>
                </select> <entry id='b'></entry>`;
                concat(condition.querySelector('#a'),line.condition.a);
                concat(condition.querySelector('#b'),line.condition.b);
            };
            makeEditor(parseScript(line.true,0,false),block.querySelector('#true'));
            makeEditor(parseScript(line.false,0,false),block.querySelector('#false'));
        }
        if (line instanceof Choice) {
            block.id = 'choice';

            block.innerHTML = `
            <h2>Choice</h2>
            `;
            Object.entries(line.choices).filter(([k,v]) => k!='.type').forEach(([k,v]) => {
                let div = block.appendChild(document.createElement('div'));
                let b = div.appendChild(document.createElement('b'));
                b.textContent = k;
                let blockentry = div.appendChild(document.createElement('div'));
                blockentry.id = 'blockentry';
                makeEditor(parseScript(v,0,false),blockentry)
            })
        }
    })
}

async function main() {
    let file = await fetch(game.src + '/scripts/' + game.lang + '.json')
        .then(response => response.json())
    makeEditor(
        parseScript(file,0,false),
        document.body
    );
}

var game = new Game('datapacks/Urban-Shadows','ES','male','Mike');
setGame(game);

let main_script = document.head.appendChild(document.createElement('script'));
main_script.onload = main;
main_script.src='main.js';