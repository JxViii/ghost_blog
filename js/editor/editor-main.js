const params = new URLSearchParams(window.location.search);
const postId = params.get("id");

let existing_post = null;
if(postId)
  existingPost = await getPostById(postId);