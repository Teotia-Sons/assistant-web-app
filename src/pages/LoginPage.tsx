import {
  CodeResponse,
  GoogleOAuthProvider,
  useGoogleLogin,
} from '@react-oauth/google';
import React from 'react';

import { login } from '../services/authService';

type LoginPageComponentParams = {
  onLoginHook: () => void;
};

function LoginForm({ onLoginHook }: LoginPageComponentParams) {
  const handleAuthCodeResponse = async (codeResponse: CodeResponse) => {
    await login(codeResponse.code);
    onLoginHook();
  };

  const handleLoginClick = useGoogleLogin({
    onSuccess: handleAuthCodeResponse,
    flow: 'auth-code',
  });

  return (
    <div className={'flex flex-col items-center space-y-4 p-8'}>
      <title>Sign in</title>
      <button className={'px-4 py-2'} onClick={() => handleLoginClick()}>
        Sign in
      </button>
    </div>
  );
}

export default function LoginPage({ onLoginHook }: LoginPageComponentParams) {
  return (
    <GoogleOAuthProvider clientId={process.env.REACT_APP_GOOGLE_CLIENT_ID!}>
      <LoginForm onLoginHook={onLoginHook} />
    </GoogleOAuthProvider>
  );
}
