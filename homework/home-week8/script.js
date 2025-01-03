const quotes = [
  "When you have eliminated the impossible, whatever remains, however improbable, must be the truth.",
  "There is nothing more deceptive than an obvious fact.",
  "I ought to know by this time that when a fact appears to be opposed to along train of deductions it invariably proves to be capable of bearing some other interpretation.",
  "I never make exceptions. An exception disproves the rule.",
  "What one man can invent another can discover.",
  "Nothing clears up a case so much as stating it to another person.",
  "Education never ends, Watson. It is a series of lessons, with the greatest for the last.",
];

let words = [];
let wordIndex = 0;
let startTime = Date.now();

const quoteElement = document.getElementById("quote");
const messageElement = document.getElementById("message");
const typedValueElement = document.getElementById("typed-value");
const startButton = document.getElementById("start");

// 최고점수 관련 변수 선언
let highScore = localStorage.getItem("highScore") || Infinity;

// 최고점수 표시 함수
function showHighScore() {
  return highScore === Infinity ? "No high score yet" : `${highScore / 1000} seconds`;
}

// 모달 관련 변수 선언
const modal = document.getElementById("result-modal");
const modalMessage = document.getElementById("modal-message");
const closeButton = document.querySelector(".close-button");
const restartButton = document.getElementById("restart-button");

// 모달 표시 함수
function showModal(message) {
  modalMessage.innerText = message;
  modal.style.display = "flex";
}

// 모달 닫기 로직
closeButton.addEventListener("click", () => {
  modal.style.display = "none";
});
window.addEventListener("click", (event) => {
  if (event.target === modal) {
    modal.style.display = "none";
  }
});
restartButton.addEventListener("click", () => {
  modal.style.display = "none";
  startButton.click(); // 게임 재시작
});

startButton.addEventListener("click", () => {
  const quoteIndex = Math.floor(Math.random() * quotes.length);
  const quote = quotes[quoteIndex];
  words = quote.split(" ");
  wordIndex = 0;

  const spanWords = words.map((word) => `<span>${word} </span>`);
  quoteElement.innerHTML = spanWords.join("");
  quoteElement.childNodes[0].className = "highlight";
  messageElement.innerText = "";
  typedValueElement.value = "";
  typedValueElement.focus();
  startTime = new Date().getTime();
  quoteElement.style.display = "block";
  typedValueElement.disabled = false;
  startButton.disabled = true;

  // 기존 이벤트 리스너를 제거하고 새로 추가
  typedValueElement.removeEventListener("input", inputEventListener);
  typedValueElement.addEventListener("input", inputEventListener);
});

function inputEventListener() {
  const currentWord = words[wordIndex];
  const typedValue = typedValueElement.value;

  if (typedValue === currentWord && wordIndex === words.length - 1) {
    const elapsedTime = new Date().getTime() - startTime;

    if (elapsedTime < highScore) {
      highScore = elapsedTime;
      localStorage.setItem("highScore", highScore);
    }

    const message = `CONGRATULATIONS! You finished in ${elapsedTime / 1000} seconds.\nHigh Score: ${showHighScore()}`;
    showModal(message);

    startButton.disabled = false;
    typedValueElement.value = "";
    typedValueElement.disabled = true;
    typedValueElement.removeEventListener("input", inputEventListener);

  } else if (typedValue.endsWith(" ") && typedValue.trim() === currentWord) {
    typedValueElement.classList.add("next-word-animation");
    typedValueElement.value = "";
    wordIndex++;

    for (const wordElement of quoteElement.childNodes) {
      wordElement.className = "";
    }
    quoteElement.childNodes[wordIndex].className = "highlight";

    setTimeout(() => {
      typedValueElement.classList.remove("next-word-animation");
    }, 500);

  } else if (currentWord.startsWith(typedValue)) {
    typedValueElement.className = "";
  } else {
    typedValueElement.className = "error";
  }
}