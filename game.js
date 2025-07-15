import { parseScript, getFile, setGame, readScript, Game } from "./scriptorium.js";

var game = new Game('datapacks/Urban-Shadows','ES','female','Dalia');
setGame(game);

async function main() {
    let parsedScript = parseScript(await getFile(`${game.src}/scripts/${game.lang}.json`,(response)=>response.json()));
    console.log(
        parsedScript
    );
    await readScript(parsedScript,0,(l)=>l<=999)
}
main()