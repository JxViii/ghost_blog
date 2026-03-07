import {getPosts} from "./api.js"
import {getDate, getTags} from "./auxiliar.js"


async function getVPosts(){
  const all_posts = await getPosts();

  return all_posts;
}

async function loadPosts(){

  // GetPosts() and load them
  const all_posts = await getVPosts();
  const n_posts = all_posts.length;

  console.log(all_posts);

  if(cap >= n_posts) cap = n_posts;
  if(start >= cap){
    if(cap < total) start = 0;
    else start = cap - total;
  }

  const posts = all_posts.slice(start,cap);
  const postGrid = document.querySelector(".blog-grid");
  let i = 0;

  posts.forEach(post => {

    const date_tag = getDate(post);

    const post_tags = post.tags;
    const tags = getTags(post_tags);

    postGrid.insertAdjacentHTML("beforeend",`<div class="blog-item" id="${post.id}" style="--bg: url(${post.feature_image})">
      <div class="main-image">
        <div class="date-tag">
          <h3>${date_tag}</h3>
        </div>
          <h3>${post.title}</h3>
      </div>
      <div class="blog-info">
        <div class="blog-tags">
        </div>
        <div class="blog-desc">
          <p>${post.excerpt}</p>
        </div>
      </div>
    </div>`);

    const blog_tags = postGrid.querySelectorAll(".blog-tags");
    tags.forEach(tag => {

      blog_tags[i].innerHTML += `
        <div class="tag">
          <h3>${tag}</h3>
        </div>
      `

    })

    const l_post = document.getElementById(post.id);

    l_post.addEventListener("click", () => {
      window.open(`${post.url}`, "_blank", "noopener,noreferrer");
    })

    ++i;

  });

}

function clearBlog(){
  const postGrid = document.querySelector(".blog-grid");

  postGrid.innerHTML=""
}

async function getPage(page){

  const posts = await getVPosts();
  const n = Math.ceil(posts.length / total);

  if(page > n) page = n;
  else if(page < 1) page = 1;
  cap = total * page;
  start = cap - total;

  blog_page.placeholder=`${page}`;
  blog_page.value=`${page}`;

  console.log(n, blog_page.placeholder, blog_page.value);

  clearBlog();
  loadPosts();

}

function nextPage(){
  page++;
  getPage(page);
}

async function setMaxPage(){

  const posts = await getVPosts();
  const n_posts = posts.length;

  const pages = Math.ceil(n_posts / cap);
  blog_page.max = `${pages}`;

}

let page = 1;
let total = 6;
let start = 0
let cap = 0;

const blog_page = document.getElementById("blog-page");

const next_button = document.getElementById("blog-next");
next_button.addEventListener("click", () => {
  nextPage();
});

const page_input = document.getElementById("blog-page");
page_input.addEventListener("keydown", (event) => {
  
  if(event.key === "Enter") getPage(page_input.value);

});

document.addEventListener("DOMContentLoaded", () => {
  setMaxPage();
})

getPage(page);