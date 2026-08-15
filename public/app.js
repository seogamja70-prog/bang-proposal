// 방긋 프로포즈 - app.js
// 3인 플레이 / 단어 200장 / 조사 100장 / 각 비피앙세 6+6장 / 30초 타이머 없음

const FUNNY_WORDS = [
    "엉덩이",
    "찢어진 팬티",
    "구질구질해",
    "죽어 버리겠습니다",
    "자극적인",
    "못된 고양이",
    "대머리",
    "자존감 도둑",
    "이라는 감옥",
    "인간 쓰레기",
    "안하무인",
    "더러워",
    "야당과 여당",
    "배덕감",
    "자의식 과잉",
    "퇴치하지 않을래?",
    "이랄까?",
    "집착광공",
    "타락한",
    "상처 입은 뼈에로",
    "상처를 핥으며",
    "페티시",
    "매도",
    "TMI지만",
    "괴롭혀주지 않을래?",
    "김밥천국",
    "불장난",
    "카카오페이",
    "유아퇴행",
    "코털",
    "휴지심",
    "복수하고 싶어",
    "편도 결석",
    "겨드랑이",
    "잉여 인간",
    "에너지 뱀파이어",
    "쾌락의 늪",
    "냄새나는",
    "우리 엄마 말에 따르면",
    "아무리 냄새나도",
    "고문실",
    "관능의 소용돌이",
    "수치심",
    "어둠의 댄스",
    "했다죠",
    "발명! 쓰레기걸",
    "너희 부모님",
    "어둠의 뼈에로",
    "엉덩이 피어싱",
    "털투성이",
    "오랑우탄",
    "거짓말이긴 하지만",
    "날개 잃은",
    "피비린내",
    "살인마",
    "김흥국",
    "거지발싸개",
    "킹왕짱",
    "뿔",
    "튀!",
    "노상 방뇨",
    "안경잡이",
    "쓰레기 집",
    "유튜브",
    "도박 중독",
    "비열한",
    "여편네",
    "쓰레기통",
    "비도덕적인",
    "추악한 욕망",
    "음란 마귀",
    "(웃음)",
    "BL만화",
    "상처투성이",
    "사이코패스",
    "뼈에로의 댄스",
    "일진회",
    "네 안의 어둠",
    "불매 운동",
    "중성화 수술",
    "비밀스러운 욕망",
    "농밀한",
    "매국노",
    "백종원"
];

const NORMAL_WORDS = [
    "사랑",
    "행복",
    "우리",
    "오늘",
    "내일",
    "평생",
    "언제나",
    "함께",
    "소중한",
    "따뜻한",
    "아름다운",
    "특별한",
    "운명",
    "마음",
    "진심",
    "약속",
    "미래",
    "가족",
    "친구",
    "추억",
    "웃음",
    "기쁨",
    "설렘",
    "감동",
    "기적",
    "세상",
    "하늘",
    "별",
    "달",
    "꽃",
    "여행",
    "집",
    "아침",
    "저녁",
    "주말",
    "생일",
    "기념일",
    "첫눈",
    "커피",
    "케이크",
    "사진",
    "노래",
    "영화",
    "음악",
    "책",
    "편지",
    "선물",
    "반지",
    "손",
    "눈",
    "미소",
    "목소리",
    "처음",
    "마지막",
    "다시",
    "항상",
    "서로",
    "둘",
    "우리집",
    "마음속",
    "세상에서",
    "가장",
    "진짜",
    "정말",
    "너무",
    "조금",
    "많이",
    "꼭",
    "함께하는",
    "사랑하는",
    "좋아하는",
    "원하는",
    "기다리는",
    "바라보는",
    "웃고 있는",
    "손잡고",
    "안아주고",
    "만나서",
    "헤어져도",
    "멀리 있어도",
    "가까이",
    "영원히",
    "평생을",
    "지금",
    "오늘부터",
    "앞으로",
    "언젠가",
    "같이",
    "같은",
    "새로운",
    "멋진",
    "예쁜",
    "귀여운",
    "좋은",
    "소중하게",
    "진심으로",
    "행복하게",
    "즐겁게",
    "함께라서",
    "너와",
    "나와",
    "우리의",
    "둘만의",
    "특별한",
    "완벽한",
    "최고의",
    "유일한",
    "평생의",
    "운명적인",
    "다정한",
    "든든한",
    "포근한",
    "설레는",
    "멋지게",
    "진심 어린",
    "소중히"
];

