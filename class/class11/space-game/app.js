function loadTexture(path) {
    return new Promise((resolve) => {
      const img = new Image();
      img.src = path;
      img.onload = () => {
        resolve(img);
      };
    });
  }
  
  function createEnemies2(ctx, canvas, enemyImg) {
    const ROWS = 5;
    const COLS = 5;
    const START_X = canvas.width / 2 - (enemyImg.width * COLS) / 2;
  
    for (let row = 0; row < ROWS; row++) {
      for (let col = 0; col < COLS - row; col++) {
        const x = START_X + col * enemyImg.width + (enemyImg.width / 2) * row;
        const y = row * enemyImg.height;
        ctx.drawImage(enemyImg, x, y);
      }
    }
  }
  
  window.onload = async () => {
    const canvas = document.getElementById("myCanvas");
    const ctx = canvas.getContext("2d");
  
    const heroImg = await loadTexture("assets/player.png");
    const enemyImg = await loadTexture("assets/enemyShip.png");
    const bgImg = await loadTexture("assets/starBackground.png");
  
    const bgPattern = ctx.createPattern(bgImg, "repeat");
    ctx.fillStyle = bgPattern;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  
    const heroX = canvas.width / 2 - 45;
    const heroY = canvas.height - canvas.height / 4;
  
    ctx.drawImage(heroImg, heroX, heroY);
  
    const scaledWidth = heroImg.width / 2;
    const scaledHeight = heroImg.height / 2;
    ctx.drawImage(heroImg, heroX - scaledWidth - 20, heroY, scaledWidth, scaledHeight);
    ctx.drawImage(heroImg, heroX + heroImg.width + 20, heroY, scaledWidth, scaledHeight);
  
    createEnemies2(ctx, canvas, enemyImg);
  };