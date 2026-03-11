import { getPosts } from "./api/blog-api.js";
import { getDate, getTags } from "./auxiliar.js";

const state = {
  posts: [],
  page: 1,
  perPage: 6,
};

const postGrid = document.querySelector(".blog-grid");
const pageInput = document.getElementById("blog-page");
const nextButton = document.getElementById("blog-next");

function getTotalPages() {
  return Math.max(1, Math.ceil(state.posts.length / state.perPage));
}

function clampPage(page) {
  const totalPages = getTotalPages();
  return Math.min(Math.max(1, Number(page) || 1), totalPages);
}

function getPaginatedPosts() {
  const start = (state.page - 1) * state.perPage;
  const end = start + state.perPage;
  return state.posts.slice(start, end);
}

function clearBlog() {
  postGrid.innerHTML = "";
}

function createPost(post) {
  const dateTag = getDate(post);
  const tagsMarkup = getTags(post.tags)
    .map(
      (tag) => `
        <div class="tag">
          <h3>${tag}</h3>
        </div>`
    )
    .join("");

  return `
    <article class="blog-item" data-url="${post.url}" style="--bg: url(${post.feature_image})">
      <div class="main-image">
        <div class="date-tag">
          <h3>${dateTag}</h3>
        </div>
        <h3>${post.title}</h3>
      </div>
      <div class="blog-info">
        <div class="blog-tags">${tagsMarkup}</div>
        <div class="blog-desc">
          <p>${post.excerpt}</p>
        </div>
      </div>
    </article>`;
}

function renderPosts() {
  clearBlog();

  const visiblePosts = getPaginatedPosts();

  if (!visiblePosts.length) {
    postGrid.innerHTML = `<p class="blog-empty">No posts found.</p>`;
    return;
  }

  const posts = visiblePosts.map(createPost).join("");
  postGrid.insertAdjacentHTML("beforeend", posts);
}

// sync the pagination button
function syncPaginationUI() {
  const totalPages = getTotalPages();
  pageInput.max = String(totalPages);
  pageInput.value = String(state.page);
  pageInput.placeholder = String(state.page);
  nextButton.disabled = state.page >= totalPages;
}

function updateView() {
  state.page = clampPage(state.page);
  renderPosts();
  syncPaginationUI();
}

function goToPage(page) {
  state.page = clampPage(page);
  updateView();
}

function goToNextPage() {
  goToPage(state.page + 1);
}

function setUpPagination() {
  nextButton.addEventListener("click", goToNextPage);

  pageInput.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
      goToPage(pageInput.value);
    }
  });
}

function setUpPostURLS() {
  postGrid.addEventListener("click", (event) => {
    const postItem = event.target.closest(".blog-item");
    if (!postItem) return;

    const { url } = postItem.dataset;
    if (!url) return;

    window.open(url, "_blank", "noopener,noreferrer");
  });
}

async function main() {
  try {
    const posts = await getPosts();
    state.posts = Array.isArray(posts) ? posts : [];
    updateView();
  } catch (error) {
    console.error("Could not initialize blog:", error);
    postGrid.innerHTML = `<p class="blog-empty">Could not load posts.</p>`;
  }
}

setUpPagination();
setUpPostURLS();
main();
