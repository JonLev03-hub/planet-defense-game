const canvas = document.querySelector("canvas");
const c = canvas.getContext("2d");
canvas.width = 720;
canvas.height = 720;
playing = false;
class Planet {
    static x = canvas.width/2
    static y = canvas.height/2
    static healRate = 4
    static radius = 50

    constructor() {
        this.health = 10
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
    draw(){
        c.beginPath();
        c.strokeStyle = "white";
        c.lineWidth = 2;
        c.translate(Planet.x,Planet.y)
        c.arc(0, 0, Planet.radius, 0, 2 * Math.PI);
        c.stroke()
        c.resetTransform()
    }
}

// Init classes
const planet = new Planet


// // game logic loop
// window.setInterval(()=> {
//     planet.draw()
// },16)

// game animation loop
function gameloop(){
    window.requestAnimationFrame(gameloop)
    if (playing) {

        // update player
        // update asteroids and aliens
        // detect any collisions
        // draw planet
        planet.draw()
        // draw player
        // draw aliens and asteroids
    } else {
        // make start screen
    }
    // draw scoreboard
}
gameloop()