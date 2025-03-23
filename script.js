var game = {};

document.addEventListener('DOMContentLoaded',function() {
    homePage();
});

async function getFile(url,func) {
    return fetch(url)
        .then((response) => {
            if (!response.ok) {
                return response.status;
            } else {
                return func(response);
            }
        })
}

function getJSON(dict, attr) {
    if (typeof dict == typeof {} && !Array.isArray(dict)) {
        return getJSON(dict[attr[0]],attr.slice(1))
    } else {
        return dict
    }
}