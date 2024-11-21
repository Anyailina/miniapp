
document.addEventListener("DOMContentLoaded", function() {
  const toggleListButton = document.getElementById("toggleListButton");
  const saveButton = document.getElementById("saveButton");
  const dropdownList = document.getElementById("dropdownList");
  const learnNewWordButton = document.getElementById("learnNewWordButton");
  const repeatWordButton = document.getElementById("repeatWordButton");
  const params = new URLSearchParams(window.location.search);
  let id = params.get('id');

  
  // Ensure the elements exist before using them
  if (toggleListButton && saveButton && dropdownList && learnNewWordButton && repeatWordButton) {
    let selectedFolders = JSON.parse(localStorage.getItem('selected_folders'));
    let selectedCount = selectedFolders ? selectedFolders.length : 0;
    toggleListButton.textContent = `Выбрано папок (${selectedCount})`;

  


    async function fetchFolderList() {
    
      fetch(`https://previously-true-fly.ngrok-free.app/folder/user?id=${id}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'ngrok-skip-browser-warning': 'true',
        },
      })
        .then(response => response.json())
        .then(data => {
          if (Array.isArray(data)) {
            dropdownList.innerHTML = '';  // Clear the current list
            data.forEach(folder => {
              const li = document.createElement("li");
              const checkbox = document.createElement("input");
              checkbox.type = "checkbox";
              checkbox.value = folder.id;
              checkbox.classList.add("folder-checkbox");
        
              const label = document.createElement("label");
              label.textContent = folder.name;  // Folder name or other field
        
              li.appendChild(checkbox);
              li.appendChild(label);
              dropdownList.appendChild(li);
        
              checkbox.addEventListener("change", updateToggleButtonText);
        
              const selectedFolders = JSON.parse(localStorage.getItem('selected_folders')) || [];
              if (selectedFolders.includes(folder.id.toString())) {
                checkbox.checked = true;
                selectedCount++;
              }
            });
          } else {
            console.error('Expected an array, but received:', data);
          }
        })
        .catch(error => {
          console.error('Error fetching folder list:', error);
        });
    }


    function updateToggleButtonText() {
      selectedCount = dropdownList.querySelectorAll("input[type='checkbox']:checked").length;
      toggleListButton.textContent = `Выбрано папок (${selectedCount})`;
    }

    function saveSelectedFolders() {
      const checkboxes = dropdownList.querySelectorAll("input[type='checkbox']:checked");
      const selectedValues = Array.from(checkboxes).map(cb => cb.value);
      localStorage.setItem('selected_folders', JSON.stringify(selectedValues));
      console.log("Selected folders saved:", selectedValues);
    }

    toggleListButton.addEventListener("click", function() {
      dropdownList.classList.toggle("hidden");
      saveButton.classList.toggle("hidden");
      toggleListButton.classList.toggle("hidden");
      learnNewWordButton.classList.toggle("hidden");
      repeatWordButton.classList.toggle("hidden");

      fetchFolderList();
    });

    saveButton.addEventListener("click", function() {
      saveSelectedFolders();

      dropdownList.classList.add("hidden");
      saveButton.classList.add("hidden");
      toggleListButton.classList.remove("hidden");
      learnNewWordButton.classList.remove("hidden");
      repeatWordButton.classList.remove("hidden");

      updateToggleButtonText();
    });

    learnNewWordButton.addEventListener("click", function() {
      const params = new URLSearchParams(window.location.search);
    let id = params.get('id');
      if (selectedFolders.length > 0) {
        window.location.href = `/learn_new_word.html?id=${id}`;
      }
    });

    repeatWordButton.addEventListener("click", function() {
      const params = new URLSearchParams(window.location.search);
      let id = params.get('id');
      let selectedFolders = JSON.parse(localStorage.getItem('selected_folders')) || [];
      if (selectedFolders.length > 0) {
        window.location.href = `/repeat_word.html?id=${id}`;
      }
    });
  }
})

