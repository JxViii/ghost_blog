import { getSession, goToLogin } from "/js/api/auth.js";

// Only for UX, the API is what actually rejects non admin requests
document.documentElement.style.visibility = "hidden";

const { role } = await getSession();
if(role === "admin") document.documentElement.style.visibility = "";
else goToLogin();
