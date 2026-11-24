let characterSheet; // 儲存角色 1 的待機精靈圖。
let walkSheet; // 儲存角色 1 的走路精靈圖。
let magicSheet; // 儲存角色 1 的施法精靈圖。
let magicEffectSheet; // 儲存施法後飛行特效的精靈圖。
let char2StopSheet; // 儲存角色 2 的待機精靈圖。
let char2ActionSheet; // 儲存角色 2 的互動動作精靈圖。
let bgImg; // 儲存背景圖片。

let characterCenterX; // 儲存角色 1 中心點在畫布上的水平位置。
let bgX = 0; // 儲存背景的水平偏移量。
let facingDirection = 1; // 記錄角色 1 朝向，1 為右方，-1 為左方。
let magicFacingDirection = 1; // 記錄施法開始時角色面向的方向。
let isCastingMagic = false; // 記錄角色是否正在播放施法動畫。
let magicStartFrame = 0; // 記錄施法動畫開始時的畫面影格。
let isEffectActive = false; // 記錄施法特效是否正在畫面中飛行。
let effectCenterX = 0; // 記錄飛行特效中心點的水平位置。
let effectDirection = 1; // 記錄飛行特效移動的方向。
let effectStartFrame = 0; // 記錄飛行特效開始時的畫面影格。
let spaceKeyHeld = false; // 防止長按空白鍵重複觸發施法。

// 選擇題狀態變數
let selectedOptionIndex = -1; // 記錄目前選擇的選項索引（-1 代表尚未作答）。
let wasNearChar2 = false; // 記錄前一幀是否處於接近角色 2 的狀態。
let optionHitBoxes = []; // 儲存各選項的點擊感應區域。

const quizData = {
  question: "如果角色 1 在冒險途中肚子餓了，最有可能拿出哪樣道具？",
  options: [
    "A. 發光的烤地瓜",
    "B. 隱形橡皮擦",
    "C. 靜音鬧鐘"
  ],
  correctIndex: 0
};

const spriteFrameCount = 9; // 設定角色 1 每張精靈圖內的動畫影格數量。
const magicFrameCount = 4; // 設定施法精靈圖內的動畫影格數量。
const effectFrameCount = 5; // 設定飛行特效精靈圖內的動畫影格數量。

// 角色 2 精靈圖規格常數
const char2StopFrameCount = 8; // 2/stop/stop.png 的影格數量。
const char2StopTotalWidth = 699; // 2/stop/stop.png 的總寬度。
const char2StopHeight = 190; // 2/stop/stop.png 的高度。

const char2ActionFrameCount = 12; // 2/action/action.png 的影格數量。
const char2ActionTotalWidth = 1627; // 2/action/action.png 的總寬度。
const char2ActionHeight = 171; // 2/action/action.png 的高度。

const framesPerImage = 8; // 設定每張影格顯示的繪圖次數。
const moveSpeedRatio = 0.006; // 設定角色每格相對於畫布寬度的移動速度。
const effectSpeedRatio = 0.015; // 設定特效每格相對於畫布寬度的移動速度。

function preload() { // 在畫布啟動前載入圖片。
  characterSheet = loadImage("1/stop/stop.png"); // 載入角色 1 的待機精靈圖。
  walkSheet = loadImage("1/walk/walk.png"); // 載入角色 1 的走路精靈圖。
  magicSheet = loadImage("1/magic/magic.png"); // 載入角色 1 的施法精靈圖。
  magicEffectSheet = loadImage("1/magic_effect/magic_effect.png"); // 載入施法後飛行的特效精靈圖。

  char2StopSheet = loadImage("2/stop/stop.png"); // 載入角色 2 的待機精靈圖。
  char2ActionSheet = loadImage("2/action/action.png"); // 載入角色 2 的動作精靈圖。

  bgImg = loadImage("bg/3.png"); // 載入背景圖片 3.png（若在根目錄請改為 "3.png"）。
} // 結束圖片載入函式。

function setup() { // 建立並初始化全螢幕畫布。
  createCanvas(windowWidth, windowHeight); // 讓畫布尺寸符合目前瀏覽器視窗。
  imageMode(CORNER); // 使用圖片左上角作為繪製座標。
  frameRate(60); // 設定畫布更新頻率以維持動畫流暢。
  characterCenterX = width * 2 / 3; // 將角色 1 初始位置設在畫布寬度的三分之二處（位於角色 2 右邊）。
} // 結束畫布初始化函式。

