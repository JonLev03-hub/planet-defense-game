const canvas = document.querySelector("canvas");
const c = canvas.getContext("2d");
canvas.width = 720;
canvas.height = 720;
const despawnRange = 30;

// init game variables
var playing = false;
var paused = false
var highscore = 0;
var score = 0;
var day = 0;
var enemyCap;
var enemies;
var powerup;
var difficulty = 0.04;

const canvasPos = canvas.getBoundingClientRect();
var mouseX;
var mouseY;

// load game files
var laserSound = new Audio("./assets/sounds/laserSound.wav");
laserSound.volume = 0.1;
var explosionSound = new Audio("./assets/sounds/explosionSound.wav");
explosionSound.volume = 0.1;
var impactSound = new Audio("./assets/sounds/impactSound.wav");
impactSound.volume = 0.1;
var powerupSound = new Audio("./assets/sounds/powerupSound.wav");
impactSound.volume = 0.1;

// ----- functions -----
function randomNumber(min,max, neg = false) {
  let number = Math.floor(Math.random() * (max-min + 1)+min);
  if (neg && randomNumber(0,1)) {
    number = number * -1;
  }
  return number;
}
function getDistance(x1,y1,x2,y2) {
    let x = x1-x2;
    let y = y1-y2
    return Math.sqrt(x * x + y * y);
}

// ----- classes -----
class entity {
  constructor(x, y) {
    if (x && y) {
      this.x = x;
      this.y = y;
    } else {
      this.generateLocation();
    }
  }
  draw() {
    c.beginPath();
    c.strokeStyle = (this.color ? this.color : "white");
    c.lineWidth = 2;
    c.translate(this.x, this.y);
    c.arc(0, 0, this.radius, 0, 2 * Math.PI);
    c.stroke();
    c.resetTransform();
  }
  update() {
    this.x += this.xVel;
    this.y += this.yVel;

    // check if it passed the boundaries
    if (this.y < -despawnRange) {
      this.y = canvas.height + despawnRange;
    } else if (this.y > canvas.height + despawnRange) {
      this.y = -despawnRange;
    } else if (this.x < -despawnRange) {
      this.x = canvas.width + despawnRange;
    } else if (this.x > canvas.width + despawnRange) {
      this.x = -despawnRange;
    }

    this.draw();
  }
  generateLocation() {
      this.y = randomNumber(0,canvas.width+despawnRange/2, false);
      this.x = randomNumber(0,1) ? -despawnRange/2 : canvas.width+despawnRange/2;
      randomNumber(0,1) && ([this.x, this.y] = [this.y, this.x]);
  }
}

class Asteroid extends entity {
  static maxSpeed = 3;
  static minSpeed = 1;
  static pixelMultiplier = 12;
  constructor(x, y, health = 3) {
    super(x, y);
    this.pointValue = 10;
    this.health = health;
    this.radius = this.health * Asteroid.pixelMultiplier;
    this.xVel =
      randomNumber(Asteroid.minSpeed,Asteroid.maxSpeed, true)
    this.yVel =
        randomNumber(Asteroid.minSpeed,Asteroid.maxSpeed, true)
    this.damage = this.health;
  }
  spawn(){
        if(enemies[this.constructor.name].length < Math.floor(enemyCap[this.constructor.name])){
            enemies[this.constructor.name].push(new this.constructor);
        }
    }
  break() {
    score += this.pointValue;
    explosionSound.currentTime = 0;
    explosionSound.play();
    if (this.health > 1) {
      enemies.Asteroid.push(new Asteroid(this.x+this.radius/3, this.y, this.health - 1));
      enemies.Asteroid.push(new Asteroid(this.x, this.y-this.radius/3, this.health - 1));
    } else {
      enemyCap["asteroid"] += difficulty;
      this.spawn()
    }
  }
}

