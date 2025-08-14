const bc = 8; //bulletの数
const mc = 20; //モンスターの数
var startTime = new Array(bc);
var nowTime = new Array(bc);
var csx = new Array(bc); //カメラの向きｘ
var csy = new Array(bc); //カメラの向きｙ
var spx = new Array(bc); //カメラの位置ｘ
var spy = new Array(bc); //カメラの位置ｙ
var spz = new Array(bc); //カメラの位置ｚ
var hitCount = 0;  //被弾したモンスターの数
var time = 60;  //タイマー秒数
var warningFlag = false;  //警告音が鳴ったかどうか
var gameFlag=false;  //ゲームがスタートしたかどうか
var shootOn;  //ID
var timerId;  //ID

//SHOOTボタンON
function mouseDown() {
  if (!gameFlag) {
    return;
  }
  let shootBtn = document.getElementById("shoot");
  shootBtn.setAttribute("material", { color: "blue" });
  setTimeout(shot);
  shootOn = setInterval(shot, 300);
}

//弾の発射
var shot = function () {
  let num = getBullet();
  startTime[num] = new Date().getTime();
  const ban = new Audio(
    "https://cdn.glitch.global/95f1d303-7f12-4a05-9cdf-ccadca6e370f/shot.mp3?v=1713753072464"
  );
  ban.play();
};

//SHOOTボタンOFF
function mouseUp() {
  let shootBtn = document.getElementById("shoot");
  shootBtn.setAttribute("material", { color: "red" });
  clearInterval(shootOn);
}

//発射可能な弾の取得
function getBullet() {
  let cnt;
  for (cnt = 0; cnt < bc; cnt++) {
    let bullet = document.getElementById("bullet" + cnt);
    if (bullet.getAttribute("visible") == false) {
      const camera = document.querySelector("#camera");
      let cameraPosition = camera.getAttribute("position");
      let cameraRotation = camera.getAttribute("rotation");
      spx[cnt] = cameraPosition.x;
      spy[cnt] = cameraPosition.y;
      spz[cnt] = cameraPosition.z;
      csx[cnt] = cameraRotation.x;
      csy[cnt] = cameraRotation.y;
      bullet.setAttribute("position", {
        x: spx[cnt],
        y: spy[cnt],
        z: spz[cnt],
      });
      bullet.setAttribute("visible", "true");
      break;
    }
  }
  return cnt;
}

//発射済み弾の移動
var bulletMove = function () {
  for (let i = 0; i < bc; i++) {
    let bullet = document.getElementById("bullet" + i);

    if (bullet.getAttribute("visible")) {
      nowTime[i] = new Date().getTime();
      let time = nowTime[i] - startTime[i];
      if (time >= 2000) {
        bullet.setAttribute("visible", "false");
      } else {
        let bulletPos = bullet.getAttribute("position");
        bullet.setAttribute("position", {
          x:
            bulletPos.x +
            (Math.sin((csy[i] * Math.PI) / 180) *
              Math.cos((csx[i] * Math.PI) / 180) *
              -time) /
              500,
          y: bulletPos.y + (Math.sin((csx[i] * Math.PI) / 180) * time) / 500,
          z:
            bulletPos.z +
            (Math.cos((csy[i] * Math.PI) / 180) *
              Math.cos((csx[i] * Math.PI) / 180) *
              -time) /
              500,
        });

        colliderCheck(bullet);
      }
    }
  }
};
setInterval(bulletMove, 100);

