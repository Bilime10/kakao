// CLASS
class EventEmitter {
  constructor() {
    this.listeners = {};
  }
  on(message, listener) {
    if (!this.listeners[message]) {
      this.listeners[message] = [];
    }
    this.listeners[message].push(listener);
  }
  emit(message, payload = null) {
    if (this.listeners[message]) {
      this.listeners[message].forEach((l) => l(message, payload));
    }
  }
  clear() {
    this.listeners = {};
  }
}

class GameObject {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.dead = false; // 객체가 파괴되었는지 여부
    this.type = ""; // 객체 타입 (영웅/적)
    this.width = 0; // 객체의 폭
    this.height = 0; // 객체의 높이
    this.img = undefined; // 객체의 이미지
  }
  rectFromGameObject() {
    return {
      top: this.y,
      left: this.x,
      bottom: this.y + this.height,
      right: this.x + this.width,
    };
  }
  draw(ctx) {
    ctx.drawImage(this.img, this.x, this.y, this.width, this.height); // 캔버스에 이미지 그리기
  }
}

class Hero extends GameObject {
  constructor(x, y) {
    super(x, y);
    (this.width = 60), (this.height = 40);
    this.type = "Hero";
    this.speed = { x: 0, y: 0 };
    this.cooldown = 0;
    this.life = 3;
    this.points = 0;
    this.shield = new Shield(this);
  }
  fire() {
    if (this.canFire()) {
      gameObjects.push(new Laser(this.x + 25, this.y - 10)); // 레이저 발사
      this.cooldown = 400; // 쿨다운 500ms
      let id = setInterval(() => {
        if (this.cooldown > 0) {
          this.cooldown -= 100;
        } else {
          clearInterval(id);
        }
      }, 100);
    }
  }
  canFire() {
    return this.cooldown === 0; // 쿨다운이 끝났는지 확인
  }
  useMeteor() {
    for (let i = 0; i < 13; i++) {
      // 메터오 사이즈 100 고려
      gameObjects.push(
        new Meteor( // 메테오 생성
          Math.floor(Math.random() * (canvas.width - 100)),
          Math.floor(Math.random() * (canvas.height - 100))
        )
      );
    }
  }

  usePiercingLaser() {
    gameObjects.push(new PiercingLaser(this.x + 45, this.y - 10));
  }

  useShield() {
    if (!this.invincible) {
      this.shield.startShield();
    }
  }

  decrementLife() {
    if (!this.invincible) {
      this.life--;
      if (this.life <= 0) {
        this.dead = true;
      }
    }
  }

  incrementPoints() {
    this.points += 100;
  }
}

class SubHero extends GameObject {
  constructor(x, y) {
    super(x, y);
    this.width = 60 / 2;
    this.height = 40 / 2;
    this.type = "SubHero";
    this.speed = { x: 0, y: 0 };
    let id = setInterval(() => {
      if (!this.dead) {
        gameObjects.push(new Laser(this.x + 25 / 2.0, this.y - 25 / 2.0));
      }
    }, 1000);
  }

  checkLife(hero) {
    if (hero.life <= 0) {
      this.dead = true;
    }
  }
}

class Enemy extends GameObject {
  constructor(x, y) {
    super();
    this.x = x;
    this.y = y;
    this.width = 60;
    this.height = 40;
    // 스피드 최소 15 최대 35 랜덤
    this.speed = Math.floor(Math.random() * (35 - 15 + 1)) + 15;
    this.dead = false;
    this.type = "Enemy";
    this.movementPattern = Math.floor(Math.random() * 2); // 0: 기본 아래로, 1: 대각선, 2: 속도 변화
  }

  moveDown() {
    this.y += this.speed;
  }

  moveDiagonally() {
    const direction = Math.random() > 0.5 ? 1 : -1;
    this.x += direction * this.speed;
    this.y += this.speed;
  }

  // 이동 패턴에 맞게 이동
  move() {
    switch (this.movementPattern) {
      case 0:
        this.moveDown();
        break;
      case 1:
        this.moveDiagonally();
        break;
    }
  }

  drawCollusion(ctx) {
    ctx.drawImage(this.collusionImg, this.x, this.y, this.width, this.height);
  }
}

class BossLaser extends GameObject {
  constructor(x, y) {
    super();
    this.x = x;
    this.y = y;
    this.width = 10;
    this.height = 30;
    this.speed = 30; // 레이저 속도
    this.type = "BossLaser"; // 타입 구분
    this.dead = false;
  }

