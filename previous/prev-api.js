const SUPER_SAFE_API_KEY = "c3cc24cdd9b08707949066832f";
const CLOUDINARY_API_KEY = "227754184868186";
const CLOUDINARY_API_SECRET = "HI-UL-f3lvoxL-nwR38TAixgWnw";
const CLOUDINARY_URL=`cloudinary://${CLOUDINARY_API_KEY}:${CLOUDINARY_API_SECRET}@drowmvgkm"`;
const base_url = "https://jxviii.ghost.io";

export async function getPosts() {

  // Todos los posts
  const url = `${base_url}/ghost/api/content/posts/?key=${SUPER_SAFE_API_KEY}&include=tags&include=authors`;

  try{
    const res = await fetch(url);

    if(!res.ok){
      console.error("HTTP ERROR:", res.status);
      return;
    }

    const data = await res.json();
    
    console.log(data.posts);
    
    return data.posts;
  }
  catch(err){
    console.error("Error: ", err);
    return;
  }

}