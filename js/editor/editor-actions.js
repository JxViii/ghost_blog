import { editor } from "/js/editor/editor-setup.js"
import { getSlugFromTitle, getTagByName } from "/js/auxiliar.js"
import { updatePost, uploadPost, deletePost, deleteAllPosts, getPostById } from "/js/api/blog-api.js";
import { getTagsFromEditor, addTag, renderTags } from "/js/editor/editor-tags.js";
import toHTML from "/js/editor/jsonToHtml.js"

export async function buildPostObject(){

  const title = document.getElementById("editor-title").value.trim();
  const featureImage = document.getElementById("feature-img")?.src || null
  const excerpt = document.getElementById("side-menu-excerpt").value.trim();
  const slug = getSlugFromTitle(title);
  const editorData = await editor.save();
  const tags = getTagsFromEditor();

  const { blocks } = editorData;

  const html = blocks.map( obj => handleBlock(obj) ).join("\n");

  const post = {
    title: title,
    feature_image: featureImage,
    excerpt: excerpt || "There is no description for this post",
    editor_data: editorData,
    html: html,
    author: "JxViii",
    tags: tags,
    slug: slug
    // url: `/blog/${slug}`
  };

  return post;

}

export function getIdURL() {
  return new URLSearchParams(window.location.search).get("id");
}

export function setEditorURL(id) {
  window.history.replaceState({}, "", `/admin/editor.html?id=${id}`);
}

export function updateSaveState(status = "clear"){
  
  const saveState = document.querySelector(".save-state");
  let msg = "";

  if(status === "clear"){
    msg = "";
  }
  else if( !status ){
    msg = "Couldn't be saved !";
  }
  else if(status === "published" || status === "draft"){
    const statusCapitalized = status.charAt(0).toUpperCase() + status.slice(1);
    msg = `Saved - ${statusCapitalized}`;
  }
  else if("need-save"){
    msg = "Save the post before previewing";
  }

  saveState.innerText = msg;
}

export function deleteEditorURL() {
  window.history.replaceState({}, "", `/admin/editor.html`);
}

export async function savePost(status = "draft"){

    if(status === "published"){
      const title = document.getElementById("editor-title");
      if (title.value.trim() === "") {
        console.log("Title is empty!");
        return;
      }
    }

    const post = await buildPostObject();
    post.status = status;

    const postId = getIdURL();

    let savedPost;

    if (postId) {
      post.id = postId;
      savedPost = await updatePost(post);
    } else {
      savedPost = await uploadPost(post);
      if (savedPost?.id) {
        setEditorURL(savedPost.id);
      }
    }

    if(savedPost){
      updateSaveState(status);
      return savedPost;
    }

    updateSaveState(null);
    return null;
}

export async function loadPost(){

  const id = getIdURL();

  if(!id) return;

  const post = await getPostById(id);

  if(!post){
    console.error("No post with this id");
    return;
  }

  const { title,
          feature_image,
          editor_data,
          excerpt,
          tags
  } = post;

  const titleElement = document.getElementById("editor-title");

  if (title)
    titleElement.value = title;

  console.log(feature_image);
  if (feature_image){

    const featureImgWrapper = document.querySelector(".editor-feature-image")
    const featureImgButton = document.getElementById("feature-image-button")

    featureImgButton.style.display = "none";

    featureImgWrapper.insertAdjacentHTML("beforeend", `
    
      <img src="${feature_image}" alt="" id="feature-img">
      <button id="delete-feature-img">✖</button>
      <input type="text" class="feature-image-caption" placeholder="Cover description...">

    `)

    const deleteFeatureImageButton = document.getElementById("delete-feature-img");

    deleteFeatureImageButton.addEventListener("click", async ()=> {
      deleteFeatureImage();
    });
  }

  if(excerpt){

    const excerptElement = document.getElementById("side-menu-excerpt");

    excerptElement.value = excerpt;

  }

  if(tags){

    tags.forEach( tag => addTag(tag) );

  }

  if (editor_data){
    await editor.isReady;
    await editor.render(editor_data);
  }

}

async function clearPost(){

  const titleElement = document.getElementById("editor-title");

  titleElement.value = "";

  deleteFeatureImage();

  await editor.isReady;
  await editor.clear();

}
/*
  Images
*/
export function deleteFeatureImage(){

  const featureImgButton = document.getElementById("feature-image-button")
  const featureImage = document.getElementById("feature-img");
  const featureImageCaption = document.querySelector(".feature-image-caption");
  const deleteFeatureImageButton = document.getElementById("delete-feature-img");

  featureImage?.remove();
  featureImageCaption?.remove();
  deleteFeatureImageButton?.remove();

  featureImgButton.style.display = "flex";
}

/*
  Button Handlers
*/
export async function handlePublish() {
  return await savePost("published");
}

export async function handleSaveDraft() {
  return await savePost("draft");
}

export async function handleDelete() {
  const postId = getIdURL();

  if (!postId) {
    console.error("No post ID in URL");
    return false;
  }

  const deleted = await deletePost({ id: postId });

  if(deleted !== 204)
    return false;

  deleteEditorURL();
  await clearPost();
  updateSaveState("clear");
  return deleted === 204;
}

export function handlePreview() {
  
  const postId = getIdURL();

  if (!postId){
    updateSaveState("need-save");
    return null;
  }

  const url = `/blog/post?id=${postId}`

  window.open(url, "_blank", "noopener,noreferrer");

  return url;

}

/*
  Editor JS to HTML
*/

function handleBlock(obj){

  switch(obj.type){

    case "header":
      return toHTML.methods.makeHeading(obj);
    case "paragraph":
      return toHTML.methods.makeParagraph(obj);
    case "list":
      return toHTML.methods.makeList(obj);
    case "ghostQuote":
      return toHTML.methods.makeGhostQuote(obj);
    case "code":
      return toHTML.methods.makeCode(obj);
    case "delimiter":
      return toHTML.methods.makeDelimiter(obj);
    case "image":
      return toHTML.methods.makeImage(obj);
    case "attaches":
      return toHTML.methods.makeFile(obj);
    case "embed":
      return toHTML.methods.makeEmbed(obj);
  }

}

/*
  Test feature only to reset the blop
*/
export async function deleteAllBlogs(blog){

  const status = await deleteAllPosts();
  return status === 204;

}