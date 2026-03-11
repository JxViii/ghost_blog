import { editor } from "/js/editor/editor-setup.js"
import { getSlugFromTitle } from "/js/auxiliar.js"
import { updatePost, uploadPost, deletePost, deleteAllPosts } from "../api/blog-api";

export async function buildPostObject(existing_post){

  const title = document.getElementById("editor-title").value.trim();
  const featureImage = document.getElementById("feature-img")?.src || null
  const slug = getSlugFromTitle(title);
  const editorData = await editor.save();

  const post = {
    title: title,
    feature_image: featureImage,
    excerpt: null,
    editor_data: editorData,
    html: "",
    author: "JxViii",
    tags: [],
    status: existing_post?.status ?? "draft",
    slug: slug,
    url: `/blog/${slug}`
  };

  return post;

}

export async function postBlog(existing_post, toPost){

  const post = await buildPostObject(existing_post);
  post.status = (toPost) ? "published" : "draft";

  const res = (!existing_post) ? await uploadPost(post) : await updatePost(post);
  if(res) return true;

  post.status = "draft"
  return false;

}

export async function deleteBlog(existing_post){

  const post = await buildPostObject();
  post.id = getIdURL();

  if(!post.id)
    return false;

  const { status } = await deletePost(post);
  if(status === 204) return true;
  return false;

}

export function getIdURL() {
  return new URLSearchParams(window.location.search).get("id");
}

export function setEditorURL(id) {
  window.history.replaceState({}, "", `/editor.html?id=${id}`);
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

    console.log(savedPost);
    return savedPost ?? null;
}

// handlers
export async function handlePublish() {
  return await savePost("published");
}

export async function handleSaveDraft() {
  return await savePost("draft");
}

export async function handleDelete() {
  const postId = getPostIdFromUrl();

  if (!postId) {
    console.error("No post ID in URL");
    return false;
  }

  const deleted = await deletePost({ id: postId });
  return deleted === 204;
}

/*
  Test feature only to reset the blop
*/
export async function deleteAllBlogs(blog){

  const status = await deleteAllPosts();
  return status === 204;

}