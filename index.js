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

    static turretWidth = 30;
    static turretHeight = 5;
    static bulletSize = 5
    static bulletSpeed = 4

    
    constructor() {
        this.health = 10
        this.turretRotation = 0
        this.bullets = []
        
        // powerups
        this.automatic = true
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
        let thetaPrime = Math.atan2(mouseY,mouseX)
        this.turretRotation = thetaPrime
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
        c.fillRect(0,-Planet.turretHeight/2,Planet.turretWidth,Planet.turretHeight)
        c.resetTransform()

        // draw bullets
        for (let i = 0; i < this.bullets.length;i++) 
        {
            let bullet = this.bullets[i]
            c.translate(Planet.x,Planet.y)
            c.translate(bullet.x,bullet.y)
            c.fillRect(-Planet.bulletSize/2,-Planet.bulletSize/2,Planet.bulletSize,Planet.bulletSize)
            c.resetTransform()
        }
    }
    shootTurret(){
        this.bullets.push({
            x: Math.cos(this.turretRotation) * Planet.turretWidth,
            y: Math.sin(this.turretRotation) * Planet.turretWidth,
            xVel: Math.cos(this.turretRotation) * Planet.bulletSpeed,
            yVel: Math.sin(this.turretRotation) * Planet.bulletSpeed,
        })
        // console.log(this.bullets)
    }
    update() {

        this.rotateTurret()
        
        // move bullets
        for (let i = 0; i < this.bullets.length;i++) 
        {
            let b = this.bullets[i]
            b.x += b.xVel
            b.y += b.yVel
        }


        this.draw()
    }
}



// create functions

// Init classes
const planet = new Planet

// Init functions

// other stuff

// get mouse position 
canvas.addEventListener("mousemove", (e) => {
    mouseX = Math.round(e.clientX - canvasPos.left - canvas.width/2)
    mouseY = Math.round(e.clientY - canvasPos.top - canvas.height/2)
    // console.log(mouseX,mouseY)
})

canvas.addEventListener("click", (e) => {
    planet.shootTurret()
})

// game loop
function gameloop(){
    window.requestAnimationFrame(gameloop)
    if (playing) {

        // clear canvas
        c.clearRect(0,0,canvas.width,canvas.height)
        // update planet
        planet.update()
        // update enemies
    } else {
        // make start screen
    }
    // draw scoreboard
    // console.log(mouseX,mouseY)
}
gameloop()