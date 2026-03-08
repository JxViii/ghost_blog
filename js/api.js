export async function getPosts() {

  // Todos los posts
  const url = `/.netlify/functions/getPosts`;

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

export async function uploadFile(file){

  const url = `/.netlify/functions/postImage`;

  const formData = new FormData();

  formData.append("image", file);

  try{
    const res = await fetch(url, {
      method:"POST",
      body: formData
    });

    if(!res.ok){
      console.error("Upload failed: ", res.status);
      return -1;
    }

    const { success , error, status, file } = await res.json();

    if(!res.ok || !success){
      console.error(error, status);
      return -1;
    }

    return file.url;

  }
  catch(err){
    console.error("Upload failed: ", err);
    return -1;
  }

}