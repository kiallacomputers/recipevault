<template>
  <div class="space-y-7">
    <div><h1 class="text-3xl font-bold">Friends</h1><p class="text-stone-600">Find friends and share your love of cooking. Recipe sharing is coming in Phase 2B.</p></div>
    <p v-if="error" class="error" role="alert">{{ error }}</p>
    <p v-if="notice" class="text-green-700" role="status">{{ notice }}</p>
    <section class="card space-y-3"><h2 class="text-xl font-semibold">Find people</h2>
      <input v-model="term" aria-label="Search people" placeholder="Search by name or username (at least 2 characters)" @keyup.enter="search" />
      <button class="btn" :disabled="busy||term.trim().length<2" @click="search">Search</button>
      <div v-for="p in results" :key="p.id" class="flex flex-wrap items-center justify-between gap-3 border-t pt-3">
        <div><p class="font-semibold">{{ p.display_name }}</p><p class="text-sm text-stone-500">{{ p.username ? '@'+p.username : 'RecipeVault member' }}</p></div>
        <span v-if="friendIds.has(p.id)" class="text-green-700 text-sm">Friends</span>
        <span v-else-if="pendingIds.has(p.id)" class="text-stone-500 text-sm">Request pending</span>
        <button v-else class="btn" :disabled="busy" @click="act(()=>repo.send(p.id),'Friend request sent')">Add friend</button>
      </div>
      <p v-if="searched&&!results.length" class="text-sm text-stone-500">No matching members found.</p>
    </section>
    <section class="card space-y-3"><h2 class="text-xl font-semibold">Received requests ({{ received.length }})</h2>
      <p v-if="!received.length" class="text-stone-500">No new requests.</p>
      <div v-for="r in received" :key="r.id" class="flex flex-wrap items-center justify-between gap-3 border-t pt-3">
        <p>{{ label(r.sender_id) }}</p><div class="flex gap-2"><button class="btn" :disabled="busy" @click="act(()=>repo.respond(r.id,true),'Friend request accepted')">Accept</button><button class="btn btn-secondary" :disabled="busy" @click="act(()=>repo.respond(r.id,false),'Request declined')">Decline</button></div>
      </div>
    </section>
    <section class="card space-y-3"><h2 class="text-xl font-semibold">My friends ({{ friendships.length }})</h2>
      <p v-if="!friendships.length" class="text-stone-500">You haven't added any friends yet.</p>
      <div v-for="f in friendships" :key="f.user_low+f.user_high" class="flex flex-wrap items-center justify-between gap-3 border-t pt-3">
        <p>{{ label(other(f.user_low,f.user_high)) }}</p><button class="btn btn-secondary" :disabled="busy" @click="removeFriend(other(f.user_low,f.user_high))">Remove</button>
      </div>
    </section>
    <section class="card space-y-3"><h2 class="text-xl font-semibold">Sent requests ({{ sent.length }})</h2>
      <p v-if="!sent.length" class="text-stone-500">No pending requests.</p>
      <div v-for="r in sent" :key="r.id" class="flex flex-wrap items-center justify-between gap-3 border-t pt-3">
        <p>{{ label(r.receiver_id) }}</p><button class="btn btn-secondary" :disabled="busy" @click="act(()=>repo.cancel(r.id),'Request cancelled')">Cancel</button>
      </div>
    </section>
  </div>
</template>
<script setup lang="ts">
import type {MemberProfile,FriendRequest,Friendship} from '~/composables/useFriends'
definePageMeta({middleware:'auth'})
const repo=useFriends(),term=ref(''),busy=ref(false),error=ref(''),notice=ref(''),searched=ref(false)
const results=ref<MemberProfile[]>([]),requests=ref<FriendRequest[]>([]),friendships=ref<Friendship[]>([]),profiles=ref<MemberProfile[]>([]),myId=ref('')
const received=computed(()=>requests.value.filter(r=>r.receiver_id===myId.value))
const sent=computed(()=>requests.value.filter(r=>r.sender_id===myId.value))
const friendIds=computed(()=>new Set(friendships.value.map(f=>other(f.user_low,f.user_high))))
const pendingIds=computed(()=>new Set(requests.value.flatMap(r=>[r.sender_id,r.receiver_id]).filter(id=>id!==myId.value)))
function other(low:string,high:string){return low===myId.value?high:low}
function label(id:string){const p=profiles.value.find(p=>p.id===id);return p?.display_name||(p?.username?'@'+p.username:'RecipeVault member')}
async function refresh(){const data=await repo.overview();myId.value=data.id;requests.value=data.requests;friendships.value=data.friendships;profiles.value=data.profiles}
async function search(){busy.value=true;error.value='';try{results.value=await repo.searchMembers(term.value);searched.value=true}catch(e:any){error.value=e.message||'Search failed'}finally{busy.value=false}}
async function act(fn:()=>Promise<unknown>,message:string){busy.value=true;error.value='';notice.value='';try{await fn();await refresh();notice.value=message}catch(e:any){error.value=e.message||'Action failed'}finally{busy.value=false}}
async function removeFriend(id:string){if(!confirm('Remove this friend?'))return;await act(()=>repo.remove(id),'Friend removed')}
onMounted(async()=>{try{await refresh()}catch(e:any){error.value=e.message||'Unable to load friends'}})
</script>
