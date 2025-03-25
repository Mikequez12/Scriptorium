document.addEventListener('DOMContentLoaded',(DOMEvent) => {
    if (window.location.hash != '#fast') {
        return
    }
    // GO DIRECTLY TO VANILLA //
    gameConfigToplevel();
    findGame({target:document.querySelector('button#search')});
    setTimeout(() => {
        document.querySelector('#name').value = 'Mike';
        document.querySelector('#censor').checked = false;
        startGame();
    }, 500);
});