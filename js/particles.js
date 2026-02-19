// ==========================================================================
// CONSTELLATION / PARTICLE NETWORK EFFECT
// ==========================================================================

// Defining a Class to encapsulate all the logic for the background animation
class ParticleNetworkEffect {
    
    // The constructor runs immediately when a new instance of the class is created.
    // It takes the ID of the HTML canvas element as an argument.
    constructor(canvasElementId) {
        // Find the canvas in the HTML
        this.canvasElement = document.getElementById(canvasElementId);
        
        // If the canvas doesn't exist, stop running the code to prevent errors
        if (!this.canvasElement) return;

        // Get the 2D rendering context, which provides the tools/methods to draw shapes and lines
        this.canvasContext = this.canvasElement.getContext('2d');
        
        // Array to store all the individual dot/particle objects
        this.particleNodesArray = [];
        
        // Centralized configuration settings for easy tweaking
        this.networkConfiguration = {
            mouseInteractionRadius: 200,   // How close the mouse needs to be to interact with a particle
            nodeConnectionDistance: 140,   // How close particles need to be to each other to draw a connecting line
            nodeDensityFactor: 4000,       // Controls how many particles spawn (higher number = fewer particles)
            rgbLineColor: '17, 129, 221'   // The base color of the lines (a shade of blue)
        };

        // Object to track the current X and Y coordinates of the user's mouse pointer
        this.mouseCoordinates = { xPosition: null, yPosition: null };

        // Initialize everything
        this.attachEventListeners();
        this.resizeCanvasToWindow();
        this.initializeParticleNodes();
        this.startAnimationLoop();
    }

    // Sets up listeners for user actions
    attachEventListeners() {
        // Track mouse movement across the entire window
        window.addEventListener('mousemove', (mouseEvent) => {
            // Update the coordinates object with the current mouse position
            this.mouseCoordinates.xPosition = mouseEvent.x;
            this.mouseCoordinates.yPosition = mouseEvent.y;
        });

        // When the mouse leaves the browser window entirely, clear the coordinates
        // This stops lines from drawing to the edge of the screen when the mouse isn't there
        window.addEventListener('mouseout', () => {
            this.mouseCoordinates.xPosition = null;
            this.mouseCoordinates.yPosition = null;
        });

        // If the user resizes their browser, recalculate canvas size and respawn particles
        window.addEventListener('resize', () => {
            this.resizeCanvasToWindow();
            this.initializeParticleNodes();
        });
    }

    // Ensures the canvas always fills the entire screen
    resizeCanvasToWindow() {
        this.canvasElement.width = window.innerWidth;
        this.canvasElement.height = window.innerHeight;
    }

    // Creates the initial batch of particles
    initializeParticleNodes() {
        // Empty the array in case this is called during a window resize
        this.particleNodesArray = [];
        
        // Calculate amount of particles based on screen size divided by the density factor
        const calculatedNumberOfNodes = (this.canvasElement.width * this.canvasElement.height) / this.networkConfiguration.nodeDensityFactor; 
        
        // Generate random initial positions for each particle and push them into the array
        for (let currentIndex = 0; currentIndex < calculatedNumberOfNodes; currentIndex++) {
            this.particleNodesArray.push({
                xPosition: Math.random() * this.canvasElement.width,
                yPosition: Math.random() * this.canvasElement.height
            });
        }
    }

