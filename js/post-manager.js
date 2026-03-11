import { getPostsGhost } from "./api/ghost.js";
import { getPosts } from "./api/blog-api.js";
import { getDate, getAllTags } from "./auxiliar.js";

const state = {
  posts: [],
  search: "",
  selectedTags: [],
  order: "newest",
};

function loadPostsManager(postsToRender) {
  const postGrid = document.querySelector(".posts-grid");

  const cardsHTML = postsToRender
    .map((post) => {
      const date = getDate(post);
      const mainAuthor = post.author
      const tagsHTML = post.tags
        .map(
          (tag) => `
            <div class="post-tag">
              ${tag.name}
            </div>
          `
        )
        .join("");

      return `
        <div class="post-item" id="${post.id}" style="--bg: url(${post.feature_image})">
          <div class="post-wrapper">
            <div class="post-grid">
              <div class="post-img"></div>
              <div class="post-info">
                <h3 class="post-title">${post.title}</h3>
                <p class="post-date">By ${mainAuthor} - ${date}</p>
                <div class="post-tags">
                  ${tagsHTML}
                </div>
              </div>
            </div>
          </div>
        </div>
      `;
    })
    .join("");

  postGrid.innerHTML = cardsHTML;
}

function render() {
  const visiblePosts = applyFilters();
  loadPostsManager(visiblePosts);
}

function applyFilters() {
  let filtered = [...state.posts];

  if (state.search !== "") {
    filtered = filtered.filter((post) =>
      post.title.toLowerCase().includes(state.search)
    );
  }

  if (state.selectedTags.length > 0) {
    filtered = filtered.filter((post) => {
      const postTagNames = post.tags.map((tag) => tag.name);

      // AND filter: post must include all selected tags
      // .every() exists AAAAAAAAAAAAAAAAAAAAA
      return state.selectedTags.every((tag) => postTagNames.includes(tag));

    });
  }

  filtered.sort((a, b) => {
    if (state.order === "oldest") {
      return new Date(a.published_at) - new Date(b.published_at);
    }
    return new Date(b.published_at) - new Date(a.published_at);
  });

  return filtered;
}

function setUpFilters() {
  setUpSearchFilter();
  setUpTagsFilter();
  setUpDateFilter();
  setUpOutsideClick();
  setUpNewPost();
}

function setUpSearchFilter() {
  const searchInput = document.getElementById("filter-title");

  searchInput.addEventListener("input", (event) => {
    state.search = event.target.value.trim().toLowerCase();
    render();
  });
}

function setUpTagsFilter() {
  // localCompare() = a - b for String Values;
  const tags = getAllTags(state.posts).sort((a, b) => a.localeCompare(b));

  const tagsButton = document.getElementById("filter-tag");
  const tagsMenu = document.querySelector(".filter-tag-menu");
  const dateMenu = document.querySelector(".filter-date-menu");
  const tagsList = document.querySelector(".filter-tag-options");
  const tagsSearch = document.querySelector(".filter-tag-search");

  tagsList.innerHTML = tags
    .map((tag) => `<li class="displayed" data-tag="${tag}">${tag}</li>`)
    .join("");

  tagsButton.addEventListener("click", (event) => {
    event.stopPropagation();
    tagsMenu.classList.toggle("displayed");
    dateMenu.classList.remove("displayed");
  });

  tagsMenu.addEventListener("click", (event) => {
    event.stopPropagation();
  });

  tagsList.addEventListener("click", (event) => {
    const item = event.target.closest("li");
    if (!item) return;

    const tag = item.dataset.tag;
    const index = state.selectedTags.indexOf(tag);

    item.classList.toggle("filtered");

    if (index === -1) {
      state.selectedTags.push(tag);
    } else {
      state.selectedTags.splice(index, 1);
    }

    updateTagsButtonText();
    render();
  });

  tagsSearch.addEventListener("input", (event) => {
    const value = event.target.value.trim().toLowerCase();
    const items = tagsList.querySelectorAll("li");

    items.forEach((item) => {
      const tag = item.dataset.tag.toLowerCase();
      const shouldShow = tag.includes(value);
      item.classList.toggle("displayed", shouldShow);
    });
  });
}

function updateTagsButtonText() {
  const tagsButton = document.getElementById("filter-tag");

  const buttonText =
    state.selectedTags.length === 0
      ? "All Tags"
      : `Tags (${state.selectedTags.length})`;

  tagsButton.innerHTML = `
    ${buttonText}
    <svg viewBox="0 0 26 17"><path d="M1.469 2.18l11.5 13.143 11.5-13.143" stroke-width="4" stroke="#0B0B0A" fill="none" stroke-linecap="round" stroke-linejoin="round"></path></svg>
  `;
}

function setUpDateFilter() {
  const dateButton = document.getElementById("filter-date");
  const dateMenu = document.querySelector(".filter-date-menu");
  const tagsMenu = document.querySelector(".filter-tag-menu");
  const dateOptions = document.querySelectorAll(".filter-date-menu-item");
  const currentOptElement = dateButton.querySelector(".filter-opt");

  dateButton.addEventListener("click", (event) => {
    event.stopPropagation();
    dateMenu.classList.toggle("displayed");
    tagsMenu.classList.remove("displayed");
    updateDateMenuSelection();
  });

  dateMenu.addEventListener("click", (event) => {
    event.stopPropagation();
  });

  dateOptions.forEach((option) => {
    option.addEventListener("click", () => {
      state.order = option.id === "oldest" ? "oldest" : "newest";
      currentOptElement.textContent =
        state.order === "oldest" ? "Oldest first" : "Newest first";

      updateDateMenuSelection();
      dateMenu.classList.remove("displayed");
      render();
    });
  });
}

function updateDateMenuSelection() {
  const dateOptions = document.querySelectorAll(".filter-date-menu-item");

  dateOptions.forEach((option) => {
    const isSelected =
      (state.order === "newest" && option.id === "newest") ||
      (state.order === "oldest" && option.id === "oldest");

    option.classList.toggle("filtered", isSelected);
  });
}

// Wasn't on my previous version
function setUpOutsideClick() {
  document.addEventListener("click", () => {
    document.querySelector(".filter-tag-menu")?.classList.remove("displayed");
    document.querySelector(".filter-date-menu")?.classList.remove("displayed");
  });
}

function setUpNewPost(){

  const newPostButton = document.getElementById("new-post");

  newPostButton.addEventListener("click", () => {

    window.location.href="/admin/editor.html";

  })

}

async function main() {
  const posts = await getPosts();

  if (!posts || !Array.isArray(posts)) {
    console.error("Could not load posts.");
    return;
  }

  state.posts = posts;
  render();
  setUpFilters();
}

main();
