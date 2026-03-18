import { getPostById } from "/js/api/blog-api.js";
import { getMonth } from "/js/auxiliar.js"

const blogTitle = document.querySelector(".blog-header-title");
const blogFeatureImg = document.querySelector(".blog-header-feature-image");
const blogDate = document.querySelector(".blog-header-date");
const blogAuthors = document.querySelector(".blog-header-authors");
const blogExcerpt = document.querySelector(".blog-header-excerpt");
const blogTags = document.querySelector(".blog-header-tags");
const blogContent = document.querySelector(".blog-content");


const getFullDate = (isoString) => {

  const isoDate = isoString.split("T")[0].split("-");
  const isoTime = isoString.split("T")[1];

  let fullDate = `${isoDate[2]} ${getMonth(parseInt(isoDate[1]))} ${isoDate[0]} - ${isoTime.split(".")[0]}`;

  return fullDate;

}

const main = async () => {

  const id = new URLSearchParams(window.location.search).get("id");
  if(!id){
    console.log("There is no ID!");
    return;
  }

  const post = await getPostById(id);
  const {
    title,
    excerpt,
    feature_image,
    author,
    tags,
    published_at,
    html
  } = post;

  blogTitle.textContent = title;
  blogDate.textContent = getFullDate(published_at);
  blogAuthors.insertAdjacentHTML("beforeend",
    `<h3 class="blog-header-author--item">${author}</h3>`
  )
  blogExcerpt.textContent = excerpt;
  blogTags.insertAdjacentHTML("beforeend", tags.map( tag => 
    `<li class="blog-header-tag--item">${tag.name}</li>`
  ).join(""));
  blogFeatureImg.style.setProperty("--img", `url(${feature_image})`);
  blogContent.innerHTML = html;

}

main();