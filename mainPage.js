function homePage() {
    document.body.innerHTML = `
<div id='mainPage'>
    <button onclick="gameConfigToplevel()">New Game</button>
</div>
`;
}

function gameConfigToplevel() {
    let toplevel = document.body.appendChild(document.createElement('toplevel'));
    
    toplevel.id = 'mainPage';

    toplevel.innerHTML = `
    <h1>New Game</h1>
    <div><b>Address: </b><input value="datapacks/vanilla" /></div>
    <button onclick="findGame(event)" id='search'>Search</button>
    <button type='close' onclick="deleteParent(event)"></button>
    `;
}

async function getData(url) {
    let config_dat = await getFile(`${url}/config.dat`,(response) => response.json());
    return {
        title:config_dat.title,
        langs:config_dat.langs,
        rating:config_dat.rating
    }
}

var gameFiles;

async function findGame(event) {
    const parentCall = event.target.parentElement;
    let toplevel = parentCall//document.body.appendChild(document.createElement('toplevel'));

    game.url = `${parentCall.querySelector('input').value}`;

    gameFiles = await fetch(game.url)
        .then(async function(response) {
            if (!response.ok) {
                console.error('Error while fetching: OK = false');
                return {value:false,status:response.status}; // Error
            } else {
                return {value:true,data:await getData(game.url)}; // Puede continuar
            }
        });
    
    console.log(gameFiles);
    if (!gameFiles.value) {
        alert(`ERROR: ${gameFiles.status}`);
        return;
    } else {
        console.info(gameFiles.data);
    }

    toplevel.id = 'mainPage';

    toplevel.innerHTML = `
    <h1></h1>
    <h3></h3>
    <div><b>Language: </b><select id='lang'><optgroup label='(none)'></optgroup></select></div>
<div><b>Sex: </b><select id="sex"><option>Male</option><option>Female</option></select></div>
<div><b>Name: </b><input id="name" /></div>
<div><b>Censor: </b><input id="censor" type="checkbox" /></div>
<button onclick="if (document.querySelector('#name').value.replaceAll(' ','').length == 0) {alert('Please, choose a valid name')} else {startGame()}">Start</button>
<img src='${game.url}/icon.ico' />
<button type='close' onclick="deleteParent(event)"></button>`;

    toplevel.querySelector('h1').textContent = gameFiles.data.title;

    toplevel.querySelector('h3').textContent = `Rating: +${gameFiles.data.rating}`;
    
    let langObj = toplevel.querySelector('select#lang');
    Array.from(langObj.children).forEach((child) => child.remove());
    Object.entries(gameFiles.data.langs).forEach(([lang,ident]) => {
        langObj.appendChild(document.createElement('option')).textContent = lang;
    })
}

function deleteParent(event) {
    event.target.parentElement.remove();
}