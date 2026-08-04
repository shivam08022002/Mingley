import { HubConnectionBuilder, HttpTransportType, LogLevel } from '@microsoft/signalr';
import { safeStorage, BASE_URL } from './api';
import { useChatStore } from '../store/useChatStore';
import { useMatchesStore } from '../features/matches/store/useMatchesStore';
import { useToastStore } from '../store/useToastStore';
import { navigationRef } from '../navigation/navigationRef';

const customSignalRLogger = {
  log: (logLevel, message) => {
    if (logLevel >= LogLevel.Error) {
      console.warn('[SignalR Error]', message);
    } else if (logLevel >= LogLevel.Warning) {
      console.warn('[SignalR Warning]', message);
    } else {
      console.log('[SignalR]', message);
    }
  },
};

class SignalRService {
  constructor() {
    this.connection = null;
    this.started = false;
    this.isConnecting = false;
    this.listeners = {}; // eventName -> Set of callbacks
    this.onCallAnswered = null; // compatibility callback slot
  }

  on(eventName, callback) {
    if (!this.listeners[eventName]) {
      this.listeners[eventName] = new Set();
    }
    this.listeners[eventName].add(callback);
    // Return unsubscribe function for useEffect cleanup
    return () => {
      this.listeners[eventName]?.delete(callback);
    };
  }

  _emit(eventName, payload) {
    this.listeners[eventName]?.forEach((cb) => {
      try {
        cb(payload);
      } catch (e) {
        console.warn(`[signalR] listener error for ${eventName}:`, e);
      }
    });
  }

  // Alias connect to start for compatibility
  async connect() {
    return this.start();
  }

  // Alias disconnect to stop for compatibility
  async disconnect() {
    return this.stop();
  }