//モンスターと弾の衝突チェック
function colliderCheck(bullet) {
  let bulletPos = bullet.getAttribute("position");
  let bulletRad = bullet.getAttribute("scale");
  let bulletX = bulletPos.x;
  let bulletY = bulletPos.y;
  let bulletZ = bulletPos.z;
  let bulletR = bulletRad.x;
  for (let i = 0; i < mc; i++) {
    let monster = document.getElementById("monster" + i);
    let monsterPos = monster.getAttribute("position");
    let monsterRad = monster.getAttribute("scale");
    let monsterX = monsterPos.x;
    let monsterY = monsterPos.y;
    let monsterZ = monsterPos.z;
    let monsterR = monsterRad.x;

    let distance = Math.sqrt(
      (monsterX - bulletX) * (monsterX - bulletX) +
        (monsterY - bulletY) * (monsterY - bulletY) +
        (monsterZ - bulletZ) * (monsterZ - bulletZ)
    );
    if (distance < monsterR) {
      if (monster.getAttribute("visible")) {
        bullet.setAttribute("visible", "false");
        //エフェクト表示
        effect(monsterPos);
        setTimeout(ce, 1500);
        const don = new Audio(
          "https://cdn.glitch.global/95f1d303-7f12-4a05-9cdf-ccadca6e370f/hit.mp3?v=1714116939953"
        );
        don.play();
        hitCount++;
        const countText = document.getElementById("countText");
        let str = hitCount + " / " + mc;
        countText.setAttribute("value", str);
        if (hitCount == mc) {
          clearInterval(timerId);
          gameEnd();
        }
      }
      monster.setAttribute("visible", "false");
    }
  }
}

//タイマー表示
function showClock() {
  if (!gameFlag) {
    return;
  }
  time--;
  const beep = new Audio(
    "https://cdn.glitch.global/95f1d303-7f12-4a05-9cdf-ccadca6e370f/warning.mp3?v=1714190612758"
  );
  const timerText = document.getElementById("timerText");
  if (time > 21) {
    timerText.setAttribute("color", "cyan");
  } else if (time > 6 && time < 21) {
    timerText.setAttribute("color", "yellow");
    if (!warningFlag) {
      beep.play();
      warningFlag = true;
    }
  } else if (time >0 && time < 6) {
    timerText.setAttribute("color", "red");
    beep.play();
  }

  timerText.setAttribute("value", time);
  if (time <= 0) {
    clearInterval(timerId);
    warningFlag = false;
    gameEnd();
  }
}
timerId = setInterval(showClock, 1000);

//ゲームの終了処理
function gameEnd() {
  const camera = document.getElementById("camera");
  let retry = document.createElement("a-plane");
  retry.setAttribute("onretry", "");
  retry.setAttribute("id", "retryBtn");
  retry.setAttribute("position", "0 0 -1");
  retry.setAttribute("width", "0.35");
  retry.setAttribute("height", "0.15");
  retry.setAttribute("color", "cyan");
  retry.setAttribute("class", "clickable");
  camera.appendChild(retry);
  let retrytext = document.createElement("a-text");
  retrytext.setAttribute("position", "-0.1 0 0");
  retrytext.setAttribute("width", "1.5");
  retrytext.setAttribute("color", "black");
  retrytext.setAttribute("value", "RETRY");
  retry.appendChild(retrytext);
  let text = document.createElement("a-text");
  text.setAttribute("id", "endText");
  text.setAttribute("position", "-0.28 0.3 -1");
  text.setAttribute("width", "2");
  if (hitCount == mc && time > 0) {
    text.setAttribute("color", "blue");
    text.setAttribute("value", "GAME CLEAR");
  } else {
    text.setAttribute("color", "red");
    text.setAttribute("value", "GAME OVER!");
  }
  camera.appendChild(text);

  gameFlag = false;
  for (let i = 0; i < mc; i++) {
    let monster = document.getElementById("monster"+i);
    monster.setAttribute("visible", "false");
  }  
}

