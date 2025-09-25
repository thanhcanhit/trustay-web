import { io, Socket } from 'socket.io-client';

export const REALTIME_EVENT = {
	REGISTER: 'realtime/register',
	CONNECTED: 'realtime/connected',
	DISCONNECTED: 'realtime/disconnected',
	NOTIFY: 'notify/event',
	CHAT_MESSAGE: 'chat/message',
	HEARTBEAT_PING: 'realtime/ping',
	HEARTBEAT_PONG: 'realtime/pong',
	CONNECT: 'connect',
	DISCONNECT: 'disconnect',
	CONNECT_ERROR: 'connect_error',
	RECONNECT: 'reconnect',
	RECONNECT_ERROR: 'reconnect_error',
	RECONNECT_FAILED: 'reconnect_failed',
} as const;

export type RegisterPayload = { userId: string };

type MountableHandler = (socket: Socket, userId?: string) => void | (() => void);

let socket: Socket | null = null;

export function ensureSocket(userId: string) {
	if (socket?.connected) return socket as Socket;

	socket = io(process.env.NEXT_PUBLIC_API_URL as string, {
		path: '/ws',
		transports: ['websocket', 'polling'], // Fallback to polling if websocket fails
		withCredentials: true,
		autoConnect: true,
		reconnection: true,
		reconnectionAttempts: 5,
		reconnectionDelay: 1000,
		reconnectionDelayMax: 5000,
		timeout: 20000,
	});

	// Connection events
	socket.on(REALTIME_EVENT.CONNECT, () => {
		console.log('🔗 [SOCKET] Connected, registering userId:', userId);
		socket?.emit(REALTIME_EVENT.REGISTER, { userId } satisfies RegisterPayload);
	});

	socket.on(REALTIME_EVENT.DISCONNECT, (reason: string) => {
		console.log('❌ [SOCKET] Disconnected:', reason);
		if (reason === 'io server disconnect') {
			// Server initiated disconnect, reconnect manually
			socket?.connect();
		}
	});

	socket.on(REALTIME_EVENT.CONNECT_ERROR, (error: Error) => {
		console.error('🚫 [SOCKET] Connection error:', error.message);
	});

	socket.on(REALTIME_EVENT.RECONNECT, (attemptNumber: number) => {
		console.log('🔄 [SOCKET] Reconnected after', attemptNumber, 'attempts');
		// Re-register user after reconnection
		socket?.emit(REALTIME_EVENT.REGISTER, { userId } satisfies RegisterPayload);
	});

	socket.on(REALTIME_EVENT.RECONNECT_ERROR, (error: Error) => {
		console.error('🔄❌ [SOCKET] Reconnection error:', error.message);
	});

	socket.on(REALTIME_EVENT.RECONNECT_FAILED, () => {
		console.error('🔄🚫 [SOCKET] Reconnection failed after maximum attempts');
	});

	// Heartbeat
	socket.on(REALTIME_EVENT.HEARTBEAT_PING, () => {
		socket?.emit(REALTIME_EVENT.HEARTBEAT_PONG);
	});

	return socket as Socket;
}

export function mountHandlers(userId: string, handlers: MountableHandler[]) {
	const s = ensureSocket(userId);
	const disposers = handlers.map((h) => h(s, userId)).filter(Boolean) as (() => void)[];
	return () => {
		disposers.forEach((d) => d());
	};
}

export function closeSocket() {
	socket?.close();
	socket = null;
}

export function getSocketStatus() {
	return {
		connected: socket?.connected || false,
		id: socket?.id || null,
		disconnected: socket?.disconnected || false,
	};
}

export function forceReconnect(userId: string) {
	if (socket) {
		console.log('🔄 [SOCKET] Force reconnecting...');
		socket.disconnect();
		socket = null;
	}
	return ensureSocket(userId);
}

export function isSocketHealthy(): boolean {
	return socket?.connected === true;
}
