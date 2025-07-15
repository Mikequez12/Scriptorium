document.addEventListener('DOMContentLoaded',async (event) => {
    let data = await fetch(window.location.hash.slice(1))
        .then(response => response.ok?response.json():false);
    
    console.log(data);
    
    readLines(data);
})

function formatText(t,p) {
    let el = document.createElement('el');
    if (Array.isArray(t)) {
        readLines(t,p)
    } else if (typeof t == typeof {}) {
        el.style.color = 'white';
        if (t['.type'] == 'GET') {
            el.textContent = t['.get'];
            el.style.backgroundColor = 'lightSeaGreen';
        } else if (t[".type"] == 'CENSOR') {
            el.textContent = t['.text'];
            el.style.backgroundColor = 'violet'
        } else if (t['.type'] == 'OPERATION') {
            readLines([t],p)
        } else {
            el.textContent = "OBJECT";
            el.style.backgroundColor = 'red';
        }
    } else {
        el.textContent = t;
    }
    p.appendChild(el);
}

function readLines(data,parent=document.querySelector('ul')) {
    for (line of data) {
        let li = parent.appendChild(document.createElement('div'));
        li.id = 'li';
        if (Array.isArray(line)) {
            li.innerHTML = '<span id="who"></span><span id="conver"></span>';
            formatText(line[0],li.querySelector("#who"));
            for (c of line.slice(1)) {
                formatText(c,li.querySelector('#conver').appendChild(document.createElement('span')));
            }
        } else if (typeof line == typeof {}) {
            li.innerHTML = '<details><summary></summary></details>';
            li.querySelector('summary').textContent = line['.type'];
            let det = li.querySelector('details');
            for (let [k,v] of Object.entries(line)) {
                if (k == '.type') continue;
                let div = det.appendChild(document.createElement('div'));
                div.style.display = 'flex';
                div.id = 'kv';
                key = div.appendChild(document.createElement('span'));
                key.id = 'key';
                key.innerText = k;
                value = div.appendChild(document.createElement('span'));
                value.id = 'value';
                formatText(v,value);
            }
        }
    }
}