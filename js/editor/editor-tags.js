import { getAllTagsF, getTagByID, getTagByName } from "/js/auxiliar.js";
import { getPosts } from "/js/api/blog-api.js"


const state = {
  tags: [],
  selected: document.querySelector(".selected-tags")
}

// function to help

function isTagInArray(tag, arr){

  for( const { name } of arr ){
    if(tag.name === name)
      return true;
  }

  return false;
}

export function getTagsFromEditor(){

  const tagsElement = document.querySelectorAll(".selected-tag-item");
  const tags = [];

  tagsElement.forEach( selectedTag => {
    const name = selectedTag.dataset.tag.replace("-"," ");
    const tag = getTagByName(state.tags, name);
    tags.push(tag);
  })

  return tags;
}

// tag actions

export function addTag(tag){

  state.selected.insertAdjacentHTML("beforeend", `
    <div class="selected-tag-item" data-tag="${tag.name.replace(/\s+/g,"-")}">${tag.name}</div>
  `);

  const tagElement = document.querySelector(`[data-tag="${tag.name.replace(/\s+/g,"-")}"`);
  tagElement.addEventListener("click", (e) => {
    const option = document.getElementById(`${tag.id}`);
    e.stopPropagation();
    tagElement.remove();
    option.classList.remove("selected");
  })

}

async function createTag(name){

  if(name === ""){
    alert("Tag needs to have a name");
    return;
  }

  const newTag = {
    id: crypto.randomUUID(),
    name : name
  }

  if(isTagInArray(newTag, state.tags)){
    alert("This tag is already created!");
    return;
  }

  state.tags.push(newTag);
  renderTags();
}

async function deleteTag(){



}

export function renderTags(){

  const subMenuTags = document.querySelector(".sub-menu-tags-wrapper");

  const tags = [...state.tags];

  const tagsHTML = tags.map( (tag) =>{

    const selectedTag = document.querySelector(`[data-tag=${tag.name.replace(/\s+/g,"-")}`);
    let selected = "";
    if(selectedTag?.dataset.tag.replace("-"," ") === tag.name) selected = "selected";

    return `<li class="sub-menu-tag-item ${selected}" id="${tag.id}">${tag.name}</li>`
  })
  .join("");

  console.log(tagsHTML);
  subMenuTags.innerHTML = tagsHTML;
  setUpTagsMenu();
}

function setUpTagsMenu(){

  const tagsList = document.querySelectorAll(".sub-menu-tag-item");
  console.log(tagsList);

  tagsList.forEach( tagLi => {

    const id = tagLi.id;
  
    console.log(id);

    tagLi.addEventListener("click", () => {

      const tag = getTagByID(state.tags, id);
      addTag(tag);
      tagLi.classList.add("selected");

    })

  })

}

// setting up elements

function setUpTags(){
  setUpTagInput();
  setUpTagsDiv();
}

function setUpTagInput(){

  const tagInput = document.getElementById("create-tag");
  tagInput.addEventListener("keydown", (e) => {

    if(e.key === "Enter"){
      const name = tagInput.value.trim();
      tagInput.value = "";
      createTag(name);
    }

  })
}

function setUpTagsDiv(){

  const tagsElement = document.querySelector(".selected-tags");
  const tagsOptions = document.querySelector(".sub-menu-tags");

  tagsElement.addEventListener("click", () => {
    tagsOptions.classList.toggle("open");
  })

}

const main = async () => {

  const posts = await getPosts();
  state.tags = getAllTagsF(posts);
  renderTags();
  setUpTags();
}


main();