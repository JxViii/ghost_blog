
import { uploadFile } from "/js/api/cloudinary.js" 
import { buildPostObject, postBlog, deleteBlog, handlePublish, handleSaveDraft } from "/js/editor/editor-actions.js";

const bodyGrid = document.querySelector(".body-grid");
const sideMenu = document.querySelector(".side-menu");
const featureImgWrapper = document.querySelector(".editor-feature-image")
const featureImgButton = document.getElementById("feature-image-button")
const featureImgInput = document.getElementById("feature-image-input")


function setUpUIButtons(){

  setUpSideMenuButton();
  setUpFeatureImage();
  setUpPostManagerButton();
  setUpPostBlogButton();
  setUpSaveDraft();

}

async function setUpSaveDraft(){

  document.addEventListener('keydown', async (e) => {
  if ( (e.key === 's' || e.key === 'S') && (navigator.platform.match('Mac') ? e.metaKey : e.ctrlKey)) {
    e.preventDefault();

    const post = await handleSaveDraft();
    
    console.log(post);
  }

});

}

function setUpPostBlogButton(){

  const postButton = document.getElementById("post");

  postButton.addEventListener("click", async () => {

    const post = await handlePublish();

    console.log("POSTED: ", post);

  })

}

function setUpPostManagerButton(){

  const button = document.getElementById("post-manager");
  console.log(button);

  button.addEventListener("click", () => {

    console.log("prev");
    window.location.href="/admin/post-manager.html";

  })

}

function setUpSideMenuButton(){

  const sideMenuButton = document.getElementById("menu");

  sideMenuButton.addEventListener("click", () => {

    bodyGrid.classList.toggle("open");
    sideMenu.classList.toggle("open");

  })

}

async function setUpFeatureImage(){

  featureImgButton.addEventListener("click", () => {
    console.log("c");
    featureImgInput.click();

  })

  featureImgInput.addEventListener("change", (e) => {

    const file = e.target.files[0];
    if(!file) return;

    console.log(file);

    getFeatureImage(file);

  })
}


async function getFeatureImage(file){

  const url = await uploadFile(file);
  if(url === -1){
    console.log("Error happened while fetching");
    return
  }

  featureImgButton.style.display = "none";

  console.log(url);

  featureImgWrapper.insertAdjacentHTML("beforeend", `
  
    <img src="${url}" alt="" id="feature-img">
    <input type="text" class="feature-image-caption" placeholder="Cover description...">

  `)

}

function deleteFeatureImage(url){

  const img = document.getElementById("feature-img");

  featureImgButton.style.display = "flex";

  featureImgWrapper.insertAdjacentHTML("beforeend", `
  
    <img src="${url}" alt="" id="feature-img">

  `);

}

setUpUIButtons();



