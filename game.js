const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

canvas.width = innerWidth;
canvas.height = innerHeight;

let score = 0;
let lives = 3;
let power = null;
let gameOver = false;

const hitSound = document.getElementById("hitSound");
const powerSound = document.getElementById("powerSound");
const healSound = document.getElementById("healSound");

const keys = {};

window.addEventListener("keydown", e => keys[e.key] = true);
window.addEventListener("keyup", e => keys[e.key] = false);
window.addEventListener("resize", () => {
  canvas.width = innerWidth;
  canvas.height = innerHeight;
});

class Player {
  constructor() {
    this.x = canvas.width / 2;
    this.y = canvas.height / 2;
    this.radius = 15;
    this.speed = 5;
  }

  move() {
    if (keys["w"] || keys["ArrowUp"]) this.y -= this.speed;
    if (keys["s"] || keys["ArrowDown"]) this.y += this.speed;
    if (keys["a"] || keys["ArrowLeft"]) this.x -= this.speed;
    if (keys["d"] || keys["ArrowRight"]) this.x += this.speed;

    this.x = Math.max(this.radius, Math.min(canvas.width - this.radius, this.x));
    this.y = Math.max(this.radius, Math.min(canvas.height - this.radius, this.y));
  }

  draw() {
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
    ctx.fillStyle = power === "shield" ? "#22c55e" : "#22d3ee";
    ctx.fill();
  }
}

class Enemy {
  constructor() {
    this.radius = Math.random() * 10 + 10;
    this.x = Math.random() * canvas.width;
    this.y = Math.random() * canvas.height;
    this.vx = (Math.random() - 0.5) * 4;
    this.vy = (Math.random() - 0.5) * 4;
  }

  update() {
    this.x += this.vx;
    this.y += this.vy;

    if (this.x < this.radius || this.x > canvas.width - this.radius) this.vx *= -1;
    if (this.y < this.radius || this.y > canvas.height - this.radius) this.vy *= -1;

    this.draw();
  }

  draw() {
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
    ctx.fillStyle = "#ef4444";
    ctx.fill();
  }
}

class PowerUp {
  constructor(type) {
    this.type = type;
    this.radius = 10;
    this.x = Math.random() * canvas.width;
    this.y = Math.random() * canvas.height;
  }

  draw() {
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
    ctx.fillStyle = this.type === "heal" ? "#22c55e" : "#facc15";
    ctx.fill();
  }
}

function collide(a, b) {
  const dx = a.x - b.x;
  const dy = a.y - b.y;
  return Math.hypot(dx, dy) < a.radius + b.radius;
}

const player = new Player();
let enemies = [];
let powerUps = [];

function spawnEnemies(n) {
  for (let i = 0; i < n; i++) enemies.push(new Enemy());
}

spawnEnemies(6);

function updateHUD() {
  document.getElementById("score").textContent = `Score: ${score}`;
  document.getElementById("lives").textContent = `Lives: ${lives}`;
  document.getElementById("power").textContent = `Power: ${power || "None"}`;
}

function animate() {
  if (gameOver) {
    ctx.fillStyle = "rgba(0,0,0,0.7)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "#fff";
    ctx.font = "40px sans-serif";
    ctx.fillText("GAME OVER", canvas.width / 2 - 120, canvas.height / 2);
    return;
  }

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  player.move();
  player.draw();

  // Enemy logic + enemy-enemy collisions
  enemies.forEach((e, i) => {
    e.update();

    for (let j = i + 1; j < enemies.length; j++) {
      if (collide(e, enemies[j])) {
        [e.vx, enemies[j].vx] = [enemies[j].vx, e.vx];
        [e.vy, enemies[j].vy] = [enemies[j].vy, e.vy];
      }
    }

    if (collide(player, e)) {
      if (power !== "shield") {
        lives--;
        hitSound.play();
      }
      enemies.splice(i, 1);
      if (lives <= 0) gameOver = true;
    }
  });

  // Power-ups
  powerUps.forEach((p, i) => {
    p.draw();
    if (collide(player, p)) {
      if (p.type === "heal" && lives < 5) {
        lives++;
        healSound.play();
      } else {
        power = "shield";
        powerSound.play();
        setTimeout(() => power = null, 5000);
      }
      powerUps.splice(i, 1);
    }
  });

  score++;
  updateHUD();

  if (score % 600 === 0) enemies.push(new Enemy());
  if (score % 800 === 0) powerUps.push(new PowerUp(Math.random() > 0.5 ? "heal" : "shield"));

  requestAnimationFrame(animate);
}

animate();
