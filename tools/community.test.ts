import test from "node:test";
import assert from "node:assert/strict";
import { addPost, listPosts } from "../src/features/community/mock-store.ts";
test("community posts start pending and are hidden from public feed",()=>{const post=addPost({kind:"image",title:"Fixture",author:"local",actorSlugs:["tang-yunqiu"]});assert.equal(post.status,"pending");assert.equal(listPosts().some(x=>x.id===post.id),false)});