    // The core loop that updates the canvas 60 times a second
    startAnimationLoop() {
        // Tell the browser to call this function again before the next repaint
        requestAnimationFrame(() => this.startAnimationLoop());
        
        // Wipe the canvas clean on every frame so previous lines don't stack up and smear
        this.canvasContext.clearRect(0, 0, this.canvasElement.width, this.canvasElement.height);

        // If the mouse isn't on the screen, skip drawing the lines
        if (this.mouseCoordinates.xPosition === null || this.mouseCoordinates.yPosition === null) {
            return; 
        }

        // Loop through every particle on the screen
        for (let currentParticleIndex = 0; currentParticleIndex < this.particleNodesArray.length; currentParticleIndex++) {
            let currentParticleNode = this.particleNodesArray[currentParticleIndex];
            
            // Calculate the distance between the current particle and the mouse using the Pythagorean theorem (a^2 + b^2 = c^2)
            let horizontalDistanceToMouse = currentParticleNode.xPosition - this.mouseCoordinates.xPosition;
            let verticalDistanceToMouse = currentParticleNode.yPosition - this.mouseCoordinates.yPosition;
            let totalDistanceToMouse = Math.sqrt((horizontalDistanceToMouse * horizontalDistanceToMouse) + (verticalDistanceToMouse * verticalDistanceToMouse));

            // If the particle is close enough to the mouse...
            if (totalDistanceToMouse < this.networkConfiguration.mouseInteractionRadius) {
                
                // Calculate opacity: the closer to the mouse, the more solid the line (opacity approaches 1)
                let currentParticleOpacity = 1 - (totalDistanceToMouse / this.networkConfiguration.mouseInteractionRadius);

                // Nested loop: Compare the current particle to every OTHER particle to see if they should connect
                // We start at 'currentParticleIndex + 1' to avoid drawing duplicate lines back and forth
                for (let nextParticleIndex = currentParticleIndex + 1; nextParticleIndex < this.particleNodesArray.length; nextParticleIndex++) {
                    let nextParticleNode = this.particleNodesArray[nextParticleIndex];
                    
                    // Pythagorean theorem again to find distance between the two particles
                    let horizontalDistanceToNextNode = currentParticleNode.xPosition - nextParticleNode.xPosition;
                    let verticalDistanceToNextNode = currentParticleNode.yPosition - nextParticleNode.yPosition;
                    let totalDistanceBetweenNodes = Math.sqrt((horizontalDistanceToNextNode * horizontalDistanceToNextNode) + (verticalDistanceToNextNode * verticalDistanceToNextNode));

                    // If the two particles are close to each other...
                    if (totalDistanceBetweenNodes < this.networkConfiguration.nodeConnectionDistance) {
                        
                        // Check if the SECOND particle is ALSO close to the mouse
                        let horizontalDistanceNextNodeToMouse = nextParticleNode.xPosition - this.mouseCoordinates.xPosition;
                        let verticalDistanceNextNodeToMouse = nextParticleNode.yPosition - this.mouseCoordinates.yPosition;
                        let totalDistanceNextNodeToMouse = Math.sqrt((horizontalDistanceNextNodeToMouse * horizontalDistanceNextNodeToMouse) + (verticalDistanceNextNodeToMouse * verticalDistanceNextNodeToMouse));

                        if (totalDistanceNextNodeToMouse < this.networkConfiguration.mouseInteractionRadius) {
                            
                            // Calculate opacity for the second particle
                            let nextParticleOpacity = 1 - (totalDistanceNextNodeToMouse / this.networkConfiguration.mouseInteractionRadius);
                            
                            // The final line opacity depends on how far the particles are from each other, 
                            // capped by whichever particle is furthest from the mouse (Math.min)
                            let finalConnectionOpacity = (1 - (totalDistanceBetweenNodes / this.networkConfiguration.nodeConnectionDistance)) * Math.min(currentParticleOpacity, nextParticleOpacity);
                            
                            // DRAW THE LINE BETWEEN PARTICLES
                            this.canvasContext.beginPath();
                            this.canvasContext.strokeStyle = `rgba(${this.networkConfiguration.rgbLineColor}, ${finalConnectionOpacity})`;
                            this.canvasContext.lineWidth = 1;
                            this.canvasContext.moveTo(currentParticleNode.xPosition, currentParticleNode.yPosition); // Start point
                            this.canvasContext.lineTo(nextParticleNode.xPosition, nextParticleNode.yPosition); // End point
                            this.canvasContext.stroke(); // Render the line
                        }
                    }
                }

                // DRAW THE LINE BETWEEN THE FIRST PARTICLE AND THE MOUSE
                this.canvasContext.beginPath();
                this.canvasContext.strokeStyle = `rgba(${this.networkConfiguration.rgbLineColor}, ${currentParticleOpacity})`;
                this.canvasContext.lineWidth = 1;
                this.canvasContext.moveTo(currentParticleNode.xPosition, currentParticleNode.yPosition);
                this.canvasContext.lineTo(this.mouseCoordinates.xPosition, this.mouseCoordinates.yPosition);
                this.canvasContext.stroke();
            }
        }
    }
}

// Instantiate the class and kick off the whole effect on the canvas element with ID 'particleCanvas'
new ParticleNetworkEffect('particleCanvas');