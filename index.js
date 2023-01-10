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
var enemyCap;
var enemies;

const canvasPos = canvas.getBoundingClientRect()
var mouseX;
var mouseY;


// cheats
var fullAuto = false
var god = false
// load game files
var laserSound = new Audio('laserSound.wav');
laserSound.volume = .2
var explosionSound = new Audio('explosionSound.wav');
explosionSound.volume = .2
var impactSound = new Audio('impactSound.wav');
impactSound.volume = .2


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
        laserSound.currentTime = 0;
        laserSound.play();
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
        this.radius = this.size * 15 // 7 is just the number of pixels to multiply the size by

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
        explosionSound.currentTime = 0;
        explosionSound.play();
        if (this.size > 1){
        enemies.asteroid.push(new Asteroid(this.size-1,this.x-5,this.y-5))
        enemies.asteroid.push(new Asteroid(this.size-1,this.x-5,this.y-5))
        }else {
            enemyCap["asteroid"] += .1 
        }
        }
}
class Alien1 {
    static maxSpeed = 3
    constructor(){
        this.type = 1
        this.findPos()
        this.findVel()
        console.log(this.x,this.y)
        console.log(this.yVel,this.xVel)
        this.radius = 25
        this.size = 2
    }

    draw(){
        c.beginPath();
        c.strokeStyle = "red";
        c.lineWidth = 2;
        c.translate(this.x,this.y)
        c.arc(0, 0, this.radius, 0, 2 * Math.PI);
        c.stroke()
        c.resetTransform()
    }
    findPos(){
        let min = 1
        let max = 4
        let q = Math.floor(Math.random() * (max - min + 1)) + min
        let pos1 = Math.random()*canvas.width
        console.log(q)
        if (q == 1){

            this.x = -despawnRange + 1
            this.y = pos1
        }else if(q==2){

            this.x = canvas.width + despawnRange -1 
            this.y = pos1
        }else if(q==3){

            this.y = -despawnRange + 1
            this.x = pos1
        }else if(q==4){

            this.y = canvas.width + despawnRange -1
            this.x = pos1
        }
    }
    findVel(){
        let thetaPrime = Math.atan2(Planet.y-this.y,Planet.x-this.x)
        let yVel = Math.sin(thetaPrime)*Alien1.maxSpeed
        let xVel = Math.cos(thetaPrime)*Alien1.maxSpeed
        this.xVel = xVel
        this.yVel = yVel
        // return yVel,xVel
    }
    update() {
        this.x += this.xVel
        this.y += this.yVel
        this.draw()
        // console.log(this.x,this.y,this.xVel,this.yVel)
    }
    break(){
        score += 20
        explosionSound.currentTime = 0;
        explosionSound.play();
        enemyCap["alien1"] += .05
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
        alien1 : 1,
        alien2 : 0,
        alien3 : 0
    }
    enemies = {
        asteroid: [],
        alien1 : [],
        alien2 : [],
        alien3 : []
    }
    score = 0
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
    // console.log(key)
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
            console.log(enemies)
            console.log(enemyCap)
            if (enemies[k].length < Math.floor(enemyCap[k])){
                switch (k) {
                    case "asteroid":
                        enemies.asteroid.push(new Asteroid(3))
                        break;
                    case "alien1":
                        enemies.alien1.push(new Alien1())
                        
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
                        // console.log(i)
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
                    // console.log(planet.health)
                    impactSound.currentTime = 0;
                    impactSound.play();
                }

            }
        }
        if (fullAuto) planet.shootTurret()
        if (god) planet.health = 10
        // console.log(score)
    } else {
        // make start screen
        startScreen()
    }
    // draw scoreboard
    drawScoreboard()
    // console.log(mouseX,mouseY)
}
gameloop()