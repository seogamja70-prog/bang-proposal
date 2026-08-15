const express = require("express");
const path = require("path");
const http = require("http");
const crypto = require("crypto");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

const PORT = process.env.PORT || 3000;
const PLAYER_COLORS = ["🔴", "🔵", "🟡", "🟢", "🟣", "🟠"];
const rooms = new Map();

app.use(express.static(path.join(__dirname, "public")));

// 명사 카드 100장
const NOUN_WORDS = [
  "사랑", "행복", "우리", "오늘", "내일", "평생", "운명", "마음", "진심", "약속",
  "미래", "가족", "친구", "추억", "웃음", "기쁨", "설렘", "감동", "기적", "세상",
  "하늘", "별", "달", "꽃", "여행", "집", "아침", "저녁", "주말", "생일",
  "기념일", "첫눈", "커피", "케이크", "사진", "노래", "영화", "음악", "책", "편지",
  "선물", "반지", "손", "눈", "미소", "목소리", "우리집", "마음속", "별빛", "햇살",
  "바람", "향기", "마법", "기억", "꿈", "김밥천국", "카카오페이", "코털", "휴지심", "편도 결석",
  "겨드랑이", "잉여 인간", "에너지 뱀파이어", "쾌락의 늪", "고문실", "수치심", "어둠의 댄스", "너희 부모님", "엉덩이 피어싱", "오랑우탄",
  "피비린내", "살인마", "김흥국", "거지발싸개", "킹왕짱", "노상 방뇨", "안경잡이", "쓰레기 집", "유튜브", "도박 중독",
  "여편네", "쓰레기통", "추악한 욕망", "음란 마귀", "BL 만화", "상처투성이", "사이코패스", "일진회", "불매 운동", "중성화 수술",
  "매국노", "백종원", "찢어진 팬티", "못된 고양이", "대머리", "자존감 도둑", "인간 쓰레기", "배덕감", "페티시", "불장난"
];

// 동사 카드 50장
const VERB_WORDS = [
  "사랑해", "좋아해", "기다려줘", "안아줘", "손잡아줘", "웃어줘", "믿어줘", "기억해줘", "함께하자", "결혼하자",
  "살아가자", "여행가자", "춤추자", "노래하자", "약속하자", "고백할게", "지켜줄게", "응원할게", "기다릴게", "찾아갈게",
  "바라볼게", "안아줄게", "챙겨줄게", "웃겨줄게", "행복하게 해줄게", "평생 함께할게", "매일 사랑할게", "절대 안 떠날게", "같이 살자", "같이 늙자",
  "기억하자", "축하하자", "사진 찍자", "밥 먹자", "커피 마시자", "영화를 보자", "놀러 가자", "비밀을 지키자", "서로 믿자", "서로 아껴주자",
  "행복해지자", "웃으며 살자", "다시 만나자", "끝까지 가자", "오늘도 사랑하자", "내일도 만나자", "꿈꾸자", "도망가자", "복수하자", "프로포즈하자"
];

// 조사 카드 50장. 각 조사 카드는 4개의 선택지를 가진다.
const PARTICLE_TEMPLATES = [
  ["은", "는", "이", "가"],
  ["을", "를", "에", "에서"],
  ["와", "과", "도", "만"],
  ["의", "로", "으로", "에게"],
  ["한테", "께", "처럼", "보다"],
  ["까지", "부터", "조차", "마저"]
];

