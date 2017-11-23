// 'use strict';
const canvas = document.getElementById("canvas");
const background = document.getElementById("background");
const ctx = canvas.getContext('2d');
const bandckgrouCtx = background.getContext('2d');
const colors = [
    'rgb(52, 152, 219)',
    'rgb(142, 68, 173)',
    'rgb(192, 57, 43)',
    'rgb(44, 62, 80)'
];

let spawner;

// Use this to make the shade color.
function shadeRGBColor(color, percent) {
    var f = color.split(","), t = percent < 0 ? 0 : 255, p = percent < 0 ? percent * -1 : percent, R = parseInt(f[0].slice(4)), G = parseInt(f[1]), B = parseInt(f[2]);
    return "rgb(" + (Math.round((t - R) * p) + R) + "," + (Math.round((t - G) * p) + G) + "," + (Math.round((t - B) * p) + B) + ")";
}

function random(min, max) { return Math.floor((Math.random() * max) + min); }

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

window.onload = function () { init(); };

function init() {
    // Canvas
    canvas.width = document.body.clientWidth;
    canvas.height = document.body.clientHeight;
    // Background canvas
    background.width = document.body.clientWidth;
    background.height = document.body.clientHeight;
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
        this.smallPlanets = [
            new Planet(ctx, canvas.height - 200, 300, random(0,4), random(30, 40), colors[random(0,3)]),
            new Planet(ctx, 350, 600, random(0,4), random(30, 40), colors[random(0,3)]),
            new Planet(ctx, 650, 150, random(0,4), random(30, 40), colors[random(0,3)]),
         ];

        this.bigPlanets = [
            new Planet(ctx, canvas.width - 500, canvas.height - 150, random(0, 4), random(80, 90), colors[random(0, 3)]),
            new Planet(ctx, 200, 200, random(0, 4), random(70, 80), colors[random(0, 3)]),
        ];

        this.stars = [];
        for (let i = 0; i < 100; i++) {
            this.stars.push(new Star(bandckgrouCtx, random(0, background.width), random(0, background.height), random(1, 2)))
        }
        for (let j = 0; j < this.stars.length; j++) {
            this.stars[j].draw();
        }
        this.SpaceShip = new SpaceShip(ctx, 250, 50);
        this.draw();
    }

    draw() {
        for (let k = 0; k < this.smallPlanets.length; k++) {
            this.smallPlanets[k].draw();
        }

        this.SpaceShip.draw();

        for (let l = 0; l < this.bigPlanets.length; l++) {
            this.bigPlanets[l].draw();
        }
    }
}

class Star extends GameObject {
    constructor(ctx, x, y, size) {
        super(ctx, x, y, size);
        this.size = size;
    }

    draw() {
        this.ctx.save();
        this.ctx.fillStyle = "white";
        this.ctx.beginPath();
        this.ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2, true);
        this.ctx.shadowBlur = 30;
        this.ctx.shadowColor = "white";
        this.ctx.closePath();
        this.ctx.fill();
        this.ctx.restore();
    }

}


class SpaceShip extends GameObject {
    constructor(ctx, x, y) {
        super(ctx, x, y);
        this.rotation = 0;
        this.direction = 90 * Math.PI / 20;
        this.height = 35;
        this.width = 30;
        this.rotateSpeed = 30;
        this.speed = 4;
        this.holdingLeft = false;
        this.holdingRight = false;
        this.positions = [];

        // Calculate the direction which the spaceship need to fly.
        window.addEventListener('keyup', (e) => {
            if (e.keyCode === 65 || e.keyCode === 37) {
                this.holdingLeft = false;
            } else if (e.keyCode === 68 || e.keyCode === 39) {
                this.holdingRight = false;
            }
        })
        window.addEventListener('keydown', (e) => {
            if (e.keyCode === 65 || e.keyCode === 37) {
                this.holdingLeft = true;
            } else if (e.keyCode === 68 || e.keyCode === 39) {
                this.holdingRight = true;
            }
        });
    }

    draw() {
        this.move();
        this.drawSmoke();
        this.ctx.save();
        this.ctx.beginPath();
        this.ctx.translate(this.x, this.y);
        this.ctx.rotate(this.direction);
        this.ctx.translate(8, -20);
        this.drawRocket();
        this.ctx.fillStyle = 'white';
        this.ctx.fill();
        this.ctx.restore();
    }

    calcDirection() {
        var dx = this.xDes - this.x;
        var dy = this.yDes - this.y;
        var dist = Math.sqrt(dx * dx + dy * dy);
        this.direction = Math.atan2(dx, dy);
    };

    move() {
        if (this.holdingLeft) {
            this.direction -= Math.PI / this.rotateSpeed;
        } else if (this.holdingRight) {
            this.direction += Math.PI / this.rotateSpeed;
        }

        this.positions.push({ x: this.x, y: this.y });

        if (this.positions.length >= 50) {
            this.positions.shift();
        }

        this.y += this.speed * Math.cos(this.direction);
        this.x -= this.speed * Math.sin(this.direction);

        if (this.x > canvas.width + this.height + 10) { this.x = -this.height; }
        if (this.x < -this.height) { this.x = canvas.width + this.height; }
        if (this.y > canvas.height + this.height + 10) { this.y = -this.height }
        if (this.y < -this.height) {this.y = canvas.height + this.height; }
    };

    drawSmoke() {
        const size = 4 / this.positions.length;
        const opacity = 1 / this.positions.length;
        const red = 255 / this.positions.length;

        this.ctx.save();
        for (let i = 0; i < this.positions.length; i++) {
            const color = "rgba(" + (Math.floor(255 - red * i)) + ",0," + Math.floor(red * i) + "," + opacity * i + ")";
            this.ctx.fillStyle = color; //red
            this.ctx.beginPath();
            this.ctx.arc(this.positions[i].x, this.positions[i].y, 0 + i * size, 0, Math.PI * 2, true);
            this.ctx.shadowBlur = 30;
            this.ctx.shadowColor = color;
            this.ctx.closePath();
            this.ctx.fill();
        }
        this.ctx.restore();

    }

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
    constructor(ctx, x, y, startY, radius, color) {
        super(ctx, x, y);
        this.radius = radius;
        this.color = color;
        this.startY = y;
        this.y + startY;
        this.up = false;
    }

    drawShadow() {
        this.ctx.save();
        this.ctx.beginPath();
        var grd = this.ctx.createLinearGradient(this.x - this.radius / 2, this.y + this.radius / 2, this.x + this.radius / 2, this.y - this.radius);

        grd.addColorStop(0, 'rgba(0, 0, 0, 0.4)');
        grd.addColorStop(0.2, 'rgba(0, 0, 0, 0.3)');
        grd.addColorStop(1.0, 'rgba(255, 255,255, 0.3)');

        this.ctx.arc(this.x, this.y, this.radius, 0, 2 * Math.PI, false);
        this.ctx.fillStyle = grd;
        this.ctx.fill();
        this.ctx.restore();
    }

    draw() {
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
        this.drawShadow();
    }

    drawRect(y, size, color) {
        this.ctx.fillStyle = color;
        this.ctx.fillRect(this.x - this.radius, y - size, this.radius * 2, size);
    }
}