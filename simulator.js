export function simulator(numGames = 1000, verboseConsole = false) {

   (async () => {
      const Game = await import("./classes/game/models/Game.js");
      //   const Simulator = await import("./simulator.js");

      let winners = {};
      winners["numGames"] = 0;
      winners["Player 1"] = 0;
      winners["Player 2"] = 0;

      const batchSize = 20;
      const numBatches = Math.ceil(numGames / batchSize);

      for (let batch = 0; batch < numBatches; batch++) {
         const batchPromises = [];

         for (let i = 0; i < batchSize; i++) {
            const gamePromise = new Promise(async (resolve) => {
               winners["numGames"] = winners["numGames"] + 1;

               let game = new Game.default();
               console.log("Game:");
               game.play(verboseConsole = true);

               winners[game.winner.name] = winners[game.winner.name] + 1;

               if (verboseConsole)
                  console.log(game.cubeSet.toStringTUI());

               resolve();

            });

            batchPromises.push(gamePromise);

         }

         await Promise.all(batchPromises);

         console.clear();
      }

      winners.winRatio = 1.0 * (winners["Player 1"] / winners["Player 2"])
      console.log(winners);
   })();


}



simulator(1, true);