function draw() { // 每個畫面更新時繪製背景、角色、飛行特效與選擇題方框。
  background(242, 218, 206); // 若背景填滿前先用基礎色鋪底。

  const rightPressed = keyIsDown(RIGHT_ARROW); // 檢查目前是否按住鍵盤右方向鍵。
  const leftPressed = keyIsDown(LEFT_ARROW); // 檢查目前是否按住鍵盤左方向鍵。
  const isWalking = rightPressed || leftPressed; // 按住任一方向鍵時播放走路動畫。

  // 計算背景的顯示寬高（維持比例填滿畫布高度或視窗）
  const bgHeight = height;
  const bgWidth = bgImg.width * (height / bgImg.height);

  let moveSpeed = max(1, width * moveSpeedRatio);

  if (rightPressed) { // 按住右鍵時
    facingDirection = 1; // 設定角色 1 面向右方。
    // 檢查背景是否還沒到最右邊（bgX 往左滾動，最小值為 -bgWidth）
    if (bgX > -bgWidth) {
      bgX -= moveSpeed; // 背景向左捲動
      if (bgX < -bgWidth) bgX = -bgWidth; // 限制不超過邊界
    } else {
      // 背景已到最右邊，改由角色往右移動
      characterCenterX += moveSpeed;
    }
  } else if (leftPressed) { // 按住左鍵時
    facingDirection = -1; // 設定角色 1 面向左方。
    // 檢查背景是否還沒到最左邊（bgX 往右滾動，最大值為 0）
    if (bgX < 0) {
      bgX += moveSpeed; // 背景向右捲動
      if (bgX > 0) bgX = 0; // 限制不超過邊界
    } else {
      // 背景已到最左邊，改由角色往左移動
      characterCenterX -= moveSpeed;
    }
  } // 結束方向鍵移動判斷。

  // 繪製三張串接的背景圖片（左、中、右）
  image(bgImg, bgX, 0, bgWidth, bgHeight);
  image(bgImg, bgX + bgWidth, 0, bgWidth, bgHeight);
  image(bgImg, bgX + bgWidth * 2, 0, bgWidth, bgHeight);

  // ================= 角色 1 尺寸計算 =================
  const baseFrameWidth = characterSheet.width / spriteFrameCount; // 計算待機角色 1 單張影格的來源寬度。
  const baseFrameHeight = characterSheet.height; // 取得待機角色 1 單張影格的來源高度。
  const scaleFactor = min(width * 0.28 / baseFrameWidth, height * 0.5 / baseFrameHeight); // 依畫布寬高等比例計算角色縮放比例。
  const characterHeight = baseFrameHeight * scaleFactor; // 計算角色動畫共用的顯示高度。

  // ================= 角色 2 位置與狀態判斷 =================
  const char2CenterX = bgX + bgWidth / 2; // 角色 2 固定在最左邊那張背景圖的正中間。
  const distanceToChar2 = abs(characterCenterX - char2CenterX); // 計算角色 1 與角色 2 之間的水平距離。
  const triggerDistance = characterHeight * 0.65; // 設定觸發動作與選擇題的接近距離閾值。
  const isNearChar2 = distanceToChar2 < triggerDistance; // 判斷角色 1 是否接近角色 2。

  // 若剛離開角色 2 範圍，重置作答狀態以便下次靠近重新作答
  if (!isNearChar2 && wasNearChar2) {
    selectedOptionIndex = -1;
  }
  wasNearChar2 = isNearChar2;

  // 依距離狀態切換角色 2 的精靈圖與規格參數
  const char2ActiveSheet = isNearChar2 ? char2ActionSheet : char2StopSheet;
  const char2FrameCount = isNearChar2 ? char2ActionFrameCount : char2StopFrameCount;
  const char2SourceFrameWidth = (isNearChar2 ? char2ActionTotalWidth : char2StopTotalWidth) / char2FrameCount;
  const char2SourceFrameHeight = isNearChar2 ? char2ActionHeight : char2StopHeight;

  // 讓角色 2 的顯示高度與角色 1 協調（以待機高度為基準等比例縮放）
  const char2BaseScale = characterHeight / char2StopHeight;
  const char2DisplayHeight = char2SourceFrameHeight * char2BaseScale;
  const char2DisplayWidth = char2SourceFrameWidth * char2BaseScale;
  const char2Y = height - char2DisplayHeight; // 將角色 2 底端對齊畫布底端。
  const char2FrameIndex = floor(frameCount / framesPerImage) % char2FrameCount; // 循環播放角色 2 動畫。

  // 繪製角色 2
  image(
    char2ActiveSheet,
    char2CenterX - char2DisplayWidth / 2,
    char2Y,
    char2DisplayWidth,
    char2DisplayHeight,
    char2FrameIndex * char2SourceFrameWidth,
    0,
    char2SourceFrameWidth,
    char2SourceFrameHeight
  );

  // ================= 角色 1 施法與移動繪製 =================
  if (isCastingMagic && floor((frameCount - magicStartFrame) / framesPerImage) >= magicFrameCount) { // 判斷四格施法動畫是否已播放完畢。
    isCastingMagic = false; // 結束一次性的施法動畫。
    isEffectActive = true; // 開始播放施法後的飛行特效。
    effectDirection = magicFacingDirection; // 讓飛行特效沿施法開始時的面向移動。
    effectCenterX = characterCenterX + effectDirection * baseFrameWidth * scaleFactor / 2; // 將特效放在角色面向一側。
    effectStartFrame = frameCount; // 記錄飛行特效的起始影格。
  } // 結束施法動畫完成處理。

  const activeSheet = isCastingMagic ? magicSheet : isWalking ? walkSheet : characterSheet; // 依施法、移動或待機狀態選擇角色圖片。
  const activeFrameCount = isCastingMagic ? magicFrameCount : spriteFrameCount; // 取得目前角色動畫的影格數量。
  const sourceFrameWidth = activeSheet.width / activeFrameCount; // 計算目前精靈圖中單張影格的來源寬度。
  const sourceFrameHeight = activeSheet.height; // 取得目前精靈圖單張影格的來源高度。
  const activeScaleFactor = characterHeight / sourceFrameHeight; // 讓不同角色動畫維持相同顯示高度。
  const characterWidth = sourceFrameWidth * activeScaleFactor; // 依動畫影格比例計算角色顯示寬度。

  characterCenterX = constrain(characterCenterX, characterWidth / 2, width - characterWidth / 2); // 限制角色位置並讓動畫影格完整留在畫布內。
  const characterY = height - characterHeight; // 將角色畫面底端對齊畫布底端。
  const frameIndex = isCastingMagic ? floor((frameCount - magicStartFrame) / framesPerImage) : floor(frameCount / framesPerImage) % activeFrameCount; // 施法影格只播放一次，其餘動作循環播放。
  const renderDirection = isCastingMagic ? magicFacingDirection : facingDirection; // 施法期間維持開始施法時的角色朝向。

  push(); // 暫存畫布狀態以便只翻轉角色圖片。
  translate(characterCenterX, 0); // 將座標原點移到角色中心以進行水平翻轉。
  scale(renderDirection, 1); // 角色或施法朝左時水平翻轉精靈圖。
  image(activeSheet, -characterWidth / 2, characterY, characterWidth, characterHeight, frameIndex * sourceFrameWidth, 0, sourceFrameWidth, sourceFrameHeight); // 繪製目前方向與動作的精靈圖影格。
  pop(); // 還原畫布狀態，避免翻轉影響背景或其他繪圖。

  // ================= 飛行特效繪製 =================
  if (isEffectActive) { // 有飛行特效時繪製並更新其位置。
    const effectFrameWidth = magicEffectSheet.width / effectFrameCount; // 計算特效精靈圖中單張影格的來源寬度。
    const effectFrameHeight = magicEffectSheet.height; // 取得特效精靈圖單張影格的來源高度。
    const effectHeight = characterHeight * 0.18; // 依角色高度計算特效顯示高度。
    const effectWidth = effectFrameWidth * effectHeight / effectFrameHeight; // 依精靈圖比例計算特效顯示寬度。
    const effectY = characterY + characterHeight * 0.42 - effectHeight / 2; // 將特效放在角色身體前方的高度。
    const effectAtEdge = effectDirection === 1 ? effectCenterX + effectWidth / 2 >= width : effectCenterX - effectWidth / 2 <= 0; // 判斷特效是否已抵達畫布左右邊緣。
    if (effectAtEdge) { // 特效抵達畫布邊緣時移除特效。
      isEffectActive = false; // 停止繪製已抵達畫布邊緣的特效。
    } else { // 特效尚未抵達邊緣時繼續播放動畫並移動。
      const effectFrameIndex = floor((frameCount - effectStartFrame) / 4) % effectFrameCount; // 循環播放五格特效動畫。
      push(); // 暫存畫布狀態以便依飛行方向翻轉特效。
      translate(effectCenterX, 0); // 將座標原點移到特效中心。
      scale(effectDirection, 1); // 特效往左移動時水平翻轉圖片。
      image(magicEffectSheet, -effectWidth / 2, effectY, effectWidth, effectHeight, effectFrameIndex * effectFrameWidth, 0, effectFrameWidth, effectFrameHeight); // 繪製目前的特效影格。
      pop(); // 還原畫布狀態。
      effectCenterX += effectDirection * max(4, width * effectSpeedRatio); // 讓特效朝指定方向持續移動。
    } // 結束飛行特效邊緣判斷。
  } // 結束飛行特效繪製處理。

  // ================= 接近角色 2 時顯示上方選擇題方框 =================
  optionHitBoxes = [];
  if (isNearChar2) {
    drawQuizBox();
  }
} // 結束每格畫面繪製函式。

