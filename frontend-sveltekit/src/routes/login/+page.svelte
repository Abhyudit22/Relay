<script lang="ts">
  import { loginUser } from '$lib/api';
  import { goto } from '$app/navigation';

  let email = '';
  let password = '';
  let role = 'customer';
  let loading = false;
  let errorMsg = '';

  async function handleLogin() {
    loading = true;
    errorMsg = '';
    try {
      const user = await loginUser(email || 'demo@relay.io', password || 'password', role);
      sessionStorage.setItem('relay_user', JSON.stringify(user));
      goto('/dashboard');
    } catch (err: any) {
      errorMsg = err.message || 'Login failed';
    } finally {
      loading = false;
    }
  }
</script>

<div class="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col items-center justify-center p-4">
  <div class="w-full max-w-md space-y-6">
    <div class="text-center space-y-2">
      <a href="/" class="text-xs text-red-500 font-bold hover:underline">← Back to Relay</a>
      <h1 class="text-2xl font-bold text-white">Log In to Your Account</h1>
      <p class="text-xs text-zinc-400">Access your Relay logistics portal</p>
    </div>

    <form on:submit|preventDefault={handleLogin} class="p-6 bg-zinc-900 rounded-3xl border border-zinc-800 space-y-4 shadow-xl">
      {#if errorMsg}
        <div class="p-3 bg-red-950/60 border border-red-800/80 rounded-xl text-xs text-red-300 font-medium">
          {errorMsg}
        </div>
      {/if}

      <div>
        <label class="block text-xs font-semibold text-zinc-300 mb-1">Select Role</label>
        <select bind:value={role} class="w-full p-3 rounded-xl bg-zinc-800 border border-zinc-700 text-xs text-white focus:outline-none focus:border-red-500">
          <option value="customer">Customer / Sender</option>
          <option value="agent">Delivery Courier (Rider)</option>
          <option value="admin">Operations & Dispatch</option>
          <option value="recipient">Package Recipient</option>
        </select>
      </div>

      <div>
        <label class="block text-xs font-semibold text-zinc-300 mb-1">Email or Phone Number</label>
        <input
          type="text"
          bind:value={email}
          placeholder="e.g. user@relay.io"
          class="w-full p-3 rounded-xl bg-zinc-800 border border-zinc-700 text-xs text-white focus:outline-none focus:border-red-500"
        />
      </div>

      <div>
        <label class="block text-xs font-semibold text-zinc-300 mb-1">Password</label>
        <input
          type="password"
          bind:value={password}
          placeholder="••••••••"
          class="w-full p-3 rounded-xl bg-zinc-800 border border-zinc-700 text-xs text-white focus:outline-none focus:border-red-500"
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        class="w-full py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold text-xs shadow-md transition-all disabled:opacity-50"
      >
        {loading ? 'Logging in...' : 'Sign In'}
      </button>

      <div class="text-center text-xs text-zinc-400 pt-2">
        Don't have an account? <a href="/signup" class="text-red-400 font-semibold hover:underline">Sign up</a>
      </div>
    </form>
  </div>
</div>