class Powerup extends entity {
  static powerups = ["fullAuto", "heal", "bonusPoints"];
  static respawnTime = 8000; // in ms
  static maxSpeed = 2;
  static minSpeed = 1;
  constructor() {
    super(false, false, "red");
    this.radius = 15;
    this.color = "yellow";
    this.power = this.GeneratePowerup();
    this.xVel =
      randomNumber(Powerup.minSpeed,Powerup.maxSpeed, true);
    this.yVel =
    randomNumber(Powerup.minSpeed,Powerup.maxSpeed, true);
  }
  GeneratePowerup() {
    let index = randomNumber(0,Powerup.powerups.length);
    return Powerup.powerups[index];
  }
  break() {
    powerupSound.currentTime = 0;
    powerupSound.play();
    switch (this.power) {
      case "fullAuto":
        planet.fullAuto = 150;
        break;
      case "heal":
        planet.health += 4;
        break;
      case "bonusPoints":
        score += 250;
        break;
      default:
        break;
    }

    // spawn the new powerup
    powerup = undefined;
    setTimeout(() => {
      powerup = new Powerup();
    }, Powerup.respawnTime);
  }
}

class Alien1 extends entity{
    static maxSpeed = 2;
    constructor() {
        super()
      this.findVel();
      this.radius = 25;
      this.damage = 2;
      this.color = "red"
      this.pointValue = 20
    }
    findVel() {
      let thetaPrime = Math.atan2(Planet.y - this.y, Planet.x - this.x);
      let yVel = Math.sin(thetaPrime) * Alien1.maxSpeed;
      let xVel = Math.cos(thetaPrime) * Alien1.maxSpeed;
      this.xVel = xVel;
      this.yVel = yVel;
      // return yVel,xVel
    }
    update() {
      this.x += this.xVel;
      this.y += this.yVel;
      this.draw();
    }
    spawn(){
        while(enemies[this.constructor.name].length < Math.floor(enemyCap[this.constructor.name])){
            enemies[this.constructor.name].push(new this.constructor);
        }
    }
    break() {
      score += this.pointValue;
      explosionSound.currentTime = 0;
      explosionSound.play();
      enemyCap[this.constructor.name] += difficulty;
      this.spawn()
    }
  }

class Planet {
  static x = canvas.width / 2;
  static y = canvas.height / 2;
  static radius = 50;

  static turretWidth = 30;
  static turretHeight = 5;
  static bulletSize = 5;
  static bulletSpeed = 8;

  constructor() {
    this.health = 10;
    this.turretRotation = 0;
    this.bullets = [];
    this.fullAuto = 0;
  }
  damage(damage = 1) {
    this.health -= damage;
    impactSound.currentTime = 0;
    impactSound.play();
    if (this.health <= 0) {
      endGame()
    }
  }
  rotateTurret() {
    let thetaPrime = Math.atan2(mouseY, mouseX);
    this.turretRotation = thetaPrime;
  }
  draw() {
    c.beginPath();
    c.strokeStyle = "white";
    c.lineWidth = 2;
    c.translate(Planet.x, Planet.y);
    c.arc(0, 0, Planet.radius, 0, 2 * Math.PI);
    c.stroke();

    // draw turret center
    c.beginPath();
    c.lineWidth = 2;
    c.arc(0, 0, 9, 0, 2 * Math.PI);
    c.stroke();

    // draw turret barrel
    c.fillStyle = "white";
    c.rotate(this.turretRotation);
    c.fillRect(
      0,
      -Planet.turretHeight / 2,
      Planet.turretWidth,
      Planet.turretHeight
    );
    c.resetTransform();

    // draw bullets
    for (let i = 0; i < this.bullets.length; i++) {
      let bullet = this.bullets[i];
      c.translate(bullet.x, bullet.y);
      c.fillRect(
        -Planet.bulletSize / 2,
        -Planet.bulletSize / 2,
        Planet.bulletSize,
        Planet.bulletSize
      );
      c.resetTransform();
    }
  }
  shootTurret() {
    if (paused) return;
    this.bullets.push({
      x: Math.cos(this.turretRotation) * Planet.turretWidth + Planet.x,
      y: Math.sin(this.turretRotation) * Planet.turretWidth + Planet.y,
      xVel: Math.cos(this.turretRotation) * Planet.bulletSpeed,
      yVel: Math.sin(this.turretRotation) * Planet.bulletSpeed,
    });
    laserSound.currentTime = 0;
    laserSound.play();
  }
  update() {
    this.rotateTurret();

    if (planet.fullAuto) {
        planet.shootTurret();
        planet.fullAuto--;
    }

    // move bullets
    for (let i = 0; i < this.bullets.length; i++) {
      let b = this.bullets[i];
      b.x += b.xVel;
      b.y += b.yVel;

      if (b.y < -despawnRange) {
        planet.bullets.splice(i, 1);
      } else if (b.y > canvas.height + despawnRange) {
        planet.bullets.splice(i, 1);
      } else if (b.x < -despawnRange) {
        planet.bullets.splice(i, 1);
      } else if (b.x > canvas.width + despawnRange) {
        planet.bullets.splice(i, 1);
      }
    }
    this.draw();
  }
}


