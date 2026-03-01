import {getPosts} from "./api.js"
import {getDate, getTags} from "./auxiliar.js"

async function loadPosts(){

  // GetPosts() and load them

  const posts = await getPosts();

  console.log(posts);

  const postGrid = document.querySelector(".blog-grid");

  let i = 0;

  posts.forEach(post => {

    const post_time = post.published_at.split('T');
    const date = post_time[0].split('-');

    const date_tag = getDate(date);

    const post_tags = post.tags;
    const tags = getTags(post_tags);

    console.log(tags);

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

      console.log(tag);

      blog_tags[i].innerHTML += `
        <div class="tag">
          <h3>${tag}</h3>
        </div>
      `

    })

    const l_post = document.getElementById(post.id);

    l_post.addEventListener("click", () => {
      console.log("c");
      window.open(`${post.url}`, "_blank", "noopener,noreferrer");
    })

    console.log(l_post, post.id, post.url);

    ++i;

  });

}

loadPosts();