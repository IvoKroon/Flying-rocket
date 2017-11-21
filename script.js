// 'use strict';
const canvas = document.getElementById("canvas");
const ctx = canvas.getContext('2d');
let spawner;


// Use this to make the shade color.
function shadeRGBColor(color, percent) {
    var f = color.split(","), t = percent < 0 ? 0 : 255, p = percent < 0 ? percent * -1 : percent, R = parseInt(f[0].slice(4)), G = parseInt(f[1]), B = parseInt(f[2]);
    return "rgb(" + (Math.round((t - R) * p) + R) + "," + (Math.round((t - G) * p) + G) + "," + (Math.round((t - B) * p) + B) + ")";
}

window.requestAnimFrame = (function () {
    return (
        window.requestAnimationFrame ||
        window.webkitRequestAnimationFrame ||
        window.mozRequestAnimationFrame ||
        function (callback) {
            window.setTimeout(callback, 1000);
        }
    );
})();

window.onload = function () {
    init();
    // window.addEventListener("resize", () => {
    //  initCanvas();
    // });
};

function init() {
    spawner = new Spawner();
    loop();
}

function loop() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    spawner.draw();
    requestAnimFrame(loop);
}

class GameObject {
    constructor(ctx, x, y) {
        this.x = x;
        this.y = y;
        this.ctx = ctx;
    }
}

class Spawner {
    constructor() {
        //show different planets
        // 1 is large and in front with size between 200 and 100
        // 0 is small and is behind with size between 100 and 50
        // 1 can stand before 0 but 0 not before 1

        // When planet get destroyed get 5 astroids and they go to other astroids and form new planets.
        // Something with colors?
        this.planet = new Planet(ctx, 150, 250, 50, 'rgb(245,136,158)');
        this.planet2 = new Planet(ctx, 100, 100, 100, 'rgb(1,25,54)');
        this.SpaceShip = new SpaceShip(ctx, 250, 50);
        this.draw();
    }

    draw() {
        this.planet.draw();
        this.planet2.draw();
        this.SpaceShip.draw();
    }
}

class SpaceShip extends GameObject {
    constructor(ctx, x, y) {
        super(ctx, x, y);
        this.rotation = 0;
        this.direction = 90 * Math.PI / 20;
        // this.vX = 2;
        // this.vY = 2;
        this.height = 35;
        this.width = 30;
        this.rotateSpeed = 40;
        this.speed = 3;
        this.holdingLeft = false;
        this.holdingRight = false;
        // Calculate the direction which the spaceship need to fly.
        window.addEventListener('keyup', (e) => {
            console.log('Up');
            if (e.keyCode === 65 || e.keyCode === 37) {
                this.holdingLeft = false;
            } else if (e.keyCode === 68 || e.keyCode === 39) {
                this.holdingRight = false;
            }
        })
        window.addEventListener('keydown', (e) => {
            console.log('Down');
            if (e.keyCode === 65 || e.keyCode === 37) {
                // this.direction -= Math.PI / this.rotateSpeed;
                this.holdingLeft = true;
            } else if (e.keyCode === 68 || e.keyCode === 39) {
                // this.direction += Math.PI / this.rotateSpeed;
                this.holdingRight = true;
            }
        });
    }

    draw() {
        this.move();
        this.ctx.save();
        this.ctx.beginPath();
        // this.ctx.translate(-this.x + 20 / 2, -this.y + 30 / 2);
        // // console.log("dir2 " + (this.direction - this.direction));
        // this.ctx.rotate(90 * Math.PI / 2);
        this.ctx.translate(this.x, this.y);

        // Rotate 1 degree
        this.ctx.rotate(this.direction);

        // Move registration point back to the top left corner of canvas
        this.ctx.translate(8, -20);

        this.drawRocket();

        this.ctx.fillStyle = 'white';
        this.ctx.fill();
        this.ctx.restore();
    }

    calcDirection() {
        var dx = this.xDes - this.x;
        var dy = this.yDes - this.y;
        console.log(dx);
        var dist = Math.sqrt(dx * dx + dy * dy);
        this.direction = Math.atan2(dx, dy);
        console.log("dir " + this.direction);
    };

    move() {
        // Move to a direction
        if(this.holdingLeft){
            this.direction -= Math.PI / this.rotateSpeed;
            console.log('LEFT');
        }else if(this.holdingRight){
            console.log('RIGHT');
            this.direction += Math.PI / this.rotateSpeed;
        }
        this.y += this.speed * Math.cos(this.direction);
        this.x -= this.speed * Math.sin(this.direction);

        // WE USE HEIGHT HERE INSTEAD OF WIDTH BECAUSE OF THE ROCKETS FLY DIRECTION.
        if (this.x > canvas.width + this.height + 10) {
            this.x = -this.height;
        }

        if (this.x < -this.height) {
            this.x = canvas.width + this.height;
        }

        if (this.y > canvas.height + this.height + 10) {
            this.y = -this.height
        }

        if (this.y < -this.height) {
            this.y = canvas.height + this.height;
        }
    };

    drawRocket() {
        this.ctx.moveTo(0, 0);
        this.ctx.lineTo(7, 0);
        this.ctx.lineTo(0, 13);
        this.ctx.lineTo(0, 30);

        this.ctx.lineTo(-7.5, 35);
        this.ctx.lineTo(-15, 30);

        this.ctx.lineTo(-15, 13);
        this.ctx.lineTo(-22, 0);
        this.ctx.closePath();
    }
}

class Planet extends GameObject {
    constructor(ctx, x, y, radius, color) {
        super(ctx, x, y);
        this.radius = radius;
        this.color = color;
        this.startY = y;
        this.up = false;
    }

    swoopEffect() {
        if (this.up) {
            this.y += 0.1;
        } else {
            this.y -= 0.1;
        }

        if (this.startY - this.y > 5 || this.startY - this.y < 0) {
            this.up = !this.up;
        }

    }

    draw() {
        this.swoopEffect();
        this.ctx.save();
        this.ctx.beginPath();
        this.ctx.arc(this.x, this.y, this.radius, 0, 2 * Math.PI, false);
        this.ctx.fillStyle = this.color;
        this.ctx.fill();
        this.ctx.clip();
        const distanceBetween = this.radius * 2 / 7;
        for (let i = 1; i < 7 + 1; i++) {
            if (i % 2 === 0) {
                this.drawRect(
                    this.y - this.radius + distanceBetween * i,
                    distanceBetween * 0.9,
                    shadeRGBColor(this.color, 0.3)
                );
            }
        }
        this.ctx.restore();
    }

    drawRect(y, size, color) {
        this.ctx.fillStyle = color;
        this.ctx.fillRect(this.x - this.radius, y - size, this.radius * 2, size);
    }
}