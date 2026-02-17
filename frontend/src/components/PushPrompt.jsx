import React, { useState } from 'react';
import { notificationsApi } from '../services/api.js';

const urlBase64ToUint8Array = (base64String) => {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  return Uint8Array.from([...rawData].map((char) => char.charCodeAt(0)));
};

const PushPrompt = () => {
  const [state, setState] = useState('idle');

  const enable = async () => {
    try {
      setState('loading');
      if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
        setState('unsupported');
        return;
      }

      const keyRes = await notificationsApi.publicKey();
      if (!keyRes.enabled || !keyRes.publicKey) {
        setState('unsupported');
        return;
      }

      const permission = await Notification.requestPermission();
      if (permission !== 'granted') {
        setState('denied');
        return;
      }

      const registration = await navigator.serviceWorker.register('/sw.js');
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(keyRes.publicKey)
      });
      await notificationsApi.subscribe(subscription);
      setState('enabled');
    } catch (error) {
      setState('error');
    }
  };

  if (state === 'enabled') {
    return <span className="push-status">Alerts On</span>;
  }

  return (
    <button type="button" className="push-button secondary" onClick={enable} disabled={state === 'loading'}>
      {state === 'loading' ? 'Enabling...' : 'Enable Alerts'}
    </button>
  );
};

export default PushPrompt;
