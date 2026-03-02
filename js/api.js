const SUPER_SAFE_API_KEY = "c3cc24cdd9b08707949066832f"
const base_url = "https://jxviii.ghost.io"

export async function getPosts() {

  // Todos los posts
  const url = `${base_url}/ghost/api/content/posts/?key=${SUPER_SAFE_API_KEY}&include=tags`;

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