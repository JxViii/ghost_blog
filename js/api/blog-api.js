import { goToLogin } from "/js/api/auth.js";

// 401 = not logged in, 403 = logged in without enough access
function checkAuth(res){
  if(res.status === 401 || res.status === 403){
    goToLogin();
    return false;
  }
  return true;
}

export async function getPosts() {

  // Todos los posts
  const url = `/api/posts`;

  try{
    const res = await fetch(url);

    if(!res.ok){
      console.error("HTTP ERROR:", res.status);
      return;
    }

    const data = await res.json();
    return data.posts;
  }
  catch(err){
    console.error("Error: ", err);
    return;
  }

}

export async function getPostById(id){

  try{

    if(!id || typeof id !== "string"){
      console.error("Either no id was sent or the format isn't valid");
      return
    }

    const res = await fetch(`/api/post?id=${id}`)

    if(!checkAuth(res)) return;

    if(!res.ok){
      console.error("Error fetching data", res.status);
      return;
    }

    const data = await res.json();

    return data.post;

  }catch(e){
    console.error("Error fetching data", e);
    return;
  }

}

export async function uploadPost(post){

  try{

    if(!post){
      console.error("No post was attached");
      return;
    }

    const res = await fetch("/api/posts", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(post)
    })

    if(!checkAuth(res)) return;

    if(!res.ok){
      console.error("There was an issue posting this entry", res.status);
      return;
    }

    const data = await res.json();

    return data.post;

  }catch(e){
    console.error("There was an issue posting this entry", e);
    return;
  }

}

export async function updatePost(post){

  try{

    if(!post){
      console.error("No post was attached");
      return;
    }

    if(!post.id){
      console.error("The post has no ID");
      return;
    }

    const res = await fetch(`/api/post?id=${post.id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(post)
    })

    if(!checkAuth(res)) return;

    if(!res.ok){
      console.error("There was an issue updating this entry", res.status);
      return;
    }

    const data = await res.json();

    return data.post;

  }catch(e){
    console.error("There was an issue updating this entry", e);
    return;
  }

}

export async function deletePost(post){

  try{

    if(!post){
      console.error("No post was attached");
      return;
    }

    if(!post.id){
      console.error("The post has no ID");
      return;
    }

    const res = await fetch(`/api/post?id=${post.id}`, {
      method: "DELETE"
    })

    if(!checkAuth(res)) return;

    if(!res.ok){
      console.error("There was an issue deleting this entry", res.status);
      return;
    }

    return res.status;

  }catch(e){
    console.error("There was an issue updating this entry", e);
    return;
  }

}

export async function deleteAllPosts(){

  try{

    const res = await fetch(`/api/posts`, {
      method: "DELETE"
    })

    if(!checkAuth(res)) return;

    if(!res.ok){
      console.error("Couldn't delete all posts", res.status);
      return;
    }

    return res.status;

  }catch(e){
    console.error("Couldn't delete all posts", e);
    return;
  }

}