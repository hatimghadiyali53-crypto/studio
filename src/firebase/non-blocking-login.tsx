
'use client';
import {
  Auth,
  signInAnonymously,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup,
  sendPasswordResetEmail,
} from 'firebase/auth';
import { toast } from '@/hooks/use-toast';

/** Initiate anonymous sign-in (non-blocking). */
export function initiateAnonymousSignIn(authInstance: Auth): void {
  signInAnonymously(authInstance);
}

/** Initiate email/password sign-up (non-blocking). */
export function initiateEmailSignUp(authInstance: Auth, email: string, password: string): void {
  createUserWithEmailAndPassword(authInstance, email, password);
}

/** Initiate email/password sign-in (non-blocking). */
export function initiateEmailSignIn(authInstance: Auth, email: string, password: string): void {
  signInWithEmailAndPassword(authInstance, email, password);
}

/** Initiate Google sign-in (non-blocking). */
export function initiateGoogleSignIn(authInstance: Auth): void {
  const provider = new GoogleAuthProvider();
  signInWithPopup(authInstance, provider);
}

/** Initiate password reset email (non-blocking). */
export async function initiatePasswordReset(authInstance: Auth, email: string): Promise<void> {
  try {
    await sendPasswordResetEmail(authInstance, email);
    toast({
      title: "Password Reset Email Sent",
      description: `If an account exists for ${email}, a password reset link has been sent.`,
    });
  } catch (error: any) {
    console.error("Password reset error:", error);
    toast({
      variant: "destructive",
      title: "Error Sending Reset Email",
      description: error.message || "An unknown error occurred.",
    });
  }
}

    