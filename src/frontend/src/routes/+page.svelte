<script lang="ts">
  import { onMount, tick } from 'svelte';

  const BACKEND = 'http://localhost:3001';

  type ChatMessage = {
    sender: 'user' | 'ai';
    text: string;
    createdAt: string;
  };

  let messages: ChatMessage[] = [];
  let input = '';
  let loading = false;
  let sessionId: number | null = null;

  let container: HTMLDivElement;

  async function scrollToBottom() {
    await tick();
    container?.scrollTo({ top: container.scrollHeight, behavior: 'smooth' });
  }

  async function loadHistory() {
    if (!sessionId) return;

    try {
      const res = await fetch(
        `${BACKEND}/chat/history?sessionId=${sessionId}`
      );

      if (!res.ok) return;

      const data = await res.json();

      messages = data.messages.map((m: any) => ({
        sender: m.sender,
        text: m.text,
        createdAt: m.createdAt ?? new Date().toISOString()
      }));

      scrollToBottom();
    } catch (err) {
      console.warn('History load failed', err);
    }
  }

  onMount(() => {
    const stored = localStorage.getItem('sessionId');
    if (stored) {
      sessionId = Number(stored);
      loadHistory();
    }
  });

  async function sendMessage() {
    if (!input.trim() || loading) return;

    const text = input;
    input = '';
    loading = true;

    messages = [
      ...messages,
      { sender: 'user', text, createdAt: new Date().toISOString() }
    ];
    scrollToBottom();

    try {
      const payload: any = { message: text };
      if (sessionId !== null) payload.sessionId = sessionId;

      const res = await fetch(`${BACKEND}/chat/message`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!res.ok) throw new Error('Bad response');

      const data = await res.json();

      sessionId = data.sessionId;
      localStorage.setItem('sessionId', String(sessionId));

      messages = [
        ...messages,
        {
          sender: 'ai',
          text: data.reply,
          createdAt: new Date().toISOString()
        }
      ];
    } catch (err) {
      messages = [
        ...messages,
        {
          sender: 'ai',
          text: 'Something went wrong. Please try again.',
          createdAt: new Date().toISOString()
        }
      ];
    } finally {
      loading = false;
      scrollToBottom();
    }
  }
</script>

<style>
  .chat {
    max-width: 420px;
    height: 600px;
    margin: auto;
    border-radius: 12px;
    border: 1px solid #e5e7eb;
    display: flex;
    flex-direction: column;
    background: #fff;
  }

  .header {
    padding: 12px;
    border-bottom: 1px solid #e5e7eb;
    font-weight: 600;
  }

  .status {
    font-size: 12px;
    color: green;
  }

  .messages {
    flex: 1;
    padding: 12px;
    overflow-y: auto;
  }

  .bubble {
    max-width: 75%;
    padding: 10px 12px;
    border-radius: 14px;
    margin-bottom: 8px;
    font-size: 14px;
  }

  .user {
    background: #2563eb;
    color: white;
    margin-left: auto;
  }

  .ai {
    background: #f3f4f6;
    color: #111;
  }

  .time {
    font-size: 10px;
    opacity: 0.6;
    margin-top: 2px;
  }

  .input {
    display: flex;
    gap: 8px;
    padding: 10px;
    border-top: 1px solid #e5e7eb;
  }

  input {
    flex: 1;
    padding: 10px;
    border-radius: 8px;
    border: 1px solid #d1d5db;
  }

  button {
    background: #2563eb;
    color: white;
    border: none;
    border-radius: 8px;
    padding: 0 16px;
  }

  button:disabled {
    opacity: 0.5;
  }

  .typing {
    font-size: 12px;
    opacity: 0.6;
    margin-bottom: 8px;
  }
</style>

<div class="chat">
  <div class="header">
    Spur Support
    <div class="status">● Online</div>
  </div>

  <div class="messages" bind:this={container}>
    {#each messages as m}
      <div class="bubble {m.sender}">
        {m.text}
        <div class="time">
          {new Date(m.createdAt).toLocaleTimeString()}
        </div>
      </div>
    {/each}

    {#if loading}
      <div class="typing">Agent is typing…</div>
    {/if}
  </div>

  <div class="input">
    <input
      placeholder="Type your message…"
      bind:value={input}
      on:keydown={(e) => e.key === 'Enter' && sendMessage()}
    />
    <button on:click={sendMessage} disabled={loading}>
      Send
    </button>
  </div>
</div>