  async start() {
    if (this.started || this.isConnecting) return;
    this.isConnecting = true;

    try {
      const token = await safeStorage.getItem('accessToken');
      if (!token) {
        console.warn('SignalR: No access token found, skipping connection.');
        this.isConnecting = false;
        return;
      }

      this.connection = new HubConnectionBuilder()
        .withUrl(`${BASE_URL}/hubs/chat?access_token=${token}`, {
          skipNegotiation: true,
          transport: HttpTransportType.WebSockets,
        })
        .withAutomaticReconnect([0, 2000, 5000, 10000, 20000])
        .configureLogging(customSignalRLogger)
        .build();

      this.connection.serverTimeoutInMilliseconds = 60000;
      this.connection.keepAliveIntervalInMilliseconds = 15000;

      // ── Incoming Call ──
      this.connection.on('IncomingCall', (data) => {
        console.log('SignalR Event: IncomingCall', data);
        this._emit('IncomingCall', data);
      });

      // ── Call Answered ──
      this.connection.on('CallAnswered', (data) => {
        console.log('SignalR Event: CallAnswered', data);
        if (this.onCallAnswered) {
          try { this.onCallAnswered(data); } catch (e) { console.error(e); }
        }
        this._emit('CallAnswered', data);
      });

      // ── Call Ended ──
      this.connection.on('CallEnded', (data) => {
        console.log('SignalR Event: CallEnded', data);
        this.closeCallScreenIfActive(data.callId, 'Call ended.');
        this._emit('CallEnded', data);
      });

      // ── Call Declined ──
      this.connection.on('CallDeclined', (data) => {
        console.log('SignalR Event: CallDeclined', data);
        this.closeCallScreenIfActive(data.callId, 'Call declined by receiver.');
        this._emit('CallDeclined', data);
      });

      // ── Call Missed ──
      this.connection.on('CallMissed', (data) => {
        console.log('SignalR Event: CallMissed', data);
        this.closeCallScreenIfActive(data.callId, 'Call missed.');
        this._emit('CallMissed', data);
      });

      // ── Missed Call Toast ──
      this.connection.on('MissedCall', (data) => {
        console.log('SignalR Event: MissedCall', data);
        useToastStore.getState().showToast({
          title: 'Missed Call 📞',
          text: `You missed a call from ${data.caller?.fullName || data.caller?.name || 'User'}`,
          type: 'info',
        });
        this._emit('MissedCall', data);
      });

      // ── Messages ──
      this.connection.on('NewMessage', (data) => {
        console.log('SignalR Event: NewMessage', data);
        const { chatId, message } = data;
        useChatStore.getState().pushReceivedMessage(chatId, message);
        this._emit('NewMessage', data);
      });

      this.connection.on('MessagesRead', (data) => {
        console.log('SignalR Event: MessagesRead', data);
        useChatStore.getState().fetchChats();
        this._emit('MessagesRead', data);
      });

      this.connection.on('Typing', (data) => {
        this._emit('Typing', data);
      });

      // ── Matches ──
      this.connection.on('NewMatch', (data) => {
        console.log('SignalR Event: NewMatch', data);
        const { matchId, user } = data;
        useMatchesStore.getState().pushNewMatch({ matchId, matchedUser: user });
        this._emit('NewMatch', data);
      });

      // ── General Notifications ──
      this.connection.on('NewNotification', (data) => {
        console.log('SignalR Event: NewNotification', data);
        const { title, body, type } = data;

        // Skip call-related notifications to let CallingScreen/IncomingCallScreen handle it
        if (
          type === 'call' ||
          type === 'incoming_call' ||
          title?.toLowerCase().includes('call') ||
          body?.toLowerCase().includes('calling') ||
          body?.toLowerCase().includes('call')
        ) {
          console.log('Skipping call notification toast to avoid overlap.');
          return;
        }

        useToastStore.getState().showToast({
          title,
          text: body,
          type: type === 'error' ? 'error' : 'info',
        });
        this._emit('NewNotification', data);
      });

      // ── Online Status ──
      this.connection.on('UserOnlineStatus', (data) => {
        console.log('SignalR Event: UserOnlineStatus', data);
        useChatStore.getState().fetchChats();
        this._emit('UserOnlineStatus', data);
      });

      this.connection.onreconnecting(() => console.warn('[signalR] reconnecting...'));
      this.connection.onreconnected(() => console.log('[signalR] reconnected'));
      this.connection.onclose((err) => console.warn('[signalR] connection closed', err));

      await this.connection.start();
      this.started = true;
      console.log('SignalR: Connection established successfully.');
    } catch (error) {
      console.warn('SignalR: Failed to connect:', error);
      this.started = false;
    } finally {
      this.isConnecting = false;
    }
  }

  closeCallScreenIfActive(callId, message) {
    if (navigationRef.isReady()) {
      const currentRoute = navigationRef.getCurrentRoute();
      if (
        (currentRoute?.name === 'Calling' || currentRoute?.name === 'IncomingCall') &&
        (currentRoute.params?.callId === callId || !callId)
      ) {
        if (navigationRef.canGoBack()) {
          navigationRef.goBack();
        } else {
          navigationRef.reset({ index: 0, routes: [{ name: 'Home' }] });
        }
      }
    }
  }

  async stop() {
    if (!this.started || !this.connection) return;

    try {
      await this.connection.stop();
      this.connection = null;
      this.started = false;
      console.log('SignalR: Connection stopped successfully.');
    } catch (error) {
      console.warn('SignalR: Failed to stop connection:', error);
    }
  }

  async joinChat(chatId) {
    if (!this.started || !this.connection || !chatId) return;
    if (this.connection.state !== 'Connected') {
      setTimeout(() => this.joinChat(chatId), 500);
      return;
    }
    try {
      await this.connection.invoke('JoinChat', chatId);
      console.log(`SignalR: Joined chat group chat_${chatId}`);
    } catch (error) {
      console.warn('SignalR: JoinChat failed:', error);
    }
  }

  async leaveChat(chatId) {
    if (!this.started || !this.connection || !chatId) return;
    try {
      await this.connection.invoke('LeaveChat', chatId);
      console.log(`SignalR: Left chat group chat_${chatId}`);
    } catch (error) {
      console.warn('SignalR: LeaveChat failed:', error);
    }
  }
}

export const signalRService = new SignalRService();
