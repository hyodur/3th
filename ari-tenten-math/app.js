(() => {
  const STORAGE_KEY = "ariMath2.v1";
  const PAIRS = ["1", "2", "3", "4", "5"];
  const PAIR_LABELS = { "1": "1 + 9", "2": "2 + 8", "3": "3 + 7", "4": "4 + 6", "5": "5 + 5" };
  const LEVELS = [
    { name: "씨앗", icon: "🌰" },
    { name: "새싹", icon: "🌱" },
    { name: "꽃", icon: "🌸" },
    { name: "별꽃", icon: "🌟" }
  ];
  const CHARACTER_ASSETS = {
    duo: "assets/characters/ari-tenten-highfive.png",
    ari: {
      idle: "assets/characters/ari-idle.png",
      hint: "assets/characters/ari-thinking.png",
      success: "assets/characters/ari-success.png"
    },
    tenten: {
      idle: "assets/characters/tenten-idle.png",
      hint: "assets/characters/tenten-hint.png",
      success: "assets/characters/tenten-success.png"
    }
  };
  const SHOP_ITEMS = [
    { id: "ari-default", kind: "costume", target: "ari", name: "별빛 마법사 아리", copy: "아리의 기본 별빛 망토예요.", price: 0, currency: "cookies", image: CHARACTER_ASSETS.ari.idle },
    { id: "ari-cloud", kind: "costume", target: "ari", name: "구름 탐험가 아리", copy: "구름 모자를 쓰고 새로운 길을 찾아요.", price: 12, currency: "cookies", image: "assets/characters/ari-cloud-explorer.png" },
    { id: "ari-strawberry-chef", kind: "costume", target: "ari", name: "딸기 파티시에 아리", copy: "달콤한 딸기 별과자를 만드는 요리사예요.", price: 18, currency: "cookies", image: "assets/characters/ari-strawberry-chef.png", requires: "forest" },
    { id: "ari-moon-bunny", kind: "costume", target: "ari", name: "달빛 토끼잠옷 아리", copy: "포근한 토끼잠옷을 입고 꿈별을 여행해요.", price: 3, currency: "stars", image: "assets/characters/ari-moon-bunny.png", requires: "tenten" },
    { id: "ari-dragon-hero", kind: "costume", target: "ari", name: "별숲 용기사 아리", copy: "무섭지 않은 초록 용과 씩씩하게 모험해요.", price: 28, currency: "cookies", image: "assets/characters/ari-dragon-hero.png", requires: "treasure" },
    { id: "tenten-default", kind: "costume", target: "tenten", name: "숫자 요정 텐텐", copy: "텐텐의 기본 별빛 날개예요.", price: 0, currency: "cookies", image: CHARACTER_ASSETS.tenten.idle, requires: "tenten" },
    { id: "tenten-rainbow", kind: "costume", target: "tenten", name: "무지개 안내자 텐텐", copy: "무지개 다리를 모두 건넌 친구의 옷이에요.", price: 4, currency: "stars", image: "assets/characters/tenten-rainbow-guide.png", requires: "rainbow" },
    { id: "tenten-cupcake-chef", kind: "costume", target: "tenten", name: "컵케이크 요리사 텐텐", copy: "열 개의 별단추를 단 달콤한 요리사예요.", price: 18, currency: "cookies", image: "assets/characters/tenten-cupcake-chef.png", requires: "tenten" },
    { id: "tenten-cloud-pajama", kind: "costume", target: "tenten", name: "구름달 잠옷 텐텐", copy: "보송보송 구름신발로 달빛을 사뿐 걸어요.", price: 3, currency: "stars", image: "assets/characters/tenten-cloud-pajama.png", requires: "treasure" },
    { id: "tenten-dino-explorer", kind: "costume", target: "tenten", name: "꼬마 공룡탐험대 텐텐", copy: "별 나침반을 들고 숫자 화석을 찾아요.", price: 28, currency: "cookies", image: "assets/characters/tenten-dino-explorer.png", requires: "rainbow" },
    { id: "ari-crown", kind: "accessory", target: "ari", name: "반짝 별왕관", copy: "첫 시도 정답 5개 이상이면 별조각 +1!", price: 2, currency: "stars", emoji: "👑", requires: "forest" },
    { id: "tenten-cookie", kind: "accessory", target: "tenten", name: "달콤 쿠키가방", copy: "모험을 끝낼 때마다 보너스 쿠키 +2!", price: 10, currency: "cookies", emoji: "🍪", requires: "tenten" }
  ];
  const REWARD_BADGES = [
    { key: "clearedForest", icon: "🌿", name: "숲의 별열매" },
    { key: "unlockedTenten", icon: "🧚", name: "텐텐 동료" },
    { key: "clearedTreasure", icon: "🔑", name: "황금열쇠" },
    { key: "clearedRainbow", icon: "🌈", name: "무지개 배지" }
  ];

  const $ = (selector) => document.querySelector(selector);
  const screens = [...document.querySelectorAll(".screen")];
  const numberGrid = $("#number-grid");
  const feedback = $("#feedback");
  const hintPanel = $("#hint-panel");
  const progressBar = $(".progress-track");

  const state = {
    version: 14,
    soundEnabled: true,
    musicEnabled: true,
    cookies: 0,
    stars: 0,
    clearedForest: false,
    forestClears: 0,
    forestCorrect: 0,
    clearedTreasure: false,
    treasureClears: 0,
    treasureCorrect: 0,
    clearedRainbow: false,
    rainbowClears: 0,
    rainbowCorrect: 0,
    metTenten: false,
    unlockedTenten: false,
    missionCount: 0,
    starStampProgress: 0,
    ownedItems: ["ari-default"],
    equippedAri: "ari-default",
    equippedTenten: "tenten-default",
    equippedAriAccessory: null,
    equippedTentenAccessory: null,
    pairProgress: defaultPairProgress(),
    run: null
  };

  let attemptsThisQuestion = 0;
  let hintCountedThisQuestion = false;
  let rewardReplayMode = "forest";
  let audioContext = null;
  let musicMasterGain = null;
  let musicTimer = null;
  let musicPlaying = false;
  let musicStep = 0;

  function defaultPairProgress() {
    return Object.fromEntries(PAIRS.map((key) => [key, { correct: 0, attempts: 0, hints: 0 }]));
  }

  function masteryLevel(correct) {
    if (correct >= 6) return 3;
    if (correct >= 3) return 2;
    if (correct >= 1) return 1;
    return 0;
  }

  function shuffle(values) {
    const copy = [...values];
    for (let i = copy.length - 1; i > 0; i -= 1) {
      const j = Math.floor(Math.random() * (i + 1));
      [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    return copy;
  }

  function numberJosa(value, pair) {
    const number = Number(value);
    const hasBatchim = [1, 3, 6, 7, 8].includes(number);
    if (pair === "을/를") return hasBatchim ? "을" : "를";
    if (pair === "과/와") return hasBatchim ? "과" : "와";
    if (pair === "으로/로") return [3, 6].includes(number) ? "으로" : "로";
    return "";
  }

  function load() {
    try {
      const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
      if (!saved || typeof saved !== "object") return;

      if (Number(saved.version) >= 2) {
        state.version = 14;
        state.soundEnabled = saved.soundEnabled !== false;
        state.musicEnabled = saved.musicEnabled !== false;
        state.cookies = Math.max(Number(saved.cookies) || 0, 0);
        state.stars = Math.max(Number(saved.stars) || 0, 0);
        state.metTenten = Boolean(
          saved.metTenten ||
          saved.unlockedTenten ||
          ["adventure", "mission", "treasure", "rainbow"].includes(saved.run?.mode)
        );
        state.unlockedTenten = Boolean(saved.unlockedTenten);
        state.clearedForest = Boolean(saved.clearedForest || saved.unlockedTenten);
        state.forestClears = Math.max(Number(saved.forestClears) || (state.clearedForest ? 1 : 0), 0);
        state.forestCorrect = Math.max(Number(saved.forestCorrect) || 0, 0);
        state.clearedTreasure = Boolean(saved.clearedTreasure);
        state.treasureClears = Math.max(Number(saved.treasureClears) || (state.clearedTreasure ? 1 : 0), 0);
        state.treasureCorrect = Math.max(Number(saved.treasureCorrect) || 0, 0);
        state.clearedRainbow = Boolean(saved.clearedRainbow);
        state.rainbowClears = Math.max(Number(saved.rainbowClears) || (state.clearedRainbow ? 1 : 0), 0);
        state.rainbowCorrect = Math.max(Number(saved.rainbowCorrect) || 0, 0);
        state.missionCount = Math.max(Number(saved.missionCount) || 0, 0);
        state.starStampProgress = Math.max(Number(saved.starStampProgress) || 0, 0) % 3;
        state.ownedItems = Array.isArray(saved.ownedItems) ? [...new Set(saved.ownedItems.filter((id) => SHOP_ITEMS.some((item) => item.id === id)))] : ["ari-default"];
        if (!state.ownedItems.includes("ari-default")) state.ownedItems.push("ari-default");
        if (state.unlockedTenten && !state.ownedItems.includes("tenten-default")) state.ownedItems.push("tenten-default");
        const savedAriCostume = shopItem(saved.equippedAri);
        const savedTentenCostume = shopItem(saved.equippedTenten);
        const savedAriAccessory = shopItem(saved.equippedAriAccessory);
        const savedTentenAccessory = shopItem(saved.equippedTentenAccessory);
        state.equippedAri = state.ownedItems.includes(saved.equippedAri) && savedAriCostume?.kind === "costume" && savedAriCostume.target === "ari" ? saved.equippedAri : "ari-default";
        state.equippedTenten = state.ownedItems.includes(saved.equippedTenten) && savedTentenCostume?.kind === "costume" && savedTentenCostume.target === "tenten" ? saved.equippedTenten : "tenten-default";
        state.equippedAriAccessory = state.ownedItems.includes(saved.equippedAriAccessory) && savedAriAccessory?.kind === "accessory" && savedAriAccessory.target === "ari" ? saved.equippedAriAccessory : null;
        state.equippedTentenAccessory = state.ownedItems.includes(saved.equippedTentenAccessory) && savedTentenAccessory?.kind === "accessory" && savedTentenAccessory.target === "tenten" ? saved.equippedTentenAccessory : null;
        state.run = saved.run && Array.isArray(saved.run.questions) ? saved.run : null;
        if (state.run?.mode === "forest" && state.run.questions.some((question) => question.numbers?.[0] > 9 || question.answer > 9)) {
          state.run = null;
        }
        PAIRS.forEach((key) => {
          const old = saved.pairProgress?.[key];
          if (!old) return;
          state.pairProgress[key] = {
            correct: Math.max(Number(old.correct) || 0, 0),
            attempts: Math.max(Number(old.attempts) || 0, 0),
            hints: Math.max(Number(old.hints) || 0, 0)
          };
        });
        return;
      }

      // 첫 프로토타입의 저장 기록을 2차 버전으로 옮깁니다.
      state.cookies = Math.max(Number(saved.cookies) || 0, 0);
      state.stars = Math.max(Number(saved.stars) || 0, 0);
      state.unlockedTenten = Boolean(saved.unlockedTenten);
      state.metTenten = state.unlockedTenten;
      state.clearedForest = state.unlockedTenten;
      state.forestClears = state.clearedForest ? 1 : 0;
      if (state.unlockedTenten) {
        state.ownedItems.push("tenten-default");
        PAIRS.forEach((key) => { state.pairProgress[key].correct = 1; });
      }
    } catch (_) {
      localStorage.removeItem(STORAGE_KEY);
    }
  }

  function save() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }

  function ensureAudioContext() {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (!AudioContextClass) return null;
    if (!audioContext) audioContext = new AudioContextClass();
    if (audioContext.state === "suspended") audioContext.resume().catch(() => {});
    return audioContext;
  }

  function getAudioContext() {
    if (!state.soundEnabled) return null;
    return ensureAudioContext();
  }

  function playTone(frequency, delay, duration, volume, type = "sine") {
    const context = getAudioContext();
    if (!context) return;
    const start = context.currentTime + delay;
    const oscillator = context.createOscillator();
    const gain = context.createGain();
    oscillator.type = type;
    oscillator.frequency.setValueAtTime(frequency, start);
    gain.gain.setValueAtTime(0.0001, start);
    gain.gain.exponentialRampToValueAtTime(volume, start + 0.018);
    gain.gain.exponentialRampToValueAtTime(0.0001, start + duration);
    oscillator.connect(gain);
    gain.connect(context.destination);
    oscillator.start(start);
    oscillator.stop(start + duration + 0.02);
  }

  function playCorrectSound() {
    playTone(523.25, 0, 0.14, 0.026);
    playTone(659.25, 0.095, 0.18, 0.023);
  }

  function playWrongSound() {
    playTone(220, 0, 0.12, 0.018, "triangle");
    playTone(185, 0.08, 0.15, 0.015, "triangle");
  }

  const MUSIC_MELODY = [
    523.25, 659.25, 783.99, 987.77,
    880.00, 783.99, 659.25, 587.33,
    698.46, 880.00, 1046.50, 783.99,
    659.25, 587.33, 523.25, null
  ];
  const MUSIC_PADS = [261.63, 220.00, 293.66, 196.00];

  function playMusicNote(frequency, duration = 2.2, volume = 0.025) {
    const context = ensureAudioContext();
    if (!context || !musicMasterGain || !frequency) return;
    const now = context.currentTime;
    const envelope = context.createGain();
    const bell = context.createOscillator();
    const shimmer = context.createOscillator();
    const shimmerGain = context.createGain();
    bell.type = "sine";
    bell.frequency.setValueAtTime(frequency, now);
    shimmer.type = "triangle";
    shimmer.frequency.setValueAtTime(frequency * 2, now);
    shimmer.detune.setValueAtTime(5, now);
    shimmerGain.gain.setValueAtTime(.16, now);
    envelope.gain.setValueAtTime(.0001, now);
    envelope.gain.exponentialRampToValueAtTime(volume, now + .055);
    envelope.gain.exponentialRampToValueAtTime(.0001, now + duration);
    bell.connect(envelope);
    shimmer.connect(shimmerGain);
    shimmerGain.connect(envelope);
    envelope.connect(musicMasterGain);
    bell.start(now);
    shimmer.start(now);
    bell.stop(now + duration + .05);
    shimmer.stop(now + duration + .05);
  }

  function playMusicPad(frequency) {
    const context = ensureAudioContext();
    if (!context || !musicMasterGain) return;
    const now = context.currentTime;
    const oscillator = context.createOscillator();
    const gain = context.createGain();
    oscillator.type = "sine";
    oscillator.frequency.setValueAtTime(frequency, now);
    gain.gain.setValueAtTime(.0001, now);
    gain.gain.exponentialRampToValueAtTime(.012, now + .65);
    gain.gain.exponentialRampToValueAtTime(.0001, now + 3.45);
    oscillator.connect(gain);
    gain.connect(musicMasterGain);
    oscillator.start(now);
    oscillator.stop(now + 3.55);
  }

  function musicTick() {
    if (!state.musicEnabled || !musicPlaying) return;
    playMusicNote(MUSIC_MELODY[musicStep % MUSIC_MELODY.length]);
    if (musicStep % 4 === 0) playMusicPad(MUSIC_PADS[Math.floor(musicStep / 4) % MUSIC_PADS.length]);
    musicStep = (musicStep + 1) % MUSIC_MELODY.length;
  }

  function startBackgroundMusic() {
    if (!state.musicEnabled || musicPlaying || document.hidden) return;
    const context = ensureAudioContext();
    if (!context) return;
    musicMasterGain = context.createGain();
    musicMasterGain.gain.setValueAtTime(.0001, context.currentTime);
    musicMasterGain.gain.exponentialRampToValueAtTime(.78, context.currentTime + .8);
    musicMasterGain.connect(context.destination);
    musicPlaying = true;
    musicTick();
    musicTimer = window.setInterval(musicTick, 920);
  }

  function stopBackgroundMusic() {
    if (musicTimer) window.clearInterval(musicTimer);
    musicTimer = null;
    musicPlaying = false;
    if (!musicMasterGain || !audioContext) return;
    const oldGain = musicMasterGain;
    musicMasterGain = null;
    oldGain.gain.cancelScheduledValues(audioContext.currentTime);
    oldGain.gain.setValueAtTime(Math.max(oldGain.gain.value, .0001), audioContext.currentTime);
    oldGain.gain.exponentialRampToValueAtTime(.0001, audioContext.currentTime + .55);
    window.setTimeout(() => oldGain.disconnect(), 650);
  }

  function updateSoundToggle() {
    const button = $("#sound-toggle");
    button.textContent = state.soundEnabled ? "🔊 효과음 켜짐" : "🔇 효과음 꺼짐";
    button.setAttribute("aria-pressed", String(state.soundEnabled));
    const label = state.soundEnabled ? "효과음 끄기" : "효과음 켜기";
    button.setAttribute("aria-label", label);
    button.title = label;
  }

  function updateMusicToggle() {
    const button = $("#music-toggle");
    button.textContent = state.musicEnabled ? "🎵 배경음 켜짐" : "⏸ 배경음 꺼짐";
    button.setAttribute("aria-pressed", String(state.musicEnabled));
    const label = state.musicEnabled ? "배경음 끄기" : "배경음 켜기";
    button.setAttribute("aria-label", label);
    button.title = label;
  }

  function showScreen(id) {
    screens.forEach((screen) => screen.classList.toggle("active", screen.id === id));
    window.scrollTo({ top: 0, behavior: "smooth" });
    window.setTimeout(() => document.getElementById(id).querySelector("button")?.focus(), 10);
  }

  function toast(message) {
    const node = $("#toast");
    node.textContent = message;
    node.classList.add("show");
    window.setTimeout(() => node.classList.remove("show"), 1800);
  }

  function shopItem(id) {
    return SHOP_ITEMS.find((item) => item.id === id);
  }

  function costumeAsset(target, pose = "idle") {
    const equippedId = target === "ari" ? state.equippedAri : state.equippedTenten;
    const item = shopItem(equippedId);
    if (item?.kind === "costume" && item.id !== `${target}-default`) return item.image;
    return CHARACTER_ASSETS[target][pose] || CHARACTER_ASSETS[target].idle;
  }

  function accessoryItem(target) {
    const id = target === "ari" ? state.equippedAriAccessory : state.equippedTentenAccessory;
    const item = shopItem(id);
    return item?.kind === "accessory" && item.target === target ? item : null;
  }

  function paintAccessory(selector, target) {
    const node = $(selector);
    if (!node) return;
    const item = accessoryItem(target);
    node.hidden = !item;
    node.textContent = item?.emoji || "";
    node.setAttribute("aria-label", item ? `${item.name} 착용 중` : "");
  }

  function itemRequirementMet(item) {
    if (!item.requires) return true;
    if (item.requires === "forest") return state.clearedForest;
    if (item.requires === "tenten") return state.unlockedTenten;
    if (item.requires === "treasure") return state.clearedTreasure;
    if (item.requires === "rainbow") return state.clearedRainbow;
    return false;
  }

  function itemRequirementText(item) {
    if (item.requires === "forest") return "세 수 숲 완료 필요";
    if (item.requires === "tenten") return "텐텐과 친구 되기 필요";
    if (item.requires === "treasure") return "10의 보물상자 완료 필요";
    if (item.requires === "rainbow") return "무지개 다리 완료 필요";
    return "아직 잠겨 있어요";
  }

  function itemIsEquipped(item) {
    if (item.kind === "costume") return item.target === "ari" ? state.equippedAri === item.id : state.equippedTenten === item.id;
    return item.target === "ari" ? state.equippedAriAccessory === item.id : state.equippedTentenAccessory === item.id;
  }

  function buyOrEquipItem(item) {
    if (!itemRequirementMet(item)) {
      toast(itemRequirementText(item));
      return;
    }
    const owned = state.ownedItems.includes(item.id);
    if (!owned) {
      const balanceKey = item.currency === "stars" ? "stars" : "cookies";
      if (state[balanceKey] < item.price) {
        toast(item.currency === "stars" ? "별조각이 조금 더 필요해요!" : "달콤쿠키가 조금 더 필요해요!");
        return;
      }
      state[balanceKey] -= item.price;
      state.ownedItems.push(item.id);
      playCorrectSound();
      toast(`${item.name} 획득!`);
    }

    if (item.kind === "costume") {
      if (item.target === "ari") state.equippedAri = item.id;
      else state.equippedTenten = item.id;
    } else if (item.target === "ari") {
      state.equippedAriAccessory = state.equippedAriAccessory === item.id ? null : item.id;
    } else {
      state.equippedTentenAccessory = state.equippedTentenAccessory === item.id ? null : item.id;
    }
    save();
    renderShop();
  }

  function renderShop() {
    $("#shop-cookie-count").textContent = state.cookies;
    $("#shop-star-count").textContent = state.stars;
    $(".shop-subtitle").textContent = state.metTenten
      ? "연습해서 모은 보상으로 친구들을 꾸며요!"
      : "연습해서 모은 보상으로 아리를 꾸며요!";
    $("#star-stamp-label").textContent = `다음 꾸준별까지 ${state.starStampProgress} / 3`;
    [...document.querySelectorAll("#star-stamp-dots span")].forEach((dot, index) => {
      dot.classList.toggle("filled", index < state.starStampProgress);
    });

    const badges = $("#reward-badges");
    badges.replaceChildren();
    REWARD_BADGES
      .filter((badgeInfo) => state.metTenten || badgeInfo.key !== "unlockedTenten")
      .forEach((badgeInfo) => {
      const earned = Boolean(state[badgeInfo.key]);
      const badge = document.createElement("div");
      badge.className = `reward-badge${earned ? "" : " locked"}`;
      const icon = document.createElement("span");
      icon.className = "badge-icon";
      icon.textContent = earned ? badgeInfo.icon : "🔒";
      const name = document.createElement("strong");
      name.textContent = badgeInfo.name;
      const status = document.createElement("small");
      status.textContent = earned ? "가방에 보관 중" : "모험하면 열려요";
      badge.append(icon, name, status);
      badges.appendChild(badge);
      });

    $("#shop-ari-preview").src = costumeAsset("ari");
    $("#shop-ari-label").textContent = shopItem(state.equippedAri)?.name || "별빛 마법사 아리";
    paintAccessory("#shop-ari-accessory", "ari");
    $("#shop-tenten-slot").hidden = !state.metTenten;
    $(".wardrobe-preview").classList.toggle("solo", !state.metTenten);
    $("#shop-tenten-preview").src = costumeAsset("tenten");
    $("#shop-tenten-preview").style.opacity = "1";
    $("#shop-tenten-label").textContent = state.unlockedTenten
      ? (shopItem(state.equippedTenten)?.name || "숫자 요정 텐텐")
      : "별정원에서 만난 텐텐";
    paintAccessory("#shop-tenten-accessory", "tenten");

    const grid = $("#shop-items");
    grid.replaceChildren();
    SHOP_ITEMS
      .filter((item) => state.metTenten || (item.target !== "tenten" && item.requires !== "tenten"))
      .forEach((item) => {
      const owned = state.ownedItems.includes(item.id);
      const equipped = itemIsEquipped(item);
      const unlocked = itemRequirementMet(item);
      const card = document.createElement("article");
      card.className = "shop-item";
      const art = document.createElement("div");
      art.className = "shop-item-art";
      if (item.kind === "costume") {
        const image = document.createElement("img");
        image.src = item.image;
        image.alt = "";
        image.setAttribute("aria-hidden", "true");
        art.appendChild(image);
      } else {
        const emoji = document.createElement("span");
        emoji.className = "item-emoji";
        emoji.textContent = item.emoji;
        emoji.setAttribute("aria-hidden", "true");
        art.appendChild(emoji);
      }
      const info = document.createElement("div");
      const title = document.createElement("h4");
      title.textContent = item.name;
      const copy = document.createElement("p");
      copy.textContent = item.copy;
      const action = document.createElement("button");
      action.type = "button";
      action.className = "item-action";
      if (!unlocked) {
        action.disabled = true;
        action.textContent = `🔒 ${itemRequirementText(item)}`;
      } else if (equipped && item.kind === "costume") {
        action.disabled = true;
        action.classList.add("equipped");
        action.textContent = "✓ 착용 중";
      } else if (equipped) {
        action.textContent = "장식 빼기";
      } else if (owned) {
        action.textContent = "착용하기";
      } else {
        action.textContent = `${item.currency === "stars" ? "⭐" : "🍪"} ${item.price}개로 얻기`;
      }
      action.addEventListener("click", () => buyOrEquipItem(item));
      info.append(title, copy, action);
      card.append(art, info);
      grid.appendChild(card);
      });
    showScreen("shop-screen");
  }

  function makeForestQuestions() {
    const addition = [
      [2, 3, 4], [1, 5, 3], [4, 2, 3], [3, 1, 5]
    ].map((numbers) => ({
      type: "forest",
      operator: "+",
      numbers,
      firstStep: numbers[0] + numbers[1],
      answer: numbers[0] + numbers[1] + numbers[2]
    }));
    const subtraction = [
      [9, 2, 3], [9, 4, 2], [8, 3, 2], [7, 2, 1]
    ].map((numbers) => ({
      type: "forest",
      operator: "−",
      numbers,
      firstStep: numbers[0] - numbers[1],
      answer: numbers[0] - numbers[1] - numbers[2]
    }));
    return shuffle([...addition, ...subtraction]);
  }

  function makeTreasureQuestions() {
    return shuffle([1,2,3,4,5,6,7,8,9]).slice(0, 8).map((taken) => ({
      type: "treasure",
      given: taken,
      answer: 10 - taken
    }));
  }

  function makeRainbowQuestions() {
    return shuffle([
      [8, 5], [9, 4], [7, 6], [6, 7],
      [8, 7], [9, 6], [7, 8], [6, 9]
    ]).map(([first, second]) => ({
      type: "rainbow",
      first,
      second,
      bridge: 10 - first,
      rest: second - (10 - first),
      answer: first + second
    }));
  }

  function makeAdventureQuestions() {
    return shuffle([6, 3, 8, 4, 7, 9, 2, 5]).map((given, index) => ({
      given,
      answer: 10 - given,
      pairKey: String(Math.min(given, 10 - given)),
      placement: index >= 5 && index % 2 ? "left" : "right"
    }));
  }

  function makeMissionQuestions() {
    const ranked = shuffle(PAIRS).sort((a, b) => {
      const aProgress = state.pairProgress[a];
      const bProgress = state.pairProgress[b];
      return masteryLevel(aProgress.correct) - masteryLevel(bProgress.correct) || aProgress.correct - bProgress.correct;
    });
    const keys = [...ranked, ranked[0]];
    return keys.map((key, index) => {
      const low = Number(key);
      const high = 10 - low;
      const given = Math.random() < .5 ? low : high;
      return {
        given,
        answer: 10 - given,
        pairKey: key,
        placement: index % 2 === 0 ? "right" : "left"
      };
    });
  }

  function initialLevels() {
    return Object.fromEntries(PAIRS.map((key) => [key, masteryLevel(state.pairProgress[key].correct)]));
  }

  function startRun(mode, resume = false) {
    const firstTentenMeeting = mode === "adventure" && !state.metTenten;
    if (firstTentenMeeting) state.metTenten = true;
    if (!resume || !state.run || state.run.mode !== mode) {
      const questions = mode === "forest"
        ? makeForestQuestions()
        : mode === "treasure"
          ? makeTreasureQuestions()
          : mode === "rainbow"
            ? makeRainbowQuestions()
          : mode === "mission"
            ? makeMissionQuestions()
            : makeAdventureQuestions();
      state.run = {
        mode,
        index: 0,
        questions,
        firstTryCorrect: 0,
        initialLevels: initialLevels()
      };
      save();
    } else if (firstTentenMeeting) {
      save();
    }
    showScreen("game-screen");
    numberGrid.dataset.locked = "false";
    renderQuestion();
  }

  function resumeRun() {
    if (!state.run) return;
    startRun(state.run.mode, true);
  }

  function renderEquation(question) {
    const equation = $(".equation");
    equation.replaceChildren();
    const makeNumber = (value, id) => {
      const span = document.createElement("span");
      span.id = id;
      span.textContent = value;
      return span;
    };
    const blank = makeNumber("?", "answer-blank");
    blank.className = "blank";
    if (question.type === "forest") {
      const [first, second, third] = question.numbers;
      equation.append(
        makeNumber(first, "given-number"),
        document.createTextNode(` ${question.operator} `),
        makeNumber(second, "second-number"),
        document.createTextNode(` ${question.operator} `),
        makeNumber(third, "third-number"),
        document.createTextNode(" = "),
        blank
      );
      return;
    }
    if (question.type === "treasure") {
      equation.append(
        makeNumber(10, "given-number"),
        document.createTextNode(" − "),
        makeNumber(question.given, "second-number"),
        document.createTextNode(" = "),
        blank
      );
      return;
    }
    if (question.type === "rainbow") {
      equation.append(
        makeNumber(question.first, "given-number"),
        document.createTextNode(" + "),
        makeNumber(question.second, "second-number"),
        document.createTextNode(" = "),
        blank
      );
      return;
    }
    if (question.placement === "left") {
      equation.append(blank, document.createTextNode(" + "), makeNumber(question.given, "given-number"), document.createTextNode(" = 10"));
    } else {
      equation.append(makeNumber(question.given, "given-number"), document.createTextNode(" + "), blank, document.createTextNode(" = 10"));
    }
  }

  function renderQuestion() {
    const run = state.run;
    if (!run || run.index >= run.questions.length) {
      completeRun();
      return;
    }

    const question = run.questions[run.index];
    const forest = run.mode === "forest";
    const treasure = run.mode === "treasure";
    const rainbow = run.mode === "rainbow";
    const boss = !forest && run.mode === "adventure" && run.index >= 5;
    attemptsThisQuestion = 0;
    hintCountedThisQuestion = false;
    renderEquation(question);
    $("#stage-pill").textContent = forest
      ? (run.index >= 6 ? "세 수 숲 마지막 길" : "세 수 숲 첫 모험")
      : treasure
        ? (run.index >= 6 ? "황금 열쇠 마지막 도전" : "10의 보물상자")
        : rainbow
          ? (run.index >= 6 ? "무지개 다리 마지막 칸" : "10 만들기 무지개 다리")
          : run.mode === "mission" ? "텐텐의 별꽃 미션" : boss ? "꽃봉오리 보스" : "별정원 첫 모험";
    $("#question-title").textContent = forest
      ? question.operator === "+" ? "세 수를 차례로 더해 보아요!" : "세 수를 차례로 빼 보아요!"
      : treasure ? "사라지고 남은 보석은 몇 개일까요?"
      : rainbow ? "10을 먼저 만들어 더해 보아요!"
      : boss ? "마지막 별꽃을 깨워 주세요!" : run.mode === "mission" ? "오늘의 화단에 별빛을 주세요!" : "10이 될 숫자 친구를 찾아요!";
    feedback.textContent = "";
    feedback.className = "feedback";
    hintPanel.classList.remove("visible");
    renderQuestionVisual(question);
    renderHint(question);
    renderCompanion("idle");

    const answerPool = forest
      ? [0,1,2,3,4,5,6,7,8,9]
      : rainbow
        ? [11,12,13,14,15,16,17,18]
        : [1,2,3,4,5,6,7,8,9];
    const candidates = shuffle([question.answer, ...shuffle(answerPool.filter((n) => n !== question.answer)).slice(0, 4)]);
    numberGrid.replaceChildren();
    candidates.forEach((number) => {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "number-btn";
      button.textContent = number;
      button.setAttribute("aria-label", `숫자 ${number}`);
      button.addEventListener("click", () => chooseAnswer(number, question, button));
      numberGrid.appendChild(button);
    });
    updateHud();
  }

  function renderQuestionVisual(question) {
    const visual = $("#question-visual");
    visual.replaceChildren();
    visual.hidden = !["treasure", "rainbow"].includes(question.type);
    if (question.type === "treasure") {
      const scene = document.createElement("div");
      scene.className = "treasure-scene";
      const title = document.createElement("div");
      title.className = "treasure-title";
      title.textContent = `보석 10개 중 ${question.given}개가 슝!`;
      const chest = document.createElement("div");
      chest.className = "treasure-chest";
      chest.textContent = "🧰";
      chest.setAttribute("aria-hidden", "true");
      const gems = document.createElement("div");
      gems.className = "treasure-gems";
      gems.setAttribute("aria-label", `남은 보석 ${question.answer}개, 사라진 보석 ${question.given}개`);
      for (let i = 0; i < 10; i += 1) {
        const gem = document.createElement("span");
        gem.className = `treasure-gem${i >= question.answer ? " gone" : ""}`;
        gem.textContent = i >= question.answer ? "✦" : "💎";
        gem.setAttribute("aria-hidden", "true");
        gems.appendChild(gem);
      }
      scene.append(title, chest, gems);
      visual.appendChild(scene);
      return;
    }
    if (question.type !== "rainbow") return;

    const scene = document.createElement("div");
    scene.className = "rainbow-scene";
    const title = document.createElement("div");
    title.className = "rainbow-title";
    title.textContent = `${question.second}${numberJosa(question.second, "을/를")} ${question.bridge}${numberJosa(question.bridge, "과/와")} ${question.rest}${numberJosa(question.rest, "으로/로")} 나눠요!`;
    const track = document.createElement("div");
    track.className = "make-ten-track";
    track.setAttribute("aria-label", `${question.first}에 ${question.bridge}를 더해 10 만들기`);
    for (let i = 0; i < 10; i += 1) {
      const piece = document.createElement("span");
      piece.className = `rainbow-piece${i >= question.first ? " bridge" : ""}`;
      piece.setAttribute("aria-hidden", "true");
      track.appendChild(piece);
    }
    const remainder = document.createElement("div");
    remainder.className = "rainbow-remainder";
    remainder.setAttribute("aria-label", `10을 만들고 남은 수 ${question.rest}`);
    const label = document.createElement("span");
    label.className = "rainbow-step-label";
    label.textContent = `10을 만들고 남은 ${question.rest}`;
    remainder.appendChild(label);
    for (let i = 0; i < question.rest; i += 1) {
      const dot = document.createElement("span");
      dot.className = "remainder-dot";
      dot.setAttribute("aria-hidden", "true");
      remainder.appendChild(dot);
    }
    scene.append(title, track, remainder);
    visual.appendChild(scene);
  }

  function renderHint(question) {
    const frame = $("#ten-frame");
    frame.replaceChildren();
    if (question.type === "forest") {
      frame.className = "step-board";
      frame.setAttribute("aria-label", "세 수를 두 걸음으로 계산하는 방법");
      const first = document.createElement("span");
      first.className = "step-chip";
      first.textContent = `${question.numbers[0]} ${question.operator} ${question.numbers[1]} = ${question.firstStep}`;
      const arrow = document.createElement("span");
      arrow.className = "step-arrow";
      arrow.textContent = "→";
      const second = document.createElement("span");
      second.className = "step-chip";
      second.textContent = `${question.firstStep} ${question.operator} ${question.numbers[2]} = ?`;
      frame.append(first, arrow, second);
      $("#hint-panel strong").textContent = "아리의 두 걸음 계산!";
      $("#hint-copy").textContent = `먼저 앞의 두 수를 계산한 ${question.firstStep}에서, 마지막 수 ${question.numbers[2]}을${question.operator === "+" ? " 더해" : " 빼"} 보아요.`;
      return;
    }
    if (question.type === "rainbow") {
      frame.className = "step-board";
      frame.setAttribute("aria-label", "10을 먼저 만들어 더하는 두 걸음 계산");
      const first = document.createElement("span");
      first.className = "step-chip";
      first.textContent = `${question.first} + ${question.bridge} = 10`;
      const arrow = document.createElement("span");
      arrow.className = "step-arrow";
      arrow.textContent = "→";
      const second = document.createElement("span");
      second.className = "step-chip";
      second.textContent = `10 + ${question.rest} = ?`;
      frame.append(first, arrow, second);
      $("#hint-panel strong").textContent = "텐텐의 10 만들기!";
      $("#hint-copy").textContent = `${question.second}${numberJosa(question.second, "을/를")} ${question.bridge}${numberJosa(question.bridge, "과/와")} ${question.rest}${numberJosa(question.rest, "으로/로")} 나눠요. ${question.first}에 ${question.bridge}${numberJosa(question.bridge, "을/를")} 먼저 더하면 10이 돼요.`;
      return;
    }
    if (question.type === "treasure") {
      frame.className = "treasure-gems";
      frame.setAttribute("aria-label", "사라진 보석과 남은 보석");
      for (let i = 0; i < 10; i += 1) {
        const gem = document.createElement("span");
        gem.className = `treasure-gem${i >= question.answer ? " gone" : ""}`;
        gem.textContent = i >= question.answer ? "✦" : "💎";
        gem.setAttribute("aria-hidden", "true");
        frame.appendChild(gem);
      }
      $("#hint-panel strong").textContent = "텐텐의 보물 세기!";
      $("#hint-copy").textContent = `10개 중 ${question.given}개가 사라졌어요. 흐릿한 칸 말고 남은 보석만 세어 보아요.`;
      return;
    }
    frame.className = "ten-frame";
    frame.setAttribute("aria-label", "10칸 수 모형");
    for (let i = 0; i < 10; i += 1) {
      const cell = document.createElement("span");
      cell.className = `ten-cell ${i < question.given ? "filled" : "missing"}`;
      frame.appendChild(cell);
    }
    $("#hint-panel strong").textContent = state.metTenten ? "텐텐의 도움!" : "아리의 생각!";
    $("#hint-copy").textContent = `${question.given}칸이 찼어요. 비어 있는 ${question.answer}칸을 채워 볼까요?`;
  }

  function renderCompanion(pose = "idle") {
    const helping = pose === "hint";
    const forest = state.run?.mode === "forest";
    const treasure = state.run?.mode === "treasure";
    const rainbow = state.run?.mode === "rainbow";
    const guide = $("#companion-guide");
    guide.hidden = false;
    $("#tenten-game").hidden = forest || !state.metTenten;
    $("#ari-game-art").src = costumeAsset("ari", pose);
    $("#tenten-game-art").src = costumeAsset("tenten", pose);
    paintAccessory("#ari-game-accessory", "ari");
    paintAccessory("#tenten-game-accessory", "tenten");
    if (forest) {
      $("#guide-copy").textContent = pose === "success"
        ? "아리: 두 걸음 계산 성공! 숲길이 반짝여!"
        : helping
          ? "아리: 앞의 두 수부터 먼저 계산해 볼게!"
          : "아리가 세 숫자를 차례로 이어 보고 있어요!";
      return;
    }
    if (treasure) {
      $("#guide-copy").textContent = pose === "success"
        ? "아리와 텐텐: 황금 열쇠가 반짝였어!"
        : helping
          ? "텐텐: 사라진 것 말고 남은 보석을 세어 보자!"
          : "텐텐이 보물상자의 열 개 보석을 지키고 있어요!";
      return;
    }
    if (rainbow) {
      $("#guide-copy").textContent = pose === "success"
        ? "아리와 텐텐: 무지개 한 칸이 환하게 빛났어!"
        : helping
          ? "텐텐: 두 번째 수를 나눠서 10부터 만들자!"
          : "텐텐이 10이 되는 조각을 아리에게 건네고 있어요!";
      return;
    }
    $("#guide-copy").textContent = state.metTenten
      ? pose === "success" ? "아리와 텐텐: 정답! 별꽃이 활짝 피었어!" : helping ? "텐텐: 10칸 중 비어 있는 칸을 세어 보자!" : "텐텐이 아리 옆에서 함께하고 있어요!"
      : pose === "success" ? "아리: 정답이야! 별빛이 반짝여!" : helping ? "아리: 10칸 중 비어 있는 칸을 천천히 세어 볼게!" : "아리가 숫자 친구를 찾고 있어요!";
  }

  function chooseAnswer(choice, question, button) {
    if (numberGrid.dataset.locked === "true") return;
    attemptsThisQuestion += 1;
    if (question.pairKey) state.pairProgress[question.pairKey].attempts += 1;

    if (choice === question.answer) {
      playCorrectSound();
      numberGrid.dataset.locked = "true";
      button.classList.add("correct");
      $("#answer-blank").textContent = question.answer;
      $("#answer-blank").classList.add("filled");
      feedback.textContent = question.type === "forest"
        ? attemptsThisQuestion === 1 ? "정답! 세 수 숲에 별열매가 열렸어요! ✨" : "멋져요! 두 걸음으로 끝까지 계산했어요!"
        : question.type === "treasure"
          ? attemptsThisQuestion === 1 ? "정답! 황금 열쇠가 반짝였어요! 🔑" : "멋져요! 남은 보석을 끝까지 잘 세었어요!"
          : question.type === "rainbow"
            ? attemptsThisQuestion === 1 ? "정답! 무지개 다리에 빛이 켜졌어요! 🌈" : "멋져요! 10을 먼저 만들어 끝까지 더했어요!"
          : attemptsThisQuestion === 1 ? "정답! 화단에 별빛이 내려왔어요! ✨" : "멋져요! 도움을 받아 끝까지 해냈어요!";
      feedback.className = "feedback good";
      renderCompanion("success");
      if (question.pairKey) state.pairProgress[question.pairKey].correct += 1;
      else if (question.type === "treasure") state.treasureCorrect += 1;
      else if (question.type === "rainbow") state.rainbowCorrect += 1;
      else state.forestCorrect += 1;
      if (attemptsThisQuestion === 1) state.run.firstTryCorrect = Math.max(Number(state.run.firstTryCorrect) || 0, 0) + 1;
      state.cookies += 1;
      state.run.index += 1;
      save();
      updateHud();
      window.setTimeout(() => {
        numberGrid.dataset.locked = "false";
        renderQuestion();
      }, 900);
      return;
    }

    playWrongSound();
    if (!hintCountedThisQuestion && question.pairKey) {
      state.pairProgress[question.pairKey].hints += 1;
      hintCountedThisQuestion = true;
    } else if (!hintCountedThisQuestion) {
      hintCountedThisQuestion = true;
    }
    save();
    button.classList.remove("wrong");
    void button.offsetWidth;
    button.classList.add("wrong");
    feedback.className = "feedback try";
    hintPanel.classList.add("visible");
    renderCompanion("hint");

    if (attemptsThisQuestion === 1) {
      feedback.textContent = question.type === "forest"
        ? "괜찮아요! 앞의 두 수부터 천천히 계산해 봐요."
        : question.type === "treasure"
          ? "괜찮아요! 상자에 남아 있는 보석만 세어 봐요."
          : question.type === "rainbow"
            ? "괜찮아요! 먼저 10이 되는 조각을 찾아봐요."
            : "괜찮아요! 10까지 몇 칸이 남았는지 살펴봐요.";
    } else if (attemptsThisQuestion === 2) {
      feedback.textContent = question.type === "forest"
        ? `첫 번째 계산 결과는 ${question.firstStep}이에요!`
        : question.type === "treasure"
          ? `남은 보석은 ${question.answer}개예요!`
          : question.type === "rainbow"
            ? `${question.first}에 ${question.bridge}를 더하면 10, 남은 수는 ${question.rest}이에요!`
            : `비어 있는 칸은 ${question.answer}개예요!`;
    } else {
      feedback.textContent = question.type === "forest"
        ? `마지막 답 ${question.answer}가 반짝이고 있어요!`
        : question.type === "treasure"
          ? `정답 열쇠 ${question.answer}가 반짝이고 있어요!`
          : question.type === "rainbow"
            ? `10 + ${question.rest}의 답 ${question.answer}가 반짝이고 있어요!`
            : `정답 친구 ${question.answer}가 반짝이고 있어요!`;
      [...numberGrid.children].forEach((node) => {
        if (Number(node.textContent) === question.answer) node.style.boxShadow = "0 0 0 6px #f05a9d, 0 7px 0 #dfa629";
      });
    }
  }

  function updateHud() {
    const run = state.run;
    const forest = run?.mode === "forest";
    const treasure = run?.mode === "treasure";
    const rainbow = run?.mode === "rainbow";
    const current = run?.index || 0;
    const total = run?.questions.length || 1;
    $("#cookie-count").textContent = state.cookies;
    $("#progress-label").textContent = `${forest ? "별열매" : treasure ? "황금열쇠" : rainbow ? "무지개빛" : "별꽃"} ${current} / ${total}`;
    $("#progress-fill").style.width = `${(current / total) * 100}%`;
    progressBar.setAttribute("aria-valuemax", total);
    progressBar.setAttribute("aria-valuenow", current);
    const row = $("#flower-row");
    row.replaceChildren();
    for (let i = 0; i < total; i += 1) {
      const flower = document.createElement("span");
      flower.className = `flower${i < current ? " bloomed" : ""}`;
      flower.textContent = forest ? (i < 6 ? "🍃" : "✨") : treasure ? (i < 6 ? "🔑" : "👑") : rainbow ? "🌈" : run?.mode === "mission" ? "🌼" : i < 5 ? "🌸" : "🌟";
      flower.setAttribute("aria-hidden", "true");
      row.appendChild(flower);
    }
  }

  function applyAccessoryBonuses(run) {
    const items = [];
    if (state.equippedTentenAccessory === "tenten-cookie") {
      state.cookies += 2;
      items.push(["🍪 쿠키가방 효과", "+2개"]);
    }
    if (state.equippedAriAccessory === "ari-crown" && Math.max(Number(run.firstTryCorrect) || 0, 0) >= 5) {
      state.stars += 1;
      items.push(["👑 별왕관 효과", "+1개"]);
    }
    return items;
  }

  function applyRunMilestone() {
    state.starStampProgress = Math.max(Number(state.starStampProgress) || 0, 0) + 1;
    if (state.starStampProgress >= 3) {
      state.starStampProgress = 0;
      state.stars += 1;
      return [["🌟 꾸준별 보너스", "+1개"]];
    }
    return [["⭐ 꾸준별 도장", `${state.starStampProgress} / 3`]];
  }

  function completeRun() {
    const run = state.run;
    if (!run) return;
    rewardReplayMode = run.mode;
    state.run = null;
    const milestoneItems = applyRunMilestone();

    if (run.mode === "forest") {
      const firstClear = !state.clearedForest;
      state.clearedForest = true;
      state.forestClears += 1;
      state.cookies += firstClear ? 5 : 3;
      if (firstClear) state.stars += 1;
      const accessoryItems = applyAccessoryBonuses(run);
      save();
      showReward({
        asset: CHARACTER_ASSETS.ari.success,
        title: firstClear ? "세 수 숲을 밝혔어요!" : "세 수 숲 연습 완료!",
        copy: firstClear ? "아리가 세 수를 차례로 계산해 숲길의 별빛을 되찾았어요. 이제 열 송이 별정원으로 갈 수 있어요!" : "아리가 세 수 덧셈과 뺄셈을 한 번 더 멋지게 연습했어요.",
        items: [["숲길 완료", "세 수 계산"], ["달콤쿠키", firstClear ? "+5개" : "+3개"], ["별조각", firstClear ? "+1개" : "연습 완료"], ...milestoneItems, ...accessoryItems]
      });
      return;
    }

    if (run.mode === "treasure") {
      const firstClear = !state.clearedTreasure;
      state.clearedTreasure = true;
      state.treasureClears += 1;
      state.cookies += firstClear ? 5 : 3;
      if (firstClear) state.stars += 1;
      const accessoryItems = applyAccessoryBonuses(run);
      save();
      showReward({
        asset: CHARACTER_ASSETS.duo,
        title: firstClear ? "10의 보물상자를 열었어요!" : "보물상자 연습 완료!",
        copy: firstClear ? "아리와 텐텐이 10에서 빼기를 모두 풀어 황금 열쇠를 얻었어요. 무지개 다리의 잠금이 풀렸어요!" : "아리와 텐텐이 남은 보석을 다시 한번 정확히 찾아냈어요.",
        items: [["황금열쇠", firstClear ? "+1개" : "연습 완료"], ["달콤쿠키", firstClear ? "+5개" : "+3개"], ["별조각", firstClear ? "+1개" : "보관 완료"], ...milestoneItems, ...accessoryItems]
      });
      return;
    }

    if (run.mode === "rainbow") {
      const firstClear = !state.clearedRainbow;
      state.clearedRainbow = true;
      state.rainbowClears += 1;
      state.cookies += firstClear ? 7 : 3;
      if (firstClear) state.stars += 1;
      const accessoryItems = applyAccessoryBonuses(run);
      save();
      showReward({
        asset: CHARACTER_ASSETS.duo,
        title: firstClear ? "무지개 다리를 완성했어요!" : "무지개 다리 연습 완료!",
        copy: firstClear ? "아리와 텐텐이 10을 먼저 만들어 모든 무지개 칸을 밝혔어요. 2단원 수학별 모험 완주!" : "아리와 텐텐이 10 만들기 덧셈을 다시 한번 멋지게 해냈어요.",
        items: [["무지개 배지", firstClear ? "+1개" : "연습 완료"], ["달콤쿠키", firstClear ? "+7개" : "+3개"], ["별조각", firstClear ? "+1개" : "보관 완료"], ...milestoneItems, ...accessoryItems]
      });
      return;
    }

    if (run.mode === "adventure" && !state.unlockedTenten) {
      state.unlockedTenten = true;
      if (!state.ownedItems.includes("tenten-default")) state.ownedItems.push("tenten-default");
      state.stars += 1;
      const accessoryItems = applyAccessoryBonuses(run);
      save();
      showReward({
        asset: CHARACTER_ASSETS.duo,
        title: "텐텐과 친구가 되었어요!",
        copy: "첫 모험을 마치고 숫자 요정 텐텐을 동료로 얻었어요. 이제 함께 별정원을 키울 수 있어요!",
        items: [["동료 요정", "텐텐"], ["달콤쿠키", "+8개"], ["별조각", "+1개"], ...milestoneItems, ...accessoryItems]
      });
      return;
    }

    state.cookies += 3;
    if (run.mode === "mission") state.missionCount += 1;
    const grown = PAIRS.filter((key) => masteryLevel(state.pairProgress[key].correct) > Number(run.initialLevels?.[key] || 0));
    const earnedStar = grown.length > 0;
    if (earnedStar) state.stars += 1;
    const accessoryItems = applyAccessoryBonuses(run);
    save();
    showReward({
      asset: CHARACTER_ASSETS.duo,
      title: run.mode === "mission" ? "별꽃 미션 완료!" : "첫 모험을 다시 해냈어요!",
      copy: grown.length ? `${grown.map((key) => PAIR_LABELS[key]).join(", ")} 화단이 한 단계 자랐어요!` : "오늘도 텐텐과 함께 숫자 친구들에게 별빛을 나눠 주었어요.",
      items: [["미션 보너스", "쿠키 +3"], ["성장한 화단", `${grown.length}곳`], ["별조각", earnedStar ? "+1개" : "다음 성장 때"], ...milestoneItems, ...accessoryItems]
    });
  }

  function showReward({ asset = CHARACTER_ASSETS.duo, title, copy, items }) {
    $("#reward-icon").src = asset;
    $("#reward-title").textContent = title;
    $("#reward-copy").textContent = copy;
    const list = $("#reward-list");
    list.replaceChildren();
    items.forEach(([label, value]) => {
      const item = document.createElement("div");
      item.className = "reward-item";
      item.append(document.createTextNode(label));
      const strong = document.createElement("b");
      strong.textContent = value;
      item.appendChild(strong);
      list.appendChild(item);
    });
    $("#garden-btn").textContent = "모험 지도 보기";
    showScreen("reward-screen");
  }

  function renderMap() {
    $("#map-cookie-count").textContent = state.cookies;
    $("#map-star-count").textContent = state.stars;
    const visibleBadges = REWARD_BADGES.filter((badge) => state.metTenten || badge.key !== "unlockedTenten");
    $("#shop-reward-count").textContent = `${visibleBadges.filter((badge) => state[badge.key]).length} / ${visibleBadges.length}`;

    $("#forest-status").textContent = state.clearedForest ? `완료 · 연습 ${state.forestClears}번` : "첫 모험";
    const forestButton = $("#forest-stage-btn");
    forestButton.className = "primary";
    forestButton.textContent = state.clearedForest ? "다시 연습하기" : "모험 시작";

    const gardenCard = $("#garden-stage");
    const gardenButton = $("#garden-stage-btn");
    gardenCard.classList.toggle("locked", !state.clearedForest);
    gardenButton.disabled = !state.clearedForest;
    gardenButton.className = state.clearedForest ? "primary" : "secondary";
    if (!state.clearedForest) {
      $("#garden-status").textContent = "세 수 숲을 먼저 밝혀요";
      gardenButton.textContent = "잠겨 있어요";
    } else if (state.unlockedTenten) {
      $("#garden-status").textContent = "텐텐과 친구 완료";
      gardenButton.textContent = "다시 연습하기";
    } else {
      $("#garden-status").textContent = "도전 가능 · 텐텐을 찾아요";
      gardenButton.textContent = "첫 모험 시작";
    }

    const treasureCard = $("#treasure-stage");
    const treasureButton = $("#treasure-stage-btn");
    treasureCard.classList.toggle("locked", !state.unlockedTenten);
    treasureButton.disabled = !state.unlockedTenten;
    treasureButton.className = state.unlockedTenten ? "primary" : "secondary";
    if (!state.unlockedTenten) {
      $("#treasure-status").textContent = "별정원에서 텐텐을 만나요";
      treasureButton.textContent = "잠겨 있어요";
    } else if (state.clearedTreasure) {
      $("#treasure-status").textContent = `완료 · 연습 ${state.treasureClears}번`;
      treasureButton.textContent = "다시 연습하기";
    } else {
      $("#treasure-status").textContent = "도전 가능 · 황금열쇠 찾기";
      treasureButton.textContent = "보물상자 열기";
    }

    const rainbowCard = $("#rainbow-stage");
    const rainbowButton = $("#rainbow-stage-btn");
    rainbowCard.classList.toggle("locked", !state.clearedTreasure);
    rainbowButton.disabled = !state.clearedTreasure;
    rainbowButton.className = state.clearedTreasure ? "primary" : "secondary";
    if (!state.clearedTreasure) {
      $("#rainbow-status").textContent = "보물상자를 먼저 열어요";
      rainbowButton.textContent = "잠겨 있어요";
    } else if (state.clearedRainbow) {
      $("#rainbow-status").textContent = `완료 · 연습 ${state.rainbowClears}번`;
      rainbowButton.textContent = "다시 연습하기";
    } else {
      $("#rainbow-status").textContent = "도전 가능 · 10 먼저 만들기";
      rainbowButton.textContent = "무지개 건너기";
    }
    showScreen("map-screen");
  }

  function renderGarden() {
    $("#garden-cookie-count").textContent = state.cookies;
    $("#garden-star-count").textContent = state.stars;
    const grid = $("#garden-plots");
    grid.replaceChildren();
    PAIRS.forEach((key) => {
      const record = state.pairProgress[key];
      const level = masteryLevel(record.correct);
      const levelInfo = LEVELS[level];
      const plot = document.createElement("article");
      plot.className = "garden-plot";
      plot.setAttribute("aria-label", `${PAIR_LABELS[key]} 화단, ${levelInfo.name} 단계`);
      const icon = document.createElement("span");
      icon.className = "plot-icon";
      icon.textContent = levelInfo.icon;
      const pair = document.createElement("span");
      pair.className = "plot-pair";
      pair.textContent = PAIR_LABELS[key];
      const status = document.createElement("span");
      status.className = "plot-state";
      status.textContent = `${levelInfo.name} · 성공 ${record.correct}번`;
      const pips = document.createElement("span");
      pips.className = "plot-pips";
      for (let i = 1; i <= 3; i += 1) {
        const pip = document.createElement("span");
        pip.className = `plot-pip${i <= level ? " on" : ""}`;
        pips.appendChild(pip);
      }
      plot.append(icon, pair, status, pips);
      grid.appendChild(plot);
    });

    const weakest = [...PAIRS].sort((a, b) => state.pairProgress[a].correct - state.pairProgress[b].correct).slice(0, 2);
    $("#mission-copy").textContent = `${weakest.map((key) => PAIR_LABELS[key]).join("와 ")} 화단에 별빛이 조금 더 필요해!`;
    $("#mission-note").textContent = `완료한 미션 ${state.missionCount}번 · 미션 6문제를 풀면 쿠키 3개를 더 받아요.`;
    showScreen("garden-screen");
  }

  function updateStart() {
    const preview = $("#tenten-preview");
    $("#ari-preview-art").src = costumeAsset("ari");
    paintAccessory("#ari-preview-accessory", "ari");
    if (state.metTenten) {
      preview.hidden = false;
      preview.classList.remove("locked");
      const tentenAccessory = accessoryItem("tenten");
      preview.innerHTML = `<img class="character-art" src="${costumeAsset("tenten")}" alt=""><span id="tenten-preview-accessory" class="cosmetic-accessory" aria-hidden="true"${tentenAccessory ? "" : " hidden"}>${tentenAccessory?.emoji || ""}</span><span id="tenten-preview-label">텐텐</span>`;
      preview.setAttribute("aria-label", state.unlockedTenten ? "동료가 된 숫자 요정 텐텐" : "별정원에서 만난 숫자 요정 텐텐");
      $("#intro-copy").innerHTML = !state.unlockedTenten
        ? "아리와 텐텐이 열 송이 별정원을 탐험하고 있어요!<br>숫자 친구를 찾아 텐텐과 진짜 친구가 되어 보아요."
        : state.clearedRainbow
          ? "아리와 텐텐이 네 지역을 모두 밝혔어요!<br>좋아하는 지역에서 다시 연습해 보아요."
          : state.clearedTreasure
            ? "아리와 텐텐이 황금 열쇠를 찾았어요.<br>이제 10을 먼저 만들어 무지개 다리를 건너요!"
            : "아리와 텐텐이 네 지역을 여행하고 있어요.<br>이제 10의 보물상자에서 황금 열쇠를 찾아요!";
    } else {
      preview.hidden = true;
      preview.classList.remove("locked");
      preview.replaceChildren();
      preview.removeAttribute("aria-label");
      $("#intro-copy").innerHTML = state.clearedForest
        ? "세 수 숲을 환하게 밝혔어요.<br>이제 열 송이 별정원에서 신비한 숫자 요정을 찾아요!"
        : "세 수 숲에서 첫 모험을 시작해요.<br>숲을 밝히면 열 송이 별정원으로 갈 수 있어요!";
    }
    $("#start-btn").textContent = "모험 지도 펼치기";
    $("#continue-btn").hidden = !state.run;
  }

  $("#start-btn").addEventListener("click", renderMap);
  $("#continue-btn").addEventListener("click", resumeRun);
  $("#map-home-btn").addEventListener("click", () => { updateStart(); showScreen("start-screen"); });
  $("#shop-btn").addEventListener("click", renderShop);
  $("#shop-back-btn").addEventListener("click", renderMap);
  $("#forest-stage-btn").addEventListener("click", () => startRun("forest"));
  $("#garden-stage-btn").addEventListener("click", () => {
    if (!state.clearedForest) return;
    state.unlockedTenten ? renderGarden() : startRun("adventure");
  });
  $("#treasure-stage-btn").addEventListener("click", () => {
    if (!state.unlockedTenten) return;
    startRun("treasure");
  });
  $("#rainbow-stage-btn").addEventListener("click", () => {
    if (!state.clearedTreasure) return;
    startRun("rainbow");
  });
  $("#home-btn").addEventListener("click", renderMap);
  $("#garden-home-btn").addEventListener("click", renderMap);
  $("#mission-btn").addEventListener("click", () => startRun("mission"));
  $("#story-replay-btn").addEventListener("click", () => startRun("adventure"));
  $("#garden-btn").addEventListener("click", renderMap);
  $("#reward-shop-btn").addEventListener("click", renderShop);
  $("#replay-btn").addEventListener("click", () => startRun(rewardReplayMode));
  const settingsDialog = $("#settings-dialog");
  $("#settings-btn").addEventListener("click", () => {
    updateMusicToggle();
    updateSoundToggle();
    if (typeof settingsDialog.showModal === "function") settingsDialog.showModal();
    else settingsDialog.setAttribute("open", "");
  });
  $("#settings-close-btn").addEventListener("click", () => settingsDialog.close());
  settingsDialog.addEventListener("click", (event) => {
    if (event.target === settingsDialog) settingsDialog.close();
  });
  $("#sound-toggle").addEventListener("click", () => {
    state.soundEnabled = !state.soundEnabled;
    save();
    updateSoundToggle();
  });
  $("#music-toggle").addEventListener("click", () => {
    state.musicEnabled = !state.musicEnabled;
    if (state.musicEnabled) startBackgroundMusic();
    else stopBackgroundMusic();
    save();
    updateMusicToggle();
  });
  $("#reset-btn").addEventListener("click", () => {
    if (!window.confirm("텐텐, 쿠키, 별조각과 모든 지역의 모험 기록을 처음으로 되돌릴까요?")) return;
    const soundEnabled = state.soundEnabled;
    const musicEnabled = state.musicEnabled;
    localStorage.removeItem(STORAGE_KEY);
    Object.assign(state, { version: 14, soundEnabled, musicEnabled, cookies: 0, stars: 0, clearedForest: false, forestClears: 0, forestCorrect: 0, clearedTreasure: false, treasureClears: 0, rainbowCorrect: 0, clearedRainbow: false, rainbowClears: 0, metTenten: false, unlockedTenten: false, missionCount: 0, starStampProgress: 0, ownedItems: ["ari-default"], equippedAri: "ari-default", equippedTenten: "tenten-default", equippedAriAccessory: null, equippedTentenAccessory: null, pairProgress: defaultPairProgress(), run: null });
    save();
    settingsDialog.close();
    updateStart();
    showScreen("start-screen");
    toast("별정원 기록을 처음으로 되돌렸어요.");
  });

  function registerWebMCP() {
    const context = document.modelContext;
    if (!context?.registerTool) return;
    try {
      context.registerTool({
        name: "read_garden_progress",
        title: "수학별 모험 진행도 확인",
        description: "세 수 숲, 열 송이 별정원, 10의 보물상자, 무지개 다리, 쿠키, 별조각과 텐텐 동료 상태를 확인합니다.",
        inputSchema: { type: "object", properties: {}, additionalProperties: false },
        annotations: { readOnlyHint: true, untrustedContentHint: false },
        execute() {
          return {
            cookies: state.cookies,
            stars: state.stars,
            clearedForest: state.clearedForest,
            forestClears: state.forestClears,
            clearedTreasure: state.clearedTreasure,
            treasureClears: state.treasureClears,
            clearedRainbow: state.clearedRainbow,
            rainbowClears: state.rainbowClears,
            metTenten: state.metTenten,
            unlockedTenten: state.unlockedTenten,
            missionCount: state.missionCount,
            starStampProgress: state.starStampProgress,
            ownedItems: state.ownedItems.map((id) => shopItem(id)?.name || id),
            equipped: {
              ari: shopItem(state.equippedAri)?.name,
              tenten: state.metTenten ? shopItem(state.equippedTenten)?.name : null,
              ariAccessory: shopItem(state.equippedAriAccessory)?.name || null,
              tentenAccessory: shopItem(state.equippedTentenAccessory)?.name || null
            },
            plots: Object.fromEntries(PAIRS.map((key) => [PAIR_LABELS[key], LEVELS[masteryLevel(state.pairProgress[key].correct)].name]))
          };
        }
      });
      context.registerTool({
        name: "start_garden_mission",
        title: "수학별 모험 시작",
        description: "화면에서 현재 진행도에 맞는 수학 모험을 시작합니다. 세 수 숲, 열 송이 별정원, 10의 보물상자, 무지개 다리 순서로 이어집니다.",
        inputSchema: { type: "object", properties: {}, additionalProperties: false },
        annotations: { readOnlyHint: false, untrustedContentHint: false },
        execute() {
          const mode = !state.clearedForest ? "forest" : !state.unlockedTenten ? "adventure" : !state.clearedTreasure ? "treasure" : !state.clearedRainbow ? "rainbow" : "mission";
          startRun(mode);
          return { status: "started", mode };
        }
      });
    } catch (_) {
      // WebMCP를 지원하지 않는 브라우저에서도 게임은 정상 동작합니다.
    }
  }

  function registerServiceWorker() {
    if (!("serviceWorker" in navigator) || !/^https?:$/.test(location.protocol)) return;
    window.addEventListener("load", async () => {
      try {
        await navigator.serviceWorker.register("./sw.js", { scope: "./" });
        await navigator.serviceWorker.ready;
        document.documentElement.dataset.pwa = "ready";
      } catch (_) {
        document.documentElement.dataset.pwa = "failed";
        // 오프라인 기능을 지원하지 않아도 게임은 온라인에서 정상 동작합니다.
      }
    });
  }

  load();
  updateSoundToggle();
  updateMusicToggle();
  updateStart();
  registerWebMCP();
  registerServiceWorker();
  const beginMusicOnGesture = () => { if (state.musicEnabled) startBackgroundMusic(); };
  document.addEventListener("pointerdown", beginMusicOnGesture, { once: true });
  document.addEventListener("keydown", beginMusicOnGesture, { once: true });
  document.addEventListener("visibilitychange", () => {
    if (document.hidden) stopBackgroundMusic();
    else if (state.musicEnabled && audioContext) startBackgroundMusic();
  });
})();