// create functions
function startScreen() {
  // draw play button
  c.fillStyle = "rgba(0,0,0,.5)";
  c.fillRect(0, 0, canvas.width, canvas.height);
  c.fillStyle = "white";
  c.textAlign = "center";
  c.font = "bold 20px 'Press Start 2P'";
  c.fillText("Press Spacebar To Start", canvas.width / 2, canvas.height / 2);
}
function pauseScreen() {
    // draw play button
    c.fillStyle = "rgba(0,0,0,.5)";
    c.fillRect(0, 0, canvas.width, canvas.height);
    c.fillStyle = "white";
    c.textAlign = "center";
    c.font = "bold 20px 'Press Start 2P'";
    c.fillText("Press Spacebar to continue", canvas.width / 2, canvas.height / 2);
  }

function startGame() {
  enemyCap = {
    Asteroid: 2,
    Alien1: 1,
  };
  enemies = {
    Asteroid: [new Asteroid],
    Alien1: [new Alien1],
  };
  score = 0;
  playing = true;
  powerup = new Powerup();
}

function endGame() {
  planet = new Planet();
  if (score > highscore) highscore = score;
  playing = false;
}

function drawScoreboard() {
  c.fillStyle = "white";
  c.textAlign = "left";

  c.font = "bold 20px 'Press Start 2P'";
  c.fillText(`Score: ${score}`, 5, 25);

  c.font = "bold 15px 'Press Start 2P'";
  c.fillText(`Health: ${planet.health}`, 5, 50);

  c.font = "bold 20px 'Press Start 2P'";
  c.textAlign = "right";
  c.fillText(`Highscore: ${highscore}`, canvas.width - 5, 25);
}

// Init classes
var planet = new Planet();

// get mouse position
canvas.addEventListener("mousemove", (e) => {
  mouseX = Math.round(e.clientX - canvasPos.left - canvas.width / 2);
  mouseY = Math.round(e.clientY - canvasPos.top - canvas.height / 2);
});

canvas.addEventListener("click", (e) => {
  planet.shootTurret();
});

window.addEventListener("keydown", (e) => {
  let key = e.key;
  console.log(key)
  if (key == " ") {
    if (playing == false ){
        startGame()
    }else {
        paused  = !paused
    }
  }
});

// game loop
function gameloop() {
  window.requestAnimationFrame(gameloop);
  c.clearRect(0, 0, canvas.width, canvas.height);
  planet.update();
  if (playing && !paused) {
    // update enemies
    for (let k in enemies) {
      for (let j = 0; j < enemies[k].length; j++) {

        let e = enemies[k][j];
        e.update();

        // check for bullet collision
        for (let i = 0; i < planet.bullets.length; i++) {
          let b = planet.bullets[i];
          let distance = getDistance(e.x,e.y,b.x,b.y)
          if (distance <= e.radius) {
              planet.bullets.splice(i, 1);
              enemies[k].splice(j, 1);
              e.break();
            break;
          }
        }

        // check for planet collision
        let distance = getDistance(e.x,e.y,Planet.x,Planet.y)
        if (distance - e.radius < Planet.radius) {
          planet.damage(e.damage)
          enemies[k].splice(j, 1);
          e.spawn()
        }
      }
    }
    // update powerup and check for collsion
    if (powerup) {
      powerup.update();
      for (let i = 0; i < planet.bullets.length; i++) {
        let b = planet.bullets[i];
        let x = b.x - powerup.x;
        let y = b.y - powerup.y;
        let distance = Math.sqrt(x * x + y * y);
        if (distance <= powerup.radius) {
          planet.bullets.splice(i, 1);
          powerup.break();
          break;
        }
      }
    }
  } else if (playing){
    pauseScreen()
  }else {
    startScreen()
  }
  drawScoreboard();
}
gameloop();