// 25종 × 4장 = 100장. 카드 1장에는 조사 4개가 들어간다.
const PARTICLE_TEMPLATES = [
    ["은", "는", "이", "가"],
    ["을", "를", "에", "에서"],
    ["와", "과", "도", "만"],
    ["의", "로", "으로", "에게"],
    ["한테", "께", "처럼", "보다"],
    ["까지", "부터", "조차", "마저"],
    ["하고", "랑", "이랑", "이나"],
    ["에게서", "께서", "로부터", "으로부터"],
    ["만큼", "같이", "처럼", "보다"],
    ["마다", "밖에", "따라", "대해"],
    ["관해", "위해", "통해", "대신"],
    ["대로", "사이", "중에", "밖으로"],
    ["라도", "이라도", "든지", "거나"],
    ["나마", "조차", "마저", "커녕"],
    ["부터", "까지", "에서", "으로"],
    ["은", "는", "도", "만"],
    ["이", "가", "을", "를"],
    ["하고", "랑", "와", "과"],
    ["에", "에서", "에게", "한테"],
    ["의", "로", "으로", "부터"],
    ["처럼", "같이", "만큼", "보다"],
    ["마다", "밖에", "조차", "마저"],
    ["이라도", "라도", "든지", "거나"],
    ["대해", "관해", "위해", "통해"],
    ["대로", "따라", "대신", "사이"]
];

const PLAYER_COLORS = [
    { name: "붉은색", icon: "🔴", className: "red" },
    { name: "푸른색", icon: "🔵", className: "blue" },
    { name: "금색", icon: "🟡", className: "gold" }
];

let players = [];
let wordDeck = [];
let particleDeck = [];
let wordDiscard = [];
let particleDiscard = [];

let currentFianceIndex = 0;
let round = 1;

let proposalPlayerIds = [];
let proposalIndex = 0;

let presentationOrder = [];
let presentationIndex = 0;

const $ = (id) => document.getElementById(id);

