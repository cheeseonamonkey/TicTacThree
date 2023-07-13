(async () => {
   const Game = await import("./players.js");
   await import("./drawing.js");
   await import("./dataClasses.js");
   //   const Simulator = await import("./simulator.js");

   let game = new Game.default();
   game.render()


})();
