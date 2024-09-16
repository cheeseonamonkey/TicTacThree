(async () => {
   const Game = await import("./classes/game/Game.js");
   //   const Simulator = await import("./simulator.js");

   let game = new Game.default();
   game.render()


})();
