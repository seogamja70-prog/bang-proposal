const socket = io();

let myPlayerId = null;
let isHost = false;
let state = null;
let privateHand = { verbCards: [], nounCards: [], particleCards: [], proposal: [] };
let localProposal = [];

const $ = id => document.getElementById(id);

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function show(id) {
  document.querySelectorAll(".screen").forEach(el => el.classList.remove("active"));
  $(id).classList.add("active");
}

function toast(message) {
  $("toast").textContent = message;
  $("toast").classList.add("show");
  clearTimeout(toast.timer);
  toast.timer = setTimeout(() => $("toast").classList.remove("show"), 2800);
}

function me() {
  return state?.players?.find(p => p.id === myPlayerId);
}

function isFiance() {
  return state?.fianceId === myPlayerId;
}

function resetLocalProposal() {
  localProposal = [];
  privateHand.proposal = [];
}

function renderLobby() {
  if (!state) return;

  $("roomCodeText").textContent = state.code;
  $("lobbyCount").textContent = `${state.players.length} / ${state.playerCount}`;

  $("playerList").innerHTML = state.players.map(p => `
    <div class="player-row ${p.id === myPlayerId ? "mine" : ""}">
      <span class="player-color">${p.color}</span>
      <span class="player-name">${escapeHtml(p.name)}</span>
      ${p.id === state.hostId ? '<span class="host-badge">방장</span>' : ""}
      ${p.id === myPlayerId ? '<span class="me-badge">나</span>' : ""}
    </div>
  `).join("");

  const start = $("startGameButton");
  if (isHost) {
    start.classList.remove("hidden");
    start.disabled = state.players.length !== state.playerCount;
    start.textContent =
      state.players.length === state.playerCount
        ? "게임 시작 💍"
        : `${state.playerCount}명 모이면 시작`;
  } else {
    start.classList.add("hidden");
  }
}

function renderProposal() {
  if (!state) return;

  const fiance = state.players.find(p => p.id === state.fianceId);
  $("proposalRound").textContent = state.round;
  $("fianceLabel").textContent = `${fiance?.color || "💍"} ${escapeHtml(fiance?.name || "")}`;

  if (isFiance()) {
    show("fianceWaitScreen");
    $("fianceWaitText").textContent =
      "당신은 이번 라운드의 피앙세입니다. 다른 플레이어들이 프로포즈를 만드는 동안 기다려주세요.";
    return;
  }

  show("proposalScreen");
  $("myName").textContent = `${me()?.color || ""} ${escapeHtml(me()?.name || "")}`;

  if (me()?.submitted) {
    $("proposalEditor").classList.add("hidden");
    $("proposalSubmitted").classList.remove("hidden");
    $("submitProposalButton").disabled = true;
    return;
  }

  $("proposalEditor").classList.remove("hidden");
  $("proposalSubmitted").classList.add("hidden");
  $("submitProposalButton").disabled = localProposal.length === 0;

  renderHands();
  renderLocalProposal();
  $("progressText").textContent =
    `제출 완료 ${state.submittedCount} / ${state.proposerCount}`;
}

function renderHands() {
  const verbBox = $("verbCards");
  const nounBox = $("nounCards");
  const particleBox = $("particleCards");

  verbBox.innerHTML = privateHand.verbCards.length
    ? privateHand.verbCards.map(card => `
      <button class="card verb-card" data-kind="verb" data-id="${card.id}">
        <span class="card-type">동사 CARD</span>
        <strong>${escapeHtml(card.text)}</strong>
      </button>
    `).join("")
    : '<div class="empty-hand">남은 동사 카드가 없습니다.</div>';

  nounBox.innerHTML = privateHand.nounCards.length
    ? privateHand.nounCards.map(card => `
      <button class="card noun-card" data-kind="noun" data-id="${card.id}">
        <span class="card-type">명사 CARD</span>
        <strong>${escapeHtml(card.text)}</strong>
      </button>
    `).join("")
    : '<div class="empty-hand">남은 명사 카드가 없습니다.</div>';

  particleBox.innerHTML = privateHand.particleCards.length
    ? privateHand.particleCards.map(card => `
      <div class="card particle-card">
        <span class="card-type">조사 CARD</span>
        <div class="particle-options">
          ${card.options.map(option => `
            <button class="particle-option" data-id="${card.id}" data-text="${escapeHtml(option)}">
              ${escapeHtml(option)}
            </button>
          `).join("")}
        </div>
      </div>
    `).join("")
    : '<div class="empty-hand">남은 조사 카드가 없습니다.</div>';

  verbBox.querySelectorAll("[data-kind='verb']").forEach(button => {
    button.addEventListener("click", () => addVerbWithCache(button.dataset.id));
  });

  nounBox.querySelectorAll("[data-kind='noun']").forEach(button => {
    button.addEventListener("click", () => addNounWithCache(button.dataset.id));
  });

  particleBox.querySelectorAll(".particle-option").forEach(button => {
    button.addEventListener("click", () =>
      addParticleWithCache(button.dataset.id, button.dataset.text)
    );
  });
}

