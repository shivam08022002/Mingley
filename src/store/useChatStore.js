import { create } from 'zustand';

/**
 * useChatStore
 *
 * Central store for all chat-related monetisation:
 *  - user          : current user (gender)
 *  - wallet        : current user's coin balance
 *  - receiverWallet: dummy receiver balance (coin-transfer demo)
 *  - freeMessagesLeft
 *
 * No real API calls – all dummy state.
 */
export const useChatStore = create((set, get) => ({
  // ── Current user (dummy) ──────────────────────────────────────────────────
  user: {
    gender: 'female', // Set to 'female' to test the female flow
    name: 'Jessica',
  },

  // ── Chat Messages ─────────────────────────────────────────────────────────
  messages: [
    { id: '1', text: "Hi Jake, how are you? I saw on the app that we've crossed paths several times this week", time: '2:55 PM', isMine: false },
    { id: '2', text: 'Haha truly! Nice to meet you Grace! What about a cup of coffee today evening?', time: '3:02 PM', isMine: true, read: true },
    { id: '3', text: "Sure, let's do it!", time: '3:10 PM', isMine: false },
    { id: '4', text: 'Great I will write later the exact time and place. See you soon!', time: '3:12 PM', isMine: true, read: true },
  ],

  // ── Transactions History ──────────────────────────────────────────────────
  transactions: [
    { id: 't1', title: 'Welcome Bonus', amount: 150, type: 'credit', date: new Date().toISOString() },
  ],

  // ── Premium status ────────────────────────────────────────────────────────
  isPremium: false, // Toggle via upgradeToPremium()

  // ── Sender wallet ─────────────────────────────────────────────────────────
  wallet: {
    coins: 150,
  },

  // ── Dummy receiver wallet (shows credit side for coin transfers) ───────────
  receiverWallet: {
    coins: 80,
  },

  // ── Free messages left after a match (female users only) ─────────────────
  freeMessagesLeft: 3,

  // ════════════════════════════════════════════════════════════════════════════
  // ACTIONS
  // ════════════════════════════════════════════════════════════════════════════

  /** Toggle premium status (dummy upgrade). */
  upgradeToPremium: () => set({ isPremium: true }),
  downgradePremium: () => set({ isPremium: false }),

  /** Deduct 1 coin (message cost for male users). */
  deductCoin: () =>
    set((state) => {
      if (state.wallet.coins < 1) return state;
      return {
        wallet: { ...state.wallet, coins: state.wallet.coins - 1 },
        transactions: [
          { id: Math.random().toString(), title: 'Chat Message', amount: 1, type: 'debit', date: new Date().toISOString() },
          ...state.transactions,
        ],
      };
    }),

  /** Push a new message to the chat list. */
  pushMessage: (msg) => set((state) => ({ messages: [...state.messages, msg] })),

  /** Clear all messages */
  clearMessages: () => set({ messages: [] }),
  
  /** Deduct N coins (calling timer). */
  deductCoins: (n) =>
    set((state) => {
      if (state.wallet.coins < n) return state;
      return {
        wallet: { ...state.wallet, coins: state.wallet.coins - n },
        // Don't log every second for calls or the history will be spammed, just log the chunk
        transactions: [
          { id: Math.random().toString(), title: 'Call Usage', amount: n, type: 'debit', date: new Date().toISOString() },
          ...state.transactions,
        ],
      };
    }),

  /** Decrease free-message counter (female users). */
  decrementFreeMessages: () =>
    set((state) => ({
      freeMessagesLeft: Math.max(0, state.freeMessagesLeft - 1),
    })),

  /** Reset free messages to 3 (new match). */
  resetFreeMessages: () => set({ freeMessagesLeft: 3 }),

  /** Add coins to sender wallet. */
  addCoins: (amount) =>
    set((state) => ({
      wallet: { ...state.wallet, coins: state.wallet.coins + amount },
      transactions: [
        { id: Math.random().toString(), title: 'Coin Deposit', amount, type: 'credit', date: new Date().toISOString() },
        ...state.transactions,
      ],
    })),

  /**
   * Send a gift.
   * Deducts `cost` from sender wallet.
   * Returns false if insufficient balance.
   */
  sendGift: (cost, giftName = 'Gift') => {
    const { wallet } = get();
    if (wallet.coins < cost) return false;
    set((state) => ({
      wallet: { ...state.wallet, coins: state.wallet.coins - cost },
      transactions: [
        { id: Math.random().toString(), title: `Sent ${giftName}`, amount: cost, type: 'debit', date: new Date().toISOString() },
        ...state.transactions,
      ],
    }));
    return true;
  },

  /**
   * Transfer coins from sender to receiver (dummy).
   * Returns { ok: boolean, reason?: string }
   */
  transferCoins: (amount) => {
    const { wallet } = get();
    if (!amount || amount <= 0) return { ok: false, reason: 'Enter a valid amount.' };
    if (wallet.coins < amount) return { ok: false, reason: 'Insufficient coins.' };
    set((state) => ({
      wallet: { ...state.wallet, coins: state.wallet.coins - amount },
      receiverWallet: {
        ...state.receiverWallet,
        coins: state.receiverWallet.coins + amount,
      },
      transactions: [
        { id: Math.random().toString(), title: 'Coin Transfer', amount, type: 'debit', date: new Date().toISOString() },
        ...state.transactions,
      ],
    }));
    return { ok: true };
  },

  /**
   * Withdraw coins (female users only).
   * Returns { ok: boolean, reason?: string }
   */
  withdrawCoins: (amount) => {
    const { wallet, user } = get();
    if (user.gender !== 'female') return { ok: false, reason: 'Only female users can withdraw.' };
    if (!amount || amount <= 0) return { ok: false, reason: 'Enter a valid amount.' };
    if (wallet.coins < amount) return { ok: false, reason: 'Insufficient coins to withdraw.' };
    set((state) => ({
      wallet: { ...state.wallet, coins: state.wallet.coins - amount },
      transactions: [
        { id: Math.random().toString(), title: 'Cashout / Withdrawal', amount, type: 'debit', date: new Date().toISOString() },
        ...state.transactions,
      ],
    }));
    return { ok: true };
  },
}));
