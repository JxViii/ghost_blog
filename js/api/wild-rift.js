export async function getWildRiftAnalysis() {

  // Todos los posts
  const url = `/.netlify/functions/coachinos`;

  try{
    const res = await fetch(url);

    if(!res.ok){
      console.error("HTTP ERROR:", res.status);
      return;
    }

    const { data } = await res.json();
    return data.files;
  }
  catch(err){
    console.error("Error: ", err);
    return;
  }

}