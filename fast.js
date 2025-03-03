document.addEventListener('DOMContentLoaded',(DOMEvet) => {
    // GO DIRECTLY TO VANILLA //
    gameConfigToplevel();
    findGame({target:document.querySelector('button#search')});
    setTimeout(() => {
        document.querySelector('#name').value = 'Mike';
        document.querySelector('#censor').checked = false;
        startGame();
    }, 50);
});