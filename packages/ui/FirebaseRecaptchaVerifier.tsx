import React, { useRef, forwardRef, useImperativeHandle, useState } from 'react';
import { View, Modal, StyleSheet } from 'react-native';
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

// Hosted on Firebase Hosting so reCAPTCHA sees the correct authorized origin
const RECAPTCHA_URL = 'https://xtrack-prod-1774479059.web.app/recaptcha.html';

export const FirebaseRecaptchaVerifier = forwardRef<RecaptchaVerifierRef, { firebaseConfig: FirebaseConfig }>(
  ({ firebaseConfig }, ref) => {
    const wvRef = useRef<WebView>(null);
    const loadedRef = useRef(false);
    const pendingRef = useRef<{ resolve: (t: string) => void; reject: (e: Error) => void } | null>(null);
    const [visible, setVisible] = useState(false);

    const inject = (msg: object) => {
      wvRef.current?.injectJavaScript(
        `(function(){window.dispatchEvent(new MessageEvent('message',{data:${JSON.stringify(msg)}}));}());true;`
      );
    };

    useImperativeHandle(ref, () => ({
      type: 'recaptcha' as const,

      verify(): Promise<string> {
        return new Promise((resolve, reject) => {
          const timeout = setTimeout(() => {
            pendingRef.current = null;
            setVisible(false);
            reject(new Error('reCAPTCHA timed out. Check your connection and try again.'));
          }, 30000);

          pendingRef.current = {
            resolve: (t) => { clearTimeout(timeout); resolve(t); },
            reject: (e) => { clearTimeout(timeout); reject(e); },
          };

          if (loadedRef.current) {
            inject({ type: 'verify' });
          } else {
            // WebView not loaded yet — show it and wait for the load event
            setVisible(true);
          }
        });
      },

      _reset(): void {
        // Called by Firebase SDK after verification — no-op
      },
    }));

    return (
      <Modal
        visible={visible}
        transparent
        animationType="none"
        onRequestClose={() => {
          if (pendingRef.current) {
            pendingRef.current.reject(new Error('reCAPTCHA cancelled.'));
            pendingRef.current = null;
          }
          setVisible(false);
        }}
      >
        {/* Full-screen invisible overlay — only shown when reCAPTCHA needs a challenge */}
        <View style={StyleSheet.absoluteFill} pointerEvents="box-none">
          <View style={styles.webviewContainer}>
            <WebView
              ref={wvRef}
              javaScriptEnabled
              originWhitelist={['*']}
              source={{ uri: RECAPTCHA_URL }}
              onLoad={() => {
                // Send Firebase config to the page so it can initialise RecaptchaVerifier
                inject({ type: 'init', config: firebaseConfig });
              }}
              onMessage={(e) => {
                try {
                  const data = JSON.parse(e.nativeEvent.data);

                  if (data.type === 'load') {
                    loadedRef.current = true;
                    setVisible(false); // reCAPTCHA ready, hide until verify is triggered
                    // If verify() was called while we were waiting for load, fire it now
                    if (pendingRef.current) {
                      inject({ type: 'verify' });
                    }
                  } else if (data.type === 'verify' && pendingRef.current) {
                    setVisible(false);
                    pendingRef.current.resolve(data.token);
                    pendingRef.current = null;
                  } else if (data.type === 'error' && pendingRef.current) {
                    setVisible(false);
                    pendingRef.current.reject(new Error(data.message || 'reCAPTCHA failed.'));
                    pendingRef.current = null;
                  }
                } catch (_) {}
              }}
            />
          </View>
        </View>
      </Modal>
    );
  }
);

const styles = StyleSheet.create({
  webviewContainer: {
    position: 'absolute',
    // Positioned off screen — only slides in if a full visible challenge is needed
    bottom: -300,
    left: 0,
    right: 0,
    height: 300,
  },
});
