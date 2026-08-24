<script lang="ts">
  import { goto } from '$app/navigation';
  let selectedRole = 'customer';
</script>

<div class="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col items-center justify-center p-4">
  <div class="w-full max-w-md space-y-8 text-center">
    <!-- Brand Badge -->
    <div class="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-zinc-900 border border-zinc-800 text-xs font-semibold">
      <span class="w-2 h-2 rounded-full bg-red-600 animate-pulse"></span>
      <span class="font-bold text-red-500">RELAY</span>
      <span class="text-zinc-500">|</span>
      <span>Logistics OS</span>
    </div>

    <!-- Main Title -->
    <div class="space-y-2">
      <h1 class="text-3xl font-black tracking-tight text-white sm:text-4xl">
        Welcome to Relay
      </h1>
      <p class="text-sm text-zinc-400">
        High-velocity logistics platform. Log in or create an account to get started.
      </p>
    </div>

    <!-- Login & Sign Up Card -->
    <div class="p-6 bg-zinc-900/90 rounded-3xl border border-zinc-800 shadow-xl space-y-6 text-left">
      <div class="grid grid-cols-2 gap-3">
        <a
          href="/login"
          class="py-3 px-4 bg-white text-zinc-950 hover:bg-zinc-100 rounded-2xl font-bold text-sm text-center shadow-md transition-all block"
        >
          Log In
        </a>
        <a
          href="/signup"
          class="py-3 px-4 bg-red-600 text-white hover:bg-red-700 rounded-2xl font-bold text-sm text-center shadow-md transition-all block"
        >
          Sign Up
        </a>
      </div>

      <div class="relative flex items-center justify-center">
        <div class="border-t border-zinc-800 w-full"></div>
        <span class="bg-zinc-900 px-3 text-[11px] font-semibold text-zinc-500 uppercase tracking-wider absolute">
          Select Role
        </span>
      </div>

      <!-- Quick Role Access -->
      <div class="space-y-2">
        <a
          href="/login?role=customer"
          class="p-3 rounded-2xl bg-zinc-800/60 hover:bg-zinc-800 border border-zinc-700/60 flex items-center justify-between transition-all"
        >
          <div>
            <div class="text-xs font-bold text-white">Customer Portal</div>
            <div class="text-[11px] text-zinc-400">Create & manage delivery orders</div>
          </div>
          <span class="text-xs text-red-400 font-semibold">Enter →</span>
        </a>

        <a
          href="/login?role=agent"
          class="p-3 rounded-2xl bg-zinc-800/60 hover:bg-zinc-800 border border-zinc-700/60 flex items-center justify-between transition-all"
        >
          <div>
            <div class="text-xs font-bold text-white">Delivery Courier (Rider)</div>
            <div class="text-[11px] text-zinc-400">Manage route runs & OTP handshakes</div>
          </div>
          <span class="text-xs text-emerald-400 font-semibold">Enter →</span>
        </a>

        <a
          href="/login?role=admin"
          class="p-3 rounded-2xl bg-zinc-800/60 hover:bg-zinc-800 border border-zinc-700/60 flex items-center justify-between transition-all"
        >
          <div>
            <div class="text-xs font-bold text-white">Operations & Dispatch</div>
            <div class="text-[11px] text-zinc-400">Fleet, rates & SLA control</div>
          </div>
          <span class="text-xs text-purple-400 font-semibold">Enter →</span>
        </a>
      </div>
    </div>
  </div>
</div>
