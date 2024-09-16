import { CubesScene } from "../drawing/CubesScene";
import { ClaimState } from "./models/Cube";
import { CubeSet } from "./models/CubeSet";
import { Player } from "./Player";



export default class Game {
    constructor() {

        this.cubeScene = null;

        this.cubeSet = new CubeSet(this);
        this.players = [
            new Player("Player 1", ClaimState.X),
            new Player("Player 2", ClaimState.O),
        ];
        this.currentPlayerIndex = 0;

        this.winner = null;
        this.gameOver = null;
    }

    render() {
        this.cubeScene = new CubesScene();
    }
    play() {
        this.gameOver = false;
        this.winner = null;

        while (!this.gameOver) {
            const currentPlayer = this.players[this.currentPlayerIndex];
            const move = currentPlayer.makeMove(this.cubeSet);
            console.log(`${currentPlayer.name} claimed cube at (${move.x}, ${move.y}, ${move.z})`);

            const consecutiveClaims = this.cubeSet.getConsecutiveClaims(3);
            if (consecutiveClaims.length > 0) {

                this.gameOver = true;
                this.winner = currentPlayer;

                console.log(`Game over! ${this.winner.name} wins!`);

            } else {
                this.currentPlayerIndex = (this.currentPlayerIndex + 1) % this.players.length;
            }
        }



    }
}