function shuffle(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

function makeNounDeck() {
  return shuffle(NOUN_WORDS.map((text, i) => ({
    id: `noun-${i + 1}`,
    type: "noun",
    text
  })));
}

function makeVerbDeck() {
  return shuffle(VERB_WORDS.map((text, i) => ({
    id: `verb-${i + 1}`,
    type: "verb",
    text
  })));
}

function makeParticleDeck() {
  const cards = [];
  for (let i = 0; i < 50; i++) {
    cards.push({
      id: `particle-${i + 1}`,
      type: "particle",
      options: [...PARTICLE_TEMPLATES[i % PARTICLE_TEMPLATES.length]]
    });
  }
  return shuffle(cards);
}

function draw(deckName, discardName, room) {
  if (room[deckName].length === 0) {
    if (room[discardName].length === 0) return null;
    room[deckName] = shuffle(room[discardName].splice(0));
  }
  return room[deckName].pop() || null;
}

function newCode() {
  let code;
  do {
    code = crypto.randomBytes(3).toString("hex").toUpperCase();
  } while (rooms.has(code));
  return code;
}

function makePlayer(socketId, name, index) {
  return {
    id: crypto.randomUUID(),
    socketId,
    name: name || `플레이어 ${index + 1}`,
    color: PLAYER_COLORS[index],
    rings: 3,
    verbHand: [],
    nounHand: [],
    particleHand: [],
    proposal: [],
    submitted: false,
    connected: true
  };
}

function publicPlayers(room) {
  return room.players.map(p => ({
    id: p.id,
    name: p.name,
    color: p.color,
    rings: p.rings,
    connected: p.connected
  }));
}

function publicProposals(room) {
  return room.presentationOrder.map(playerId => {
    const p = room.players.find(x => x.id === playerId);
    return {
      playerId: p.id,
      name: p.name,
      color: p.color,
      proposal: p.proposal
    };
  });
}

function publicState(room) {
  const submittedCount = room.players.filter(
    p => p.id !== room.fianceId && p.submitted
  ).length;

  return {
    code: room.code,
    playerCount: room.playerCount,
    players: publicPlayers(room),
    hostId: room.hostId,
    phase: room.phase,
    round: room.round,
    fianceId: room.fianceId,
    fianceName: room.players.find(p => p.id === room.fianceId)?.name || "",
    submittedCount,
    proposerCount: Math.max(0, room.players.length - 1),
    presentationOrder: room.presentationOrder,
    presentationIndex: room.presentationIndex,
    currentPresenterId: room.presentationOrder[room.presentationIndex] || null,
    proposals:
      ["presentation", "winner", "result", "gameover"].includes(room.phase)
        ? publicProposals(room)
        : [],
    winnerId: room.winnerId || null,
    winnerName: room.players.find(p => p.id === room.winnerId)?.name || "",
    winnerColor: room.players.find(p => p.id === room.winnerId)?.color || ""
  };
}

function sendState(room) {
  io.to(room.code).emit("state", publicState(room));

  for (const p of room.players) {
    if (!p.socketId) continue;
    const socket = io.sockets.sockets.get(p.socketId);
    if (!socket) continue;
    socket.emit("privateHand", {
      verbCards: p.verbHand,
      nounCards: p.nounHand,
      particleCards: p.particleHand,
      proposal: p.proposal
    });
  }
}

function resetRoundCards(room) {
  for (const p of room.players) {
    room.verbDiscard.push(...p.verbHand);
    room.nounDiscard.push(...p.nounHand);
    room.particleDiscard.push(...p.particleHand);

    for (const token of p.proposal) {
      if (token.kind === "verb") {
        const original = room.allVerbCards.get(token.cardId);
        if (original) room.verbDiscard.push(original);
      }
      if (token.kind === "noun") {
        const original = room.allNounCards.get(token.cardId);
        if (original) room.nounDiscard.push(original);
      }
      if (token.kind === "particle") {
        const original = room.allParticleCards.get(token.cardId);
        if (original) room.particleDiscard.push(original);
      }
    }

    p.verbHand = [];
    p.nounHand = [];
    p.particleHand = [];
    p.proposal = [];
    p.submitted = false;
  }
}

function dealRound(room) {
  for (const p of room.players) {
    p.verbHand = [];
    p.nounHand = [];
    p.particleHand = [];
    p.proposal = [];
    p.submitted = false;

    if (p.id === room.fianceId) continue;

    // 한 플레이어에게 동사 2장 + 명사 6장 + 조사 4장
    for (let i = 0; i < 2; i++) {
      const card = draw("verbDeck", "verbDiscard", room);
      if (card) p.verbHand.push(card);
    }

    for (let i = 0; i < 6; i++) {
      const card = draw("nounDeck", "nounDiscard", room);
      if (card) p.nounHand.push(card);
    }

    for (let i = 0; i < 4; i++) {
      const card = draw("particleDeck", "particleDiscard", room);
      if (card) p.particleHand.push(card);
    }
  }
}

function startGame(room) {
  room.verbDeck = makeVerbDeck();
  room.nounDeck = makeNounDeck();
  room.particleDeck = makeParticleDeck();
  room.verbDiscard = [];
  room.nounDiscard = [];
  room.particleDiscard = [];
  room.allVerbCards = new Map();
  room.allNounCards = new Map();
  room.allParticleCards = new Map();

  for (const card of room.verbDeck) room.allVerbCards.set(card.id, card);
  for (const card of room.nounDeck) room.allNounCards.set(card.id, card);
  for (const card of room.particleDeck) room.allParticleCards.set(card.id, card);

  room.round = 1;
  room.fianceId = room.players[Math.floor(Math.random() * room.players.length)].id;
  room.presentationOrder = [];
  room.presentationIndex = 0;
  room.winnerId = null;
  room.phase = "proposal";
  dealRound(room);
}

function proposalIsValid(room, player, proposal) {
  if (!Array.isArray(proposal) || proposal.length === 0) return false;

  const used = new Set();

  for (const token of proposal) {
    if (!token || !token.cardId || !token.kind || used.has(token.cardId)) return false;
    used.add(token.cardId);

    if (token.kind === "verb") {
      const card = player.verbHand.find(c => c.id === token.cardId);
      if (!card || token.text !== card.text) return false;
    } else if (token.kind === "noun") {
      const card = player.nounHand.find(c => c.id === token.cardId);
      if (!card || token.text !== card.text) return false;
    } else if (token.kind === "particle") {
      const card = player.particleHand.find(c => c.id === token.cardId);
      if (!card || !card.options.includes(token.text)) return false;
    } else {
      return false;
    }
  }

  return true;
}

function beginPresentation(room) {
  const fianceIndex = room.players.findIndex(p => p.id === room.fianceId);
  room.presentationOrder = [];

  for (let i = 1; i <= room.players.length - 1; i++) {
    room.presentationOrder.push(room.players[(fianceIndex + i) % room.players.length].id);
  }

  room.presentationIndex = 0;
  room.phase = "presentation";
}

function advancePresentation(room) {
  room.presentationIndex++;
  if (room.presentationIndex >= room.presentationOrder.length) {
    room.phase = "winner";
  }
}

function startNextRound(room) {
  resetRoundCards(room);

  const currentIndex = room.players.findIndex(p => p.id === room.fianceId);
  const nextIndex = (currentIndex + 1) % room.players.length;

  room.fianceId = room.players[nextIndex].id;
  room.round++;
  room.winnerId = null;
  room.presentationOrder = [];
  room.presentationIndex = 0;
  room.phase = "proposal";

  dealRound(room);
}

io.on("connection", socket => {
  socket.on("createRoom", ({ name, playerCount }) => {
    const count = Number(playerCount);
    if (!Number.isInteger(count) || count < 3 || count > 6) {
      return socket.emit("errorMessage", "플레이어 수는 3~6명이어야 합니다.");
    }

    const code = newCode();
    const room = {
      code,
      playerCount: count,
      players: [],
      hostId: null,
      phase: "lobby",
      round: 0,
      fianceId: null,
      presentationOrder: [],
      presentationIndex: 0,
      winnerId: null,
      verbDeck: [],
      nounDeck: [],
      particleDeck: [],
      verbDiscard: [],
      nounDiscard: [],
      particleDiscard: [],
      allVerbCards: new Map(),
      allNounCards: new Map(),
      allParticleCards: new Map()
    };

    const player = makePlayer(socket.id, name, 0);
    room.players.push(player);
    room.hostId = player.id;
    rooms.set(code, room);

    socket.join(code);
    socket.roomCode = code;
    socket.playerId = player.id;

    socket.emit("roomJoined", { code, playerId: player.id, isHost: true });
    sendState(room);
  });

  socket.on("joinRoom", ({ code, name }) => {
    const room = rooms.get(String(code || "").trim().toUpperCase());
    if (!room) return socket.emit("errorMessage", "방을 찾을 수 없습니다.");
    if (room.phase !== "lobby") return socket.emit("errorMessage", "이미 시작된 게임입니다.");
    if (room.players.length >= room.playerCount) return socket.emit("errorMessage", "방이 가득 찼습니다.");

    const player = makePlayer(socket.id, name, room.players.length);
    room.players.push(player);

    socket.join(room.code);
    socket.roomCode = room.code;
    socket.playerId = player.id;

    socket.emit("roomJoined", { code: room.code, playerId: player.id, isHost: false });
    sendState(room);
  });

  socket.on("startGame", () => {
    const room = rooms.get(socket.roomCode);
    if (!room) return;

    const player = room.players.find(p => p.id === socket.playerId);
    if (!player || player.id !== room.hostId) {
      return socket.emit("errorMessage", "방장만 게임을 시작할 수 있습니다.");
    }

    if (room.players.length !== room.playerCount) {
      return socket.emit("errorMessage", `현재 ${room.players.length}명입니다. ${room.playerCount}명이 모두 들어와야 시작할 수 있습니다.`);
    }

    startGame(room);
    sendState(room);
  });

  socket.on("submitProposal", proposal => {
    const room = rooms.get(socket.roomCode);
    if (!room || room.phase !== "proposal") return;

    const player = room.players.find(p => p.id === socket.playerId);
    if (!player || player.id === room.fianceId || player.submitted) return;

    if (!proposalIsValid(room, player, proposal)) {
      return socket.emit("errorMessage", "유효하지 않은 카드 조합입니다.");
    }

    // 제출한 카드는 손패에서 실제로 제거하고 프로포즈 영역으로 이동한다.
    // 그래야 라운드 종료 시 같은 카드가 중복으로 덱에 들어가지 않는다.
    const submitted = [];
    for (const token of proposal) {
      let hand;
      if (token.kind === "verb") hand = player.verbHand;
      if (token.kind === "noun") hand = player.nounHand;
      if (token.kind === "particle") hand = player.particleHand;

      const index = hand.findIndex(card => card.id === token.cardId);
      if (index === -1) {
        return socket.emit("errorMessage", "카드 상태가 변경되었습니다. 다시 선택해주세요.");
      }

      const card = hand.splice(index, 1)[0];
      submitted.push({
        kind: token.kind,
        cardId: card.id,
        text: token.text
      });
    }

    player.proposal = submitted;
    player.submitted = true;

    const allSubmitted = room.players.filter(p => p.id !== room.fianceId).every(p => p.submitted);
    if (allSubmitted) beginPresentation(room);

    sendState(room);
  });

  socket.on("nextPresentation", () => {
    const room = rooms.get(socket.roomCode);
    if (!room || room.phase !== "presentation") return;

    const player = room.players.find(p => p.id === socket.playerId);
    if (!player || player.id !== room.hostId) {
      return socket.emit("errorMessage", "방장만 발표를 넘길 수 있습니다.");
    }

    advancePresentation(room);
    sendState(room);
  });

  socket.on("chooseWinner", winnerId => {
    const room = rooms.get(socket.roomCode);
    if (!room || room.phase !== "winner") return;

    const player = room.players.find(p => p.id === socket.playerId);
    if (!player || player.id !== room.fianceId) {
      return socket.emit("errorMessage", "피앙세만 반지를 줄 수 있습니다.");
    }

    const winner = room.players.find(p => p.id === winnerId);
    if (!winner || winner.id === room.fianceId || winner.rings <= 0) {
      return socket.emit("errorMessage", "선택할 수 없는 플레이어입니다.");
    }

    winner.rings--;
    room.winnerId = winner.id;
    room.phase = winner.rings === 0 ? "gameover" : "result";
    sendState(room);
  });

  socket.on("nextRound", () => {
    const room = rooms.get(socket.roomCode);
    if (!room || room.phase !== "result") return;

    const player = room.players.find(p => p.id === socket.playerId);
    if (!player || player.id !== room.hostId) {
      return socket.emit("errorMessage", "방장만 다음 라운드를 시작할 수 있습니다.");
    }

    startNextRound(room);
    sendState(room);
  });

  socket.on("disconnect", () => {
    const room = rooms.get(socket.roomCode);
    if (!room) return;

    const player = room.players.find(p => p.id === socket.playerId);
    if (!player) return;

    player.connected = false;
    player.socketId = null;

    if (room.phase === "lobby") {
      room.players = room.players.filter(p => p.id !== player.id);
    }

    if (room.hostId === player.id) {
      const replacement = room.players.find(p => p.connected);
      room.hostId = replacement?.id || null;
    }

    if (room.players.length === 0) {
      rooms.delete(room.code);
      return;
    }

    sendState(room);
  });
});

server.listen(PORT, "0.0.0.0", () => {
  console.log("====================================");
  console.log("💍 방긋 프로포즈 멀티플레이 서버 실행");
  console.log(`PORT: ${PORT}`);
  console.log("카드 구성: 명사 100 / 동사 50 / 조사 50");
  console.log("플레이어 손패: 동사 2 + 명사 6 + 조사 4");
  console.log("====================================");
});
