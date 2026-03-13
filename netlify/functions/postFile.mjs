export default async (request, context) => {

  const CLOUDINARY_URL = "https://api.cloudinary.com/v1_1/drowmvgkm/upload";
  const CLOUDINARY_UPLOAD_PRESET = "jxviii_blog";

  try{

    const body = await request.formData();
    const file = body.get("file");

    if (!file) {
      return Response.json({ success: 0, error: "No file received" }, { status: 400 });
    }

    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", CLOUDINARY_UPLOAD_PRESET);

    const res = await fetch(CLOUDINARY_URL,
      {
        method: "POST",
        body: formData
      }
    );

    if(!res.ok){
      return Response.json(
        {
          success: 0,
          error: "Couldn't upload the file",
          status: res.status,
          file: null
        }
      );
    }

    const data = await res.json();
    console.log(data.secure_url);


    return Response.json(
      {
        success: 1,
        error: null,
        file: {
          name: file.name,
          title: file.name,
          size: file.size,
          extensiom: file.name.split(".").pop(),
          url: data.secure_url
        },
        status: res.status
      }
    );
  }
  catch(err){
    return Response.json(
      {
        success: 0,
        error: "An error ocurring while connecting",
        file: null,
        status: 500
      }
    );
  }

}