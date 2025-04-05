document.addEventListener('DOMContentLoaded',async () => {
    data = await fetch(window.location.hash.slice(1))
        .then((response => response.ok?response.json():Error(`Error in response ${response.status} ${response.statusText}`)));
    
    console.log(data);
    readScript(data,document.body)
})

HTMLElement.prototype.setText = function(text) {
    if (!Array.isArray(text)) {
        text = [text];
    };
    this.textContent = text.map((l) => {
        if (typeof l == typeof '') {
            return l
        } else if (!Array.isArray(l) && typeof l == typeof {}) {
            return `<${l['.type']=='GET'?l['.get']:"?"}>`
        }
    }).join('');
}

function readScript(lines, parent) {
    let ul = parent.appendChild(document.createElement('ul'));
    lines.forEach((line) => {
        let li = ul.appendChild(document.createElement('li'));
        let container = li.appendChild(document.createElement('div'));
        if (Array.isArray(line)) {
            container.innerHTML = `
                <span id="who"></span>
                <span id="what"></span>
            `;
            container.querySelector('#who').setText(line[0]);
            container.querySelector('#what').setText(line.slice(1));
        } else if (typeof line == typeof {}) {
            details = li.appendChild(document.createElement('details'));
            details.appendChild(document.createElement('summary')).textContent = line['.type'];
            nwul = details.appendChild(document.createElement('ul'));
            for (let [k,v] of Object.entries(line)) {
                nwli = nwul.appendChild(document.createElement('li'));
                details = nwli.appendChild(document.createElement('details'));
                details.appendChild(document.createElement('summary')).setText(k);
                if (!Array.isArray(v)) {
                    v = [v];
                };
                console.log(k,v);
                readScript(v,details);
            }
        } else if (typeof line == typeof '') {
            container.textContent = line;
        }
    });
}

document.addEventListener('keydown',(event)=>{if(event.ctrlKey && event.key=='Enter'){document.querySelectorAll('details').forEach((det)=>det.open=true)}})