document.addEventListener("DOMContentLoaded", function() {
  const toggleListButton = document.getElementById("toggleListButton");
  const saveButton = document.getElementById("saveButton");
  const dropdownList = document.getElementById("dropdownList");
  const learnNewWordButton = document.getElementById("learnNewWordButton");

  // Function to fetch data from the server and update the list
  function fetchFolderList() {
    fetch('http://localhost:8080/folder/user?id=8')  // Replace with your API endpoint
      .then(response => response.json())
      .then(data => {
        dropdownList.innerHTML = '';  // Clear the current list

        data.forEach(folder => {
          const li = document.createElement("li");
          const checkbox = document.createElement("input");
          checkbox.type = "checkbox";
          checkbox.value = folder.id;
          checkbox.classList.add("folder-checkbox");  // Add a class for checkboxes
          
          const label = document.createElement("label");
          label.textContent = folder.name;  // Folder name or other field
          
          li.appendChild(checkbox);
          li.appendChild(label);
          dropdownList.appendChild(li);

          // Add event listener to update button text
          checkbox.addEventListener("change", updateToggleButtonText);

          // Check if the folder is already selected in the cache (localStorage)
          const selectedFolders = JSON.parse(localStorage.getItem('selected_folders')) || [];
          if (selectedFolders.includes(folder.id)) {
            checkbox.checked = true;
          }
        });
      })
      .catch(error => {
        console.error('Error loading folder list:', error);
      });
  }

  // Function to update the "Выбрано папок" button text
  function updateToggleButtonText() {
    const selectedCount = dropdownList.querySelectorAll("input[type='checkbox']:checked").length;
    toggleListButton.textContent = `Выбрано папок (${selectedCount})`;
  }

  // Function to save selected folders to localStorage
  function saveSelectedFolders() {
    const checkboxes = dropdownList.querySelectorAll("input[type='checkbox']:checked");
    const selectedValues = Array.from(checkboxes).map(cb => cb.value);
    localStorage.setItem('selected_folders', JSON.stringify(selectedValues));  // Save to localStorage
    console.log("Selected folders saved:", selectedValues);
  }

  // Ensure elements exist
  if (toggleListButton && saveButton && dropdownList && learnNewWordButton) {
    toggleListButton.addEventListener("click", function() {
      dropdownList.classList.toggle("hidden");
      saveButton.classList.toggle("hidden");
      toggleListButton.classList.toggle("hidden");
      learnNewWordButton.classList.toggle("hidden"); // Hide "Выучить новые слова" button

      // Load folder list if not already loaded
      fetchFolderList();
    });

    saveButton.addEventListener("click", function() {
      saveSelectedFolders();  // Save selected folders to localStorage

      dropdownList.classList.add("hidden");
      saveButton.classList.add("hidden");
      toggleListButton.classList.remove("hidden");
      learnNewWordButton.classList.remove("hidden"); // Show "Выучить новые слова" button again
      
      // Update button text after closing the list
      updateToggleButtonText();
    });

    document.getElementById("learnNewWordButton").addEventListener("click", function() {
      window.location.href = 'http://localhost:8083/learn_new_word.html?id=8';
  });
  }
});
