const { CubeSet, Cube, ClaimState } = require('./dataClasses.js')


describe('CubeSet', () => {




   test('findByCoords should return the correct cube', () => {
      let cubeSet = new CubeSet();
      const cube = cubeSet.findByCoords(1, 1, 1);
      expect(cube.x).toBe(1);
      expect(cube.y).toBe(1);
      expect(cube.z).toBe(1);
      const cube2 = cubeSet.findByCoords(2, 2, 2);
      expect(cube2.x).toBe(2);
      expect(cube2.y).toBe(2);
      expect(cube2.z).toBe(2);
   });


   test('getConsecutiveClaims #1', () => {
      let cubeSet = new CubeSet();
      cubeSet.findByCoords(0, 1, 0).claimState = ClaimState.O
      cubeSet.findByCoords(0, 1, 1).claimState = ClaimState.O
      cubeSet.findByCoords(0, 1, 2).claimState = ClaimState.O

      cubeSet.findByCoords(1, 0, 1).claimState = ClaimState.Δ
      cubeSet.findByCoords(1, 1, 1).claimState = ClaimState.X
      cubeSet.findByCoords(2, 0, 0).claimState = ClaimState.O

      cubeSet.findByCoords(1, 2, 1).claimState = ClaimState.Δ
      cubeSet.findByCoords(1, 1, 1).claimState = ClaimState.X
      cubeSet.findByCoords(2, 2, 2).claimState = ClaimState.O

      console.log(cubeSet.toStringTUI())

      console.log(cubeSet.getConsecutiveClaims(3))

   });


});