  move() {
    this.y += this.speed; // 아래로 이동
    if (this.y > canvas.height) {
      this.dead = true; // 화면 밖으로 나가면 제거
    }
  }

  draw(ctx) {
    ctx.fillStyle = "red";
    ctx.fillRect(this.x, this.y, this.width, this.height);
  }
}

class Boss extends GameObject {
  constructor(x, y, stage) {
    super(x, y);
    this.stage = stage;
    this.width = 200;
    this.height = 200;
    this.life = 42; // 보스의 초기 생명력
    this.speed = 20;
    this.type = "Boss";
    this.image = bossImg;
    this.patterns = ["straight", "diagonal", "burst"]; // 행동 패턴
    this.currentPatternIndex = 0;
    this.laserCooldown = 0;
    this.id;
  }

  takeDamage() {
    this.life -= 1; // 레이저 한 발당 1 감소
    if (this.life <= 0) {
      this.dead = true; // 생명력이 0 이하가 되면 사망
      clearInterval(this.id);
    }
  }

  move() {
    const pattern = this.patterns[this.currentPatternIndex];
    if (pattern === "straight") {
      this.x += this.speed;
      if (this.x <= 0 || this.x + this.width >= canvas.width) {
        this.speed *= -1; // 좌우 반전
      }
    } else if (pattern === "diagonal") {
      this.x += this.speed;
      this.y += Math.sin((Date.now() / 200) * Math.PI) * 2; // 대각선 이동
    }

    if (Date.now() % 5000 < 100) {
      // 5초마다 패턴 변경
      this.currentPatternIndex =
        (this.currentPatternIndex + 1) % this.patterns.length;
    }
    if (this.x < 0) this.x = 0;
    if (this.x + this.width > canvas.width) this.x = canvas.width - this.width;
    if (this.y < 0) this.y = 0;
    if (this.y + this.height > canvas.height)
      this.y = canvas.height - this.height;
  }

  fireLasers() {
    if (this.laserCooldown > 0) {
      this.laserCooldown -= 1;
      return;
    }

    let centerX = this.x + this.width / 2;

    if (this.patterns[this.currentPatternIndex] === "straight") {
      this.id = setInterval(() => {
        const laser = new BossLaser(centerX, this.y + this.height);
        gameObjects.push(laser);
      }, 100);
    } else if (this.patterns[this.currentPatternIndex] === "burst") {
      for (let i = -10; i <= 10; i++) {
        const laser = new BossLaser(centerX + i * 20, this.y + this.height);
        gameObjects.push(laser);
      }
    }

    this.laserCooldown = 50; // 쿨다운 설정
  }

  draw(ctx) {
    ctx.drawImage(this.image, this.x, this.y, this.width, this.height);
    // 생명력 바 표시
    ctx.fillStyle = "red";
    ctx.fillRect(50, 20, (this.life / 20) * this.width, 5);
  }
}

class Laser extends GameObject {
  constructor(x, y) {
    super(x, y);
    (this.width = 9), (this.height = 33);
    this.type = "Laser";
    this.img = laserImg;
    let id = setInterval(() => {
      if (this.y > 0) {
        this.y -= 15; // 레이저가 위로 이동
      } else {
        this.dead = true; // 화면 상단에 도달하면 제거
        clearInterval(id);
      }
    }, 100);
  }
}
class Meteor extends GameObject {
  constructor(x, y) {
    super(x, y);
    this.width = 100;
    this.height = 100;
    this.type = "Meteor";
    this.img = meteorImg;
    this.dead = false;
    let id = setInterval(() => {
      this.dead = true; // 화면 하단에 도달하면 제거
      clearInterval(id);
    }, 200);
  }
}

class PiercingLaser extends GameObject {
  constructor(x, y) {
    super(x, y);
    this.width = Math.floor(canvas.width / 6);
    this.height = Math.floor(canvas.height / 4);
    this.img = GreenlaserImg;
    this.type = "PiercingLaser";
    this.dead = false;
    let id = setInterval(() => {
      if (this.y > 0) {
        this.y -= 15; // 레이저가 위로 이동
      } else {
        this.dead = true; // 화면 상단에 도달하면 제거
        clearInterval(id);
      }
    }, 100);
  }
}

