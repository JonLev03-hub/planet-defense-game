const canvas = document.querySelector("canvas");
const c = canvas.getContext("2d");
canvas.width = 720;
canvas.height = 720;
const despawnRange = 30;

// init game variables
var playing = false;
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

// ----- new functions -----
function randomNumber(max, neg = false) {
  let number = Math.floor(Math.random() * (max + 1));
  if (neg && randomNumber(1)) {
    number = number * -1;
  }
  return number;
}

// ----- new classes -----
class entity {
  constructor(x, y, color = "white") {
    if (x && y) {
      this.x = x;
      this.y = y;
    } else {
      this.generateLocation();
    }
  }
  draw() {
    c.beginPath();
    c.strokeStyle = this.color;
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
    this.x = 0;
    this.y = randomNumber(canvas.width, true);
    if (randomNumber(1)) {
      this.x, (this.y = this.y), this.x;
    }
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
      randomNumber(Asteroid.maxSpeed - Asteroid.minSpeed, true) +
      Asteroid.minSpeed;
    this.yVel =
      randomNumber(Asteroid.maxSpeed - Asteroid.minSpeed, true) +
      Asteroid.minSpeed;
    this.damage = this.health;
  }
  break() {
    score += this.pointValue;
    explosionSound.currentTime = 0;
    explosionSound.play();
    if (this.health > 1) {
      enemies.asteroid.push(new Asteroid(this.x, this.y, this.health - 1));
      enemies.asteroid.push(new Asteroid(this.x, this.y, this.health - 1));
    } else {
      enemyCap["asteroid"] += difficulty;
    }
  }
}

class Powerup extends entity {
  static powerups = ["fullAuto", "heal", "bonusPoints"];
  static respawnTime = 2000; // in ms
  static maxSpeed = 5;
  static minSpeed = 1;
  constructor() {
    super(false, false, "red");
    this.radius = 15;
    this.color = "yellow";
    this.power = this.GeneratePowerup();
    this.xVel =
      randomNumber(Powerup.maxSpeed - Powerup.minSpeed, true) +
      Powerup.minSpeed;
    this.yVel =
      randomNumber(Powerup.maxSpeed - Powerup.minSpeed, true) +
      Powerup.minSpeed;
  }
  GeneratePowerup() {
    let index = randomNumber(Powerup.powerups.length);
    return Powerup.powerups[index];
  }
  break() {
    powerupSound.currentTime = 0;
    powerupSound.play();
    switch (this.power) {
      case "fullAuto":
        planet.fullAuto += 150;
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
    powerup = undefined;
    setTimeout(() => {
      powerup = new Powerup();
      console.log(powerup);
    }, Powerup.respawnTime);
  }
}

// create classes
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
    if (this.health <= 0) {
      // end game
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

class Alien1 {
  static maxSpeed = 2;
  constructor() {
    this.type = 1;
    this.findPos();
    this.findVel();
    this.radius = 25;
    this.damage = 2;
  }

  draw() {
    c.beginPath();
    c.strokeStyle = "red";
    c.lineWidth = 2;
    c.translate(this.x, this.y);
    c.arc(0, 0, this.radius, 0, 2 * Math.PI);
    c.stroke();
    c.resetTransform();
  }
  findPos() {
    let min = 1;
    let max = 4;
    let q = Math.floor(Math.random() * (max - min + 1)) + min;
    let pos1 = Math.random() * canvas.width;
    if (q == 1) {
      this.x = -despawnRange + 1;
      this.y = pos1;
    } else if (q == 2) {
      this.x = canvas.width + despawnRange - 1;
      this.y = pos1;
    } else if (q == 3) {
      this.y = -despawnRange + 1;
      this.x = pos1;
    } else if (q == 4) {
      this.y = canvas.width + despawnRange - 1;
      this.x = pos1;
    }
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
  break() {
    score += 20;
    explosionSound.currentTime = 0;
    explosionSound.play();
    enemyCap["alien1"] += difficulty;
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
  c.fillText("Press Enter To Start", canvas.width / 2, canvas.height / 2);
}

function startGame() {
  enemyCap = {
    asteroid: 2,
    alien1: 1,
    alien2: 0,
    alien3: 0,
  };
  enemies = {
    asteroid: [],
    alien1: [],
    alien2: [],
    alien3: [],
  };
  score = 0;
  playing = true;
  powerup = new Powerup();
  console.log(powerup);
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
// Init functions

// other stuff

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
  if (key == "Enter" && playing == false) {
    startGame();
  }
});

// game loop
function gameloop() {
  window.requestAnimationFrame(gameloop);
  c.clearRect(0, 0, canvas.width, canvas.height);
  planet.update();
  if (playing) {
    // spawn enemy
    for (let k in enemies) {
      // if there are less enemies than the max spawn more
      if (enemies[k].length < Math.floor(enemyCap[k])) {
        switch (k) {
          case "asteroid":
            enemies.asteroid.push(new Asteroid(3));
            break;
          case "alien1":
            enemies.alien1.push(new Alien1());

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
    for (let k in enemies) {
      for (let j = 0; j < enemies[k].length; j++) {
        let e = enemies[k][j];

        e.update();

        // check for bullet collision
        for (let i = 0; i < planet.bullets.length; i++) {
          let b = planet.bullets[i];
          let x = b.x - e.x;
          let y = b.y - e.y;
          let distance = Math.sqrt(x * x + y * y);
          if (distance <= e.radius) {
            planet.bullets.splice(i, 1);
            e.break();
            enemies[k].splice(j, 1);
            break;
            // e.hit()
          }
        }

        // check for planet collision
        let x = Planet.x - e.x;
        let y = Planet.y - e.y;
        let distance = Math.sqrt(x * x + y * y);
        if (distance - e.radius < Planet.radius) {
          planet.health -= e.damage;
          if (planet.health <= 0) {
            endGame();
          }
          enemies[k].splice(j, 1);
          impactSound.currentTime = 0;
          impactSound.play();
        }
      }
    }
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
          // e.hit()
        }
      }
    }
    if (planet.fullAuto) {
      planet.shootTurret();
      planet.fullAuto--;
    }
  } else {
    // make start screen
    startScreen();
  }
  // draw scoreboard
  drawScoreboard();
}
gameloop();
