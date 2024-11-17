// DOM Elements
const swipeBlock = document.querySelector('.swipe-block');
const showButton = document.getElementById('showButton');
const textFieldTranslation = document.getElementById('textFieldTranslation');
const textFieldQuantityWord = document.getElementById('textFieldQuantityWord');
const textFieldGoodJob = document.getElementById('textFieldGoodJob');
const textNewWordField = document.getElementById("textNewWordField");
const textField = document.getElementById('textField');
const textFolderField = document.getElementById("textFolderField");
const progressBar = document.getElementById("progressBar");
const progressLabel = document.getElementById("progressPrecent");
const progressContainer = document.getElementById("learn-word");
const knowWord = document.getElementById("know_word");
const notKnowWord = document.getElementById("not_know_word");
const textFieldForQuantityWord = document.getElementById("textFieldForQuantityWord");

// State Variables
let words = [];
let currentIndex = 0;
let currentIndexNewWord = 0;
let neededLearnWord = [];
let learnedWord = [];
let repeatWord = [];
let totalNewWordCount = 0;
let startX = 0;
let isSwiping = false;
let currentX = 0;
let moveX = 0;
let id = 0;
const threshold = 20; // Минимальное расстояние для срабатывания свайпа

// Fetch Words from Server
async function fetchWords() {
  const selectedFolders = localStorage.getItem('selected_folders');
  const params = new URLSearchParams(window.location.search);
  id = params.get('id');
  try {
    const response = await fetch(`https://previously-true-fly.ngrok-free.app/word/user?id=${id}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: selectedFolders
    });

    const postResult = await response.json();
    if(postResult.length > 0){
      totalNewWordCount = postResult.length;
    words = postResult;
    currentIndex = 0;
    swipeBlock.style.display ='block';
    progressContainer.style.display = 'block';

    // Update UI with first word
    updateWordUI(postResult[0]);
    textNewWordField.value = "Новое слово";

    // Save index in localStorage
    localStorage.setItem('currentIndex', JSON.stringify(currentIndex));
  

    // Initialize progress bar
    progressBar.value = 0;
    progressLabel.value = '0%';
    }
    else{
      textFieldGoodJob.style.display ='block';
    }
    
  } catch (error) {
    console.error('Error fetching words:', error);
  }
}

// Update UI with word details


// Начало свайпа
function startSwipe(x) {
  startX = x;
  isSwiping = true;
  swipeBlock.style.cursor = 'grabbing';
  swipeBlock.style.transition = 'none'; // Убираем анимацию при перетаскивании
}

// Движение свайпа
function moveSwipe(x) {
  if (isSwiping) {
    moveX = x - startX;
  }
}

// Завершение свайпа
function endSwipe() {
  if (Math.abs(moveX) <threshold) return;
  swipeBlock.style.transition = 'transform 0.5s ease'; 
  const translation = (moveX > threshold) ? window.innerWidth : -window.innerWidth;
  swipeBlock.style.transform = `translateX(${translation}px)`;

  // Получаем финальное расстояние движения
  handleMove(moveX)
  // Сброс состояния
  isSwiping = false;
  swipeBlock.style.cursor = 'grab';
  currentX = 0;
  startX = 0;
}

function handleMove(moveX){
  if (neededLearnWord.length < totalNewWordCount) {
    handleSwipeDecision(moveX);
  } else if (learnedWord.length !== totalNewWordCount) {
    handleRepeatWordLogic(moveX);
  } else {
    currentIndexNewWord = 0;
  }
}


function showGoodJob(){
  swipeBlock.style.display = 'none';
  textFieldGoodJob.style.display = 'block';
  progressContainer.style.display = 'none';
}

async function sendLearnedWord(){
  try{
    await fetch("https://previously-true-fly.ngrok-free.app/word", {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(learnedWord)
    });
  }
  catch (error) {
    console.error('Error fetching new words:', error);
  }
}

function updateWordUI(word) {
  textField.value = word.name;
  textFieldTranslation.value = word.translation;
  textFolderField.value = word.folderDto.name;
}

// Move to next word in the list
function move(word) {
  setTimeout(() => {
    textFieldTranslation.style.display = 'none';
    showButton.style.display = 'block';
    swipeBlock.style.transition = 'transform 0s';
    swipeBlock.style.transform = 'translateX(0px)';
    updateWordUI(word);
    knowWord.style.backgroundColor = "#fafbfc";
    notKnowWord.style.backgroundColor = "#fafbfc";
  }, 500);
}


// Handle swipe decision (learned or not learned)
function handleSwipeDecision(moveDistance) {
  if (moveDistance < -threshold) {
    words[currentIndex].isLearned = true;  // Mark word as learned if swiped enough
  } else {
    words[currentIndex].quantityRepeat = 1; 
    neededLearnWord.push(words[currentIndex]);  // Add to needed learn list
    repeatWord.push(words[currentIndex]);  // Add to repeat list
  }

  currentIndex++;  // Move to the next word

  if (neededLearnWord.length !== totalNewWordCount) {
    if (currentIndex < words.length) {
      move(words[currentIndex]);  // Move to next word
    } else {
      fetchNewWords();  // Fetch new words if all words are processed
    }
  } else {
    showEndOfLearnStage();
  }
}

function handleRepeatWordLogic(moveDistance) {
  if (repeatWord.length > currentIndexNewWord) {
    if (moveDistance > threshold) {
      let word = repeatWord[currentIndexNewWord];
      repeatWord = repeatWord.filter(item => item !== word);
      repeatWord.push(word);
    } else {
      repeatWord[currentIndexNewWord].quantityRepeat = 1;
      let word = repeatWord[currentIndexNewWord];
      learnedWord.push(word);
      repeatWord = repeatWord.filter(item => item !== word);
      updateProgress();
    }
  }
  
  if (repeatWord.length !== 0) {
   
    move(repeatWord[currentIndexNewWord]);
  } else {
    setTimeout(() => {
      showGoodJob();  // Show feedback when all words are learned
    }, 500);
    hideProgressElements();
    sendLearnedWord();  // Send data of learned words
  }
}
function showEndOfLearnStage() {
  setTimeout(() => {
    textFieldTranslation.style.display = 'none';
    showButton.style.display = 'block';
    swipeBlock.style.transition = 'transform 0s';
    swipeBlock.style.transform = 'translateX(0px)';
    knowWord.textContent = 'Запомнил,отложить до повторения';
    notKnowWord.textContent = 'Показывать,это слово еще';
    textNewWordField.value = "Изучение нового слова";
    knowWord.style.backgroundColor = "#fafbfc";
    notKnowWord.style.backgroundColor = "#fafbfc";
    textField.value = neededLearnWord[currentIndexNewWord].name;
    textFieldTranslation.value = neededLearnWord[currentIndexNewWord].translation;
  }, 500);
}
function updateProgress() {
  progressLabel.value = (learnedWord.length / totalNewWordCount) * 100 + '%';
  textFieldQuantityWord.value = learnedWord.length;
  progressBar.value = learnedWord.length / totalNewWordCount;
}
function hideProgressElements() {
  progressBar.style.display = 'none';
  progressLabel.style.display = 'none';
  textFieldForQuantityWord.style.display = 'none';
  textFieldQuantityWord.style.display = 'none';
}

// Fetch new words and update UI
async function fetchNewWords() {

  try {
    await fetch("https://previously-true-fly.ngrok-free.app/word", {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(words)
    });

    const postResponse = await fetch(`https://previously-true-fly.ngrok-free.app/word/user?id=${id}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: localStorage.getItem('selected_folders')
    });

    const postResult = await postResponse.json();
    words = postResult;
  
    if(words.length < 1){
      totalNewWordCount =  neededLearnWord.length;
      if(neededLearnWord.length > 0){
        move(neededLearnWord[0]);
      }
      else{
        setTimeout(() => {
          showGoodJob();
        }, 500);
        sendLearnedWord();
      }
    }
    else if(words.length < totalNewWordCount - neededLearnWord.length){
      totalNewWordCount = neededLearnWord.length + words.length;
      move(words[0]);
    }
    else{
      move(words[0]);
    }
    currentIndex = 0;
  } catch (error) {
    console.error('Error fetching new words:', error);
  }
}
function goBack() {
  window.history.back();
}



