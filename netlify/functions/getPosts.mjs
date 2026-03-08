
const GHOST_URL = "https://jxviii.ghost.io";

export default async (request, context) => {

  const GHOST_API_KEY = Netlify.env.get("GHOST_API_KEY");

  try{
    const res = await fetch(`${GHOST_URL}/ghost/api/content/posts/?key=${GHOST_API_KEY}&include=tags&include=authors`)

    if(!res.ok){
      return Response.json(
        {error: `Failed fetching data ${GHOST_API_KEY}`}, {status: res.status}
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