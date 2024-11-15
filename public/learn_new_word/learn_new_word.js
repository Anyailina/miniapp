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
const threshold = 20; // Минимальное расстояние для срабатывания свайпа

// Fetch Words from Server
async function fetchWords() {
  const selectedFolders = localStorage.getItem('selected_folders');
  try {
    const response = await fetch("http://localhost:8080/word/user?id=8", {
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
function updateWordUI(word) {
  textField.value = word.name;
  textFieldTranslation.value = word.translation;
  textFolderField.value = word.folderDto.name;
}

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
  if (Math.abs(moveX) < threshold) return;

  // Получаем финальное расстояние движения
  const moveDistance = parseFloat(swipeBlock.style.transform.replace('translateX(', '').replace('px)', ''));
  swipeBlock.style.transition = 'transform 0.5s ease'; // Возвращаем анимацию на место

  // Если свайп не превысил порог, сбрасываем блок
  if (Math.abs(moveDistance) <= threshold) {
    swipeBlock.style.transform = `translateX(0px)`;
    
     // Возврат в исходное положение
  } else {
    console.log(moveDistance);
    // Обрабатываем логику свайпа
    if (neededLearnWord.length < totalNewWordCount) {
      handleSwipeDecision(moveDistance);
    } else if (learnedWord.length !== totalNewWordCount) {
      handleRepeatWordLogic(moveDistance);
    } else {
      currentIndexNewWord = 0;
    }
  }

  // Сброс состояния
  isSwiping = false;
  swipeBlock.style.cursor = 'grab';
  currentX = 0;
  startX = 0;
}


function showGoodJob(){
  swipeBlock.style.display = 'none';
  textFieldGoodJob.style.display = 'block';
  progressContainer.style.display = 'none';
}

async function sendLearnedWord(){
  try{
    await fetch("http://localhost:8080/word/user", {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(learnedWord)
    });
  }
  catch (error) {
    console.error('Error fetching new words:', error);
  }
}

// Move to next word in the list
function move(word,translation) {
  setTimeout(() => {
    textFieldTranslation.style.display = 'none';
    showButton.style.display = 'block';
    swipeBlock.style.transition = 'transform 0s';
    swipeBlock.style.transform = 'translateX(0px)';
    textField.value = word
    textFieldTranslation.value = translation
    knowWord.style.backgroundColor = "#fafbfc";
    notKnowWord.style.backgroundColor = "#fafbfc";
  }, 500);
}


// Handle swipe decision (learned or not learned)
function handleSwipeDecision(moveDistance) {
  if (moveDistance < -20) {
    words[currentIndex].isLearned = true;  // Mark word as learned if swiped enough
  } else {
    words[currentIndex].quantityRepeat = 1; 
    neededLearnWord.push(words[currentIndex]);  // Add to needed learn list
    repeatWord.push(words[currentIndex]);  // Add to repeat list
  }

  currentIndex++;  // Move to the next word
  
  const translation = (moveDistance > 20) ? window.innerWidth : -window.innerWidth;
  swipeBlock.style.transform = `translateX(${translation}px)`;  // Move the block horizontally

  if (neededLearnWord.length !== totalNewWordCount) {
    if (currentIndex < words.length) {
      move(words[currentIndex].name, words[currentIndex].translation);  // Move to next word
    } else {
      fetchNewWords();  // Fetch new words if all words are processed
    }
  } else {
    showEndOfLearnStage();
  }
}

function handleRepeatWordLogic(moveDistance) {
  if (repeatWord.length > currentIndexNewWord) {
    if (moveDistance > 20) {
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
  const translation = (moveDistance > 20) ? window.innerWidth : -window.innerWidth;
  if (repeatWord.length !== 0) {
    swipeBlock.style.transform = `translateX(${translation}px)`;
    move(repeatWord[currentIndexNewWord].name, repeatWord[currentIndexNewWord].translation);
  } else {
    swipeBlock.style.transform = `translateX(${translation}px)`;
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
    await fetch("http://localhost:8080/word/user", {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(words)
    });

    const postResponse = await fetch("http://localhost:8080/word/user?id=8", {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: localStorage.getItem('selected_folders')
    });

    const postResult = await postResponse.json();
    words = postResult;
  
    if(words.length < 1){
      totalNewWordCount =  neededLearnWord.length;
      if(neededLearnWord.length > 0){
        move(neededLearnWord[0].name,neededLearnWord[0].translation);
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
      move(words[0].name,words[0].translation);
    }
    else{
      move(words[0].name,words[0].translation);
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
  if (neededLearnWord.length < totalNewWordCount) {
    handleSwipeDecision(-threshold -1);
  } else if (learnedWord.length !== totalNewWordCount) {
    handleRepeatWordLogic(-threshold-1);
  } else {
    currentIndexNewWord = 0;
  }
});


notKnowWord.addEventListener('click', () => {
  notKnowWord.style.backgroundColor ="rgb(227, 47, 47)";
  swipeBlock.style.transition = 'transform 0.5s ease';
  if (neededLearnWord.length < totalNewWordCount) {
    handleSwipeDecision(threshold+1);
  } else if (learnedWord.length !== totalNewWordCount) {
    handleRepeatWordLogic(threshold+1);
  } else {
    currentIndexNewWord = 0;
  }
});

fetchWords();