// Event Listeners
swipeBlock.addEventListener('mousedown', (e) => startSwipe(e.clientX));
window.addEventListener('mousemove', (e) => moveSwipe(e.clientX));
window.addEventListener('mouseup', endSwipe);



window.addEventListener("beforeunload", function (event) {
  const url = "https://previously-true-fly.ngrok-free.app/word";
  const data = JSON.stringify(learnedWord);

  navigator.sendBeacon(url, data);
});

swipeBlock.addEventListener('touchstart', (e) => startSwipe(e.touches[0].clientX), { passive: false });
window.addEventListener('touchmove', (e) => {
  moveSwipe(e.touches[0].clientX);
  e.preventDefault();
}, { passive: false });
window.addEventListener('touchend', endSwipe);

showButton.addEventListener('click', () => {
  textFieldTranslation.style.display = 'block';
  showButton.style.display = 'none';
});

knowWord.addEventListener('click', () => {
  swipeBlock.style.transition = 'transform 0.5s ease';
  knowWord.style.backgroundColor = "rgb(30, 152, 14)";
  
  swipeBlock.style.transform = `translateX(${-window.innerWidth}px)`;
  handleMove(-threshold -1);
});


notKnowWord.addEventListener('click', () => {
  notKnowWord.style.backgroundColor ="rgb(227, 47, 47)";
  swipeBlock.style.transition = 'transform 0.5s ease';
  swipeBlock.style.transform = `translateX(${window.innerWidth}px)`;

  handleMove(threshold+1);
});

fetchWords();