class Shield extends GameObject {
  constructor(hero) {
    super();
    this.width = 99;
    this.height = 75;
    this.x = hero.x - 18;
    this.y = hero.y - 20;
    this.hero = hero;
    this.duration = 2000; // 2초 지속
    this.img = shieldImg;
    this.dead = false;
  }

  startShield() {
    this.dead = false;
    this.hero.invincible = true;
    gameObjects.push(this);
    setTimeout(() => {
      this.hero.invincible = false; // 무적 해제
      this.dead = true; // 쉴드 제거
    }, this.duration);
  }
}

// VARIABLES
const Messages = {
  KEY_EVENT_UP: "KEY_EVENT_UP",
  KEY_EVENT_DOWN: "KEY_EVENT_DOWN",
  KEY_EVENT_LEFT: "KEY_EVENT_LEFT",
  KEY_EVENT_RIGHT: "KEY_EVENT_RIGHT",
  KEY_EVENT_SPACE: "KEY_EVENT_SPACE",
  COLLISION_ENEMY_LASER: "COLLISION_ENEMY_LASER",
  COLLISION_ENEMY_HERO: "COLLISION_ENEMY_HERO",
  GAME_END_LOSS: "GAME_END_LOSS",
  GAME_END_WIN: "GAME_END_WIN",
  KEY_EVENT_ENTER: "KEY_EVENT_ENTER",
};
let heroImg,
  enemyImg,
  bossImg,
  laserImg,
  collusionImg,
  lifeImg,
  shieldImg,
  meteorImg,
  GreenlaserImg,
  canvas,
  ctx,
  gameObjects = [],
  hero,
  subHero1,
  subHero2,
  gameLoopId,
  eventEmitter = new EventEmitter();

let directionIntervals = {
  up: null,
  down: null,
  left: null,
  right: null,
};
const repeatDelay = 30;
let spaceBarInterval = null;
const spaceBarRepeatDelay = 120;

// 쿨타임 관리 변수
let abilitiesCooldown = {
  shield: 0, // 쉴드 (S키)
  meteor: 0, // 메테오 (D키)
  laser: 0, // 관통 레이저 (F키)
};

const abilitiesCooldownMax = {
  shield: 4000, // 4초
  meteor: 20000, // 20초
  laser: 7000, // 7초
};

// FUNCTIONS
const startDirection = (direction, message) => {
  if (!directionIntervals[direction]) {
    directionIntervals[direction] = setInterval(() => {
      eventEmitter.emit(message);
    }, repeatDelay);
  }
};

const stopDirection = (direction) => {
  if (directionIntervals[direction]) {
    clearInterval(directionIntervals[direction]);
    directionIntervals[direction] = null;
  }
};

const startSpaceBar = () => {
  if (!spaceBarInterval) {
    spaceBarInterval = setInterval(() => {
      eventEmitter.emit(Messages.KEY_EVENT_SPACE);
    }, spaceBarRepeatDelay);
  }
};

const stopSpaceBar = () => {
  if (spaceBarInterval) {
    clearInterval(spaceBarInterval);
    spaceBarInterval = null;
  }
};

const useAbility = (type) => {
  if (abilitiesCooldown[type] === 0) {
    abilitiesCooldown[type] = abilitiesCooldownMax[type]; // 쿨타임 설정
    switch (type) {
      case "shield":
        hero.useShield();
        break;
      case "meteor":
        hero.useMeteor();
        break;
      case "laser":
        hero.usePiercingLaser();
        break;
    }
    // 쿨타임 감소 처리
    let intervalId = setInterval(() => {
      if (abilitiesCooldown[type] > 0) {
        abilitiesCooldown[type] -= 100;
      } else {
        clearInterval(intervalId);
      }
    }, 100);
  } else {
    console.log(`${type} is on cooldown!`);
  }
};

let onKeyDown = function (e) {
  console.log(e.keyCode);
  switch (e.keyCode) {
    case 37: // 왼쪽 화살표
      startDirection("left", Messages.KEY_EVENT_LEFT);
      e.preventDefault();
      break;
    case 39: // 오른쪽 화살표
      startDirection("right", Messages.KEY_EVENT_RIGHT);
      e.preventDefault();
      break;
    case 38: // 위쪽 화살표
      startDirection("up", Messages.KEY_EVENT_UP);
      e.preventDefault();
      break;
    case 40: // 아래쪽 화살표
      startDirection("down", Messages.KEY_EVENT_DOWN);
      e.preventDefault();
      break;
    case 32: // 스페이스바
      startSpaceBar();
      e.preventDefault();
      break;
    case 83: // S키
      useAbility("shield");
      e.preventDefault();
      break;
    case 68: // D키
      useAbility("meteor");
      e.preventDefault();
      break;
    case 70: // F키
      useAbility("laser");
      e.preventDefault();
      break;
    default:
      break;
  }
};

