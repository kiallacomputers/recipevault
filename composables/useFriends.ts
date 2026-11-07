export interface MemberProfile {
  id: string
  display_name: string
  username: string | null
  bio: string
  discoverable: boolean
}
export interface FriendRequest {
  id: string
  sender_id: string
  receiver_id: string
  created_at: string
}
export interface Friendship {
  user_low: string
  user_high: string
  created_at: string
}

export function useFriends() {
  const db = useSupabaseClient()
  async function currentId() {
    const { data, error } = await db.auth.getUser()
    if (error || !data.user?.id) throw new Error('Please sign in again.')
    return data.user.id
  }
  async function searchMembers(term: string): Promise<MemberProfile[]> {
    const id = await currentId()
    const q = term.trim().replace(/[%,()]/g, '').slice(0, 60)
    if (q.length < 2) return []
    const { data, error } = await db.from('profiles')
      .select('id,display_name,username,bio,discoverable')
      .eq('discoverable', true)
      .or(`display_name.ilike.%${q}%,username.ilike.%${q}%`)
      .neq('id', id).limit(30)
    if (error) throw error
    return (data || []) as MemberProfile[]
  }
  async function myProfile(): Promise<MemberProfile> {
    const id = await currentId()
    const { data, error } = await db.from('profiles').select('id,display_name,username,bio,discoverable').eq('id', id).single()
    if (error) throw error
    return data as MemberProfile
  }
  async function saveProfile(profile: Pick<MemberProfile, 'display_name'|'username'|'bio'|'discoverable'>) {
    const id = await currentId()
    const name = profile.display_name.trim()
    const username = profile.username?.trim().toLowerCase() || null
    if (!name || name.length > 80) throw new Error('Display name must be 1–80 characters.')
    if (username && !/^[a-z0-9_]{3,30}$/.test(username)) throw new Error('Username must be 3–30 lowercase letters, numbers or underscores.')
    if (profile.bio.length > 500) throw new Error('Bio must be at most 500 characters.')
    const { error } = await db.from('profiles').update({display_name:name,username,bio:profile.bio,discoverable:profile.discoverable}).eq('id',id)
    if (error) throw error
  }
  async function overview() {
    const id = await currentId()
    const [requests, friendships] = await Promise.all([
      db.from('friend_requests').select('id,sender_id,receiver_id,created_at').or(`sender_id.eq.${id},receiver_id.eq.${id}`).order('created_at',{ascending:false}),
      db.from('friendships').select('user_low,user_high,created_at').or(`user_low.eq.${id},user_high.eq.${id}`)
    ])
    if (requests.error) throw requests.error
    if (friendships.error) throw friendships.error
    const reqs = (requests.data || []) as FriendRequest[]
    const friends = (friendships.data || []) as Friendship[]
    const ids = [...new Set([...reqs.flatMap(r=>[r.sender_id,r.receiver_id]),...friends.flatMap(f=>[f.user_low,f.user_high])].filter(x=>x!==id))]
    let profiles: MemberProfile[] = []
    if (ids.length) {
      const result = await db.from('profiles').select('id,display_name,username,bio,discoverable').in('id',ids)
      if (result.error) throw result.error
      profiles = (result.data || []) as MemberProfile[]
    }
    return { id, requests:reqs, friendships:friends, profiles }
  }
  async function rpc(name:'send_friend_request'|'respond_friend_request'|'cancel_friend_request'|'remove_friend',args:Record<string,unknown>) {
    const { error } = await db.rpc(name,args)
    if (error) throw error
  }
  return {
    searchMembers,myProfile,saveProfile,overview,
    send:(receiver:string)=>rpc('send_friend_request',{p_receiver:receiver}),
    respond:(request:string,accept:boolean)=>rpc('respond_friend_request',{p_request:request,p_accept:accept}),
    cancel:(request:string)=>rpc('cancel_friend_request',{p_request:request}),
    remove:(friend:string)=>rpc('remove_friend',{p_friend:friend})
  }
}
