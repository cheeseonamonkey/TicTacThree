export class CubesScene {
   constructor(parentGame) {
      this.parentGame = parentGame;
      this.scene = new THREE.Scene();
      this.camera = new THREE.PerspectiveCamera(65, 1);
      this.renderer = new THREE.WebGLRenderer({ antialias: true });
      this.canvasEl = document.getElementById('divCubeCanvas');
      this.yScaleFactor = inpYScaleFactorSlider.value;
      this.mesh = null;
      this.cubes = new Array(3).fill(null).map(() => new Array(3).fill(null).map(() => new Array(3).fill(null)));
      this.init();
   }

   init() {
      this.renderer.setSize(800, 800);
      this.renderer.setPixelRatio(1.0);
      this.canvasEl.appendChild(this.renderer.domElement);
      this.camera.position.set(0, 0, 6.5);
      this.addCubesToScene();
      this.addEventListeners();
      this.animate();
      this.modifyMargin(inpMarginSlider.value);
      btnExplodeCubes.addEventListener("click", evn => {
         this.explodeCubes();
      })
   }

   addEventListeners() {
      window.addEventListener('mousemove', this.rotateCube.bind(this));
      this.canvasEl.addEventListener('mousedown', this.startDrag.bind(this));
      window.addEventListener('mouseup', this.stopDrag.bind(this));
      inpMarginSlider.addEventListener('input', (evn) => this.modifyMargin(evn.target.value));
      inpZoomSlider.addEventListener('input', (evn) => this.modifyCameraZoom(evn.target.value));
      inpYScaleFactorSlider.addEventListener('input', (evn) => this.modifyYScaleFactor(evn.target.value));
   }

   rotateCube(event) {
      this.isDragging = this.isDragging || false;
      this.previousMousePosition = this.previousMousePosition || { x: 0.0, y: 0.0 };

      if (event.buttons === undefined || event.buttons === 0) this.isDragging = false;

      if (this.isDragging) {
         const deltaMove = {
            x: event.clientX - this.previousMousePosition.x,
            y: event.clientY - this.previousMousePosition.y,
         };
         this.scene.rotation.x += deltaMove.y * 0.0010;
         this.scene.rotation.y += deltaMove.x * 0.0013;
      }

      this.previousMousePosition = { x: event.clientX, y: event.clientY };
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
               cube.mesh.userData.cubeObjectRef = cube; // Update this line
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

   startDrag() {
      this.isDragging = true;
   }

   stopDrag() {
      this.isDragging = false;
   }

   animate() {
      requestAnimationFrame(this.animate.bind(this));
      this.renderer.render(this.scene, this.camera);
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

            this.camera.lookAt(this.scene.position);
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
   }

   modifyCameraZoom(zoom) {
      this.camera.zoom = zoom;
      this.camera.updateProjectionMatrix();
   }

   modifyYScaleFactor(yScaleFactor) {
      this.yScaleFactor = yScaleFactor;
      this.modifyMargin(inpMarginSlider.value);
   }
}

export class CubeObject {
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
      const edgesMaterial = new THREE.LineBasicMaterial({ color: 0xffddff, linewidth: 4 });
      const cube = new THREE.Mesh(geometry, material);
      const edges = new THREE.LineSegments(edgesGeometry, edgesMaterial);
      cube.add(edges);
      return cube;
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
         // Print the CubeObject for the mesh to the console
         console.log(intersectedCube.object.userData.cubeObjectRef);

         // Change the cube's color
         const cube = intersectedCube.object.userData.cubeObjectRef;
         const material = cube.mesh.material;
         material.color.set(0xff0000); // Change the color to red
         material.needsUpdate = true;
      }
   }




}
