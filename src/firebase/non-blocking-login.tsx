
'use client';
import {
  Auth,
  signInAnonymously,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup,
  sendPasswordResetEmail,
  FirebaseError,
} from 'firebase/auth';
import { toast } from '@/hooks/use-toast';

/** Initiate anonymous sign-in (non-blocking). */
export function initiateAnonymousSignIn(authInstance: Auth): void {
  signInAnonymously(authInstance).catch((error: FirebaseError) => {
    console.error("Anonymous sign-in error:", error);
    toast({
      variant: "destructive",
      title: "Sign-in Failed",
      description: "Could not sign in anonymously. Please try again later.",
    });
  });
}

/** Initiate email/password sign-up (non-blocking). */
export function initiateEmailSignUp(authInstance: Auth, email: string, password: string): void {
  createUserWithEmailAndPassword(authInstance, email, password)
    .then(() => {
        toast({
            title: "Account Created",
            description: "You have been successfully signed up.",
        });
    })
    .catch((error: FirebaseError) => {
        console.error("Sign-up error:", error);
        let description = "An unknown error occurred during sign-up.";
        if (error.code === 'auth/email-already-in-use') {
            description = "This email is already in use. Please sign in or use a different email.";
        } else if (error.code === 'auth/weak-password') {
            description = "The password is too weak. Please choose a stronger password.";
        }
        toast({
            variant: "destructive",
            title: "Sign-up Failed",
            description: description,
        });
    });
}

/** Initiate email/password sign-in (non-blocking). */
export function initiateEmailSignIn(authInstance: Auth, email: string, password: string): void {
  signInWithEmailAndPassword(authInstance, email, password)
    .catch((error: FirebaseError) => {
      console.error("Sign-in error:", error);
      let description = "An unknown error occurred. Please try again.";
      if (error.code === 'auth/invalid-credential' || error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password') {
        description = "Invalid credentials. Please check your email and password.";
      }
      toast({
        variant: "destructive",
        title: "Sign-in Failed",
        description: description,
      });
  });
}

/** Initiate Google sign-in (non-blocking). */
export function initiateGoogleSignIn(authInstance: Auth): void {
  const provider = new GoogleAuthProvider();
  signInWithPopup(authInstance, provider)
    .catch((error: FirebaseError) => {
      console.error("Google sign-in error:", error);
      toast({
        variant: "destructive",
        title: "Google Sign-in Failed",
        description: "Could not sign in with Google. Please try again.",
      });
    });
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