function drawQuizBox() {
  const boxW = width / 3; // 寬度為整個畫布寬的 1/3
  const boxH = height / 2; // 高度為整個畫布高的 1/2
  const boxX = width / 2 - boxW / 2; // 中間對準畫布的中間
  const boxY = height * 0.03; // 靠近畫布上方

  push();
  // 繪製透明度為 90 的白色方框
  fill(255, 255, 255, 90);
  stroke(60, 60, 60, 140);
  strokeWeight(2);
  rect(boxX, boxY, boxW, boxH, min(16, boxW * 0.06));

  // 隨方框大小等比例縮放內距與字級，畫布縮小時不超出方框
  const sidePadding = max(8, boxW * 0.07);
  const topPadding = max(8, boxH * 0.05);
  const bottomPadding = max(8, boxH * 0.05);
  const contentX = boxX + sidePadding;
  const contentW = max(10, boxW - sidePadding * 2);
  const boxBottom = boxY + boxH - bottomPadding;

  const questionFontSize = constrain(min(boxW * 0.044, boxH * 0.062), 9, 20);
  const optionFontSize = constrain(min(questionFontSize * 0.9, boxH * 0.055), 8, 17);
  const hintFontSize = constrain(min(optionFontSize * 0.85, boxH * 0.045), 8, 14);

  // 1. 繪製題目文字（限制在 contentW 內自動換行）
  noStroke();
  fill(20, 20, 20, 245);
  textAlign(LEFT, TOP);
  textSize(questionFontSize);
  textLeading(questionFontSize * 1.28);
  const questionH = boxH * 0.24;
  text(quizData.question, contentX, boxY + topPadding, contentW, questionH);

  // 2. 預留底部提示文字空間後，計算三個選項按鈕的高度與間距
  const hintAreaH = max(hintFontSize * 1.8, boxH * 0.1);
  const optionsStartY = boxY + topPadding + questionH + max(4, boxH * 0.02);
  const availableOptionsH = max(24, boxBottom - hintAreaH - optionsStartY);
  const optionGap = max(3, availableOptionsH * 0.08);
  const optionH = max(12, (availableOptionsH - optionGap * (quizData.options.length - 1)) / quizData.options.length);
  const optionTextPaddingX = max(6, contentW * 0.04);

  for (let i = 0; i < quizData.options.length; i++) {
    const optY = optionsStartY + i * (optionH + optionGap);
    const isHovered = mouseX >= contentX && mouseX <= contentX + contentW && mouseY >= optY && mouseY <= optY + optionH;
    const isSelected = selectedOptionIndex === i;

    optionHitBoxes.push({
      index: i,
      x: contentX,
      y: optY,
      w: contentW,
      h: optionH
    });

    if (isSelected) {
      if (i === quizData.correctIndex) {
        fill(76, 175, 80, 185);
      } else {
        fill(244, 67, 54, 185);
      }
    } else if (isHovered) {
      fill(255, 255, 255, 190);
    } else {
      fill(255, 255, 255, 130);
    }

    stroke(80, 80, 80, 140);
    strokeWeight(1.5);
    rect(contentX, optY, contentW, optionH, min(10, optionH * 0.3));

    // 若縮小時選項文字寬度超過按鈕寬度，自動進一步縮小該行字級
    let currentOptionSize = optionFontSize;
    textSize(currentOptionSize);
    const maxOptionTextW = max(8, contentW - optionTextPaddingX * 2);
    while (textWidth(quizData.options[i]) > maxOptionTextW && currentOptionSize > 7) {
      currentOptionSize -= 0.5;
      textSize(currentOptionSize);
    }

    noStroke();
    fill(20, 20, 20, 250);
    textAlign(LEFT, CENTER);
    text(quizData.options[i], contentX + optionTextPaddingX, optY + optionH / 2);
  }

  // 3. 顯示作答回饋或操作提示（同樣自動縮字避免超出方框寬度）
  const feedbackY = optionsStartY + availableOptionsH + max(4, boxH * 0.02);
  let feedbackText = "點擊選項或按鍵盤 1 / 2 / 3 作答";
  let feedbackColor = color(30, 30, 30, 235);

  if (selectedOptionIndex === quizData.correctIndex) {
    feedbackText = "答對了！發光的烤地瓜香氣四溢～";
    feedbackColor = color(20, 120, 40, 250);
  } else if (selectedOptionIndex !== -1) {
    feedbackText = "再猜猜看！提示：跟肚子餓最有關喔";
    feedbackColor = color(170, 30, 30, 250);
  }

  let currentHintSize = hintFontSize;
  textSize(currentHintSize);
  while (textWidth(feedbackText) > contentW && currentHintSize > 7) {
    currentHintSize -= 0.5;
    textSize(currentHintSize);
  }

  noStroke();
  fill(feedbackColor);
  textAlign(CENTER, TOP);
  text(feedbackText, boxX + boxW / 2, feedbackY);

  pop();
}

