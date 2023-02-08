const canvas = document.querySelector("canvas");
const c = canvas.getContext("2d");
canvas.width = 720;
canvas.height = 720;
const despawnRange = 75;
// init local storage score
if (!localStorage.highscore) {
  localStorage.setItem("highscore", 0);
}

// init game variables
var playing = false;
var paused = false;
var highscore = localStorage.highscore ? localStorage.highscore : 0;
var score = 0;
var day = 0;
var entityCap;
var entities;
var powerup;
var difficulty = 0.08;

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
powerupSound.volume = 0.1;
var stunSound = new Audio("./assets/sounds/stunSound.wav");
stunSound.volume = 0.1;

var bulletImage = new Image();
bulletImage.src = "assets/bullet.png";

// ----- functions -----
function randomNumber(min, max, neg = false) {
  let number = Math.floor(Math.random() * (max - min + 1) + min);
  if (neg && randomNumber(0, 1)) {
    number = number * -1;
  }
  return number;
}
function getDistance(x1, y1, x2, y2) {
  let x = x1 - x2;
  let y = y1 - y2;
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
    c.translate(this.x, this.y);
    c.drawImage(
      this.constructor.image,
      -this.radius - 5,
      -this.radius - 5,
      this.radius * 2 + 10,
      this.radius * 2 + 10
    );
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
    this.y = randomNumber(0, canvas.width + despawnRange / 2, false);
    this.x = randomNumber(0, 1)
      ? -despawnRange / 2
      : canvas.width + despawnRange / 2;
    randomNumber(0, 1) && ([this.x, this.y] = [this.y, this.x]);
  }
  spawn() {
    setTimeout(() => {
      while (
        entities[this.constructor.name].length <
        Math.floor(entityCap[this.constructor.name])
      ) {
        entities[this.constructor.name].push(new this.constructor());
      }
    }, this.constructor.spawnTime);
  }
  break() {
    spawnEnemy();
    score += this.pointValue;
    explosionSound.currentTime = 0;
    explosionSound.play();
    this.spawn();
    if (entityCap[this.constructor.name] < this.constructor.maxCount) {
      entityCap[this.constructor.name] += difficulty;
    }
  }
}

class Asteroid extends entity {
  static maxSpeed = 2;
  static minSpeed = 1;
  static pixelMultiplier = 15;
  static image = new Image();
  constructor(x, y, health = 3) {
    super(x, y);
    Asteroid.image.src = "./assets/asteroid.png";
    this.pointValue = 10;
    this.health = health;
    this.radius = this.health * Asteroid.pixelMultiplier;
    this.xVel = randomNumber(Asteroid.minSpeed, Asteroid.maxSpeed, true);
    this.yVel = randomNumber(Asteroid.minSpeed, Asteroid.maxSpeed, true);
    this.damage = this.health;
    this.rotation = randomNumber(0, 2 * Math.PI);
  }
  draw() {
    c.translate(this.x, this.y);
    c.rotate(this.rotation);
    this.rotation += (this.xVel * this.yVel) / 120;
    c.drawImage(
      this.constructor.image,
      -this.radius,
      -this.radius,
      this.radius * 2,
      this.radius * 2
    );
    c.resetTransform();
  }
  break() {
    spawnEnemy();
    score += this.pointValue;
    explosionSound.currentTime = 0;
    explosionSound.play();
    if (this.health > 1) {
      entities.Asteroid.push(
        new Asteroid(this.x + this.radius / 3, this.y, this.health - 1)
      );
      entities.Asteroid.push(
        new Asteroid(this.x, this.y - this.radius / 3, this.health - 1)
      );
    } else {
      entityCap[this.constructor.name] += difficulty / 7;
      this.spawn();
    }
  }
}

