export async function getPostsGhost() {

  // Todos los posts
  const url = `/.netlify/functions/ghost-posts`;

  try{
    const res = await fetch(url);

    if(!res.ok){
      console.error("HTTP ERROR:", res.status);
      return;
    }

    const { data } = await res.json();
    return data.posts;
  }
  catch(err){
    console.error("Error: ", err);
    return;
  }

}