function loadTexture(path) {
  return new Promise((resolve) => {
    const img = new Image();
    img.src = path;
    img.onload = () => {
      resolve(img);
    };
  });
}

function intersectRect(r1, r2) {
  return !(
    r2.left > r1.right ||
    r2.right < r1.left ||
    r2.top > r1.bottom ||
    r2.bottom < r1.top
  );
}

function drawGameObjects(ctx) {
  gameObjects.forEach((go) => go.draw(ctx));
}

function drawLife() {
  const START_POS = canvas.width - 180;
  for (let i = 0; i < hero.life; i++) {
    ctx.drawImage(lifeImg, START_POS + 45 * (i + 1), canvas.height - 37);
  }
}

function drawPoints() {
  ctx.font = "30px Arial";
  ctx.fillStyle = "red";
  ctx.textAlign = "left";
  drawText("Points: " + hero.points, 10, canvas.height - 20);
}

function drawText(message, x, y) {
  ctx.fillText(message, x, y);
}

function drawCooldowns() {
  const START_X = canvas.width - 180;
  const START_Y = canvas.height - 120;
  const ICON_SIZE = 50;

  // 쉴드
  ctx.drawImage(shieldImg, START_X, START_Y, ICON_SIZE, ICON_SIZE);
  if (abilitiesCooldown.shield > 0) {
    ctx.fillStyle = "rgba(0, 0, 0, 0.5)";
    ctx.fillRect(START_X, START_Y, ICON_SIZE, ICON_SIZE);
    ctx.fillStyle = "white";
    ctx.font = "20px Arial";
    ctx.fillText(
      Math.ceil(abilitiesCooldown.shield / 1000),
      START_X + ICON_SIZE / 2 - 10,
      START_Y + ICON_SIZE / 2 + 10
    );
  }

  // 메테오
  ctx.drawImage(meteorImg, START_X + 60, START_Y, ICON_SIZE, ICON_SIZE);
  if (abilitiesCooldown.meteor > 0) {
    ctx.fillStyle = "rgba(0, 0, 0, 0.5)";
    ctx.fillRect(START_X + 60, START_Y, ICON_SIZE, ICON_SIZE);
    ctx.fillStyle = "white";
    ctx.font = "20px Arial";
    ctx.fillText(
      Math.ceil(abilitiesCooldown.meteor / 1000),
      START_X + 60 + ICON_SIZE / 2 - 10,
      START_Y + ICON_SIZE / 2 + 10
    );
  }

  // 관통 레이저
  ctx.drawImage(GreenlaserImg, START_X + 120, START_Y, ICON_SIZE, ICON_SIZE);
  if (abilitiesCooldown.laser > 0) {
    ctx.fillStyle = "rgba(0, 0, 0, 0.5)";
    ctx.fillRect(START_X + 120, START_Y, ICON_SIZE, ICON_SIZE);
    ctx.fillStyle = "white";
    ctx.font = "20px Arial";
    ctx.fillText(
      Math.ceil(abilitiesCooldown.laser / 1000),
      START_X + 120 + ICON_SIZE / 2 - 10,
      START_Y + ICON_SIZE / 2 + 10
    );
  }
}

function createHero() {
  hero = new Hero(canvas.width / 2 - 45, canvas.height - canvas.height / 4);
  hero.img = heroImg;
  gameObjects.push(hero);
  subHero1 = new SubHero(
    canvas.width / 2 - 80,
    canvas.height - canvas.height / 4 + 15
  );
  subHero1.img = heroImg;
  gameObjects.push(subHero1);
  subHero2 = new SubHero(
    canvas.width / 2 + 20,
    canvas.height - canvas.height / 4 + 15
  );
  subHero2.img = heroImg;
  gameObjects.push(subHero2);
}

let enemySpawnInterval;

