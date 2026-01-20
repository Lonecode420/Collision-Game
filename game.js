const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

canvas.width = innerWidth;
canvas.height = innerHeight;

let score = 0;
let lives = 3;
let gameOver = false;

const mouse = { x: canvas.width / 2, y: canvas.height / 2 };

window.addEventListener("mousemove", e => {
  mouse.x = e.clientX;
  mouse.y = e.clientY;
});

window.addEventListener("resize", () => {
  canvas.width = innerWidth;
  canvas.height = innerHeight;
});

class Player {
  constructor() {
    this.radius = 15;
  }

  draw() {
    ctx.beginPath();
    ctx.arc(mouse.x, mouse.y, this.radius, 0, Math.PI * 2);
    ctx.fillStyle = "#22d3ee";
    ctx.fill();
  }
}

class Enemy {
  constructor() {
    this.radius = Math.random() * 12 + 8;
    this.x = Math.random() * canvas.width;
    this.y = Math.random() * canvas.height;
    this.vx = (Math.random() - 0.5) * 4;
    this.vy = (Math.random() - 0.5) * 4;
  }

  draw() {
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
    ctx.fillStyle = "#ef4444";
    ctx.fill();
  }

  update() {
    this.x += this.vx;
    this.y += this.vy;

    // Wall collision
    if (this.x - this.radius < 0 || this.x + this.radius > canvas.width)
      this.vx *= -1;
    if (this.y - this.radius < 0 || this.y + this.radius > canvas.height)
      this.vy *= -1;

    this.draw();
  }
}

// Collision detection
function collide(a, b) {
  const dx = a.x - b.x;
  const dy = a.y - b.y;
  const distance = Math.sqrt(dx * dx + dy * dy);
  return distance < a.radius + b.radius;
}

const player = new Player();
let enemies = [];

function spawnEnemies(count) {
  for (let i = 0; i < count; i++) {
    enemies.push(new Enemy());
  }
}

spawnEnemies(6);

function updateHUD() {
  document.getElementById("score").textContent = `Score: ${score}`;
  document.getElementById("lives").textContent = `Lives: ${lives}`;
}

function animate() {
  if (gameOver) {
    ctx.fillStyle = "rgba(0,0,0,0.6)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "#fff";
    ctx.font = "40px sans-serif";
    ctx.fillText("GAME OVER", canvas.width / 2 - 120, canvas.height / 2);
    return;
  }

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  player.draw();

  enemies.forEach(enemy => {
    enemy.update();

    // Player collision
    if (collide(
      { x: mouse.x, y: mouse.y, radius: player.radius },
      enemy
    )) {
      lives--;
      enemies = enemies.filter(e => e !== enemy);
      if (lives <= 0) gameOver = true;
    }
  });

  score++;
  updateHUD();

  // Difficulty scaling
  if (score % 500 === 0) enemies.push(new Enemy());

  requestAnimationFrame(animate);
}

animate();
