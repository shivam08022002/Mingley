import api from './api';

export const authService = {
  register: async (userData) => {
    try {
      const response = await api.post('/v1/auth/register', userData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  login: async (credentials) => {
    try {
      const response = await api.post('/v1/auth/login', credentials);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  changePassword: async (passwordData) => {
    try {
      const response = await api.post('/v1/auth/change-password', passwordData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  forgotPassword: async (identifier) => {
    try {
      const response = await api.post('/v1/auth/forgot-password', { identifier });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  resetPassword: async (resetData) => {
    try {
      const response = await api.post('/v1/auth/reset-password', resetData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  logout: async () => {
    try {
      const response = await api.post('/v1/auth/logout');
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },
};

export const walletService = {
  getBalance: async () => {
    try {
      const response = await api.get('/v1/wallet/balance');
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  getPackages: async () => {
    try {
      const response = await api.get('/v1/wallet/packages');
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  getTransactions: async () => {
    try {
      const response = await api.get('/v1/wallet/transactions');
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  deposit: async (depositData) => {
    try {
      const response = await api.post('/v1/wallet/deposit', depositData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  withdraw: async (withdrawData) => {
    try {
      const response = await api.post('/v1/wallet/withdraw', withdrawData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  createRazorpayOrder: async (packageId) => {
    try {
      const response = await api.post('/v1/wallet/razorpay/order', { packageId });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  verifyRazorpayPayment: async (verifyData) => {
    try {
      const response = await api.post('/v1/wallet/razorpay/verify', verifyData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },
};

export const discoverService = {
  getFeed: async (params) => {
    try {
      const response = await api.get('/v1/discover', { params });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  getLikesFeed: async (params) => {
    try {
      const response = await api.get('/v1/discover/likes', { params });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  swipe: async (swipeData) => {
    try {
      const response = await api.post('/v1/discover/swipe', swipeData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },
};

export const giftService = {
  getCatalog: async () => {
    try {
      const response = await api.get('/v1/gifts/catalog');
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  getCategories: async () => {
    try {
      const response = await api.get('/v1/gifts/categories');
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  sendGift: async (giftData) => {
    try {
      const response = await api.post('/v1/gifts/send', giftData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },
};

export const superchatService = {
  send: async (superchatData) => {
    try {
      const response = await api.post('/v1/superchat/send', superchatData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  respond: async (id, responseData) => {
    try {
      const response = await api.post(`/v1/superchat/${id}/respond`, responseData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  getReceived: async () => {
    try {
      const response = await api.get('/v1/superchat/received');
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  getSent: async () => {
    try {
      const response = await api.get('/v1/superchat/sent');
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },
};

export const matchesService = {
  getMatches: async () => {
    try {
      const response = await api.get('/v1/matches');
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  declineMatch: async (matchId) => {
    try {
      const response = await api.delete(`/v1/matches/${matchId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },
};

export const userService = {
  getMe: async () => {
    try {
      const response = await api.get('/v1/users/me');
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  getCoverPhoto: async () => {
    try {
      const response = await api.get('/v1/users/me/cover-photo');
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  updateCoverPhoto: async (url) => {
    try {
      const response = await api.post('/v1/users/me/cover-photo', { url });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  deleteCoverPhoto: async () => {
    try {
      const response = await api.delete('/v1/users/me/cover-photo');
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  updateMe: async (userData) => {
    try {
      const response = await api.put('/v1/users/me', userData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  updatePreferences: async (preferences) => {
    try {
      const response = await api.put('/v1/users/me/preferences', preferences);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  reorderImages: async (imageIds) => {
    try {
      const response = await api.put('/v1/users/me/images/reorder', { imageIds });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  getInterests: async () => {
    try {
      const response = await api.get('/v1/interests');
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  updateInterests: async (interests) => {
    try {
      const response = await api.put('/v1/users/me/interests', { interests });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  updateLocation: async (locationData) => {
    try {
      const response = await api.put('/v1/users/me/location', locationData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  uploadImage: async (imageData) => {
    try {
      const response = await api.post('/v1/users/me/images', imageData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  deleteImage: async (imageId) => {
    try {
      const response = await api.delete(`/v1/users/me/images/${imageId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  setPrimaryImage: async (imageId) => {
    try {
      const response = await api.put(`/v1/users/me/images/${imageId}/primary`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  blockUser: async (userId) => {
    try {
      const response = await api.post(`/v1/users/${userId}/block`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  unblockUser: async (userId) => {
    try {
      const response = await api.delete(`/v1/users/${userId}/block`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  getBlockedUsers: async () => {
    try {
      const response = await api.get('/v1/users/blocked');
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  reportUser: async (userId, reportData) => {
    try {
      const response = await api.post(`/v1/users/${userId}/report`, reportData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  deleteAccount: async (data) => {
    try {
      const response = await api.delete('/v1/users/me/account', { data });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  verifyAccount: async (verifyData) => {
    try {
      const response = await api.post('/v1/verify', verifyData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  getPrivacyPolicy: async () => {
    try {
      const response = await api.get('/v1/privacy/policy');
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  acceptPrivacyPolicy: async (matchId) => {
    try {
      const response = await api.post(`/v1/privacy/accept/${matchId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  getNotifications: async () => {
    try {
      const response = await api.get('/v1/notifications');
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  getUnreadNotificationsCount: async () => {
    try {
      const response = await api.get('/v1/notifications/unread-count');
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  markNotificationAsRead: async (id) => {
    try {
      const response = await api.put(`/v1/notifications/${id}/read`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  markAllNotificationsAsRead: async () => {
    try {
      const response = await api.put('/v1/notifications/read-all');
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  getUserById: async (id) => {
    try {
      const response = await api.get(`/v1/users/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  uploadContacts: async (phoneNumbers) => {
    try {
      const response = await api.post('/v1/users/contact', { phoneNumbers });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },
};

export const chatService = {
  getChats: async () => {
    try {
      const response = await api.get('/v1/chats');
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  getMessages: async (chatId, page = 1) => {
    try {
      const response = await api.get(`/v1/chats/${chatId}/messages`, { params: { page } });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  sendMessage: async (chatId, messageData) => {
    try {
      const response = await api.post(`/v1/chats/${chatId}/messages`, messageData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  sendCoins: async (chatId, coinData) => {
    try {
      const response = await api.post(`/v1/chats/${chatId}/send-coins`, coinData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  markAsRead: async (chatId) => {
    try {
      const response = await api.put(`/v1/chats/${chatId}/read`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  deleteMessage: async (chatId, messageId) => {
    try {
      const response = await api.delete(`/v1/chats/${chatId}/messages/${messageId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  getQuota: async (chatId) => {
    try {
      const response = await api.get(`/v1/chats/${chatId}/quota`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },
};

export const subscriptionService = {
  getPlans: async () => {
    try {
      const response = await api.get('/v1/subscriptions/plans');
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  getStatus: async () => {
    try {
      const response = await api.get('/v1/subscriptions/status');
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  subscribe: async (subscribeData) => {
    try {
      // Payload as per image: planId, autoRenew, paymentMethod, paymentId, orderId, signature
      const response = await api.post('/v1/subscriptions/subscribe', subscribeData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  cancelSubscription: async (subscriptionId, reason) => {
    try {
      // Endpoint: POST /v1/subscriptions/{subscriptionId}/cancel with reason in body
      const response = await api.post(`/v1/subscriptions/${subscriptionId}/cancel`, { reason });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },
};

export const callService = {
  initiateCall: async (targetId, callType) => {
    try {
      const response = await api.post('/v1/calls/initiate', { targetId, callType });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  answerCall: async (callId) => {
    try {
      const response = await api.post(`/v1/calls/${callId}/answer`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  declineCall: async (callId) => {
    try {
      const response = await api.post(`/v1/calls/${callId}/decline`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  endCall: async (callId) => {
    try {
      const response = await api.post(`/v1/calls/${callId}/end`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  timeoutCall: async (callId) => {
    try {
      const response = await api.post(`/v1/calls/${callId}/timeout`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  getAgoraToken: async (callId) => {
    try {
      const response = await api.get(`/v1/calls/${callId}/agora-token`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  getCallHistory: async () => {
    try {
      const response = await api.get('/v1/calls/history');
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },
};

export const notificationService = {
  updateFcmToken: async (token) => {
    try {
      const response = await api.post('/v1/notifications/fcm-token', { token });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  testPush: async (title, body) => {
    try {
      const response = await api.post('/v1/notifications/test-push', { title, body });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },
};


