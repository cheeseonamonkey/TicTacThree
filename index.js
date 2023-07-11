(async () => {



   const Game = await import("./players.js")
   await import("./drawing.js");
   await import("./dataClasses.js");



   console.log(new Game.default());







})();