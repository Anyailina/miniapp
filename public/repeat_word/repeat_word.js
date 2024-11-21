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
const image = document.getElementById("image");

// State Variables
let words = [];
let currentIndex = 0;
let learnedWord = [];
let totalNewWordCount = 0;
let startX = 0;
let isSwiping = false;
let currentX = 0;
let moveX = 0;
const threshold = 20; // Минимальное расстояние для срабатывания свайпа

// Fetch Words from Server
async function fetchWords() {
  const selectedFolders = localStorage.getItem('selected_folders');
  const params = new URLSearchParams(window.location.search);
  id = params.get('id');
  try {
    const response = await fetch(`https://previously-true-fly.ngrok-free.app/word/repeat/user?id=${id}`, {
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
  displayImageFromBytes();
}


function updateWordUI(word) {
  textField.value = word.name;
  textFieldTranslation.value = word.translation;
  textFolderField.value = word.folderDto.name;
  let quantityRepeat = word.quantityRepeat;
  textNewWordField.value = `${quantityRepeat}-е повторение`;
}


function startSwipe(x) {
  startX = x;
  isSwiping = true;
  swipeBlock.style.cursor = 'grabbing';
  swipeBlock.style.transition = 'none'; 
}


function moveSwipe(x) {
  if (isSwiping) {
    moveX = x - startX;
  }
}

function move(word) {
  setTimeout(() => {
    textFieldTranslation.style.display = 'none';
    showButton.style.display = 'block';
    swipeBlock.style.transition = 'transform 0s';
    swipeBlock.style.transform = 'translateX(0px)';
    updateWordUI(word)
    knowWord.style.backgroundColor = "#fafbfc";
    notKnowWord.style.backgroundColor = "#fafbfc";
  }, 500);
}

async function displayImageFromBytes() {

  try {
    // Отправляем запрос на сервер
    const response = await fetch("http://localhost:8082/ai/request/image");

    if (!response.ok) {
      throw new Error(`Ошибка загрузки изображения: ${response.statusText}`);
    }

    // Получаем массив байтов как Blob
    const blob = await response.blob();

    // Генерируем URL из Blob
    const objectUrl = URL.createObjectURL(blob);
    
    image.src = objectUrl;
    const parentElement = image.parentElement; 
    const parentWidth = parentElement.offsetWidth; // Ширина контейнера
    const parentHeight = parentElement.offsetHeight; // Высота контейнера

    image.src = objectUrl;

    image.onload = () => {
      const aspectRatio = image.naturalWidth / image.naturalHeight;
      let newWidth, newHeight;

      // Сохраняем пропорции, подстраиваем под размеры контейнера
      if (parentWidth / aspectRatio <= parentHeight) {
        newWidth = parentWidth;
        newHeight = parentWidth / aspectRatio;
      } else {
        newHeight = parentHeight;
        newWidth = parentHeight * aspectRatio;
      }

      image.style.width = `${newWidth}px`;
      image.style.height = `${newHeight}px`;
      parentElement.style.display = 'flex';
      parentElement.style.justifyContent = 'center';
      parentElement.style.alignItems = 'center';
      parentElement.style.position = 'relative'; 
    }
  
  } catch (error) {
    console.error("Ошибка:", error.message);
  }
}



function endSwipe() {
  console.log(moveX);
  
  if (Math.abs(moveX) <threshold || !isSwiping) return;
  swipeBlock.style.transition = 'transform 0.5s ease'; 
  const translation = (moveX > threshold) ? window.innerWidth : -window.innerWidth;
  swipeBlock.style.transform = `translateX(${translation}px)`;
  handleMove(moveX);
  isSwiping = false;
  swipeBlock.style.cursor = 'grab';
  currentX = 0;
  startX = 0;
  moveX = 0;
}

function handleMove(moveX){
  if(words.length > 0){
    if (moveX > threshold) {
      let word = words[currentIndex];
      words = words.filter(item => item !== word);
      words.push(word);
    } else {
      words[currentIndex].quantityRepeat ++;
      let word = words[currentIndex];
      words = words.filter(item => item !== word);
      learnedWord.push(word);
      updateProgress();
    }
    
    if(words.length <= 0){
      setTimeout(() => {
        showGoodJob();  
      }, 500);
      hideProgressElements();
      sendLearnedWord(); 
    }
    else{
      move(words[currentIndex])
    }
  }
}
function hideProgressElements() {
  progressBar.style.display = 'none';
  progressLabel.style.display = 'none';
  textFieldForQuantityWord.style.display = 'none';
  textFieldQuantityWord.style.display = 'none';
}
function updateProgress() {
  progressLabel.value = (learnedWord.length / totalNewWordCount) * 100 + '%';
  textFieldQuantityWord.value = learnedWord.length;
  progressBar.value = learnedWord.length / totalNewWordCount;
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

window.addEventListener("beforeunload", function (event) {
  const url = "https://previously-true-fly.ngrok-free.app/word";
  const data = JSON.stringify(learnedWord);

  navigator.sendBeacon(url, data);
});


showButton.addEventListener('click', () => {
  textFieldTranslation.style.display = 'block';
  showButton.style.display = 'none';
});

knowWord.addEventListener('click', () => {
  console.log(1);
  
  swipeBlock.style.transition = 'transform 0.5s ease';
  knowWord.style.backgroundColor = "rgb(30, 152, 14)";
  swipeBlock.style.transform = `translateX(${-window.innerWidth}px)`;
  handleMove(-threshold-1)

});


notKnowWord.addEventListener('click', () => {
  console.log(1);
  notKnowWord.style.backgroundColor ="rgb(227, 47, 47)";
  swipeBlock.style.transition = 'transform 0.5s ease';
  swipeBlock.style.transform = `translateX(${window.innerWidth}px)`;
  handleMove(threshold+1)
});

fetchWords();

