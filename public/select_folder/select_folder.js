document.addEventListener("DOMContentLoaded", function() {
  const toggleListButton = document.getElementById("toggleListButton");
  const saveButton = document.getElementById("saveButton");
  const dropdownList = document.getElementById("dropdownList");

  // Функция для получения данных с сервера и обновления списка
  function fetchFolderList() {
    // Пример HTTP-запроса с использованием fetch
    fetch('http://localhost:8080/select_folder/user?id=665639019')  // Замените на свой API-эндпоинт
      .then(response => response.json())
      .then(data => {
        // Очистить текущий список
        dropdownList.innerHTML = '';

        // Добавить новые элементы в список
        data.forEach(folder => {
          const li = document.createElement("li");
          const checkbox = document.createElement("input");
          checkbox.type = "checkbox";
          checkbox.value = folder.id;  // Пример значения, замените на нужное
          const label = document.createElement("label");
          label.textContent = folder.name; // Имя папки или другое поле
          li.appendChild(checkbox);
          li.appendChild(label);
          dropdownList.appendChild(li);
        });
      })
      .catch(error => {
        console.error('Ошибка загрузки списка папок:', error);
      });
  }

  // Проверим, что элементы существуют
  if (toggleListButton && saveButton && dropdownList) {
    toggleListButton.addEventListener("click", function() {
      dropdownList.classList.toggle("hidden");
      saveButton.classList.toggle("hidden");
      toggleListButton.classList.toggle("hidden");

      // Загрузить список папок, если он ещё не загружен
      fetchFolderList();
    });

    saveButton.addEventListener("click", function() {
      const checkboxes = dropdownList.querySelectorAll("input[type='checkbox']:checked");
      const selectedValues = Array.from(checkboxes).map(cb => cb.value);
      console.log("Выбранные элементы:", selectedValues); // Обработка выбранных значений

      // Скрыть список и кнопку "Готово"
      dropdownList.classList.add("hidden");
      saveButton.classList.add("hidden");
      toggleListButton.classList.remove("hidden");
    });
  }
});
