import { io, Socket } from 'socket.io-client';

export const REALTIME_EVENT = {
	REGISTER: 'realtime/register',
	CONNECTED: 'realtime/connected',
	DISCONNECTED: 'realtime/disconnected',
	NOTIFY: 'notify/event',
	CHAT_MESSAGE: 'chat/message',
	HEARTBEAT_PING: 'realtime/ping',
	HEARTBEAT_PONG: 'realtime/pong',
} as const;

export type RegisterPayload = { userId: string };

type MountableHandler = (socket: Socket) => void | (() => void);

let socket: Socket | null = null;

export function ensureSocket(userId: string) {
	if (socket?.connected) return socket as Socket;
	socket = io(process.env.NEXT_PUBLIC_API_URL as string, {
		path: '/ws',
		transports: ['websocket'],
		withCredentials: true,
		autoConnect: true,
	});
	socket.on('connect', () => {
		socket?.emit(REALTIME_EVENT.REGISTER, { userId } satisfies RegisterPayload);
	});
	socket.on(REALTIME_EVENT.HEARTBEAT_PING, () => {
		socket?.emit(REALTIME_EVENT.HEARTBEAT_PONG);
	});
	return socket as Socket;
}

export function mountHandlers(userId: string, handlers: MountableHandler[]) {
	const s = ensureSocket(userId);
	const disposers = handlers.map((h) => h(s)).filter(Boolean) as (() => void)[];
	return () => {
		disposers.forEach((d) => d());
	};
}

export function closeSocket() {
	socket?.close();
	socket = null;
}
