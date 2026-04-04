import React, { useRef, forwardRef, useImperativeHandle } from 'react';
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

function getHtml(config: FirebaseConfig): string {
  return `<!DOCTYPE html><html>
<head>
  <meta name="viewport" content="width=device-width,initial-scale=1,maximum-scale=1,user-scalable=no">
  <script src="https://www.gstatic.com/firebasejs/8.0.0/firebase-app.js"></script>
  <script src="https://www.gstatic.com/firebasejs/8.0.0/firebase-auth.js"></script>
  <script>firebase.initializeApp(${JSON.stringify(config)});</script>
  <style>html,body{height:100%;padding:0;margin:0;}</style>
</head>
<body>
  <button id="rcb" type="button" style="width:100%;height:100%;border:0;" onclick="onClickBtn()"></button>
  <script>
    var timer;
    function onVerify(token){
      if(timer){clearInterval(timer);timer=null;}
      window.ReactNativeWebView.postMessage(JSON.stringify({type:'verify',token:token}));
    }
    function onLoad(){
      window.rv=new firebase.auth.RecaptchaVerifier('rcb',{size:'invisible',callback:onVerify});
      window.rv.render().then(function(){
        window.ReactNativeWebView.postMessage(JSON.stringify({type:'load'}));
      }).catch(onError);
    }
    function onError(){
      window.ReactNativeWebView.postMessage(JSON.stringify({type:'error'}));
    }
    function onClickBtn(){
      if(!timer){
        timer=setInterval(function(){
          var ifs=document.getElementsByTagName('iframe');
          for(var i=0;i<ifs.length;i++){
            var p=ifs[i].parentNode?ifs[i].parentNode.parentNode:null;
            var hidden=p&&p.style.opacity=='0';
            if(!hidden&&(ifs[i].title==='recaptcha challenge'||ifs[i].src.indexOf('bframe')>=0)){
              clearInterval(timer);timer=null;
              window.ReactNativeWebView.postMessage(JSON.stringify({type:'fullChallenge'}));
              return;
            }
          }
        },100);
      }
    }
    window.addEventListener('message',function(e){
      if(e.data&&e.data.verify) document.getElementById('rcb').click();
    });
  </script>
  <script src="https://www.google.com/recaptcha/api.js?onload=onLoad&render=explicit" onerror="onError()"></script>
</body></html>`;
}

export const FirebaseRecaptchaVerifier = forwardRef<RecaptchaVerifierRef, { firebaseConfig: FirebaseConfig }>(
  ({ firebaseConfig }, ref) => {
    const wvRef = useRef<WebView>(null);
    const loadedRef = useRef(false);
    const pendingRef = useRef<{ resolve: (t: string) => void; reject: (e: Error) => void } | null>(null);

    useImperativeHandle(ref, () => ({
      type: 'recaptcha' as const,
      verify(): Promise<string> {
        return new Promise((resolve, reject) => {
          const timeout = setTimeout(() => {
            pendingRef.current = null;
            reject(new Error('reCAPTCHA timed out. Check your internet connection and try again.'));
          }, 30000);
          pendingRef.current = {
            resolve: (t) => { clearTimeout(timeout); resolve(t); },
            reject: (e) => { clearTimeout(timeout); reject(e); },
          };
          if (loadedRef.current && wvRef.current) {
            wvRef.current.injectJavaScript(
              `window.dispatchEvent(new MessageEvent('message',{data:{verify:true}}));true;`
            );
          }
        });
      },
      _reset(): void {
        // Called by Firebase SDK after verification completes — no-op for WebView-based verifier
      },
    }));

    return (
      <View style={{ width: 0, height: 0, overflow: 'hidden' }}>
        <WebView
          ref={wvRef}
          javaScriptEnabled
          mixedContentMode="always"
          source={{ baseUrl: `https://${firebaseConfig.authDomain}`, html: getHtml(firebaseConfig) }}
          onMessage={(e) => {
            const data = JSON.parse(e.nativeEvent.data);
            if (data.type === 'load') {
              loadedRef.current = true;
              if (pendingRef.current && wvRef.current) {
                wvRef.current.injectJavaScript(
                  `window.dispatchEvent(new MessageEvent('message',{data:{verify:true}}));true;`
                );
              }
            } else if (data.type === 'verify' && pendingRef.current) {
              pendingRef.current.resolve(data.token);
              pendingRef.current = null;
            } else if ((data.type === 'error' || data.type === 'fullChallenge') && pendingRef.current) {
              pendingRef.current.reject(new Error(
                data.type === 'fullChallenge'
                  ? 'reCAPTCHA requires manual verification — not supported in this build.'
                  : 'Failed to load reCAPTCHA.'
              ));
              pendingRef.current = null;
            }
          }}
        />
      </View>
    );
  }
);