function mousePressed() {
  if (!wasNearChar2) return;
  for (const box of optionHitBoxes) {
    if (mouseX >= box.x && mouseX <= box.x + box.w && mouseY >= box.y && mouseY <= box.y + box.h) {
      selectedOptionIndex = box.index;
      break;
    }
  }
}

function keyPressed() { // 按下空白鍵施法，並阻止方向鍵造成頁面捲動。
  if (wasNearChar2) {
    if (key === "1") {
      selectedOptionIndex = 0;
      return false;
    }
    if (key === "2") {
      selectedOptionIndex = 1;
      return false;
    }
    if (key === "3") {
      selectedOptionIndex = 2;
      return false;
    }
  }
  if (keyCode === LEFT_ARROW || keyCode === RIGHT_ARROW) { // 確認按下的是左右方向鍵。
    return false; // 阻止瀏覽器執行方向鍵的預設捲動行為。
  } // 結束方向鍵預設行為處理。
  if (key === " ") { // 確認按下空白鍵。
    if (!spaceKeyHeld) { // 忽略長按空白鍵產生的重複按鍵事件。
      spaceKeyHeld = true; // 記錄空白鍵已經按住。
      if (!isCastingMagic && !isEffectActive) { // 僅在沒有施法或飛行特效時開始新施法。
        isCastingMagic = true; // 啟動施法動畫。
        magicStartFrame = frameCount; // 記錄施法動畫的起始影格。
        magicFacingDirection = facingDirection; // 記錄施法開始時角色面對的方向。
      } // 結束施法啟動判斷。
    } // 結束空白鍵首次按下判斷。
    return false; // 阻止瀏覽器執行空白鍵的預設捲動行為。
  } // 結束空白鍵處理。
} // 結束按鍵事件函式。

function keyReleased() { // 方向鍵或空白鍵放開時更新按鍵狀態。
  if (key === " ") { // 確認放開的是空白鍵。
    spaceKeyHeld = false; // 允許下次按空白鍵時再次施法。
    return false; // 阻止瀏覽器執行空白鍵放開的預設行為。
  } // 結束空白鍵放開處理。
  if (keyCode === LEFT_ARROW || keyCode === RIGHT_ARROW) { // 確認放開的是左右方向鍵。
    return false; // 阻止瀏覽器執行方向鍵放開的預設行為。
  } // 結束方向鍵放開處理。
} // 結束按鍵放開事件函式。

function windowResized() { // 瀏覽器視窗尺寸改變時更新畫布。
  resizeCanvas(windowWidth, windowHeight); // 讓畫布持續填滿整個視窗。
  characterCenterX = constrain(characterCenterX, 0, width); // 視窗縮放後將角色位置限制在新的畫布範圍。
} // 結束視窗尺寸變更處理函式。