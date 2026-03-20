/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect } from "react";
import { io } from "socket.io-client";

export const socket = io(import.meta.env.VITE_API_URL, {
    path: '/ws',
    transports: ['websocket', 'polling']
});

export const useSocket = (channel: string, callback: (data: any) => void) => {
    useEffect(() => {
        socket.on(channel, callback);

        return () => {
            socket.off(channel, callback);
        };
    }, [channel, callback]);

    return socket;
};
