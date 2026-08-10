//* https://www.googleapis.com/drive/v3/files?q='1L_ba5Uinxhb447Hd2bIQmFoD-5LWb6p9'+in+parents&fields=files(id,name,webViewLink)&key=AIzaSyAY-KuUygZBlxLvQEd7pzEWLMVCb13FSQE

export default async (request, context) => {

  const GOOGLE_API_KEY = Netlify.env.get("GOOGLE_API_KEY");
  const FOLDER_ID = "1L_ba5Uinxhb447Hd2bIQmFoD-5LWb6p9"
  const URL = `https://www.googleapis.com/drive/v3/files?q='${FOLDER_ID}'+in+parents&fields=files(id,name,webViewLink)&key=${GOOGLE_API_KEY}`

  if(!GOOGLE_API_KEY){
    return Response.json(
      {error: 'Missing GOOGLE_API_KEY'}, {status: 500}
    );
  }

  try{
    const res = await fetch(URL);

    if(!res.ok){
      console.error("Drive API error:", res.status, await res.text());
      return Response.json(
        {error: `Failed fetching data`}, {status: res.status}
      );
    }
    
    const data = await res.json();
    return Response.json({data});
  }
  catch(error){
    return Response.json(
      {error: 'Failed fetching data'}, {status:500}
    );
  }

}