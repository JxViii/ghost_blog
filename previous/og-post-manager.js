import {getPosts} from "./api.js"
import { getDate, getTags, getAllTags, contains, startsWith, getMainAuthor, dateComparisonBinary } from "./auxiliar.js"

async function loadPostsManager(posts){

  const postGrid = document.querySelector(".posts-grid");

  posts.forEach(post => {

    const date = getDate(post);
    const main_author = getMainAuthor(post.authors);
    
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
                By ${main_author} - ${date}
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

  setUpDateFilter();

  setUpSearchFilter();

}

function setUpSearchFilter(){

  const search_input = document.getElementById("filter-title");

  search_input.addEventListener("input", (event) => {

    const str = event.target.value.toLowerCase();

    const filtered = [...posts].filter(post => 
      startsWith(str, post.title)
    )

    current_posts = [...filtered];

    clearPosts();
    loadPostsManager(current_posts);
  })

}

function setUpDateFilter(){

  const date_button = document.getElementById("filter-date");
  const tags_menu = document.querySelector(".filter-tag-menu");
  const date_options = document.querySelectorAll(".filter-date-menu-item");
  const date_menu = document.querySelector(".filter-date-menu");

  date_button.addEventListener("click", () => {

    date_menu.classList.toggle("displayed");

    if(tags_menu.classList.contains("displayed"))
      tags_menu.classList.toggle("displayed");

    const current_opt_element = date_button.querySelector(".filter-opt");
    let current_opt = current_opt_element.textContent;

    date_options.forEach(opt => {
      if(opt.textContent !== current_opt 
      && opt.classList.contains("filtered"))
        opt.classList.toggle("filtered");

      if(opt.textContent === current_opt)
      opt.classList.add("filtered");
    })


  })

  date_options.forEach(opt => {

    const current_opt_element = date_button.querySelector(".filter-opt");
    let current_opt = current_opt_element.textContent;

    opt.addEventListener("click", (event) => {

      date_menu.classList.toggle("displayed");

      current_opt_element.textContent = opt.textContent;
      current_opt = current_opt_element.textContent;

      const filtered = [...current_posts];

      if(opt.id === "oldest")
        filtered.sort( filterByDateDes );
      else filtered.sort( filterByDateAsc );
      
      clearPosts();
      loadPostsManager(filtered);

    })

  })

}

function setUpTags(posts){

  const tags = getAllTags(posts);

  const filteringTags = [];

  const tags_menu = document.querySelector(".filter-tag-menu");
  const tags_button = document.getElementById("filter-tag");
  const date_menu = document.querySelector(".filter-date-menu");

  tags_button.addEventListener("click", () => {
    tags_menu.classList.toggle("displayed");

    if(date_menu.classList.contains("displayed"))
      date_menu.classList.toggle("displayed");

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

      let button_text = `Tags (${filteringTags.length})`;
      if(filteringTags.length === 0)
        button_text = "All Tags";

      tags_button.innerHTML=`${button_text} 
      <svg viewBox="0 0 26 17"><path d="M1.469 2.18l11.5 13.143 11.5-13.143" stroke-width="4" stroke="#0B0B0A" fill="none" stroke-linecap="round" stroke-linejoin="round"></path></svg>
      `;
      
      const filtered = filterByTags(posts, filteringTags);
      current_posts = filtered;

      clearPosts();
      loadPostsManager(current_posts);
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


    let matches = 0;

    post.tags.forEach(tag => {

      const res = contains(tag.name, cmp)

      if( res !== -1 ){
        matches++;
      }

    })

    if(matches === n_tags_to_match){
      filtered.push(post);
    }

  })

  return filtered;

}

function filterByDateAsc(a, b){

  return new Date(b.published_at) - new Date(a.published_at);

}

function filterByDateDes(a, b){

  return new Date(a.published_at) - new Date(b.published_at);

}

const posts = await getPosts();
let current_posts = [...posts];
loadPostsManager(current_posts);
setUpFilters(posts);