const swipeBlock = document.querySelector('.swipe-block');
let startX = 0;
let isSwiping = false;
let currentX = 0;  // Добавим переменную для отслеживания текущего положения блока

function startSwipe(x) {
  startX = x;
  isSwiping = true;
  swipeBlock.style.cursor = 'grabbing';
  swipeBlock.style.transition = 'none';
}

function moveSwipe(x) {
  if (isSwiping) {
    const moveX = x - startX;
    swipeBlock.style.transform = `translateX(${currentX + moveX}px)`; // Используем текущую позицию блока
  }
}

function endSwipe() {
  isSwiping = false;
  swipeBlock.style.cursor = 'grab';
  
  const moveDistance = currentX + parseFloat(swipeBlock.style.transform.replace('translateX(', '').replace('px)', ''));

  if (Math.abs(moveDistance) > 20) {
    swipeBlock.style.transition = 'transform 1s ease';
    swipeBlock.style.transform = `translateX(${moveDistance > 0 ? window.innerWidth : -window.innerWidth}px)`;
    swipeBlock.textContent = moveDistance > 0 ? 'Вы сдвинули вправо!' : 'Вы сдвинули влево!';
  } else {
    swipeBlock.style.transition = 'transform 1s ease';
    swipeBlock.style.transform = `translateX(0px)`;
    swipeBlock.textContent = 'Свайпни меня';
  }

  setTimeout(() => {
    swipeBlock.style.transition = 'transform 0s';
    swipeBlock.style.transform = 'translateX(0px)';
    swipeBlock.textContent = 'Свайпни меня';
  }, 1000);

  currentX = 0;  // Сбрасываем текущее положение
  startX = 0;    // Сбрасываем начальное значение
}



swipeBlock.addEventListener('mousedown', (e) => startSwipe(e.clientX));
window.addEventListener('mousemove', (e) => moveSwipe(e.clientX));
window.addEventListener('mouseup', endSwipe);

swipeBlock.addEventListener('touchstart', (e) => startSwipe(e.touches[0].clientX), { passive: false });
window.addEventListener('touchmove', (e) => {
  moveSwipe(e.touches[0].clientX);
  e.preventDefault();
}, { passive: false });
window.addEventListener('touchend', endSwipe);
