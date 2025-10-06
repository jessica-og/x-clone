'use client';


import { RecoilRoot } from 'recoil';
import { FirebaseAuthProvider } from './FirebaseAuthProvider';

const SessionWrapper = ({ children }) => {
  return (
    <FirebaseAuthProvider>
      <RecoilRoot>{children}</RecoilRoot>
    </FirebaseAuthProvider>
  );
};

export default SessionWrapper;
