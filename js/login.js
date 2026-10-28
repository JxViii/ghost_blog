import { login, safeNext } from "/js/api/auth.js";

const form = document.getElementById("login-form");
const input = document.getElementById("login-password");
const errorMsg = document.getElementById("login-error");
const submit = document.getElementById("login-submit");

const next = safeNext(new URLSearchParams(window.location.search).get("next") ?? "/");

const errors = {
  401: "Wrong password.",
  429: "Too many attempts, try again in a few minutes.",
};

form.addEventListener("submit", async (event) => {
  event.preventDefault();
  errorMsg.textContent = "";
  submit.disabled = true;

  try{
    const res = await login(input.value);

    if(res.ok){
      // Admin pages need the admin password, readers go back to the site
      const isAdminPage = next.startsWith("/admin");
      window.location.href = (isAdminPage && res.role !== "admin") ? "/" : next;
      return;
    }

    errorMsg.textContent = errors[res.status] ?? "Something went wrong, try again later.";
    input.select();
  }catch(e){
    errorMsg.textContent = "Couldn't connect, try again later.";
  }finally{
    submit.disabled = false;
  }
});