function renderLocalProposal() {
  const box = $("proposalWords");

  if (!localProposal.length) {
    box.innerHTML = '<span class="proposal-placeholder">카드를 골라 프로포즈 문장을 만들어보세요.</span>';
    $("submitProposalButton").disabled = true;
    return;
  }

  box.innerHTML = localProposal.map((token, index) => `
    <button class="proposal-token" data-index="${index}">
      ${escapeHtml(token.text)}
      <small>×</small>
    </button>
  `).join("");

  box.querySelectorAll(".proposal-token").forEach(button => {
    button.addEventListener("click", () => removeProposal(Number(button.dataset.index)));
  });

  $("submitProposalButton").disabled = false;
}

function addVerb(cardId) {
  const index = privateHand.verbCards.findIndex(c => c.id === cardId);
  if (index === -1) return;

  const card = privateHand.verbCards.splice(index, 1)[0];
  localProposal.push({ kind: "verb", cardId: card.id, text: card.text });
  renderHands();
  renderLocalProposal();
}

function addNoun(cardId) {
  const index = privateHand.nounCards.findIndex(c => c.id === cardId);
  if (index === -1) return;

  const card = privateHand.nounCards.splice(index, 1)[0];
  localProposal.push({ kind: "noun", cardId: card.id, text: card.text });
  renderHands();
  renderLocalProposal();
}

function addParticle(cardId, text) {
  const index = privateHand.particleCards.findIndex(c => c.id === cardId);
  if (index === -1) return;

  const card = privateHand.particleCards.splice(index, 1)[0];
  localProposal.push({ kind: "particle", cardId: card.id, text });
  renderHands();
  renderLocalProposal();
}

function removeProposal(index) {
  const token = localProposal.splice(index, 1)[0];
  if (!token) return;

  restoreSelectedCard(token);
  renderHands();
  renderLocalProposal();
}

const selectedCardCache = new Map();

function restoreSelectedCard(token) {
  const card = selectedCardCache.get(token.cardId);
  if (!card) return;

  if (token.kind === "verb") privateHand.verbCards.push(card);
  else if (token.kind === "noun") privateHand.nounCards.push(card);
  else privateHand.particleCards.push(card);

  selectedCardCache.delete(token.cardId);
}

function addVerbWithCache(cardId) {
  const index = privateHand.verbCards.findIndex(c => c.id === cardId);
  if (index === -1) return;
  const card = privateHand.verbCards.splice(index, 1)[0];
  selectedCardCache.set(card.id, card);
  localProposal.push({ kind: "verb", cardId: card.id, text: card.text });
  renderHands();
  renderLocalProposal();
}

function addNounWithCache(cardId) {
  const index = privateHand.nounCards.findIndex(c => c.id === cardId);
  if (index === -1) return;
  const card = privateHand.nounCards.splice(index, 1)[0];
  selectedCardCache.set(card.id, card);
  localProposal.push({ kind: "noun", cardId: card.id, text: card.text });
  renderHands();
  renderLocalProposal();
}

function addParticleWithCache(cardId, text) {
  const index = privateHand.particleCards.findIndex(c => c.id === cardId);
  if (index === -1) return;
  const card = privateHand.particleCards.splice(index, 1)[0];
  selectedCardCache.set(card.id, card);
  localProposal.push({
    kind: "particle",
    cardId: card.id,
    text,
    options: card.options
  });
  renderHands();
  renderLocalProposal();
}

function renderPresentation() {
  show("presentationScreen");

  const currentId = state.currentPresenterId;
  const current = state.proposals.find(p => p.playerId === currentId);

  $("presentationNumber").textContent =
    `${state.presentationIndex + 1} / ${state.presentationOrder.length}`;

  if (!current) {
    $("speakerName").textContent = "준비 중...";
    $("proposalText").textContent = "";
    return;
  }

  $("speakerName").textContent = `${current.color} ${escapeHtml(current.name)}`;
  $("proposalText").innerHTML =
    current.proposal.map(token => `<span>${escapeHtml(token.text)}</span>`).join(" ") +
    ' <b>결혼하자!</b>';

  $("nextPresentationButton").classList.toggle("hidden", !isHost);
}

