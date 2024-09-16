(function (factory) {
   typeof define === 'function' && define.amd ? define(factory) :
   factory();
})((function () { 'use strict';

   (async () => {
      const Game = await Promise.resolve().then(function () { return Game$1; });
      //   const Simulator = await import("./simulator.js");

      let game = new Game.default();
      game.render();


   })();

   class CubeObject {
       constructor(scene, renderer, camera, parent, coords) {
           this.scene = scene;
           this.renderer = renderer;
           this.camera = camera;
           this.parent = parent;
           this.coords = coords;
           this.raycaster = new THREE.Raycaster();
           this.mouse = new THREE.Vector2();
           this.init();
       }

       init() {
           this.renderer.domElement.addEventListener('click', this.handleMouseClick.bind(this), {});
           this.raycaster.precision = 0.05;
       }

       static createCubeMesh(yScaleFactor) {
           const geometry = new THREE.BoxGeometry(1, yScaleFactor, 1);
           const edgesGeometry = new THREE.EdgesGeometry(geometry);
           const material = new THREE.MeshBasicMaterial({ color: 0x28df31 });
           const edgesMaterial = new THREE.LineBasicMaterial({ color: 0x33aabb, linewidth: 5 });
           const cube = new THREE.Mesh(geometry, material);
           const edges = new THREE.LineSegments(edgesGeometry, edgesMaterial);
           cube.add(edges);
           return cube;
       }

       setColor(color) {
           const material = this.mesh.material;
           material.color.set(color);
           material.needsUpdate = true;
       }

       handleMouseClick(event) {
           // Calculate the mouse position relative to the canvas element
           const canvasBounds = this.renderer.domElement.getBoundingClientRect();
           const mouseX = ((event.clientX - canvasBounds.left) / canvasBounds.width) * 2 - 1;
           const mouseY = -((event.clientY - canvasBounds.top) / canvasBounds.height) * 2 + 1;

           // Set the mouse position for raycasting
           this.mouse.set(mouseX, mouseY);

           // Raycast from the camera to the mouse position
           this.raycaster.setFromCamera(this.mouse, this.camera);

           // Find the first intersected cube
           const intersects = this.raycaster.intersectObjects(this.scene.children, true);
           const intersectedCube = intersects.find(intersect => intersect.object.userData.cubeObjectRef);

           // Check if an intersected cube was found
           if (intersectedCube) {

               let cubeObjectSelected = intersectedCube.object.userData.cubeObjectRef;

               // Print the final CubeObject coords to the console - raycast intersected, nearest to camera
               console.clear();
               console.log(cubeObjectSelected.coords);

               // Change the cube's color
               cubeObjectSelected.setColor(0xff0000); // Change the color to red
           }
       }
   }

   class CubesScene {
       constructor(parentGame) {
           this.parentGame = parentGame;
           this.scene = new THREE.Scene();
           this.camera = new THREE.PerspectiveCamera(70, 1.0);
           this.renderer = new THREE.WebGLRenderer({ antialias: true });
           this.canvasEl = document.getElementById('divCubeCanvas');
           this.yScaleFactor = inpYScaleFactorSlider.value;
           this.mesh = null;
           this.cubes = new Array(3).fill(null).map(() => new Array(3).fill(null).map(() => new Array(3).fill(null)));
           this.controls = null;
           this.init();
       }

       init() {
           this.renderer.setSize(document.querySelector("#divCubeCanvas").clientWidth, document.querySelector("#divCubeCanvas").clientWidth);
           this.renderer.setPixelRatio(1.0);
           this.canvasEl.appendChild(this.renderer.domElement);
           this.camera.position.set(0, 0, 10);
           this.addCubesToScene();
           this.addEventListeners();
           this.controls = new THREE.OrbitControls(this.camera, this.renderer.domElement);
           this.controls.enableDamping = true;
           this.controls.enablePan = false; // Enable panning
           this.controls.dampingFactor = 0.15;
           this.controls.rotateSpeed = 0.35;
           this.controls.zoomSpeed = 0.75;
           this.controls.target.set(0, 0, 0);
           this.animate();
           this.modifyMargin(inpMarginSlider.value);
           btnExplodeCubes.addEventListener("click", evn => {
               this.explodeCubes();
           });

           //set a better target (after animate() call):
           const lookAtMe = this.cubes[1][1][1].mesh.position;
           //console.log(lookAtMe)
           this.controls.target.set(lookAtMe.x, lookAtMe.y, lookAtMe.z);
       }

       addEventListeners() {
           inpMarginSlider.addEventListener('input', (evn) => this.modifyMargin(evn.target.value));
           //inpZoomSlider.addEventListener('input', (evn) => this.modifyCameraZoom(evn.target.value));
           inpYScaleFactorSlider.addEventListener('input', (evn) => this.modifyYScaleFactor(evn.target.value));
       }

       findByCoordinates(x, y, z) {
           if (x < 0 || x >= 3 || y < 0 || y >= 3 || z < 0 || z >= 3) {
               return null;
           }
           return this.cubes[x][y][z];
       }

       addCubesToScene() {
           const margin = 1.11;

           for (let i = 0; i < 3; i++) {
               for (let j = 0; j < 3; j++) {
                   for (let k = 0; k < 3; k++) {
                       const cube = new CubeObject(this.scene, this.renderer, this.camera, this, { x: i, y: j, z: k });
                       cube.mesh = CubeObject.createCubeMesh(this.yScaleFactor);
                       cube.mesh.userData.cubeObjectRef = cube;
                       this.cubes[i][j][k] = cube;
                       const x = (i - 1.5) * margin;
                       const y = (j - 1.5) * (margin * this.yScaleFactor);
                       const z = (k - 1.5) * margin;
                       cube.mesh.position.set(x, y, z);
                       this.scene.add(cube.mesh);
                   }
               }
           }
       }

       allCubes() {
           return this.cubes.flat(2);
       }

       animate() {
           try {
               requestAnimationFrame(this.animate.bind(this));

               this.controls.update();
               this.renderer.render(this.scene, this.camera);


               //set a better target (after animate() call):
               const lookAtMe = this.cubes[1][1][1].mesh.position;
               //console.log(lookAtMe)
               this.controls.target.set(lookAtMe.x, lookAtMe.y, lookAtMe.z);


           } catch (err) {
               console.error('Exception in animate() method:', err.message);
               console.error(err);
           }
       }


       explodeCubes() {
           const targetMargin = 10;
           const rotationSpeed = 0.01;

           const animateExplosion = () => {
               let currentMargin = 0.5;



               const animate = () => {

                   currentMargin += 0.03;
                   if (currentMargin >= targetMargin) {
                       currentMargin = targetMargin;
                       return;
                   }

                   this.modifyMargin(currentMargin);

                   this.scene.rotation.x += rotationSpeed;
                   this.scene.rotation.y += rotationSpeed;
                   this.scene.rotation.z += rotationSpeed;

                   this.camera.rotation.x += rotationSpeed;
                   this.camera.rotation.y += rotationSpeed;
                   this.camera.rotation.z += rotationSpeed;


                   //set better camera target
                   const lookAtMe = this.cubes[1][1][1].mesh.position;
                   this.controls.target.set(lookAtMe.x, lookAtMe.y, lookAtMe.z);


                   this.renderer.render(this.scene, this.camera);




                   requestAnimationFrame(animate);
               };

               animate();

           };

           animateExplosion();
       }

       modifyMargin(marginIn) {
           let margin = marginIn / 2.0;
           const marginIncrement = margin;

           for (let i = 0; i < 3; i++) {
               for (let j = 0; j < 3; j++) {
                   for (let k = 0; k < 3; k++) {
                       const cube = this.cubes[i][j][k];
                       const x = (i - 1.5) * margin ** 2;
                       const y = ((j - 1.5) * (marginIncrement * this.yScaleFactor));
                       const z = (k - 1.5) * margin ** 2;
                       cube.mesh.position.set(x, y, z);
                   }
               }
           }
           this.renderer.render(this.scene, this.camera);

           //set a better target (after animate() call):
           const lookAtMe = this.cubes[1][1][1].mesh.position;
           //console.log(lookAtMe)
           this.controls.target.set(lookAtMe.x, lookAtMe.y, lookAtMe.z);

       }

       modifyCameraZoom(zoom) {
           this.camera.zoom = zoom;
           this.camera.updateProjectionMatrix();
       }

       modifyYScaleFactor(yScaleFactor) {
           this.yScaleFactor = yScaleFactor;
           this.modifyMargin(inpMarginSlider.value);

           //set a better target (after animate() call):
           const lookAtMe = this.cubes[1][1][1].mesh.position;
           //console.log(lookAtMe)
           this.controls.target.set(lookAtMe.x, lookAtMe.y, lookAtMe.z);
       }
   }

   class Cube {
       constructor(x, y, z) {
           this.claimState = ClaimState.EMPTY;
           this.x = x;
           this.y = y;
           this.z = z;
       }

       getNeighbors() {
           const neighbors = [];
           const size = this.cubes.length;
           for (let dx = -1; dx <= 1; dx++) {
               for (let dy = -1; dy <= 1; dy++) {
                   for (let dz = -1; dz <= 1; dz++) {
                       if (dx === 0 && dy === 0 && dz === 0) {
                           continue; // Skip the current cube
                       }
                       const neighborX = this.x + dx;
                       const neighborY = this.y + dy;
                       const neighborZ = this.z + dz;
                       if (neighborX >= 0 &&
                           neighborX < size &&
                           neighborY >= 0 &&
                           neighborY < size &&
                           neighborZ >= 0 &&
                           neighborZ < size) {
                           neighbors.push(cubeSet.findByCoords(neighborX, neighborY, neighborZ));
                       }
                   }
               }
           }
           return neighbors;
       }

       getMatchingNeighbors() {
           const neighbors = this.getNeighbors();
           const matchingNeighbors = neighbors.filter(neighbor => neighbor.claimState === this.claimState);
           return matchingNeighbors;
       }
   }
   const ClaimState = {
       X: "X",
       O: "O",
       E: "E",
       EMPTY: "·",
   };

   class CubeSet {
       constructor(game, size = 3) {
           this.cubes = [];
           for (let x = 0; x < size; x++) {
               this.cubes[x] = [];
               for (let y = 0; y < size; y++) {
                   this.cubes[x][y] = [];
                   for (let z = 0; z < size; z++) {
                       this.cubes[x][y][z] = new Cube(x, y, z);
                   }
               }
           }
       }

       findByCoords(x, y, z) {
           return this.cubes[x][y][z];
       }

       toStringTUI() {
           let outstr = "\n";
           this.cubes.forEach(layer => {
               outstr += layer.map(rank => {
                   return `  ${rank.map(it => it.claimState).join(" ┃ ")}  \n ━━━╋━━━╋━━━ \n`;
               }).join("").replace(/━━━╋━━━╋━━━ \n$/, "\n\n");
           });
           return outstr;
       }

       logAll() {
           //console.log(this.cubes[0])
           //console.log(this.cubes[1])
           //console.log(this.cubes[2])
       }

       getConsecutiveClaims(num) {
           const consecutiveClaims = [];

           // Define all possible directions
           const directions = [
               [1, 0, 0], // Right
               [-1, 0, 0], // Left
               [0, 1, 0], // Up
               [0, -1, 0], // Down
               [0, 0, 1], // Forward
               [0, 0, -1], // Backward
               [1, 1, 0], // Diagonal Right-Up
               [-1, -1, 0], // Diagonal Left-Down
               [1, -1, 0], // Diagonal Right-Down
               [-1, 1, 0], // Diagonal Left-Up
               [1, 0, 1], // Diagonal Right-Forward
               [-1, 0, -1], // Diagonal Left-Backward
               [0, 1, 1], // Diagonal Up-Forward
               [0, -1, -1], // Diagonal Down-Backward
               [0, 1, -1], // Diagonal Up-Backward
               [0, -1, 1], // Diagonal Down-Forward
               [1, 1, 1], // Diagonal Right-Up-Forward
               [-1, -1, -1], // Diagonal Left-Down-Backward
               [1, -1, -1], // Diagonal Right-Down-Backward
               [-1, 1, 1] // Diagonal Left-Up-Forward
           ];

           for (let x = 0; x < this.cubes.length; x++) {
               for (let y = 0; y < this.cubes[x].length; y++) {
                   for (let z = 0; z < this.cubes[x][y].length; z++) {
                       const cube = this.findByCoords(x, y, z);
                       const claimState = cube.claimState;
                       if (claimState !== ClaimState.EMPTY) {
                           for (const direction of directions) {
                               let consecutiveCount = 0;
                               let currentX = x;
                               let currentY = y;
                               let currentZ = z;
                               while (currentX >= 0 && currentX < this.cubes.length &&
                                   currentY >= 0 && currentY < this.cubes[currentX].length &&
                                   currentZ >= 0 && currentZ < this.cubes[currentX][currentY].length &&
                                   this.findByCoords(currentX, currentY, currentZ).claimState === claimState) {
                                   consecutiveCount++;
                                   if (consecutiveCount === num) {
                                       const consecutiveCubes = [];
                                       for (let i = 0; i < num; i++) {
                                           consecutiveCubes.push(this.findByCoords(currentX - direction[0] * i,
                                               currentY - direction[1] * i,
                                               currentZ - direction[2] * i));
                                       }
                                       consecutiveClaims.push(consecutiveCubes);
                                   }
                                   currentX += direction[0];
                                   currentY += direction[1];
                                   currentZ += direction[2];
                               }
                           }
                       }
                   }
               }
           }

           return consecutiveClaims;
       }
   }

   class Player {
       constructor(name, claimSymbol) {
           this.name = name;
           this.claimSymbol = claimSymbol;
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
                   emptyCube.claimState = this.claimSymbol;
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
                   emptyCube.claimState = this.claimSymbol;
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
                   emptyCube.claimState = this.claimSymbol;
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
               randomCube.claimState = this.claimSymbol;
               return randomCube;
           }
           return null;
       }
   }

   class Game {
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

   var Game$1 = /*#__PURE__*/Object.freeze({
      __proto__: null,
      default: Game
   });

}));
