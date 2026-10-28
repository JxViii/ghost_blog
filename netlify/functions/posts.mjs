import { getStore } from "@netlify/blobs";
import { getSession, requireRole, noStore } from "../lib/auth.mjs";

export const config = {
  // This makes the function run on /api/posts
  path: "/api/posts",
};

// Card data shown to everyone, everything except the content itself
const toCard = ({ editor_data, html, url, ...card }) => card;

export default async (request, context) => {

  const uploads = getStore("posts");

  if(request.method !== "GET"){
    const denied = await requireRole(request, "admin");
    if(denied) return denied;
  }

  switch(request.method) {

    case "GET": {

      const session = await getSession(request);
      const isAdmin = session?.role === "admin";

      const { blobs } = await uploads.list();
      const posts = [];
      
      for(const { key } of blobs) {
        const post = await uploads.get(key, {type: "json"});
        if( !post ) continue;
        // Drafts are only visible to the admin
        if( !isAdmin && post.status !== "published" ) continue;
        posts.push(session ? { ...toCard(post), url: post.url } : toCard(post));
      }

      return Response.json({
        posts,
        status: 200
      }, { headers: noStore })

    }

    case "POST": {

      try{

        const body = await request.json();

        const {
          title,
          feature_image = null,
          excerpt = null,
          editor_data,
          html = "",
          author = "JxViii",
          tags = [],
          status,
          slug,
          experience_date,
        } = body;


        if (!title || !editor_data) {
          return new Response("Missing required fields: title or editor_data", {
            status: 400
          });
        }

        const { blobs } = await uploads.list();
        for( const { key } of blobs ){
          const post = await uploads.get(key, { type: "json"});
          if(post?.slug === slug)
            return Response.json(
              { error: "A post with this slug already exists" },
              { status: 409 }
            );
        }

        const now = new Date().toISOString();
        const id = crypto.randomUUID();

        const post = {
          id: id,
          title,
          slug,
          url: `/blog/post?id=${id}`,
          feature_image,
          excerpt,
          editor_data,
          html,
          author,
          tags,
          status,
          experience_date: experience_date,
          created_at: now,
          updated_at: now,
          published_at: status === "published" ? now : null
        };

        const { modified } = await uploads.setJSON(id, post);

        if(!modified)
          return Response.json({
            error: "Failed uploads.setJson()",
            status: 400
          }) 

        return Response.json({message: "Post Created", post},{status: 201})

      }catch(e){

        return new Response("Invalid JSON", {status: 400});

      }

    }

    case "DELETE":{

      const n = await uploads.deleteAll();
      if(n > 0)
        return new Response(
          `Couldn't delete all posts : Number of posts deleted : ${n}`,
          { status: 400 }
        )
      return new Response(null, { status: 204 });
    }

  }

  return new Response("Not a valid HTTP Method here", { status: 405 });
}