function renderWinner() {
  show("winnerScreen");

  const fiance = state.players.find(p => p.id === state.fianceId);
  $("winnerFiance").textContent = `${fiance?.color || ""} ${escapeHtml(fiance?.name || "")}`;

  $("winnerChoices").innerHTML = state.proposals.map(proposal => {
    const player = state.players.find(p => p.id === proposal.playerId);
    return `
      <button class="winner-card" data-id="${proposal.playerId}" ${!isFiance() ? "disabled" : ""}>
        <div class="winner-name">${proposal.color} ${escapeHtml(proposal.name)}</div>
        <div class="winner-proposal">
          ${proposal.proposal.map(t => escapeHtml(t.text)).join(" ")}
          <strong>결혼하자!</strong>
        </div>
        <div class="ring-left">남은 반지 ${player?.rings ?? 0}개</div>
      </button>
    `;
  }).join("");

  if (isFiance()) {
    $("winnerHint").textContent = "가장 마음에 드는 프로포즈를 선택하세요.";
    $("winnerChoices").querySelectorAll(".winner-card").forEach(button => {
      button.addEventListener("click", () => {
        if (confirm("이 프로포즈를 선택할까요?")) {
          socket.emit("chooseWinner", button.dataset.id);
        }
      });
    });
  } else {
    $("winnerHint").textContent = `${fiance?.name || "피앙세"}가 마음에 드는 프로포즈를 고르는 중입니다.`;
  }
}

function renderResult() {
  const winner = state.players.find(p => p.id === state.winnerId);
  show("resultScreen");

  $("resultWinner").textContent =
    `${winner?.color || "💍"} ${escapeHtml(winner?.name || "")}`;
  $("resultRingStatus").textContent =
    `남은 반지: ${"💍 ".repeat(winner?.rings || 0) || "0개"}`;

  $("nextRoundButton").classList.toggle("hidden", !isHost);
}

function renderGameOver() {
  const winner = state.players.find(p => p.id === state.winnerId);
  show("gameOverScreen");

  $("gameOverWinner").textContent =
    `${winner?.color || "💍"} ${escapeHtml(winner?.name || "")}`;
  $("gameOverMessage").textContent =
    `${winner?.name || "플레이어"}가 자신의 반지 3개를 모두 털어냈습니다!`;
}

function renderState() {
  if (!state) return;

  if (state.phase === "lobby") renderLobby();
  if (state.phase === "proposal") renderProposal();
  if (state.phase === "presentation") renderPresentation();
  if (state.phase === "winner") renderWinner();
  if (state.phase === "result") renderResult();
  if (state.phase === "gameover") renderGameOver();

  renderScoreboard();
}

function renderScoreboard() {
  const box = $("scoreboard");
  if (!state || !state.players.length) {
    box.innerHTML = "";
    return;
  }

  box.innerHTML = state.players.map(p => `
    <div class="score-chip ${p.id === state.fianceId ? "fiance-chip" : ""}">
      <span>${p.color}</span>
      <span>${escapeHtml(p.name)}</span>
      <span>${"💍".repeat(p.rings)}</span>
    </div>
  `).join("");
}

$("createButton").addEventListener("click", () => {
  const name = $("createName").value.trim() || "방장";
  const playerCount = Number($("createCount").value);
  socket.emit("createRoom", { name, playerCount });
});

$("joinButton").addEventListener("click", () => {
  const name = $("joinName").value.trim() || "플레이어";
  const code = $("joinCode").value.trim().toUpperCase();

  if (!code) {
    toast("방 코드를 입력해주세요.");
    return;
  }

  socket.emit("joinRoom", { name, code });
});

$("startGameButton").addEventListener("click", () => socket.emit("startGame"));

$("submitProposalButton").addEventListener("click", () => {
  if (!localProposal.length) {
    toast("카드를 최소 1장 선택해주세요.");
    return;
  }

  socket.emit(
    "submitProposal",
    localProposal.map(({ kind, cardId, text }) => ({ kind, cardId, text }))
  );
});

$("nextPresentationButton").addEventListener("click", () => {
  socket.emit("nextPresentation");
});

$("nextRoundButton").addEventListener("click", () => {
  socket.emit("nextRound");
});

$("copyRoomButton").addEventListener("click", async () => {
  const text = `방긋 프로포즈 방 코드: ${state?.code || ""}`;
  try {
    await navigator.clipboard.writeText(text);
    toast("방 코드가 복사되었습니다.");
  } catch {
    toast(text);
  }
});

$("gameOverHomeButton").addEventListener("click", () => location.reload());

socket.on("connect", () => {
  $("connectionStatus").textContent = "서버 연결됨";
  $("connectionStatus").classList.add("online");
});

socket.on("disconnect", () => {
  $("connectionStatus").textContent = "서버 연결 끊김";
  $("connectionStatus").classList.remove("online");
});

socket.on("roomJoined", data => {
  myPlayerId = data.playerId;
  isHost = data.isHost;
  $("homeScreen").classList.remove("active");
  $("lobbyScreen").classList.add("active");
});

socket.on("privateHand", hand => {
  privateHand = hand;
  selectedCardCache.clear();
  if (state?.phase === "proposal" && !state?.players.find(p => p.id === myPlayerId)?.submitted) {
    localProposal = hand.proposal || [];
  }
  if (state?.phase === "proposal") renderProposal();
});

socket.on("state", newState => {
  state = newState;
  renderState();
});

socket.on("errorMessage", message => toast(message));

show("homeScreen");