//弾とモンスターの作成
function sceneCreat() {
  const scene = document.querySelector("a-scene");
  //弾の作成
  for (let i = 0; i < bc; i++) {
    let bullet = document.createElement("a-sphere");
    bullet.setAttribute("bulletMove", "");
    bullet.setAttribute("id", "bullet" + i);
    bullet.setAttribute("position", "0 0 0");
    bullet.setAttribute("scale", "0.3 0.3 0.3");
    bullet.setAttribute("color", "yellow");
    bullet.setAttribute("visible", "false");
    bullet.setAttribute("class", "collidable");
    scene.appendChild(bullet);
  }
  //モンスターの作成
  let posx;
  let posz;
  for (let i = 0; i < mc; i++) {
    let monster = document.createElement("a-entity");
    var random = Math.random() * 8;
    if (Math.floor(Math.random() * 2) == 1) {
      posx = random;
    } else {
      posx = -random;
    }

    let posy = Math.random() * 5;
    random = Math.random() * 16;
    if (Math.floor(Math.random() * 2) == 1) {
      posz = random;
    } else {
      posz = -random;
    }
    let roty = Math.random() * 360;
    let animno = i % (mc / (mc / 5));
    monster.setAttribute("id", "monster" + i);
    monster.setAttribute("position", { x: posx, y: posy, z: posz });
    monster.setAttribute("scale", "1 1 1");
    monster.setAttribute("rotation", { x: 0, y: roty, z: 0 });
    if (Math.floor(Math.random() * 2) == 1) {
      monster.setAttribute("gltf-model", "#red");
    } else {
      monster.setAttribute("gltf-model", "#blue");
    }
    switch (animno) {
      //回転
      case 0:
        monster.setAttribute("animation", {
          property: "rotation",
          from: "0 0 0",
          to: "0 360 0",
          dir: "alternate",
          dur: 2000,
          loop: true,
          easing: "easeInOutSine",
        });
        break;
      //左右移動
      case 1:
        monster.setAttribute("animation", {
          property: "position",
          from: { x: posx, y: posy, z: posz },
          to: { x: posx + 2, y: posy, z: posz },
          rotation: { x: 0, y: roty, z: 0 },
          dir: "alternate",
          dur: 2000,
          loop: true,
          easing: "easeInOutSine",
        });
        break;
      //上下移動
      case 2:
        monster.setAttribute("animation", {
          property: "position",
          from: { x: posx, y: posy, z: posz },
          to: { x: posx, y: posy + 2, z: posz },
          rotation: { x: 0, y: roty, z: 0 },
          dir: "alternate",
          dur: 2000,
          loop: true,
          easing: "easeInOutSine",
        });
        break;
      //前後移動
      case 3:
        monster.setAttribute("animation", {
          property: "position",
          from: { x: posx, y: posy, z: posz },
          to: { x: posx, y: posy, z: posz + 2 },
          rotation: { x: 0, y: roty, z: 0 },
          dir: "alternate",
          dur: 2000,
          loop: true,
          easing: "easeInOutSine",
        });
        break;
      //斜め移動
      default:
        monster.setAttribute("animation", {
          property: "position",
          from: { x: posx, y: posy, z: posz },
          to: { x: posx + 2.0, y: posy + 2.0, z: posz + 2.0 },
          rotation: { x: 0, y: roty, z: 0 },
          dir: "alternate",
          dur: 2000,
          loop: true,
          easing: "easeInOutSine",
        });
        break;
    }
    scene.appendChild(monster);
  }
}

//エフェクトの表示
function effect(monsterPos) {
    var posx = monsterPos.x;
    var posy = monsterPos.y;
    var posz = monsterPos.z;
    const scene = document.querySelector("a-scene");
    const entity = document.createElement("a-entity");

    for (let i = 0; i < 360; i+=30) {
      let sphere1 = document.createElement("a-sphere");
      let radian = i*Math.PI/180;
      let posx1 = posx + (Math.cos(radian))*0.5;
      let posz1 = posz + (Math.sin(radian))*0.5;
      let dur1 = 2000 + Math.random() * 2000;
      let rad1 = 0.08 + Math.random() * 0.1;
      sphere1.setAttribute("position", { x: posx1, y: posy, z: posz1 });
      sphere1.setAttribute("radius", rad1);
      sphere1.setAttribute("material", {
        shader: "gradientshader",
        topColor: "purple",
        bottomColor: "white",
      });
      sphere1.setAttribute("animation", {
        property: "position",
        from: { x: posx1, y: posy, z: posz1 },
        to: { x: posx1, y: posy + 10, z: posz1 },
        dur: dur1,
        loop: false,
      });
      entity.appendChild(sphere1);
    }
    entity.setAttribute("id", "ef");
    scene.appendChild(entity);
  }

//エフェクト削除
  var ce = function clearEffect() {
    const scene = document.querySelector("a-scene");
    let ef = document.getElementById("ef");
    scene.removeChild(ef);
  };
