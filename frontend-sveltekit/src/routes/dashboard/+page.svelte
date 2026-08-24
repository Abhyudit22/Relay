<script lang="ts">
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';

  let user: any = null;

  onMount(() => {
    const stored = sessionStorage.getItem('relay_user');
    if (stored) {
      user = JSON.parse(stored);
    }
  });

  function handleLogout() {
    sessionStorage.removeItem('relay_user');
    goto('/');
  }
</script>

<div class="min-h-screen bg-zinc-950 text-zinc-100 p-6">
  <div class="max-w-4xl mx-auto space-y-6">
    <header class="flex items-center justify-between border-b border-zinc-800 pb-4">
      <div class="flex items-center gap-3">
        <span class="w-3 h-3 rounded-full bg-red-600"></span>
        <h1 class="text-xl font-bold text-white">Relay Dashboard</h1>
      </div>
      <button
        on:click={handleLogout}
        class="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-xs font-semibold text-zinc-200 rounded-xl transition-all"
      >
        Sign Out
      </button>
    </header>

    {#if user}
      <div class="p-6 bg-zinc-900 rounded-3xl border border-zinc-800 space-y-4">
        <h2 class="text-lg font-bold text-white">Logged in as {user.name}</h2>
        <div class="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
          <div class="p-4 bg-zinc-800/60 rounded-2xl border border-zinc-700/60">
            <span class="text-zinc-400 block mb-1">Role</span>
            <span class="text-white font-bold uppercase">{user.role}</span>
          </div>
          <div class="p-4 bg-zinc-800/60 rounded-2xl border border-zinc-700/60">
            <span class="text-zinc-400 block mb-1">Email</span>
            <span class="text-white font-bold">{user.email}</span>
          </div>
          <div class="p-4 bg-zinc-800/60 rounded-2xl border border-zinc-700/60">
            <span class="text-zinc-400 block mb-1">Status</span>
            <span class="text-emerald-400 font-bold">Active & Verified</span>
          </div>
        </div>
      </div>
    {:else}
      <div class="p-6 bg-zinc-900 rounded-3xl border border-zinc-800 text-center">
        <p class="text-xs text-zinc-400">Loading user profile...</p>
      </div>
    {/if}
  </div>
</div>
