import assert from "node:assert/strict";
import type { TestContext } from "node:test";
import { IncomingMessage, ServerResponse } from "node:http";
import { Socket } from "node:net";
import { createRequire } from "node:module";
import { USER_ID, MEDIA_ID, UPLOAD_ID } from "./community-v3.ts";
const { sealData } = createRequire(import.meta.resolve("@pieaistudio/swimmer-auth-kit"))("iron-session") as { sealData(data: unknown, options: {password: string; ttl: number}): Promise<string> };
/** Installed AuthKit verifies a synthetic encrypted grant via a fully isolated fetch. No account/credential writes. */
export async function communityAuthFixture(t: TestContext) {
  const origin = "https://party.example.test", backend = "https://backend.example.test", issuer = `${backend}/auth/v1`;
  const password = "synthetic-community-cookie-password-not-a-secret", clientId = "00000000-0000-4000-8000-000000000001";
  const sessionId = "00000000-0000-4000-8000-000000000021";
  const claims = { iss: issuer, aud: "authenticated", sub: USER_ID, session_id: sessionId, client_id: clientId, role: "authenticated", exp: Math.floor(Date.now()/1000)+3600, aal: "aal1" };
  const token = `${Buffer.from('{"alg":"ES256"}').toString("base64url")}.${Buffer.from(JSON.stringify(claims)).toString("base64url")}.synthetic-not-signed`;
  const config = { ACCOUNT_MODE: "swimmer", ASSET_STORE: "blob", GUEST_LIMITER: "vercel", NEXT_PUBLIC_COMMUNITY_MODE: "on", SWIMMER_ORIGIN: origin, SWIMMER_BACKEND_URL: backend, SWIMMER_PUBLISHABLE_KEY: "sb_publishable_community_synthetic", SWIMMER_COOKIE_PASSWORD: password, SWIMMER_OAUTH_CLIENT_ID: clientId, SWIMMER_ACCOUNT_URL: "https://accounts.example.test" };
  const before = Object.fromEntries(Object.keys(config).map(key => [key,process.env[key]])); Object.assign(process.env,config);
  t.after(() => { for (const [key,value] of Object.entries(before)) { if (value === undefined) delete process.env[key]; else process.env[key] = value; } });
  const sealed = await sealData({ grant: { version: 1, issuer, clientId, origin, userId: USER_ID, sessionId, accessToken: token, refreshToken: "synthetic-unused-refresh" } },{ password,ttl:86400 });
  const cookie = `__Host-swimmerparty-session-sso=${sealed}`;
  const state = { owner: false, revoked: false, malformed: false, mediaDenied: false, writes: [] as { path: string; body: Record<string,unknown>; authorization: string|null; origin: string|null }[] };
  t.mock.method(globalThis,"fetch",async (input: RequestInfo|URL,init?: RequestInit) => {
    const req = new Request(input,init),url=new URL(req.url); assert.equal(url.origin,backend,"Never contact a real backend");
    const authorization = req.headers.get("authorization");
    if (url.pathname === "/auth/v1/user") {
      assert.equal(authorization,`Bearer ${token}`);
      return state.revoked ? Response.json({code:"user_not_found"},{status:401,headers:{"x-supabase-api-version":"2024-01-01"}}) : Response.json({id:USER_ID,aud:"authenticated",role:"authenticated",is_anonymous:false,user_metadata:{},app_metadata:{provider:"email"},factors:[]});
    }
    assert.equal(req.method,"POST"); const body=await req.json() as Record<string,unknown>;
    state.writes.push({path:url.pathname,body,authorization,origin:req.headers.get("origin")});
    if (url.pathname === "/rest/v1/rpc/list_review_queue") {
      if (!state.owner || authorization !== `Bearer ${token}`) return Response.json({code:"PT403",message:"OWNER_REQUIRED"},{status:403});
      return Response.json(state.malformed ? {token:"must-not-leak"} : {posts:[],hasMore:false,nextCursor:null});
    }
    const fail=(code:string,status:number)=>Response.json({error:{code,retryable:false,requestId:"synthetic-request"}},{status});
    if (url.pathname === "/functions/v1/swimmer-party-media-preview") {
      if (state.mediaDenied) return fail("MEDIA_UNAVAILABLE",404);
      assert(["read","review"].includes(String(body.mode))); assert.equal(body.mediaId,MEDIA_ID);
      return Response.json({mediaId:MEDIA_ID,url:`${backend}/storage/v1/object/sign/swimmer-party-media/derived/fixture.png?token=synthetic`,mime:"image/png",expiresInSeconds:300});
    }
    assert.equal(authorization,`Bearer ${token}`,"Mutations must use the verified user's token, never a publishable/service key");
    if (url.pathname === "/functions/v1/swimmer-party-upload-target") return Response.json({uploadId:UPLOAD_ID,uploadUrl:`${backend}/storage/v1/object/upload/sign/fixture`,uploadUrlExpiresAt:new Date(Date.now()+300000).toISOString(),expiresAt:new Date(Date.now()+900000).toISOString()});
    if (url.pathname === "/functions/v1/swimmer-party-upload-complete") return Response.json({uploadId:UPLOAD_ID,mediaId:MEDIA_ID,status:"completed",processingStatus:"ready"});
    throw Error(`Unexpected synthetic destination ${url.pathname}`);
  });
  function nodeRequest(member=true) { const socket=new Socket();t.after(()=>socket.destroy());const req=new IncomingMessage(socket);req.method="POST";req.url="/api/community";req.headers={host:new URL(origin).host,origin,...(member?{cookie}:{})};return {req,res:new ServerResponse(req)}; }
  return {origin,backend,cookie,token,state,nodeRequest};
}
