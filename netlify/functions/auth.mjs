import { getStore } from "@netlify/blobs";
import {
  findAccount, createSessionCookie, clearSessionCookie, getSession, isCrossSite, noStore
} from "../lib/auth.mjs";

export const config = {
  // This makes the function run on /api/auth
  path: "/api/auth",
};

const MAX_ATTEMPTS = 8;
const WINDOW_MS = 15 * 60 * 1000;

async function ipKey(ip) {
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(ip ?? "unknown"));
  return Array.from(new Uint8Array(digest), (b) => b.toString(16).padStart(2, "0")).join("");
}

export default async (request, context) => {

  switch(request.method){

    case "GET": {
      const session = await getSession(request);
      return Response.json(
        { role: session?.role ?? null, name: session?.name ?? null },
        { status: 200, headers: noStore }
      );
    }

    case "POST": {

      if(isCrossSite(request))
        return Response.json({ error: "Forbidden" }, { status: 403, headers: noStore });

      const attempts = getStore({ name: "login-attempts", consistency: "strong" });
      const key = await ipKey(context.ip);
      const now = Date.now();

      let record = await attempts.get(key, { type: "json" });
      if(!record || record.reset < now) record = { count: 0, reset: now + WINDOW_MS };

      if(record.count >= MAX_ATTEMPTS){
        const retryAfter = Math.ceil((record.reset - now) / 1000);
        return Response.json(
          { error: "Too many attempts, try again later" },
          { status: 429, headers: { ...noStore, "Retry-After": String(retryAfter) } }
        );
      }

      let password;
      try{
        ({ password } = await request.json());
      }catch(e){
        return Response.json({ error: "Invalid JSON" }, { status: 400, headers: noStore });
      }

      try{

        const account = await findAccount(password);

        if(!account){
          record.count++;
          await attempts.setJSON(key, record);
          return Response.json({ error: "Wrong password" }, { status: 401, headers: noStore });
        }

        await attempts.delete(key);
        return Response.json(
          { role: account.role, name: account.name },
          { status: 200, headers: { ...noStore, "Set-Cookie": await createSessionCookie(account) } }
        );

      }catch(e){
        console.error("Login failed:", e.message);
        return Response.json({ error: "Login is not configured" }, { status: 500, headers: noStore });
      }

    }

    case "DELETE": {
      return new Response(null, {
        status: 204,
        headers: { ...noStore, "Set-Cookie": clearSessionCookie() }
      });
    }

  }

  return Response.json({ error: "Not a valid HTTP Method" }, { status: 405 });
}
