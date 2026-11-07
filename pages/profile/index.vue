<template>
  <div class="max-w-xl space-y-5">
    <h1 class="text-3xl font-bold">My Profile</h1>
    <p class="text-stone-600">Choose how other RecipeVault members can find you.</p>
    <p v-if="error" role="alert" class="error">{{ error }}</p>
    <p v-if="success" role="status" class="text-green-700">Profile saved.</p>
    <form v-if="loaded" class="card space-y-4" @submit.prevent="save">
      <div><label for="display-name">Display name</label><input id="display-name" v-model="form.display_name" maxlength="80" required /></div>
      <div><label for="username">Username</label><input id="username" v-model="form.username" maxlength="30" placeholder="e.g. homecook123" /><p class="text-xs text-stone-500 mt-1">3–30 lowercase letters, numbers or underscores.</p></div>
      <div><label for="bio">About me</label><textarea id="bio" v-model="form.bio" maxlength="500" rows="4" /></div>
      <label class="flex gap-3 items-start"><input v-model="form.discoverable" type="checkbox" class="w-auto mt-1" /><span>Let other members find me in search</span></label>
      <button class="btn" :disabled="busy">{{ busy ? 'Saving…' : 'Save profile' }}</button>
    </form>
    <p v-else-if="!error">Loading profile…</p>
  </div>
</template>
<script setup lang="ts">
definePageMeta({middleware:'auth'})
const repo=useFriends(),loaded=ref(false),busy=ref(false),error=ref(''),success=ref(false)
const form=reactive({display_name:'',username:'',bio:'',discoverable:true})
onMounted(async()=>{try{const p=await repo.myProfile();Object.assign(form,{display_name:p.display_name,username:p.username||'',bio:p.bio||'',discoverable:p.discoverable});loaded.value=true}catch(e:any){error.value=e.message||'Unable to load profile'}})
async function save(){busy.value=true;error.value='';success.value=false;try{await repo.saveProfile(form);success.value=true}catch(e:any){error.value=e.message||'Unable to save profile'}finally{busy.value=false}}
</script>