function createEnemies() {
  const MONSTER_MIN = 3; // 최소 생성되는 적의 수
  const MONSTER_MAX = 20; // 최대 생성되는 적의 수
  const MONSTER_COUNT =
    Math.floor(Math.random() * (MONSTER_MAX - MONSTER_MIN + 1)) + MONSTER_MIN; // 적군의 수 랜덤 설정

  const START_X = 0;
  const STOP_X = canvas.width;
  const START_Y = 0;
  const STOP_Y = 50; // 적군이 생성되는 최대 Y 위치

  for (let i = 0; i < MONSTER_COUNT; i++) {
    const randomX = Math.floor(Math.random() * (STOP_X - START_X)) + START_X; // 랜덤한 X 위치
    const randomY = Math.floor(Math.random() * (STOP_Y - START_Y)) + START_Y; // 랜덤한 Y 위치

    const enemy = new Enemy(randomX, randomY);
    enemy.img = enemyImg;
    gameObjects.push(enemy);
  }
}

function startEnemySpawn() {
  enemySpawnInterval = setInterval(() => {
    createEnemies();
  }, 1200);
}

let bossOneSpawned = false;
let bossTwoSpawned = false;

function checkForBossSpawn() {
  if (
    hero.points >= 10000 &&
    !gameObjects.some((go) => go.type === "Boss" && go.stage === 1) &&
    !bossOneSpawned
  ) {
    // 1단계 보스
    const boss = new Boss(canvas.width / 2, 50, 1);
    gameObjects.push(boss);
    bossOneSpawned = true;
  } else if (
    hero.points >= 50000 &&
    !gameObjects.some((go) => go.type === "Boss" && go.stage === 2) &&
    !bossTwoSpawned
  ) {
    // 2단계 보스
  }
}

function isHeroDead() {
  return hero.life <= 0;
}
function isEnemiesDead() {
  const enemies = gameObjects.filter((go) => go.type === "Enemy" && !go.dead);
  return enemies.length === 0;
}

function displayMessage(message, color = "red") {
  ctx.font = "80px Arial";
  ctx.fillStyle = color;
  ctx.textAlign = "center";
  ctx.fillText(message, canvas.width / 2, canvas.height / 2);
}

function updateGameObjects() {
  const lasers = [];
  const bossLasers = [];
  const enemies = [];
  const bosses = [];
  const meteors = [];
  const piercingLasers = [];

  // 한 번에 gameObjects를 순회하면서 필요한 객체들을 필터링
  gameObjects.forEach((go) => {
    if (!go.dead) {
      switch (go.type) {
        case "Enemy":
          enemies.push(go);
          break;
        case "Boss":
          bosses.push(go);
          break;
        case "BossLaser":
          bossLasers.push(go);
          break;
        case "Laser":
          lasers.push(go);
          break;
        case "Meteor":
          meteors.push(go);
          break;
        case "PiercingLaser":
          piercingLasers.push(go);
          break;
      }
    }
  });

  // 보스 및 적군 이동
  [...enemies, ...bosses].forEach((enemy) => {
    enemy.move();
    if (enemy.type === "Boss") {
      enemy.fireLasers();
    }
  });

  // 레이저와 적군 간 충돌 검사
  lasers.forEach((laser) => {
    [...enemies, ...bosses].forEach((enemy) => {
      if (
        intersectRect(laser.rectFromGameObject(), enemy.rectFromGameObject())
      ) {
        laser.dead = true;
        if (enemy.type === "Boss") {
          enemy.takeDamage();
          hero.incrementPoints();
        } else {
          enemy.dead = true; // 기본 적군은 바로 사망
          hero.incrementPoints();
        }
      }
    });
  });

  // 보스 레이저와 영웅의 충돌 검사
  bossLasers.forEach((laser) => {
    laser.move();
    if (intersectRect(hero.rectFromGameObject(), laser.rectFromGameObject())) {
      eventEmitter.emit(Messages.COLLISION_ENEMY_HERO, { enemy: laser });
      laser.dead = true;
    }
  });

  // 영웅과 적군 간 충돌 검사
  [...enemies, ...bosses].forEach((enemy) => {
    if (
      !hero.dead &&
      intersectRect(hero.rectFromGameObject(), enemy.rectFromGameObject())
    ) {
      eventEmitter.emit(Messages.COLLISION_ENEMY_HERO, { enemy });
    }
  });

  // 운석과 적군 간 충돌 처리
  meteors.forEach((meteor) => {
    [...enemies, ...bosses].forEach((enemy) => {
      if (
        intersectRect(meteor.rectFromGameObject(), enemy.rectFromGameObject())
      ) {
        if (enemy.type === "Boss") {
          enemy.takeDamage();
          hero.incrementPoints();
        } else {
          enemy.dead = true; // 기본 적군은 바로 사망
          hero.incrementPoints();
        }
      }
    });
  });

  // 투과 레이저와 적군 간 충돌 처리
  piercingLasers.forEach((piercingLaser) => {
    [...enemies, ...bosses].forEach((enemy) => {
      if (
        intersectRect(
          piercingLaser.rectFromGameObject(),
          enemy.rectFromGameObject()
        )
      ) {
        if (enemy.type === "Boss") {
          enemy.takeDamage();
          hero.incrementPoints();
        } else {
          enemy.dead = true; // 기본 적군은 바로 사망
          hero.incrementPoints();
        }
      }
    });
  });

  // 죽은 객체 제거
  gameObjects = gameObjects.filter((go) => !go.dead);
}

