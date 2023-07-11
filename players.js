import { CubeSet, ClaimState, Cube } from "./dataClasses.js";

var Draw

(async () => {

   var Players = await import("./players.js")
   Draw = await import("./drawing.js");

})();


class Player {
   constructor(name, claimState) {
      this.name = name;
      this.claimState = claimState;
   }

   makeMove(cubeSet) {
      const winningMove = this.getWinningMove(cubeSet);
      if (winningMove) {
         return winningMove;
      }

      const defensiveMove = this.getDefensiveMove(cubeSet);
      if (defensiveMove) {
         return defensiveMove;
      }

      const strategicMove = this.getStrategicMove(cubeSet);
      if (strategicMove) {
         return strategicMove;
      }

      const randomMove = this.getRandomMove(cubeSet);
      return randomMove;
   }

   getWinningMove(cubeSet) {
      const consecutiveClaims = cubeSet.getConsecutiveClaims(2);
      for (const consecutiveGroup of consecutiveClaims) {
         const emptyCube = consecutiveGroup.find((cube) => cube.claimState === ClaimState.EMPTY);
         if (emptyCube) {
            emptyCube.claimState = this.claimState;
            return emptyCube;
         }
      }
      return null;
   }

   getDefensiveMove(cubeSet) {
      const consecutiveClaims = cubeSet.getConsecutiveClaims(2);
      for (const consecutiveGroup of consecutiveClaims) {
         const emptyCube = consecutiveGroup.find((cube) => cube.claimState === ClaimState.EMPTY);
         if (emptyCube) {
            emptyCube.claimState = this.claimState;
            return emptyCube;
         }
      }
      return null;
   }

   getStrategicMove(cubeSet) {
      const consecutiveClaims = cubeSet.getConsecutiveClaims(1);
      for (const consecutiveGroup of consecutiveClaims) {
         const emptyCube = consecutiveGroup.find((cube) => cube.claimState === ClaimState.EMPTY);
         if (emptyCube) {
            emptyCube.claimState = this.claimState;
            return emptyCube;
         }
      }
      return null;
   }

   getRandomMove(cubeSet) {
      const emptyCubes = [];
      for (let x = 0; x < cubeSet.cubes.length; x++) {
         for (let y = 0; y < cubeSet.cubes[x].length; y++) {
            for (let z = 0; z < cubeSet.cubes[x][y].length; z++) {
               const cube = cubeSet.findByCoords(x, y, z);
               if (cube.claimState === ClaimState.EMPTY) {
                  emptyCubes.push(cube);
               }
            }
         }
      }
      if (emptyCubes.length > 0) {
         const randomIndex = Math.floor(Math.random() * emptyCubes.length);
         const randomCube = emptyCubes[randomIndex];
         randomCube.claimState = this.claimState;
         return randomCube;
      }
      return null;
   }
}

export default class Game {
   constructor() {

      console.log(Draw)

      this.cubeScene = new Draw.CubesScene()

      this.cubeSet = new CubeSet(this);
      this.players = [
         new Player("Player 1", ClaimState.X),
         new Player("Player 2", ClaimState.O),
      ];
      this.currentPlayerIndex = 0;
   }

   play() {
      let gameOver = false;
      let winner = null;

      while (!gameOver) {
         const currentPlayer = this.players[this.currentPlayerIndex];
         const move = currentPlayer.makeMove(this.cubeSet);
         console.log(`${currentPlayer.name} claimed cube at (${move.x}, ${move.y}, ${move.z})`);

         const consecutiveClaims = this.cubeSet.getConsecutiveClaims(3);
         if (consecutiveClaims.length > 0) {
            gameOver = true;
            winner = currentPlayer;
         } else {
            this.currentPlayerIndex = (this.currentPlayerIndex + 1) % this.players.length;
         }
      }

      console.log(`Game over! ${winner.name} wins!`);
   }
}


