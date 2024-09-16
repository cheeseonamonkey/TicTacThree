
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
