const canvas = document.querySelector("canvas");
const c = canvas.getContext("2d");
canvas.width = 720;
canvas.height = 720;
const despawnRange = 30

// init game variables
var playing = false;
var highscore = 0
var score = 0;
var day = 0;
var enemyCap = {
    asteroid: 2,
    alien1 : 0,
    alien2 : 0,
    alien3 : 0
}
var enemies = {
    asteroid: [],
    alien1 : [],
    alien2 : [],
    alien3 : []
}

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
    static bulletSpeed = 8

    
    constructor() {
        this.health = 10
        this.turretRotation = 0
        this.bullets = []
        
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
            c.translate(bullet.x,bullet.y)
            c.fillRect(-Planet.bulletSize/2,-Planet.bulletSize/2,Planet.bulletSize,Planet.bulletSize)
            c.resetTransform()
        }
    }
    shootTurret(){
        this.bullets.push({
            x: Math.cos(this.turretRotation) * Planet.turretWidth + Planet.x,
            y: Math.sin(this.turretRotation) * Planet.turretWidth + Planet.y,
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

            if (b.y < -despawnRange) {
                // console.log("out top")
                planet.bullets.splice(i,1)

            } else if(b.y > canvas.height + despawnRange) {
                planet.bullets.splice(i,1)

            }else if (b.x < -despawnRange) {
                // console.log("out top")
                planet.bullets.splice(i,1)

            } else if(b.x > canvas.width + despawnRange) {
                planet.bullets.splice(i,1)

            }
        }
        this.draw()
    }
}

class Asteroid {
    static maxSpeed = 5
    constructor(size,x,y){
        this.size = size
        this.radius = this.size * 12 // 7 is just the number of pixels to multiply the size by

        // if x and y arent provided get random cordinate on outside of map
        if (x) {this.x = x } else {
            this.x = Math.random()*canvas.width + canvas.width
        }
       if (y){ this.y = y } else {
        this.y = Math.random()*canvas.width + canvas.width
       }
        this.xVel = (.5 - Math.random())*Asteroid.maxSpeed + 2
        this.yVel = (.5 - Math.random())*Asteroid.maxSpeed
    }
    draw() {
        c.beginPath();
        c.strokeStyle = "white";
        c.lineWidth = 2;
        c.translate(this.x,this.y)
        c.arc(0, 0, this.radius, 0, 2 * Math.PI);
        c.stroke()
        c.resetTransform()
    }
    update() {
        this.x += this.xVel
        this.y += this.yVel

        // check if it passed the boundaries
        if (this.y < -despawnRange) {
            // console.log("out top")
            this.y = canvas.height + despawnRange
        } else if(this.y > canvas.height + despawnRange) {
            this.y = -despawnRange
        }else if (this.x < -despawnRange) {
            // console.log("out top")
            this.x = canvas.width + despawnRange
        } else if(this.x > canvas.width + despawnRange) {
            this.x = -despawnRange
        }

        this.draw()
    }
    break(){
        score += 10
        if (this.size > 1){
        enemies.asteroid.push(new Asteroid(this.size-1,this.x-5,this.y-5))
        enemies.asteroid.push(new Asteroid(this.size-1,this.x-5,this.y-5))
        }else {
            enemyCap["asteroid"] += .1 
        }
        }
}


// create functions
function startScreen() {
    // draw play button
    c.fillStyle = "rgba(0,0,0,.5)"
    c.fillRect(0,0,canvas.width,canvas.height)
    c.fillStyle = "white"
    c.textAlign = "center"
    c.font = "bold 20px 'Press Start 2P'"
    c.fillText("Press Enter To Start",canvas.width/2,canvas.height/2)
}

function startGame() {
    enemyCap = {
        asteroid: 2,
        alien1 : 0,
        alien2 : 0,
        alien3 : 0
    }
    enemies = {
        asteroid: [],
        alien1 : [],
        alien2 : [],
        alien3 : []
    }
    playing = true
}

function endGame(){
    planet = new Planet()
    if (score > highscore) highscore = score
    playing = false
}

function drawScoreboard() {

    c.fillStyle = "white"
    c.textAlign = "left"

    c.font = "bold 20px 'Press Start 2P'"
    c.fillText(`Score: ${score}`,5,25)
    
    c.font = "bold 15px 'Press Start 2P'"
    c.fillText(`Health: ${planet.health}`,5,50)

    c.font = "bold 20px 'Press Start 2P'"
    c.textAlign = "right"
    c.fillText(`Highscore: ${highscore}`,canvas.width-5,25)
    
}

// Init classes
var planet = new Planet
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

window.addEventListener("keydown",(e) => {
    let key = e.key;
    console.log(key)
    if (key == "Enter" && playing == false) {
        startGame()
    }
})

// game loop
function gameloop(){
    window.requestAnimationFrame(gameloop)
    c.clearRect(0,0,canvas.width,canvas.height)
    planet.update()
    if (playing) {

        // spawn enemy
        for (let k in enemies){
            // if there are less enemies than the max spawn more 
            if (enemies[k].length < Math.floor(enemyCap[k])){
                switch (k) {
                    case "asteroid":
                        enemies.asteroid.push(new Asteroid(3))
                        break;
                    case "alien1":
                        
                        break;
                    case "alien2":
                        
                        break;
                    case "alien3":
                        
                        break;
                    default:
                        break;
                }
            }
        }
        // update planet
        // update enemies
        for (let k in enemies){
            for (let j = 0; j < enemies[k].length; j ++ ) {
                let e = enemies[k][j]

                e.update()

                // check for bullet collision
                for (let i = 0; i < planet.bullets.length; i ++ ) {
                    let b = planet.bullets[i]
                    let x = b.x - e.x
                    let y = b.y - e.y
                    let distance = Math.sqrt(x*x+y*y)
                    if (distance <= e.radius) {
                        console.log(i)
                        planet.bullets.splice(i,1)
                        e.break()
                        enemies[k].splice(j,1)
                        break
                        // e.hit()
                    }
                }

                // check for planet collision
                let x = Planet.x - e.x
                let y = Planet.y - e.y
                let distance = Math.sqrt(x*x+y*y)
                if (distance-e.radius < Planet.radius) {
                    planet.health -= e.size
                    if (planet.health <= 0) {
                        endGame()
                    }
                    enemies[k].splice(j,1)
                    console.log(planet.health)
                }

            }
        }
        // planet.shootTurret() // uncomment for full auto
        console.log(score)
    } else {
        // make start screen
        startScreen()
    }
    // draw scoreboard
    drawScoreboard()
    // console.log(mouseX,mouseY)
}
gameloop()