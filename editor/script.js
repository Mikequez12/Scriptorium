document.addEventListener('DOMContentLoaded',async (DOMEvent) => {
    projectURL = window.location.hash.slice(1);
    file = await fetch(projectURL)
        .then((response) => {
            if (response.ok) {
                return response.json()
            } else {
                throw new Error(`Error al cargar: ${response.status}`)
            }
        })
    console.info(file);
    
    root = document.body.appendChild(document.createElement('ul'))
    root.classList.add('tree');
    insertScript(file,root)
})

function insertScript(lines,parent,r=0) {
    if (r>20) {return 0};
    console.log("LINES: ",lines);
    lines.forEach((line) => {
        if (Array.isArray(line)) {
            l = parent.appendChild(document.createElement('li'));
            l.innerHTML = `<span id='character'></span> says <span id='text'></span>`;
            if (!Array.isArray(line[0]) && typeof line[0] == typeof {}) {
                l.querySelector('#character').innerHTML = `<span><b></b><label></label></span>`;
                if (line[0]['.type'] == 'GET') {
                    l.querySelector('#character>span>b').textContent = 'GET: ';
                    l.querySelector('#character>span>label').textContent = line[0]['.get'];
                }
            } else {
                l.querySelector('#character').textContent = line[0];
            }
            line.slice(1).forEach((arg) => {
                if (!Array.isArray(arg) && typeof arg == typeof {}) {
                    el = document.createElement('span');
                    el.innerHTML = `<b></b><label></label>`;

                    if (arg['.type'] == 'GET') {
                        el.querySelector('span>b').textContent = 'GET: ';
                        el.querySelector('span>label').textContent = arg['.get'];
                    } else if (arg['.type'] == 'CENSOR') {
                        el.querySelector('span>b').textContent = 'CENSOR: ';
                        el.querySelector('span>label').textContent = arg['.text'];
                    }
                } else {
                    el = document.createElement('label');
                    el.textContent = arg;
                }
                l.querySelector('#text').appendChild(el)
            })
        } else if (line['.type'] == 'CHOOSE') {
            l = parent.appendChild(document.createElement('li'));
            l.appendChild(document.createElement('b'));
            l.querySelector('b').textContent = 'CHOOSE';
            ul = parent.appendChild(document.createElement('ul'));
            for (let [k,v] of Object.entries(line)) {
                if (k != '.type') {
                    kLi = ul.appendChild(document.createElement('li'));
                    kLiSpan = kLi.appendChild(document.createElement('span'));
                    if (k.slice(0,4) == 'URI!') {
                        k = JSON.parse(decodeURIComponent(k.slice(4)));
                    } else {
                        k = [k];
                    }
                    k.forEach((arg) => {
                        if (typeof arg == typeof '') {
                            kLiSpan.appendChild(document.createElement('label')).textContent = arg;
                        } else {
                            span = kLiSpan.appendChild(document.createElement('span'));
                            span.innerHTML = `<b></b><label></label>`;

                            if (arg['.type'] == 'GET') {
                                span.querySelector('b').textContent = 'GET: ';
                                span.querySelector('label').textContent = arg['.get'];
                            }
                        };
                        nul = ul.appendChild(document.createElement('ul'));
                    });
                    console.log("v: ",v);
                    insertScript(v,nul,r+1);
                };
            }
        } else if (line['.type'] == 'COMMAND') {
            l = parent.appendChild(document.createElement('li'));
            l.appendChild(document.createElement('b'));
            l.querySelector('b').textContent = 'COMMAND';
            ul = parent.appendChild(document.createElement('ul'));
            for (let [k, v] of Object.entries(line)) {
                if (k != '.type') {
                    li = ul.appendChild(document.createElement('li'));
                    li.innerHTML = `<span><b></b></span> <span id="value"></span>`;
                    li.querySelector('span>b').textContent = k;
                    li.querySelector('span#value').textContent = v;
                }
            }
        } else if (line['.type'] == 'CONDITION') {
            l = parent.appendChild(document.createElement('li'));
            l.appendChild(document.createElement('b'));
            l.querySelector('b').textContent = 'CONDITION';
            ul = parent.appendChild(document.createElement('ul'));
            for (let [k, v] of Object.entries(line)) {
                if (['.condition','.true','.false'].includes(k)) {
                    li = ul.appendChild(document.createElement('li'));
                    li.innerHTML = `<span><b></b></span><ul></ul>`;
                    li.querySelector('span>b').textContent = k;
                    console.log('v: ',v);
                    insertScript(k=='.condition'?[v]:v,li.querySelector('ul'),r+1);
                }
            }
        } else if (line['.type'] == 'OPERATION') {
            l = parent.appendChild(document.createElement('li'));
            l.appendChild(document.createElement('b'));
            l.querySelector('b').textContent = 'OPERATION';
            ul = parent.appendChild(document.createElement('ul'));
            console.log(line);
            for (let [k, v] of Object.entries(line)) {
                if (k != '.type') {
                    li = ul.appendChild(document.createElement('li'));
                    li.innerHTML = `<span><b></b></span>`;
                    li.querySelector('span>b').textContent = k;
                    li.querySelector
                }
            }
        } else {
            errorSpan = parent.appendChild(document.createElement('span'));
            errorSpan.style.color = 'red';
            errorSpan.textContent = 'ERROR';
        }
    })
}