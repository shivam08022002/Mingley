import { HubConnectionBuilder, HttpTransportType, LogLevel } from '@microsoft/signalr';
import { safeStorage } from './api';
import { useChatStore } from '../store/useChatStore';
import { useMatchesStore } from '../features/matches/store/useMatchesStore';
import { useToastStore } from '../store/useToastStore';
import { navigationRef } from '../navigation';

class SignalRService {
  connection = null;
  started = false;

  async start() {
    if (this.started) return;

    try {
      const token = await safeStorage.getItem('accessToken');
      if (!token) {
        console.warn('SignalR: No access token found, skipping connection.');
        return;
      }

      this.connection = new HubConnectionBuilder()
        .withUrl(`https://mingley-backend-v2.onrender.com/hubs/chat?access_token=${token}`, {
          skipNegotiation: true,
          transport: HttpTransportType.WebSockets,
        })
        .withAutomaticReconnect()
        .configureLogging(LogLevel.Information)
        .build();

      // Listen for incoming call
      this.connection.on('IncomingCall', (data) => {
        console.log('SignalR Event: IncomingCall', data);
        const { callId, callType, caller } = data;
        
        if (navigationRef.isReady()) {
          navigationRef.navigate('Calling', {
            user: caller,
            callType,
            callId,
            isIncoming: true,
          });
        }
      });

      // Listen for call answered
      this.connection.on('CallAnswered', (data) => {
        console.log('SignalR Event: CallAnswered', data);
        // Call screen will handle Agora token dynamically or let the timer run.
        useToastStore.getState().showToast({
          title: 'Call Connected',
          text: 'Receiver accepted the call.',
          type: 'success',
        });
      });

      // Listen for call ended / declined / missed
      this.connection.on('CallEnded', (data) => {
        console.log('SignalR Event: CallEnded', data);
        this.closeCallScreenIfActive(data.callId, 'Call ended.');
      });

      this.connection.on('CallDeclined', (data) => {
        console.log('SignalR Event: CallDeclined', data);
        this.closeCallScreenIfActive(data.callId, 'Call declined by receiver.');
      });

      this.connection.on('CallMissed', (data) => {
        console.log('SignalR Event: CallMissed', data);
        this.closeCallScreenIfActive(data.callId, 'Call missed.');
      });

      this.connection.on('MissedCall', (data) => {
        console.log('SignalR Event: MissedCall', data);
        useToastStore.getState().showToast({
          title: 'Missed Call 📞',
          text: `You missed a call from ${data.caller?.fullName || data.caller?.name || 'User'}`,
          type: 'info',
        });
      });

      // Listen for new messages
      this.connection.on('NewMessage', (data) => {
        console.log('SignalR Event: NewMessage', data);
        const { chatId, message } = data;
        useChatStore.getState().pushReceivedMessage(chatId, message);
      });

      // Listen for read receipts
      this.connection.on('MessageRead', (data) => {
        console.log('SignalR Event: MessageRead', data);
        useChatStore.getState().fetchChats();
      });

      // Listen for new matches
      this.connection.on('NewMatch', (data) => {
        console.log('SignalR Event: NewMatch', data);
        const { matchId, user } = data;
        useMatchesStore.getState().pushNewMatch({ matchId, matchedUser: user });
        useToastStore.getState().showToast({
          title: 'New Match! 🎉',
          text: `You and ${user.fullName || user.name} have matched!`,
          type: 'success',
        });
      });

      // Listen for general notifications
      this.connection.on('NewNotification', (data) => {
        console.log('SignalR Event: NewNotification', data);
        const { title, body, type } = data;

        // Skip call-related notifications to let the CallingScreen handle it natively
        if (
          type === 'call' || 
          type === 'incoming_call' || 
          title?.toLowerCase().includes('call') || 
          body?.toLowerCase().includes('calling') || 
          body?.toLowerCase().includes('call')
        ) {
          console.log('Skipping call notification toast to avoid overlap with CallingScreen.');
          return;
        }

        useToastStore.getState().showToast({
          title,
          text: body,
          type: type === 'error' ? 'error' : 'info',
        });
      });

      // Listen for online status updates
      this.connection.on('UserOnlineStatus', (data) => {
        console.log('SignalR Event: UserOnlineStatus', data);
        useChatStore.getState().fetchChats();
      });

      await this.connection.start();
      this.started = true;
      console.log('SignalR: Connection established successfully.');
    } catch (error) {
      console.error('SignalR: Failed to connect:', error);
      this.started = false;
    }
  }

  closeCallScreenIfActive(callId, message) {
    if (navigationRef.isReady()) {
      const currentRoute = navigationRef.getCurrentRoute();
      if (currentRoute?.name === 'Calling' && (currentRoute.params?.callId === callId || !callId)) {
        navigationRef.goBack();
        useToastStore.getState().showToast({
          title: 'Call Terminated',
          text: message,
          type: 'info',
        });
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
      console.error('SignalR: Failed to stop connection:', error);
    }
  }
}

export const signalRService = new SignalRService();
