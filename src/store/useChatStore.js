import { create } from 'zustand';
import { useAuthStore } from './useAuthStore';
import { walletService, giftService, superchatService, chatService } from '../services/apiServices';

/**
 * useChatStore
 *
 * Central store for all chat-related monetisation:
 *  - user          : current user (gender)
 *  - wallet        : current user's coin balance
 *  - receiverWallet: dummy receiver balance (coin-transfer demo)
 *  - freeMessagesLeft
 *
 */
export const useChatStore = create((set, get) => ({
  // ── Current user (synced with auth) ────────────────────────────────────────
  user: useAuthStore.getState().user || {
    id: 'd0000001-0000-0000-0000-000000000009',
    gender: 'female', 
    name: 'Aisha Khan',
  },

  // ── Chat List ─────────────────────────────────────────────────────────────
  chats: [],

  // ── Chat Messages ─────────────────────────────────────────────────────────
  messages: [],

  // ── Global Modals ─────────────────────────────────────────────────────────
  depositModalVisible: false,
  setDepositModalVisible: (visible) => set({ depositModalVisible: visible }),

  // ── Transactions History ──────────────────────────────────────────────────
  transactions: [],

  // ── Gifts ────────────────────────────────────────────────────────────────
  gifts: [],
  giftCategories: [],


  // ── Superchats ──────────────────────────────────────────────────────────
  receivedSuperchats: [],
  sentSuperchats: [],

  // ── Premium status ────────────────────────────────────────────────────────
  isPremium: false, // Toggle via upgradeToPremium()

  // ── Sender wallet ─────────────────────────────────────────────────────────
  wallet: {
    coins: 0,
  },

  // ── Dummy receiver wallet (shows credit side for coin transfers) ───────────
  receiverWallet: {
    coins: 80,
  },

  // ── Free messages left after a match (female users only) ─────────────────
  freeMessagesLeft: 3,

  // ── Chat Quota ────────────────────────────────────────────────────────────
  chatQuota: null,

  // ── Active chat channel ───────────────────────────────────────────────────
  activeChatId: null,
  setActiveChatId: (activeChatId) => set({ activeChatId }),

  // ════════════════════════════════════════════════════════════════════════════
  // ACTIONS
  // ════════════════════════════════════════════════════════════════════════════

  /** Toggle premium status (dummy upgrade). */
  upgradeToPremium: () => set({ isPremium: true }),
  downgradePremium: () => set({ isPremium: false }),

  fetchWalletBalance: async () => {
    try {
      const response = await walletService.getBalance();
      // Handle the nested data.coinBalance structure from the API
      const balance = response.data?.coinBalance ?? response.balance ?? response.coinBalance ?? 0;
      set({ wallet: { coins: balance } });
    } catch (error) {
      console.error('Fetch balance error:', error);
    }
  },

  fetchTransactions: async () => {
    try {
      const response = await walletService.getTransactions();
      // Handle nested data.transactions or direct transactions array
      const transactions = response.data?.transactions ?? response.transactions ?? [];
      set({ transactions });
    } catch (error) {
      console.error('Fetch transactions error:', error);
    }
  },

  fetchGiftCatalog: async () => {
    try {
      const response = await giftService.getCatalog();
      const gifts = response.data?.gifts ?? response.gifts ?? [];
      set({ gifts });
    } catch (error) {
      console.error('Fetch gift catalog error:', error);
    }
  },

  fetchGiftCategories: async () => {
    try {
      const response = await giftService.getCategories();
      const giftCategories = response.data?.categories ?? response.data ?? response.categories ?? [];
      set({ giftCategories });
    } catch (error) {
      console.error('Fetch gift categories error:', error);
    }
  },


  fetchReceivedSuperchats: async () => {
    try {
      const response = await superchatService.getReceived();
      const receivedSuperchats = response.data?.superchats ?? response.superchats ?? [];
      set({ receivedSuperchats });
    } catch (error) {
      console.error('Fetch received superchats error:', error);
    }
  },

  fetchSentSuperchats: async () => {
    try {
      const response = await superchatService.getSent();
      const sentSuperchats = response.data?.superChats ?? response.data?.superchats ?? response.superchats ?? [];
      set({ sentSuperchats });
    } catch (error) {
      console.error('Fetch sent superchats error:', error);
    }
  },

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
  pushMessage: (msg) => set((state) => ({ messages: [msg, ...state.messages] })),

  /** Send a superchat via API */
  sendSuperchat: async (toUserId, message, coinAmount = 500) => {
    try {
      const response = await superchatService.send({ toUserId, message, coinAmount });
      // Refresh balance and sent superchats
      get().fetchWalletBalance();
      get().fetchSentSuperchats();
      return response;
    } catch (error) {
      console.error('Send superchat error:', error);
      throw error;
    }
  },

  /** Respond to a superchat */
  respondToSuperchat: async (id, responseText) => {
    try {
      const response = await superchatService.respond(id, { message: responseText });
      get().fetchReceivedSuperchats();
      return response;
    } catch (error) {
      console.error('Respond superchat error:', error);
      throw error;
    }
  },

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
   * Send a gift via API.
   */
  sendGift: async (recipientId, giftId, chatId, message = '') => {
    try {
      const response = await giftService.sendGift({ recipientId, giftId, chatId, message });
      get().fetchWalletBalance();
      return response;
    } catch (error) {
      console.error('Send gift error:', error);
      throw error;
    }
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

  // ── New Chat Actions ──────────────────────────────────────────────────────
  fetchChats: async () => {
    try {
      const response = await chatService.getChats();
      const chats = (response.data?.chats || []).map(chat => ({
        ...chat,
        id: chat.chatId, // Map chatId to id for FlatList keyExtractor
      }));
      set({ chats });
    } catch (error) {
      console.error('Fetch chats error:', error);
    }
  },

  fetchMessages: async (chatId) => {
    try {
      const response = await chatService.getMessages(chatId);
      const rawMessages = response.data?.messages ?? response.messages ?? [];
      
      // Get current user ID from either auth store or chat store
      const currentUserId = get().user?.id || get().user?._id;
      
      const mappedMessages = rawMessages.map(m => ({
        ...m,
        id: m.id || m._id,
        text: m.content || m.text,
        type: m.messageType?.toLowerCase() || 'text',
        giftName: m.giftName,
        cost: m.giftCost,
        amount: m.coinAmount,
        imageUrl: m.imageUrl,
        time: m.createdAt ? new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '',
        isMine: m.senderId === currentUserId,
      }));

      // Sort descending by date (newest first, index 0 is newest -> bottom of inverted FlatList)
      const sortedMessages = [...mappedMessages].sort((a, b) => {
        return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
      });

      set({ messages: sortedMessages });
    } catch (error) {
      console.error('Fetch messages error:', error);
    }
  },

  sendChatMessage: async (chatId, text, type = 'TEXT', imageUrl = '', replyToMessageId = null) => {
    try {
      const payload = {
        messageType: type,
        content: text,
        text: text,
      };

      if (imageUrl) payload.imageUrl = imageUrl;
      if (replyToMessageId) payload.replyToMessageId = replyToMessageId;

      const response = await chatService.sendMessage(chatId, payload);
      // Refresh messages and quota
      get().fetchMessages(chatId);
      get().getChatQuota(chatId);
      get().fetchWalletBalance();
      return response;
    } catch (error) {
      console.error('Send chat message error:', error);
      throw error;
    }
  },

  sendCoinsInChat: async (chatId, coinAmount, message = '') => {
    try {
      const response = await chatService.sendCoins(chatId, { coinAmount, message });
      // Refresh messages, balance and quota
      get().fetchMessages(chatId);
      get().getChatQuota(chatId);
      get().fetchWalletBalance();
      return response;
    } catch (error) {
      console.error('Send coins in chat error:', error);
      throw error;
    }
  },

  markChatAsRead: async (chatId) => {
    try {
      await chatService.markAsRead(chatId);
    } catch (error) {
      console.error('Mark as read error:', error);
    }
  },

  deleteChatMessage: async (chatId, messageId) => {
    try {
      await chatService.deleteMessage(chatId, messageId);
      get().fetchMessages(chatId);
      get().getChatQuota(chatId);
    } catch (error) {
      console.error('Delete message error:', error);
    }
  },

  getChatQuota: async (chatId) => {
    try {
      const response = await chatService.getQuota(chatId);
      const quotaData = response.data || response;
      set({ chatQuota: quotaData });
      return quotaData;
    } catch (error) {
      console.error('Get quota error:', error);
    }
  },

  pushReceivedMessage: (chatId, rawMessage) => {
    const currentUserId = get().user?.id || get().user?._id;
    const mapped = {
      ...rawMessage,
      id: rawMessage.id || rawMessage._id,
      text: rawMessage.content || rawMessage.text,
      type: rawMessage.messageType?.toLowerCase() || 'text',
      giftName: rawMessage.giftName,
      cost: rawMessage.giftCost,
      amount: rawMessage.coinAmount,
      imageUrl: rawMessage.imageUrl,
      time: rawMessage.createdAt ? new Date(rawMessage.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '',
      isMine: rawMessage.senderId === currentUserId,
    };

    // Only append to the messages list if the message belongs to the currently active chat screen
    if (get().activeChatId === chatId) {
      const currentMessages = get().messages || [];
      if (!currentMessages.some(m => m.id === mapped.id)) {
        set({ messages: [mapped, ...currentMessages] });
      }
    }
    get().fetchChats();
  },
}));

// Sync useChatStore's user state with useAuthStore's user state
useAuthStore.subscribe((state) => {
  if (state.user) {
    useChatStore.setState({ user: state.user });
  } else {
    // Fallback to default dummy user if logged out
    useChatStore.setState({
      user: {
        id: 'd0000001-0000-0000-0000-000000000009',
        gender: 'female',
        name: 'Aisha Khan',
      }
    });
  }
});