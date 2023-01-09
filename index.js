const canvas = document.querySelector("canvas");
const c = canvas.getContext("2d");
canvas.width = 720;
canvas.height = 720;

// init game variables
var playing = true;
const canvasPos = canvas.getBoundingClientRect()
var mouseX;
var mouseY;

// create classes
class Planet {
    static x = canvas.width/2
    static y = canvas.height/2
    static healRate = 4
    static radius = 50

    static turretWidth = 5;
    static turretHeight = 30;

    constructor() {
        this.health = 10
        this.turretRotation = 0
    }
    heal(){
        this.health += Planet.healRate
    }
    damage(damage = 1){
        this.health -= damage
        if (this.health <= 0) {
            // end game 
        }
    }
    rotateTurret() {
        
        var xdir = mouseX;//where x and y are the sword center
        var ydir = mouseY;

        var theta = Math.atan2(mouseX - Planet.x, -(mouseY - Planet.y) ) * (180 / Math.PI) - 90  

        this.turretRotation = theta
    }
    draw(){
        c.beginPath();
        c.strokeStyle = "white";
        c.lineWidth = 2;
        c.translate(Planet.x,Planet.y)
        c.arc(0, 0, Planet.radius, 0, 2 * Math.PI);
        c.stroke()

        // draw turret center
        c.beginPath();
        c.lineWidth = 2;
        c.arc(0, 0, 9, 0, 2 * Math.PI);
        c.stroke()

        // draw turret barrel
        c.fillStyle = "white"
        c.rotate(this.turretRotation)
        c.fillRect(-Planet.turretWidth/2,-Planet.turretHeight,Planet.turretWidth,Planet.turretHeight)
        c.resetTransform()
    }
}



// create functions

// Init classes
const planet = new Planet

// Init functions

// other stuff

// get mouse position 
canvas.addEventListener("mousemove", (e) => {
    mouseX = Math.round(e.clientX - canvasPos.left)
    mouseY = Math.round(e.clientY - canvasPos.top)
    console.log(mouseX,mouseY)
})

// game loop
function gameloop(){
    window.requestAnimationFrame(gameloop)
    if (playing) {
        // update player
        // update asteroids and aliens
        // detect any collisions
        // draw planet
        c.clearRect(0,0,canvas.width,canvas.height)
        planet.rotateTurret()
        planet.draw()

        // draw player
        // draw aliens and asteroids
    } else {
        // make start screen
    }
    // draw scoreboard
    // console.log(mouseX,mouseY)
}
gameloop()