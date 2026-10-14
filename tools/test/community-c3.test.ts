import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { communityMode, isCommunityPage } from "../../src/contracts/community-access.ts";
import { errorStatus } from "../../src/contracts/community.ts";
import { createCommunityEdge, edgeContracts } from "../../src/features/community/server/edge.ts";
import { remoteContext } from "../../src/features/community/server/context.ts";
import { createCapabilityRoute, createAccessRoute } from "../../src/features/community/server/capabilities.ts";
import { communityPageAccess } from "../../src/features/community/server/page-access.ts";
import { requireCommunityAudience } from "../../src/features/community/server/access.ts";
import { collectActorVotes } from "../../src/features/community/server/leaderboard.ts";
import { CommunityError } from "../../src/features/community/errors.ts";
import { OP_ID, USER_ID, MEDIA_ID, UPLOAD_ID } from "./fixtures/community-v3.ts";
import { communityAuthFixture } from "./fixtures/community-auth.ts";
import { apiRequest,apiResponse,withEnvironment } from "./fixtures/api.ts";

test("three rollout states are exact; retired boolean and unknown values fail closed",()=>{
  for(const value of [undefined,"", "1","0","true","OWNER","invalid"]) assert.equal(communityMode(value),"off");
  assert.equal(communityMode("owner"),"owner");assert.equal(communityMode("on"),"on");
  for(const path of ["/en/community","/zh/community/new","/en/works/p/id","/zh/admin/review"]) assert(isCommunityPage(path));
  for(const path of ["/en/actors","/en/works","/en/guide","/en/community-other"]) assert(!isCommunityPage(path));
});
test("installed AuthKit carries the verified Bearer through exact target/complete and read/review edge calls",async t=>{
  const f=await communityAuthFixture(t);const n=f.nodeRequest();const context=await remoteContext(n.req,n.res,"test");
  assert.equal(context.userId,USER_ID);
  await context.edge!("target",{uploadId:UPLOAD_ID});
  const input={uploadId:UPLOAD_ID,operationId:OP_ID};
  const first=await context.call("complete_upload",input);const second=await context.call("complete_upload",input);assert.deepEqual(first,second);
  await context.edge!("media",{mediaId:MEDIA_ID,mode:"read"});await context.edge!("media",{mediaId:MEDIA_ID,mode:"review"});
  const calls=f.state.writes;assert.equal(calls.length,5);assert(calls.every(call=>call.authorization===`Bearer ${f.token}` && call.origin===f.origin));
  assert.deepEqual(calls.slice(1,3).map(call=>call.body),[input,input]);
  assert.deepEqual(calls.slice(3).map(call=>call.body),[{mediaId:MEDIA_ID,mode:"read"},{mediaId:MEDIA_ID,mode:"review"}]);
  assert(!JSON.stringify(calls).includes("finalize_upload"));
});
test("anonymous media is read-only; denied media is indistinguishable; preview origins are not forged",async t=>{
  const f=await communityAuthFixture(t);const n=f.nodeRequest(false);const context=await remoteContext(n.req,n.res,"test");
  await context.edge!("media",{mediaId:MEDIA_ID,mode:"read"});
  await assert.rejects(context.edge!("media",{mediaId:MEDIA_ID,mode:"review"}),(e:CommunityError)=>e.code==="MEDIA_UNAVAILABLE");
  await assert.rejects(context.edge!("target",{uploadId:UPLOAD_ID}),(e:CommunityError)=>e.code==="AUTH_REQUIRED");
  f.state.mediaDenied=true;await assert.rejects(context.edge!("media",{mediaId:MEDIA_ID,mode:"read"}),(e:CommunityError)=>e.code==="MEDIA_UNAVAILABLE" && e.status===404);
  n.req.headers.origin="https://preview.example.test";
  await assert.rejects(context.edge!("media",{mediaId:MEDIA_ID,mode:"read"}),(e:CommunityError)=>e.code==="ORIGIN_NOT_ALLOWED");
  assert(f.state.writes.every(call=>call.origin===f.origin));
});
test("owner-only navigation is authorized with the backend on every request, including RSC",async t=>{
  const f=await communityAuthFixture(t);process.env.NEXT_PUBLIC_COMMUNITY_MODE="owner";
  const request=()=>new Request(`${f.origin}/en/community`,{headers:{cookie:f.cookie,host:new URL(f.origin).host,rsc:"1"}});
  assert.equal((await communityPageAccess(request()))?.allowed,false);
  f.state.owner=true;assert.equal((await communityPageAccess(request()))?.allowed,true);
  f.state.malformed=true;assert.equal((await communityPageAccess(request()))?.allowed,false);f.state.malformed=false;
  f.state.owner=false;assert.equal((await communityPageAccess(request()))?.allowed,false);
  f.state.owner=true;f.state.revoked=true;assert.equal((await communityPageAccess(request()))?.allowed,false);
  assert.equal((await communityPageAccess(new Request(`${f.origin}/en/community`)))?.allowed,false);
  assert.equal(await communityPageAccess(new Request(`${f.origin}/en/actors`)),null);
});
test("Owner audience also gates API reads and returns no private projection on a forged or failed check",async()=>{
  await withEnvironment({NEXT_PUBLIC_COMMUNITY_MODE:"owner"},async()=>{
    const denied={userId:USER_ID,call:async()=>{throw new CommunityError("OWNER_REQUIRED");}};
    await assert.rejects(requireCommunityAudience(denied),(e:CommunityError)=>e.code==="POST_UNAVAILABLE");
    const output=apiResponse();await createAccessRoute(async()=>denied)(apiRequest({headers:{cookie:"owner=true"}}),output.res);
    assert.deepEqual(output.value.body,{mode:"owner",allowed:false,owner:false});assert.equal(output.headers.get("cache-control"),"private, no-store");
  });
});
for(const [code,status] of Object.entries(errorStatus)) test(`C3 edge error ${code} retains the fixed HTTP status ${status}`,async()=>{
  const edge=createCommunityEdge(async()=>({data:null,error:Error("unsafe provider details"),response:Response.json({error:{code,retryable:false,requestId:"fixed"}},{status})}),USER_ID,"test");
  await assert.rejects(edge("target",{uploadId:UPLOAD_ID}),(e:CommunityError)=>e.code===code && e.status===status && !e.message.includes("unsafe"));
});
test("media capabilities require explicit mode and matching identity, before transport",async()=>{
  assert(!edgeContracts.media.input.safeParse({mediaId:MEDIA_ID}).success);
  assert(!edgeContracts.target.input.safeParse({uploadId:UPLOAD_ID,userId:USER_ID}).success);
  await withEnvironment({NEXT_PUBLIC_COMMUNITY_MODE:"on",ACCOUNT_MODE:"mock",VERCEL_ENV:undefined},async()=>{
    let calls=0;const route=createCapabilityRoute("media",async()=>{calls++;throw Error();});const out=apiResponse();
    await route(apiRequest({method:"POST",query:{mediaId:MEDIA_ID},body:{mediaId:MEDIA_ID},headers:{host:"localhost:3000",origin:"http://localhost:3000"}}),out.res);assert.equal(out.value.code,400);assert.equal(calls,0);
  });
});
test("leaderboard uses only get_actor_votes with bounded concurrency and never publishes a partial winner",async()=>{
  let concurrent=0,max=0;const names:string[]=[];
  const result=await collectActorVotes(async(name,args)=>{names.push(name);max=Math.max(max,++concurrent);await new Promise(resolve=>setTimeout(resolve,1));concurrent--;return {data:{actorSlug:args.p_actor_slug,count:3,voted:false},error:null};},["one","two","three","four","five"]);
  assert.equal(result.votes.length,5);assert(max<=4);assert(names.every(name=>name==="get_actor_votes"));
  await assert.rejects(collectActorVotes(async()=>({data:null,error:Error()}),["one","two"]));
});
test("rollout never registers a production mock switch or direct finalize route",()=>{
  const source=readFileSync(new URL('../../src/features/community/server/context.ts',import.meta.url),'utf8');
  assert(source.includes('modes.account !== "swimmer"'));assert(!source.includes('service_role'));
  assert(!readFileSync(new URL('../../src/features/community/upload.ts',import.meta.url),'utf8').includes('"finalize_upload"'));
});

test("owner-only media denials use the same MEDIA_UNAVAILABLE envelope as an invisible object", async () => {
  await withEnvironment({NEXT_PUBLIC_COMMUNITY_MODE:"owner",ACCOUNT_MODE:"mock",VERCEL_ENV:undefined}, async () => {
    const route=createCapabilityRoute("media",async()=>({userId:USER_ID,call:async()=>{throw new CommunityError("OWNER_REQUIRED");}}));
    const out=apiResponse();
    await route(apiRequest({method:"POST",query:{mediaId:MEDIA_ID},body:{mediaId:MEDIA_ID,mode:"read"},headers:{host:"localhost:3000",origin:"http://localhost:3000"}}),out.res);
    assert.equal(out.value.code,404);
    assert.equal((out.value.body as {error:{code:string}}).error.code,"MEDIA_UNAVAILABLE");
    assert.equal(out.headers.get("cache-control"),"private, no-store");
  });
});
