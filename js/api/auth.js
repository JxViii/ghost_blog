export async function getSession() {

  try{
    const res = await fetch("/api/auth");
    if(!res.ok) return { role: null, name: null };
    return await res.json();
  }catch(e){
    console.error("Couldn't check the session", e);
    return { role: null, name: null };
  }

}

export async function login(password) {

  const res = await fetch("/api/auth", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ password })
  });

  const data = await res.json().catch(() => ({}));
  return { ok: res.ok, status: res.status, ...data };

}

export async function logout() {
  await fetch("/api/auth", { method: "DELETE" });
}

// Only allow redirects back to a page of this same site
export function safeNext(next, fallback = "/") {
  try{
    const url = new URL(next, window.location.origin);
    if(url.origin !== window.location.origin) return fallback;
    return url.pathname + url.search + url.hash;
  }catch(e){
    return fallback;
  }
}

export function goToLogin() {
  const next = window.location.pathname + window.location.search;
  window.location.href = `/login.html?next=${encodeURIComponent(next)}`;
}
