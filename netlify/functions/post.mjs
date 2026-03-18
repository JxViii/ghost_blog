import { getStore } from "@netlify/blobs";

export const config = {
  // This makes the function run on /api/post
  path: "/api/post",
};

const uploads = getStore("posts");

export default async (request, context) => {

  const url = new URL(request.url);
  const id = url.searchParams.get("id");

  if(!id)
    return Response.json({
      error: "id parameter not found",
      status: 400
    })

  switch(request.method){

    case "GET": {

      const post = await uploads.get(id, {type: "json"});
      if(post === null) return Response.json({
        error: "Post not found",
        status: 404
      })
      return Response.json(
        { post },
        { status: 200 }
      )

    }
    case "PUT": {

      const existing_post = await uploads.get(id, {type: "json"});
      if(!existing_post) return Response.json({
        error: "Post not found",
        status: 404
      })

      const body = await request.json();
      const updated = {
        ...existing_post,
        ...body,
        id: existing_post.id,
        url: `/blog/post?id=${id}`,
        created_at: existing_post.created_at,
        updated_at: new Date().toISOString(),
        published_at:
          existing_post.published_at ?? (body.status === "published" ? new Date().toISOString() : null)
      };
      await uploads.setJSON(id, updated);
      return Response.json(
        { message: "Post updated", post: updated },
        { status: 201 }
      );

    }
    case "DELETE": {

      const existing_post = await uploads.get(id, {type: "json"});
      if(!existing_post) return Response.json({
        error: "Post not found",
        status: 404
      })

      await uploads.delete(id);
      return new Response(null, { status: 204 });
    }

  }

  return Response.json({
    error: "Not a valid HTTP Method",
    status: 405
  })

}