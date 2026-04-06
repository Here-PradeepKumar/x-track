import React, { useRef, forwardRef, useImperativeHandle, useCallback } from 'react';
import { View } from 'react-native';
import WebView from 'react-native-webview';

type FirebaseConfig = {
  apiKey: string;
  authDomain: string;
  [key: string]: string | undefined;
};

export interface RecaptchaVerifierRef {
  readonly type: 'recaptcha';
  verify(): Promise<string>;
  _reset(): void;
}

// Hosted on Firebase Hosting — correct authorized origin for reCAPTCHA
const RECAPTCHA_URL = 'https://xtrack-prod-1774479059.web.app/recaptcha.html';

export const FirebaseRecaptchaVerifier = forwardRef<RecaptchaVerifierRef, { firebaseConfig: FirebaseConfig }>(
  ({ firebaseConfig }, ref) => {
    const wvRef = useRef<WebView>(null);
    const readyRef = useRef(false);   // true once rv.render() completed in the page
    const initErrorRef = useRef<string | null>(null); // stores rv.render() failure reason
    const pendingRef = useRef<{ resolve: (t: string) => void; reject: (e: Error) => void } | null>(null);
    const configRef = useRef(firebaseConfig);
    configRef.current = firebaseConfig;

    const inject = useCallback((msg: object) => {
      wvRef.current?.injectJavaScript(
        `(function(){window.dispatchEvent(new MessageEvent('message',{data:${JSON.stringify(msg)}}));}());true;`
      );
    }, []);

    useImperativeHandle(ref, () => ({
      type: 'recaptcha' as const,

      verify(): Promise<string> {
        // If init already failed, reject immediately with the real error
        if (initErrorRef.current) {
          return Promise.reject(new Error(`reCAPTCHA init failed: ${initErrorRef.current}`));
        }
        return new Promise((resolve, reject) => {
          const timeout = setTimeout(() => {
            pendingRef.current = null;
            reject(new Error('reCAPTCHA timed out. Check your connection and try again.'));
          }, 30000);

          pendingRef.current = {
            resolve: (t) => { clearTimeout(timeout); resolve(t); },
            reject: (e) => { clearTimeout(timeout); reject(e); },
          };

          if (readyRef.current) {
            inject({ type: 'verify' });
          }
        });
      },

      _reset(): void {
        readyRef.current = false;
        initErrorRef.current = null;
        pendingRef.current = null;
        inject({ type: 'init', config: configRef.current });
      },
    }));

    return (
      // Always mounted and off-screen so the WebView is never unmounted mid-flow
      <View
        pointerEvents="none"
        style={{ position: 'absolute', width: 300, height: 400, top: -450, left: 0 }}
      >
        <WebView
          ref={wvRef}
          javaScriptEnabled
          originWhitelist={['*']}
          source={{ uri: RECAPTCHA_URL }}
          onLoad={() => {
            // Page HTML loaded — send Firebase config so the page can init RecaptchaVerifier
            inject({ type: 'init', config: firebaseConfig });
          }}
          onMessage={(e) => {
            try {
              const data = JSON.parse(e.nativeEvent.data);

              if (data.type === 'load') {
                readyRef.current = true;
                initErrorRef.current = null;
                if (pendingRef.current) {
                  inject({ type: 'verify' });
                }
              } else if (data.type === 'error') {
                const msg = data.message || 'reCAPTCHA failed.';
                console.error('[reCAPTCHA]', msg);
                if (pendingRef.current) {
                  pendingRef.current.reject(new Error(msg));
                  pendingRef.current = null;
                } else {
                  // Error during init — store so verify() can surface it immediately
                  initErrorRef.current = msg;
                }
              } else if (data.type === 'verify' && pendingRef.current) {
                pendingRef.current.resolve(data.token);
                pendingRef.current = null;
              }
            } catch (_) {}
          }}
        />
      </View>
    );
  }
);
