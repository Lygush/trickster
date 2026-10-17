// shared/useGame.js — подключение к серверу и синхронизация состояния.
// (Файл одинаковый в client-screen и client-phone.)
//
// Сервер шлёт полное состояние игры (game_state) после каждого изменения,
// поэтому клиент «без памяти»: перезагрузка страницы ничего не ломает.

import { useEffect, useRef, useState, useCallback } from 'react';
import { io } from 'socket.io-client';

export const SERVER_URL = process.env.REACT_APP_SERVER_URL || window.location.origin;

export default function useGame({ role, getToken, onEvent }) {
  const [state, setState]           = useState(null);
  const [connected, setConnected]   = useState(false);
  const [serverInfo, setServerInfo] = useState(null);
  const [error, setError]           = useState('');
  const offsetRef  = useRef(0);   // serverNow - Date.now()
  const socketRef  = useRef(null);
  const onEventRef = useRef(onEvent);
  onEventRef.current = onEvent;

  useEffect(() => {
    const socket = io(SERVER_URL, { reconnectionDelay: 500, reconnectionDelayMax: 3000 });
    socketRef.current = socket;
    let errTimer;

    socket.on('connect', () => {
      setConnected(true);
      socket.emit('hello', { role, token: getToken ? getToken() : undefined });
    });
    socket.on('disconnect', () => setConnected(false));
    socket.on('server_info', setServerInfo);
    socket.on('game_state', (s) => {
      offsetRef.current = s.serverNow - Date.now();
      setState(s);
    });
    socket.on('game_error', ({ message }) => {
      setError(message);
      clearTimeout(errTimer);
      errTimer = setTimeout(() => setError(''), 3500);
    });
    ['welcome', 'joined', 'session_reset'].forEach(ev =>
      socket.on(ev, (data) => onEventRef.current?.(ev, data)));

    return () => { clearTimeout(errTimer); socket.disconnect(); };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const emit = useCallback((event, payload) => socketRef.current?.emit(event, payload), []);
  const serverNow = useCallback(() => Date.now() + offsetRef.current, []);

  return { state, connected, serverInfo, error, emit, serverNow };
}
