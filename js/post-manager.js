import {getPosts} from "./api.js"
import { getDate, getTags, getAllTags, contains, startsWith } from "./auxiliar.js"

async function loadPostsManager(posts){

  const postGrid = document.querySelector(".posts-grid");

  posts.forEach(post => {

    const date = getDate(post);
    
    postGrid.insertAdjacentHTML("beforeend", `
      
      <div class="post-item" id="${post.id}" style="--bg: url(${post.feature_image})">
        <div class="post-wrapper">
          <div class="post-grid">
            <div class="post-img">
            </div>
            <div class="post-info">
              <h3 class="post-title">
                ${post.title}
              </h3>
              <p class="post-date">
                By {username} - ${date}
              </p>
              <div class="post-tags">
              </div>
            </div>
          </div>
        </div>
      </div>
  
    `);

    const post_element = document.getElementById(post.id);
    const post_tags_element = post_element.querySelector(".post-tags");

    const post_tags = getTags(post.tags);

    post_tags.forEach(tag => {
      
      post_tags_element.innerHTML += `
        <div class="post-tag">
          ${tag}
        </div>
      `

    });

  });

}

function clearPosts(){

  const postGrid = document.querySelector(".posts-grid");
  postGrid.innerHTML="";

}

function setUpFilters(posts){

  setUpTags(posts);

}

function setUpTags(posts){

  const tags = getAllTags(posts);

  const filteringTags = [];

  const tags_menu = document.querySelector(".filter-tag-menu");
  const tags_button = document.getElementById("filter-tag");

  tags_button.addEventListener("click", () => {
    tags_menu.classList.toggle("displayed");
  })

  const tags_list = document.querySelector(".filter-tag-options");

  tags_list.innerHTML="";

  tags.forEach(tag => {
    tags_list.insertAdjacentHTML("beforeend",
    `
      <li class="displayed">${tag}</li>  
    `)
  })

  const tags_li_elements = document.querySelectorAll(".filter-tag-options li")

  tags_li_elements.forEach(li => {

    li.addEventListener("click", () => {

      const tag = li.textContent;

      li.classList.toggle("filtered");

      const pos = contains(tag, filteringTags);
      if(pos === -1)  filteringTags.push(li.textContent);
      else filteringTags.splice(pos, 1);

      tags_button.innerHTML=`Tags (${filteringTags.length})`;
      
      const filtered = filterByTags(posts, filteringTags);

      clearPosts();
      loadPostsManager(filtered);
    })

  })

  const tags_search = document.querySelector(".filter-tag-search");

  tags_search.addEventListener("input", (event) => {

    const str = event.target.value.toLowerCase();

    const new_tags = tags.filter(tag => startsWith(str, tag));

    console.log(new_tags);

    loadFilterTags(tags_li_elements, new_tags);

  })

}

function loadFilterTags(tags_li, new_tags){

  tags_li.forEach(li => {

    const tag = li.textContent;

    const res = contains(tag, new_tags);
    console.log(new_tags, tag, res);

    if( res === -1 && li.classList.contains("displayed")){
      li.classList.remove("displayed");
    }
    else if( res !== -1 && !(li.classList.contains("displayed")))
      li.classList.add("displayed");

  })

}

function filterByTags(v, cmp){

  const filtered = [];
  const n_tags_to_match = cmp.length;

  v.filter(post => {

    console.log(`Checking for ${post.title}`);

    let matches = 0;

    post.tags.forEach(tag => {

      const res = contains(tag.name, cmp)

      if( res !== -1 ){
        console.log(`Found ${tag.name} == ${cmp[res]}`)
        matches++;
      }

    })

    if(matches === n_tags_to_match){
      console.log(`Matches ${matches} == ${n_tags_to_match}`)
      filtered.push(post);
    }

  })

  return filtered;

}

const posts = await getPosts();
loadPostsManager(posts);
setUpFilters(posts);