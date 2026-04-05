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
            // RecaptchaVerifier already rendered — trigger immediately
            inject({ type: 'verify' });
          }
          // If not ready yet, verify will be triggered once 'ready' message arrives
        });
      },

      _reset(): void {
        // Firebase calls this after every verifyPhoneNumber attempt.
        // Re-initialise the WebView reCAPTCHA so the next OTP send works.
        readyRef.current = false;
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
                // rv.render() completed — RecaptchaVerifier is ready
                readyRef.current = true;
                if (pendingRef.current) {
                  // verify() was already called while we were loading — fire it now
                  inject({ type: 'verify' });
                }
              } else if (data.type === 'verify' && pendingRef.current) {
                pendingRef.current.resolve(data.token);
                pendingRef.current = null;
              } else if (data.type === 'error' && pendingRef.current) {
                pendingRef.current.reject(new Error(data.message || 'reCAPTCHA failed.'));
                pendingRef.current = null;
              }
            } catch (_) {}
          }}
        />
      </View>
    );
  }
);
