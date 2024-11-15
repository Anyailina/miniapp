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
    progressLabel.value = '100%';
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

// Swipe Start
function startSwipe(x) {
  startX = x;
  isSwiping = true;
  swipeBlock.style.cursor = 'grabbing';
  swipeBlock.style.transition = 'none';
}

// Move Swipe Block
function moveSwipe(x) {
  if (isSwiping) {
    const moveX = x - startX;
    swipeBlock.style.transform = `translateX(${currentX + moveX}px)`;
  }
}

// End Swipe Action
function endSwipe() {
  const moveDistance = currentX + parseFloat(swipeBlock.style.transform.replace('translateX(', '').replace('px)', ''));
  if (Math.abs(moveDistance) > 20) {
    isSwiping = false;
    swipeBlock.style.cursor = 'grab';
    if (neededLearnWord.length < totalNewWordCount) {
      swipeBlock.style.transition = 'transform 1s ease';
      handleSwipeDecision(moveDistance);
  } else if (learnedWord.length != totalNewWordCount) {
      swipeBlock.style.transition = 'transform 1s ease';

      if (repeatWord.length > currentIndexNewWord) {
          if (moveDistance > 20) {
              let word = repeatWord[currentIndexNewWord];
              repeatWord = repeatWord.filter(item => item !== word);
              repeatWord.push(word);
             
          } else {
             repeatWord[currentIndexNewWord].quantityRepeat = 1;
              console.log(repeatWord[currentIndexNewWord]);
              let word = repeatWord[currentIndexNewWord];
              learnedWord.push(word);
              repeatWord = repeatWord.filter(item => item !== word);
              progressLabel.value = learnedWord.length/totalNewWordCount*100 +'%';
              textFieldQuantityWord.value = learnedWord.length;
              progressBar.value = learnedWord.length/totalNewWordCount;
              
          }
      } else {
          currentIndexNewWord = 0;
      }
      if(repeatWord.length != 0){
        const translation = (moveDistance > 20) ? window.innerWidth : -window.innerWidth;
        swipeBlock.style.transform = `translateX(${translation}px)`;
        move(repeatWord[currentIndexNewWord].name, repeatWord[currentIndexNewWord].translation);
      }else {
        const translation = (moveDistance > 20) ? window.innerWidth : -window.innerWidth;
        swipeBlock.style.transform = `translateX(${translation}px)`;
        setTimeout(() => {
          showGoodJob();
        }, 1000);
        sendLearnedWord();
      } 
  }
  // Сброс позиции свайпа
  currentX = 0;
  startX = 0;
  
  }
  else {
    swipeBlock.style.transform = `translateX(0px)`;
  }
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
  }, 1000);
}


// Handle swipe decision (learned or not learned)
function handleSwipeDecision(moveDistance) {
    if (moveDistance < -20) {
      words[currentIndex].isLearned = true;
    }
    else{
      words[currentIndex].quantityRepeat = 1; 
      neededLearnWord.push(words[currentIndex]);
      repeatWord.push(words[currentIndex]);
    }
    currentIndex++;

    const translation = (moveDistance > 20) ? window.innerWidth : -window.innerWidth;
    swipeBlock.style.transform = `translateX(${translation}px)`;

    if(neededLearnWord.length != totalNewWordCount ){
      if( currentIndex < words.length){
        move(words[currentIndex].name,words[currentIndex].translation);
      }
      else{
        fetchNewWords();
      }
    
    }
    else{

      knowWord.textContent = 'Запомнил,отложить до повторения';
      notKnowWord.textContent = 'Показывать,это слово еще';
      textNewWordField.value = "Изучение нового слова";
      move(neededLearnWord[currentIndexNewWord].name,neededLearnWord[currentIndexNewWord].translation);
    }
  
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
        }, 1000);
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

// Initialize the process
fetchWords();
