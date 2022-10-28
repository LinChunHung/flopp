const GAME_STATE = {
  FirstCardAwaits: "FirstCardAwaits",
  SecondCardAwaits: "SecondCardAwaits",
  CardsMathFailed: "CardsMathFailed",
  CardsMatched: "CardsMatched",
  GameFinished: "GameFinished"
};

const Symbols = [
  "https://assets-lighthouse.alphacamp.co/uploads/image/file/17989/__.png", // 0-12 黑桃
  "https://assets-lighthouse.alphacamp.co/uploads/image/file/17992/heart.png", // 13-25 愛心
  "https://assets-lighthouse.alphacamp.co/uploads/image/file/17991/diamonds.png", // 26-38 方塊
  "https://assets-lighthouse.alphacamp.co/uploads/image/file/17988/__.png" // 39-51 梅花
];

// 運用MVC架構分類程式碼
// View 畫面有關的事情 牌面13 * 4
const view = {
  getCardElement(index) {
    return `
    <div class="card back" data-index=${index}></div>
    `;
  },
  getCardContent(index) {
    const number = this.transformNumber((index % 13) + 1);
    const symbol = Symbols[Math.floor(index / 13)];
    return `
        <p>${number}</p>
        <img src=${symbol}>
        <p>${number}</p>
    `;
  },
  transformNumber(number) {
    switch (number) {
      case 1:
        return "A";
      case 11:
        return "J";
      case 12:
        return "Q";
      case 13:
        return "K";
      default:
        return number;
    }
  },
  displayCards(indexes) {
    const rootElement = document.querySelector("#cards");
    rootElement.innerHTML = indexes
      .map((index) => this.getCardElement(index))
      .join("");
  },
  flipCards(...cards) {
    cards.map((card) => {
      if (card.classList.contains("back")) {
        // 假如卡片內class包含back回傳正面
        card.classList.remove("back");
        card.innerHTML = this.getCardContent(Number(card.dataset.index));
        return;
      }
      // 回傳背面
      card.classList.add("back");
      card.innerHTML = null;
    });
  },
  pairCards(...cards) {
    cards.map((card) => {
      card.classList.add("paired");
    });
  },
  renderScore(score) {
    document.querySelector(".score").textContent = `Score: ${score}`;
  },
  renderTriedTimed(times) {
    document.querySelector(
      ".tried"
    ).textContent = `You've tried: ${times} times`;
  },
  appendWrongAnimation(...cards) {
    cards.map((card) => {
      card.classList.add("wrong");
      card.addEventListener("animationend", (event) => {
        // {once: true} 要求事件執行一次之後就卸載監聽器，同張卡片有可能被點錯好幾次，每次都要動態掛上新監聽器用完就卸載
        event.target.classList.remove("wrong"), { once: true };
      });
    });
  },
  showGameFinished() {
    const div = document.createElement("div");
    div.classList.add("completed");
    div.innerHTML = `
      <p>Complete!</p>
      <p>Score: ${model.score}</p>
      <p>You're tried: ${model.triedTimes} times</p>
    `;
    const header = document.querySelector("#header");
    header.before(div);
  }
};

const model = {
  revealedCards: [],
  score: 0,
  triedTimes: 0,
  isRevealedCardsMatched() {
    return (
      this.revealedCards[0].dataset.index % 13 ===
      this.revealedCards[1].dataset.index % 13
    );
  }
};

const controller = {
  currentState: GAME_STATE.FirstCardAwaits,
  generateCards() {
    view.displayCards(utility.getRandomNumberArray(52));
  },
  dispatchCardAction(card) {
    if (!card.classList.contains("back")) return;

    switch (this.currentState) {
      case GAME_STATE.FirstCardAwaits:
        view.flipCards(card);
        model.revealedCards.push(card);
        this.currentState = GAME_STATE.SecondCardAwaits;
        break;
      case GAME_STATE.SecondCardAwaits:
        view.renderTriedTimed(++model.triedTimes);
        view.flipCards(card);
        model.revealedCards.push(card);

        if (model.isRevealedCardsMatched()) {
          // 配對成功
          view.renderScore((model.score += 10));
          this.currentState = GAME_STATE.CardsMatched;
          view.pairCards(...model.revealedCards);
          model.revealedCards = [];
          if (model.score === 260) {
            this.currentState = GAME_STATE.GameFinished;
            view.showGameFinished();
            return;
          }
          this.currentState = GAME_STATE.FirstCardAwaits;
        } else {
          // 配對失敗
          this.currentState = GAME_STATE.CardsMathFailed;
          view.appendWrongAnimation(...model.revealedCards);
          setTimeout(this.resetCards, 1000);
        }
        break;
    }
    // console.log(this.currentState)
    // console.log(model.revealedCards.map(card => card.dataset.index))
  },
  resetCards() {
    view.flipCards(...model.revealedCards);
    model.revealedCards = [];
    controller.currentState = GAME_STATE.FirstCardAwaits;
  }
};

const utility = {
  getRandomNumberArray(count) {
    const number = Array.from(Array(count).keys());
    for (let index = number.length - 1; index > 0; index--) {
      let randomIndex = Math.floor(Math.random() * (index + 1));
      // 解構賦值
      [number[index], number[randomIndex]] = [
        number[randomIndex],
        number[index]
      ];
    }
    return number;
  }
};

controller.generateCards();
document.querySelectorAll(".card").forEach((card) => {
  card.addEventListener("click", (event) => {
    controller.dispatchCardAction(card);
  });
});