function initGame() {
  gameObjects = [];
  createHero();
  startEnemySpawn();

  eventEmitter.on(Messages.KEY_EVENT_UP, () => {
    hero.y -= 8;
    subHero1.y -= 8;
    subHero2.y -= 8;
    hero.shield.y -= 8;
  });
  eventEmitter.on(Messages.KEY_EVENT_DOWN, () => {
    hero.y += 8;
    subHero1.y += 8;
    subHero2.y += 8;
    hero.shield.y += 8;
  });
  eventEmitter.on(Messages.KEY_EVENT_LEFT, () => {
    hero.x -= 8;
    subHero1.x -= 8;
    subHero2.x -= 8;
    hero.shield.x -= 8;
  });
  eventEmitter.on(Messages.KEY_EVENT_RIGHT, () => {
    hero.x += 8;
    subHero1.x += 8;
    subHero2.x += 8;
    hero.shield.x += 8;
  });
  eventEmitter.on(Messages.KEY_EVENT_SPACE, () => {
    if (hero.canFire()) {
      hero.fire();
    }
  });
  eventEmitter.on(Messages.COLLISION_ENEMY_HERO, (_, { enemy }) => {
    enemy.dead = true;
    hero.decrementLife();
    subHero1.checkLife(hero);
    subHero2.checkLife(hero);

    if (isHeroDead()) {
      eventEmitter.emit(Messages.GAME_END_LOSS);
      return;
    }
  });
  eventEmitter.on(Messages.GAME_END_WIN, () => {});
  eventEmitter.on(Messages.GAME_END_LOSS, () => {
    let id = setInterval(() => {
      clearInterval(gameLoopId);
      displayMessage("GAME OVER", "red");
      clearInterval(id);
    }, 100);
  });
  eventEmitter.on(Messages.KEY_EVENT_ENTER, () => {});
}

// window
window.onload = async () => {
  canvas = document.getElementById("myCanvas");
  ctx = canvas.getContext("2d");
  backgroundImg = await loadTexture("assets/starBackground.png");
  heroImg = await loadTexture("assets/player.png");
  enemyImg = await loadTexture("assets/enemyShip.png");
  bossImg = await loadTexture("assets/enemyUFO.png");
  laserImg = await loadTexture("assets/laserRed.png");
  collusionImg = await loadTexture("assets/laserGreenShot.png");
  lifeImg = await loadTexture("assets/life.png");
  shieldImg = await loadTexture("assets/shield.png");
  meteorImg = await loadTexture("assets/meteorBig.png");
  GreenlaserImg = await loadTexture("assets/laserGreen.png");
  initGame();
  gameLoopId = setInterval(() => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "black";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(backgroundImg, 0, 0, canvas.width, canvas.height);
    drawGameObjects(ctx);
    drawPoints();
    drawCooldowns(); // 쿨타임 표시
    drawLife();
    updateGameObjects(); // 충돌 감지
    checkForBossSpawn();
  }, 100);
};

window.addEventListener("keydown", onKeyDown);
window.addEventListener("keyup", (evt) => {
  switch (evt.key) {
    case "ArrowUp":
      stopDirection("up");
      break;
    case "ArrowDown":
      stopDirection("down");
      break;
    case "ArrowLeft":
      stopDirection("left");
      break;
    case "ArrowRight":
      stopDirection("right");
      break;
    case " ":
      stopSpaceBar();
      break;
    case "Enter":
      eventEmitter.emit(Messages.KEY_EVENT_ENTER);
      break;
  }
});