function shuffle(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

function showScreen(id) {
    document.querySelectorAll(".screen").forEach(screen => {
        screen.classList.remove("active");
    });

    const screen = $(id);
    if (screen) {
        screen.classList.add("active");
        window.scrollTo({ top: 0, behavior: "smooth" });
    }
}

function createDecks() {
    wordDeck = [];
    particleDeck = [];
    wordDiscard = [];
    particleDiscard = [];

    let wordId = 1;

    FUNNY_WORDS.forEach(text => {
        wordDeck.push({
            id: `funny-${wordId++}`,
            type: "word",
            category: "funny",
            text
        });
    });

    NORMAL_WORDS.forEach(text => {
        wordDeck.push({
            id: `normal-${wordId++}`,
            type: "word",
            category: "normal",
            text
        });
    });

    let particleId = 1;

    // 25종류를 각각 4장씩 만들어 100장
    for (let copy = 0; copy < 4; copy++) {
        PARTICLE_TEMPLATES.forEach(particles => {
            particleDeck.push({
                id: `particle-${particleId++}`,
                type: "particle",
                particles: [...particles]
            });
        });
    }

    shuffle(wordDeck);
    shuffle(particleDeck);

    console.log(`단어 카드: ${wordDeck.length}장`);
    console.log(`개그 카드: ${FUNNY_WORDS.length}장`);
    console.log(`일반 카드: ${NORMAL_WORDS.length}장`);
    console.log(`조사 카드: ${particleDeck.length}장`);
}

function drawWordCard() {
    if (wordDeck.length === 0) {
        if (wordDiscard.length === 0) return null;
        wordDeck = shuffle([...wordDiscard]);
        wordDiscard = [];
    }

    return wordDeck.pop();
}

function drawParticleCard() {
    if (particleDeck.length === 0) {
        if (particleDiscard.length === 0) return null;
        particleDeck = shuffle([...particleDiscard]);
        particleDiscard = [];
    }

    return particleDeck.pop();
}

function createPlayers() {
    players = [];

    document.querySelectorAll(".name-input").forEach((input, index) => {
        players.push({
            id: index,
            name: input.value.trim() || `플레이어 ${index + 1}`,
            color: PLAYER_COLORS[index],
            rings: 3,
            wordHand: [],
            particleHand: [],
            proposal: []
        });
    });
}

function chooseRandomFiance() {
    currentFianceIndex =
        Math.floor(Math.random() * players.length);
}

function dealCards() {
    players.forEach(player => {
        player.wordHand = [];
        player.particleHand = [];
        player.proposal = [];

        if (player.id === currentFianceIndex) return;

        // 단어 6장
        for (let i = 0; i < 6; i++) {
            const card = drawWordCard();
            if (card) player.wordHand.push(card);
        }

        // 조사 6장
        for (let i = 0; i < 6; i++) {
            const card = drawParticleCard();
            if (card) player.particleHand.push(card);
        }
    });
}

function getFiance() {
    return players[currentFianceIndex];
}

function showFianceScreen() {
    const fiance = getFiance();

    $("roundNumber").textContent = round;
    $("fianceName").textContent =
        `${fiance.color.icon} ${fiance.name}`;

    const leftPlayer =
        players[(currentFianceIndex + 1) % players.length];

    $("nextFianceHint").textContent =
        `다음 피앙세는 ${leftPlayer.name}입니다.`;

    showScreen("fianceScreen");
}

function startProposalPhase() {
    proposalPlayerIds = [];

    // 피앙세 왼쪽부터 시작
    for (let i = 1; i < players.length; i++) {
        const index =
            (currentFianceIndex + i) % players.length;

        proposalPlayerIds.push(index);
    }

    proposalIndex = 0;
    showCurrentProposalPlayer();
}

function showCurrentProposalPlayer() {
    if (proposalIndex >= proposalPlayerIds.length) {
        finishAllProposals();
        return;
    }

    const player =
        players[proposalPlayerIds[proposalIndex]];

    $("proposalRound").textContent = round;
    $("currentPlayerName").textContent =
        `${player.color.icon} ${player.name}`;

    renderPlayerCards(player);
    renderParticleCards(player);
    renderProposal(player);

    showScreen("proposalScreen");
}

function renderPlayerCards(player) {
    const container = $("playerCards");
    container.innerHTML = "";

    player.wordHand.forEach(card => {
        const button = document.createElement("button");

        button.className =
            `word-card ${card.category}`;

        button.textContent = card.text;

        button.addEventListener("click", () => {
            addWordToProposal(player, card.id);
        });

        container.appendChild(button);
    });

    if (player.wordHand.length === 0) {
        const empty = document.createElement("div");
        empty.className = "empty-card-message";
        empty.textContent = "사용할 단어 카드가 없습니다.";
        container.appendChild(empty);
    }
}

function renderParticleCards(player) {
    const container = $("particleCards");
    container.innerHTML = "";

    player.particleHand.forEach((card, cardIndex) => {
        const cardBox = document.createElement("div");
        cardBox.className = "particle-card";

        const title = document.createElement("div");
        title.className = "particle-card-title";
        title.textContent = `조사 카드 ${cardIndex + 1}`;

        const options = document.createElement("div");
        options.className = "particle-options";

        card.particles.forEach(particle => {
            const button = document.createElement("button");
            button.className = "particle-button";
            button.textContent = particle;

            button.addEventListener("click", () => {
                addParticleToProposal(
                    player,
                    card.id,
                    particle
                );
            });

            options.appendChild(button);
        });

        cardBox.appendChild(title);
        cardBox.appendChild(options);
        container.appendChild(cardBox);
    });

    if (player.particleHand.length === 0) {
        const empty = document.createElement("div");
        empty.className = "empty-card-message";
        empty.textContent = "사용할 조사 카드가 없습니다.";
        container.appendChild(empty);
    }
}

function addWordToProposal(player, cardId) {
    const index =
        player.wordHand.findIndex(card => card.id === cardId);

    if (index === -1) return;

    const card = player.wordHand.splice(index, 1)[0];

    player.proposal.push({
        sourceType: "word",
        sourceId: card.id,
        text: card.text,
        card
    });

    renderPlayerCards(player);
    renderParticleCards(player);
    renderProposal(player);
}

function addParticleToProposal(player, cardId, particle) {
    const index =
        player.particleHand.findIndex(card => card.id === cardId);

    if (index === -1) return;

    // 조사 하나를 선택하면 그 조사 카드 1장을 사용한다.
    const card =
        player.particleHand.splice(index, 1)[0];

    player.proposal.push({
        sourceType: "particle",
        sourceId: card.id,
        text: particle,
        card
    });

    renderPlayerCards(player);
    renderParticleCards(player);
    renderProposal(player);
}

function renderProposal(player) {
    const container = $("proposalWords");
    container.innerHTML = "";

    if (player.proposal.length === 0) {
        const empty = document.createElement("div");
        empty.className = "empty-message";
        empty.textContent =
            "단어 카드와 조사 카드를 선택하세요.";
        container.appendChild(empty);
        return;
    }

    player.proposal.forEach((item, index) => {
        const word = document.createElement("button");

        word.className =
            item.sourceType === "particle"
                ? "proposal-word particle-word"
                : "proposal-word";

        word.textContent = item.text;
        word.title = "클릭하면 카드로 되돌아갑니다.";

        word.addEventListener("click", () => {
            const removed =
                player.proposal.splice(index, 1)[0];

            if (removed.sourceType === "word") {
                player.wordHand.push(removed.card);
            } else {
                player.particleHand.push(removed.card);
            }

            renderPlayerCards(player);
            renderParticleCards(player);
            renderProposal(player);
        });

        container.appendChild(word);
    });
}

function completeCurrentProposal() {
    const player =
        players[proposalPlayerIds[proposalIndex]];

    if (player.proposal.length === 0) {
        alert("최소 한 장의 카드를 사용해주세요!");
        return;
    }

    // 남은 카드는 버림
    player.wordHand.forEach(card => wordDiscard.push(card));
    player.particleHand.forEach(card =>
        particleDiscard.push(card)
    );

    player.wordHand = [];
    player.particleHand = [];

    proposalIndex++;
    showCurrentProposalPlayer();
}

function finishAllProposals() {
    showScreen("presentationStartScreen");
}

function startPresentation() {
    presentationOrder = [];

    // 피앙세 왼쪽부터, 피앙세 제외
    for (let i = 1; i < players.length; i++) {
        const index =
            (currentFianceIndex + i) % players.length;

        presentationOrder.push(players[index]);
    }

    presentationIndex = 0;
    showNextProposal();
}

function makeProposalText(player) {
    if (!player.proposal.length) {
        return "프로포즈 문장이 없습니다.";
    }

    return player.proposal
        .map(item => item.text)
        .join(" ");
}

function showNextProposal() {
    if (presentationIndex >= presentationOrder.length) {
        showRingSelection();
        return;
    }

    const player =
        presentationOrder[presentationIndex];

    $("presentationNumber").textContent =
        presentationIndex + 1;

    $("presentationTotal").textContent =
        presentationOrder.length;

    $("speakerName").textContent =
        `${player.color.icon} ${player.name}`;

    $("proposalText").textContent =
        `${makeProposalText(player)} ... 결혼하자!`;

    $("speakerRingStatus").textContent =
        `남은 반지 ${"💍 ".repeat(player.rings)}`;

    showScreen("presentationScreen");
}

function showRingSelection() {
    const container = $("ringChoices");
    container.innerHTML = "";

    presentationOrder.forEach(player => {
        const button = document.createElement("button");
        button.className =
            `ring-choice ${player.color.className}`;

        const name = document.createElement("div");
        name.className = "choice-name";
        name.textContent =
            `${player.color.icon} ${player.name}`;

        const proposal = document.createElement("div");
        proposal.className = "choice-proposal";
        proposal.textContent =
            `${makeProposalText(player)} ... 결혼하자!`;

        const rings = document.createElement("div");
        rings.className = "choice-rings";
        rings.textContent =
            `현재 반지 ${"💍 ".repeat(player.rings)}`;

        button.append(name, proposal, rings);

        button.addEventListener("click", () => {
            giveRing(player);
        });

        container.appendChild(button);
    });

    showScreen("ringScreen");
}

function giveRing(winner) {
    if (winner.rings <= 0) {
        alert("이 플레이어의 반지는 모두 사용되었습니다.");
        return;
    }

    winner.rings--;

    $("ringWinnerName").textContent =
        `${winner.color.icon} ${winner.name}`;

    renderRingStatus(winner);

    if (winner.rings === 0) {
        showGameOver(winner);
        return;
    }

    showScreen("roundResultScreen");
}

function renderRingStatus(player) {
    const text =
        player.rings > 0
            ? `남은 반지: ${"💍 ".repeat(player.rings)}`
            : "반지를 모두 사용했습니다!";

    $("ringStatus").textContent = text;
}

function discardRoundCards() {
    players.forEach(player => {
        player.wordHand.forEach(card => wordDiscard.push(card));
        player.particleHand.forEach(card =>
            particleDiscard.push(card)
        );

        player.proposal.forEach(item => {
            if (item.sourceType === "word") {
                wordDiscard.push(item.card);
            } else {
                particleDiscard.push(item.card);
            }
        });

        player.wordHand = [];
        player.particleHand = [];
        player.proposal = [];
    });
}

function startNextRound() {
    discardRoundCards();

    // 현재 피앙세의 왼쪽 플레이어가 다음 피앙세
    currentFianceIndex =
        (currentFianceIndex + 1) % players.length;

    round++;

    dealCards();
    showFianceScreen();
}

function showGameOver(winner) {
    $("winnerName").textContent =
        `${winner.color.icon} ${winner.name}`;

    $("winnerMessage").textContent =
        `${winner.name}님이 반지 3개를 모두 받아냈습니다!`;

    showScreen("gameOverScreen");
}

function startGame() {
    createPlayers();

    if (players.length !== 3) {
        alert(
            "이 게임은 총 9개의 반지를 사용하는 3인 플레이입니다."
        );
        return;
    }

    createDecks();
    chooseRandomFiance();
    dealCards();

    console.log("게임 시작");
    console.log("피앙세:", getFiance().name);

    showFianceScreen();
}

// 이벤트
$("startButton").addEventListener("click", startGame);

$("fianceReadyButton").addEventListener(
    "click",
    startProposalPhase
);

$("completeProposalButton").addEventListener(
    "click",
    completeCurrentProposal
);

$("startPresentationButton").addEventListener(
    "click",
    startPresentation
);

$("nextProposalButton").addEventListener(
    "click",
    () => {
        presentationIndex++;
        showNextProposal();
    }
);

$("nextRoundButton").addEventListener(
    "click",
    startNextRound
);

$("restartButton").addEventListener(
    "click",
    () => location.reload()
);

function createNameInputs() {
    const container = $("nameInputs");
    container.innerHTML = "";

    for (let i = 0; i < 3; i++) {
        const input = document.createElement("input");

        input.className = "name-input";
        input.value = `플레이어 ${i + 1}`;
        input.placeholder =
            `${PLAYER_COLORS[i].icon} 플레이어 ${i + 1}`;

        container.appendChild(input);
    }
}

createNameInputs();

console.log(
    `개그 카드 ${FUNNY_WORDS.length}장 / 일반 카드 ${NORMAL_WORDS.length}장 / 단어 총 ${FUNNY_WORDS.length + NORMAL_WORDS.length}장`
);

console.log(
    `조사 카드 ${PARTICLE_TEMPLATES.length * 4}장`
);
