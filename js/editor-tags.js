const tagSelect = document.getElementById("tagSelect");
const tagSelectBox = document.getElementById("tagSelectBox");
const tagSelectChips = document.getElementById("tagSelectChips");
const tagSelectDropdown = document.getElementById("tagSelectDropdown");

const selectedTags = new Set(["HTML"]);

function renderTags() {
  tagSelectChips.innerHTML = "";

  if (selectedTags.size === 0) {
    const placeholder = document.createElement("div");
    placeholder.className = "tag-select-placeholder";
    placeholder.textContent = "Select tags";
    tagSelectChips.appendChild(placeholder);
  } else {
    selectedTags.forEach(tag => {
      const chip = document.createElement("div");
      chip.className = "tag-chip";

      const text = document.createElement("span");
      text.textContent = tag;

      const removeBtn = document.createElement("button");
      removeBtn.className = "tag-chip-remove";
      removeBtn.type = "button";
      removeBtn.textContent = "×";

      removeBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        selectedTags.delete(tag);
        updateOptions();
        renderTags();
      });

      chip.appendChild(text);
      chip.appendChild(removeBtn);
      tagSelectChips.appendChild(chip);
    });
  }
}

function updateOptions() {
  const options = tagSelectDropdown.querySelectorAll(".tag-option");

  options.forEach(option => {
    const value = option.dataset.value;
    option.classList.toggle("selected", selectedTags.has(value));
  });
}

function toggleDropdown() {
  tagSelect.classList.toggle("open");
}

tagSelectBox.addEventListener("click", toggleDropdown);

tagSelectDropdown.addEventListener("click", (e) => {
  const option = e.target.closest(".tag-option");
  if (!option) return;

  const value = option.dataset.value;

  if (selectedTags.has(value)) {
    selectedTags.delete(value);
  } else {
    selectedTags.add(value);
  }

  updateOptions();
  renderTags();
});

document.addEventListener("click", (e) => {
  if (!tagSelect.contains(e.target)) {
    tagSelect.classList.remove("open");
  }
});

renderTags();
updateOptions();