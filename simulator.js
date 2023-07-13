export function Simulator() {

   (async () => {
      const Game = await import("./players.js");
      await import("./drawing.js");
      await import("./dataClasses.js");
      //   const Simulator = await import("./simulator.js");

      let winners = {};
      winners["numGames"] = 0;
      winners["Player 1"] = 0;
      winners["Player 2"] = 0;

      const batchSize = 20;
      const totalGames = 50_000;
      const numBatches = Math.ceil(totalGames / batchSize); // Calculate the number of batches

      for (let batch = 0; batch < numBatches; batch++) {
         const batchPromises = [];

         for (let i = 0; i < batchSize; i++) {
            const gamePromise = new Promise(async (resolve) => {
               winners["numGames"] = winners["numGames"] + 1;

               let game = new Game.default();
               console.log("Game:");
               await game.play();

               winners[game.winner.name] = winners[game.winner.name] + 1;

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