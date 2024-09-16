import { Cube, ClaimState } from "../classes/game/models/Cube";
import Game from "../classes/game/models/Game";
import { CubeSet } from "../classes/game/models/CubeSet";
import { Player } from "../classes/game/Player";

describe('Game basic tests', () => {
    let game;

    beforeEach(() => {
        game = new Game();

    });


    it('should create a Game instance', () => {
        expect(game).toBeInstanceOf(Game);
    });

    it('should initialize cubeSet with a 3x3x3 grid', () => {
        const cubeSet = game.cubeSet;
        expect(cubeSet).toBeInstanceOf(CubeSet);
        expect(cubeSet.cubes.length).toBe(3);
        expect(cubeSet.cubes[0].length).toBe(3);
        expect(cubeSet.cubes[0][0].length).toBe(3);
    });

    it('should initialize players correctly', () => {
        expect(game.players).toHaveLength(2);
        expect(game.players[0]).toBeInstanceOf(Player);
        expect(game.players[1]).toBeInstanceOf(Player);
    });

    it('should set the starting player index to 0', () => {
        expect(game.currentPlayerIndex).toBe(0);
        expect(game.players[game.currentPlayerIndex].name).toBe("Player 1");
    });

    it('should initialize winner and gameOver to false', () => {
        expect(game.winner).toBeNull();
        expect(game.gameOver).toBe(false)
    });




    it('should detect a winner correctly', () => {
        jest.spyOn(game.cubeSet, 'getConsecutiveClaims').mockReturnValue([[new Cube(0, 0, 0), new Cube(1, 1, 1), new Cube(2, 2, 2)]]);

        game.play();

        expect(game.gameOver).toBe(true);
        expect(game.winner).toBe(game.players[0]);
    });

    beforeEach(() => {
        game = new Game();
    });


    const checkCubeClaims = (cubes, claimState) => {
        cubes.forEach(cube => {
            for (let row = 0; row < 3; row++) {
                for (let col = 0; col < 3; col++) {
                    expect(cube[row][col].claimState).toBe(claimState);
                }
            }
        });
    };

    const countNonEmptyClaims = (cubes) => {
        let count = 0;
        cubes.forEach(cube => {
            for (let row = 0; row < 3; row++) {
                for (let col = 0; col < 3; col++) {
                    if (cube[row][col].claimState !== ClaimState.EMPTY) {
                        count++;
                    }
                }
            }
        });
        return count;
    };

    it('should init with empty cube claims', () => {
        checkCubeClaims(game.cubeSet.cubes, ClaimState.EMPTY);
    });

    it('should finish play() with good cube claims', () => {
        game.play();
        const nonEmptyClaims = countNonEmptyClaims(game.cubeSet.cubes);
        expect(nonEmptyClaims).toBeGreaterThanOrEqual(5); // Minimum moves to have a winner
    });


    it('should change the current player after a move', () => {
        const initialPlayerIndex = game.currentPlayerIndex;

        // Spy on the player's makeMove method
        jest.spyOn(game.players[initialPlayerIndex], 'makeMove').mockImplementation(() => {
            return { x: 0, y: 0, z: 0 };
        });

        game.play();

        expect(game.currentPlayerIndex).not.toBe(initialPlayerIndex);
        expect(game.currentPlayerIndex).toBe(1);
    });


    it('should play 200 games without error', () => {


        for (let i = 0; i < 200; i++) {
            let gam = new Game();

            gam.play();

            expect(gam.winner).not.toBe(null)



        }
    });



});