class Powerup extends entity {
  static powerups = ["fullAuto", "heal", "bonusPoints"];
  static maxSpeed = 2;
  static minSpeed = 1;
  static spawnTime = 4000;
  static image = new Image();
  constructor() {
    super(false, false, "red");
    Powerup.image.src = "assets/powerup.png";
    this.radius = 15;
    this.color = "yellow";
    this.power = this.GeneratePowerup();
    this.xVel = randomNumber(Powerup.minSpeed, Powerup.maxSpeed, true);
    this.yVel = randomNumber(Powerup.minSpeed, Powerup.maxSpeed, true);
    this.rotation = randomNumber(0, 2 * Math.PI);
  }
  draw() {
    c.translate(this.x, this.y);
    c.rotate(this.rotation);
    this.rotation += (this.xVel * this.yVel) / 120;
    c.drawImage(
      this.constructor.image,
      -this.radius - 5,
      -this.radius - 5,
      this.radius * 2 + 10,
      this.radius * 2 + 10
    );
    c.resetTransform();
  }
  GeneratePowerup() {
    let index = randomNumber(0, Powerup.powerups.length - 1);
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
    this.spawn();
  }
}

class Alien1 extends entity {
  static maxSpeed = 1.75;
  static spawnTime = 1000;
  static maxCount = 2;
  static image = new Image();
  constructor() {
    super();
    Alien1.image.src = "assets/alien1.png";
    this.findVel();
    this.radius = 25;
    this.damage = 2;
    this.color = "red";
    this.pointValue = 20;
  }
  findVel() {
    let thetaPrime = Math.atan2(Planet.y - this.y, Planet.x - this.x);
    let yVel = Math.sin(thetaPrime) * Alien1.maxSpeed;
    let xVel = Math.cos(thetaPrime) * Alien1.maxSpeed;
    this.xVel = xVel;
    this.yVel = yVel;
  }
}
class Alien2 extends entity {
  static maxSpeed = 3;
  static targetRange = 100;
  static spawnTime = 4000;
  static maxCount = 3;
  static image = new Image();
  constructor() {
    super();
    Alien2.image.src = "assets/alien2.png";
    this.radius = 20;
    this.damage = 2;
    this.color = "lightgreen";
    this.pointValue = 40;
    this.targetX = (this.x + Planet.x) / 2;
    this.targetY = (this.y + Planet.y) / 2;
    this.findVel();
  }
  findVel() {
    let thetaPrime = Math.atan2(this.targetY - this.y, this.targetX - this.x);
    let yVel = Math.sin(thetaPrime) * Alien2.maxSpeed;
    let xVel = Math.cos(thetaPrime) * Alien2.maxSpeed;
    this.xVel = xVel;
    this.yVel = yVel;
  }
  newTarget() {
    if (randomNumber(0, 7)) {
      // random movement
      this.targetX = this.x + randomNumber(0, Alien2.targetRange, true);
      this.targetY = this.y + randomNumber(0, Alien2.targetRange, true);

      // make sure that the target is within the screen
      if (
        (this.targetX < 0) |
        (this.targetY < 0) |
        (this.targetX > canvas.width) |
        (this.targetY > canvas.width)
      ) {
        this.newTarget();
        return;
      }
      // make sure that target wont be on planet
      let distance = getDistance(
        Planet.x,
        Planet.y,
        this.targetX,
        this.targetY
      );
      if (distance < 100) {
        this.newTarget();
        return;
      }
    } else {
      // target player
      this.targetX = Planet.x;
      this.targetY = Planet.y;
    }

    this.findVel();
  }
  update() {
    this.y += this.yVel;
    this.x += this.xVel;
    let distance = getDistance(this.x, this.y, this.targetX, this.targetY);
    if (distance <= Alien2.maxSpeed * 2) {
      this.newTarget();
    }
    this.draw();
  }
}
class Alien3 extends entity {
  static maxSpeed = 2;
  static patrolRange = Math.PI / 2; //in radians
  static patrolRadius = 300;
  static spawnTime = 10000;
  static image = new Image();
  constructor() {
    super();
    Alien3.image.src = "assets/alien3.png";
    this.radius = 20;
    this.damage = 2;
    this.color = "purple";
    this.pointValue = 60;
    this.targetX = (this.x + Planet.x) / 2;
    this.targetY = (this.y + Planet.y) / 2;
    this.findVel();

    this.bulletTime = 1; // in ms
    this.bulletSpeed = 2;
    this.bulletSize = 10;
    this.bullets = [];
  }
  findVel() {
    let thetaPrime = Math.atan2(this.targetY - this.y, this.targetX - this.x);
    let yVel = Math.sin(thetaPrime) * Alien3.maxSpeed;
    let xVel = Math.cos(thetaPrime) * Alien3.maxSpeed;
    this.xVel = xVel;
    this.yVel = yVel;
  }
  newTarget() {
    let planetAngle = Math.atan2(this.y - Planet.y, this.x - Planet.x);
    let angle = Math.random() * Alien3.patrolRange;
    if (randomNumber(0, 1)) angle *= -1;
    this.targetX =
      Math.cos(angle + planetAngle) * Alien3.patrolRadius + Planet.x;
    this.targetY =
      Math.sin(angle + planetAngle) * Alien3.patrolRadius + Planet.y;
    this.findVel();
    // if (!randomNumber(0, 1)) this.shoot();
    this.shoot();
  }
  shoot() {
    if (paused) return;
    let angle = Math.atan2(this.y - Planet.y, this.x - Planet.x);
    this.bullets.push({
      x: this.x,
      y: this.y,
      xVel: Math.cos(angle) * this.bulletSpeed,
      yVel: Math.sin(angle) * this.bulletSpeed,
    });
  }
  update() {
    this.y += this.yVel;
    this.x += this.xVel;
    let distance = getDistance(this.x, this.y, this.targetX, this.targetY);
    if (distance <= Alien3.maxSpeed * 2) {
      this.newTarget();
    }
    this.draw();

    // update bullets
    for (let i = 0; i < this.bullets.length; i++) {
      let bullet = this.bullets[i];
      bullet.x -= bullet.xVel;
      bullet.y -= bullet.yVel;

      // check for planet collision
      let distance = getDistance(bullet.x, bullet.y, Planet.x, Planet.y);
      if (distance - this.bulletSize < Planet.radius) {
        planet.stun();
        this.bullets.splice(i, 1);
      }

      // check for bullet collision
      for (let j = 0; j < planet.bullets.length; j++) {
        let b = planet.bullets[j];
        let distance = getDistance(bullet.x, bullet.y, b.x, b.y);
        if (distance <= this.bulletSize) {
          planet.bullets.splice(j, 1);
          this.bullets.splice(i, 1);
        }
      }

      c.translate(bullet.x, bullet.y);
      c.drawImage(
        bulletImage,
        -this.bulletSize,
        -this.bulletSize,
        this.bulletSize * 2,
        this.bulletSize * 2
      );
      c.resetTransform();
    }
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
  static image = new Image();
  constructor() {
    this.health = 10;
    this.turretRotation = 0;
    this.bullets = [];
    this.fullAuto = 0;
    this.stuned = false;
    Planet.image.src = "assets/planet.png";
  }
  damage(damage = 1) {
    this.health -= damage;
    impactSound.currentTime = 0;
    impactSound.play();
    if (this.health <= 0) {
      endGame();
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
    c.drawImage(
      Planet.image,
      -Planet.radius,
      -Planet.radius,
      Planet.radius * 2,
      Planet.radius * 2
    );
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
      c.drawImage(
        bulletImage,
        -Planet.bulletSize,
        -Planet.bulletSize,
        Planet.bulletSize * 2,
        Planet.bulletSize * 2
      );
      c.resetTransform();
    }
  }
  shootTurret(second = false) {
    if (paused) return;
    if (this.stuned) return;
    this.bullets.push({
      x: Math.cos(this.turretRotation) * Planet.turretWidth + Planet.x,
      y: Math.sin(this.turretRotation) * Planet.turretWidth + Planet.y,
      xVel: Math.cos(this.turretRotation) * Planet.bulletSpeed,
      yVel: Math.sin(this.turretRotation) * Planet.bulletSpeed,
    });
    this.bullets.push({
      x: Math.cos(this.turretRotation) * Planet.turretWidth + Planet.x,
      y: Math.sin(this.turretRotation) * Planet.turretWidth + Planet.y,
      xVel: Math.cos(this.turretRotation) * Planet.bulletSpeed,
      yVel: Math.sin(this.turretRotation) * Planet.bulletSpeed,
    });
    laserSound.currentTime = 0;
    laserSound.play();
  }
  stun() {
    if (this.stuned) {
      clearInterval(this.stunFunction);
    }
    this.stuned = true;
    this.stunFunction = setTimeout(() => {
      this.stuned = false;
    }, 1000);
    stunSound.currentTime = 0;
    stunSound.play();
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
function spawnEnemy() {
  if (!entityCap.Alien1) {
    entityCap.Alien1 = 1;
    entities.Alien1.push(new Alien1());
  } else if (!entityCap.Alien2 && entityCap.Alien1 >= 1.4) {
    entityCap.Alien2 = 1;
    entities.Alien2.push(new Alien2());
  } else if (!entityCap.Alien3 && entityCap.Alien2 >= 1.4) {
    entityCap.Alien3 = 1;
    entities.Alien3.push(new Alien3());
  }
}
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
  entityCap = {
    Asteroid: 1,
    Alien1: 0,
    Alien2: 0,
    Alien3: 0,
    Powerup: 0,
  };
  entities = {
    Asteroid: [new Asteroid()],
    Alien1: [
      /* new Alien1() */
    ],
    Alien2: [
      /* new Alien2() */
    ],
    Alien3: [
      /* new Alien3() */
    ],
    Powerup: [new Powerup()],
  };
  score = 0;
  playing = true;
  powerup = new Powerup();
}

function endGame() {
  planet = new Planet();
  if (score > highscore) {
    highscore = score;
    localStorage.highscore = score;
  }
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
  let canvasPos = canvas.getBoundingClientRect();
  mouseX = Math.round(e.clientX - canvasPos.left - canvas.width / 2);
  mouseY = Math.round(e.clientY - canvasPos.top - canvas.height / 2);
});

canvas.addEventListener("click", (e) => {
  planet.shootTurret();
});

window.addEventListener("keydown", (e) => {
  let key = e.key;
  if (key == " ") {
    if (playing == false) {
      startGame();
    } else {
      paused = !paused;
    }
  }
});

// game loop
function gameloop() {
  window.requestAnimationFrame(gameloop);
  c.clearRect(0, 0, canvas.width, canvas.height);
  planet.update();
  if (playing && !paused) {
    // add frame to counter
    // if frames is larger then add specific enemies
    // update entities
    for (let k in entities) {
      for (let j = 0; j < entities[k].length; j++) {
        let e = entities[k][j];
        e.update();

        // check for bullet collision
        for (let i = 0; i < planet.bullets.length; i++) {
          let b = planet.bullets[i];
          let distance = getDistance(e.x, e.y, b.x, b.y);
          if (distance <= e.radius) {
            planet.bullets.splice(i, 1);
            entities[k].splice(j, 1);
            e.break();
            break;
          }
        }

        // check for planet collision
        let distance = getDistance(e.x, e.y, Planet.x, Planet.y);
        if (distance - e.radius < Planet.radius) {
          planet.damage(e.damage);
          entities[k].splice(j, 1);
          e.spawn();
        }
      }
    }
  } else if (playing) {
    pauseScreen();
  } else {
    startScreen();
  }
  drawScoreboard();
}
gameloop();
