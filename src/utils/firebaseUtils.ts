import {
  GoogleAuthProvider,
  getAuth,
  signInWithRedirect,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  signOut,
} from 'firebase/auth'
import { auth } from '@/lib/initializeFirebaseApp'

const loginWithGoogle = async () => {
  const googleProvider = new GoogleAuthProvider()
  const user = await signInWithRedirect(auth, googleProvider)
}

const loginWithEmail = async (email: string, password: string) => {
  try {
    const { user } = await signInWithEmailAndPassword(auth, email, password)
    return user
  } catch (error) {
    throw new Error((error as Error).message)
  }
}

const signupWithEmail = async (email: string, password: string) => {
  try {
    const { user } = await createUserWithEmailAndPassword(auth, email, password)
    return user
  } catch (error) {
    throw new Error((error as Error).message)
  }
}

const logout = async () => {
  try {
    await signOut(auth)
    return true
  } catch (error) {
    throw new Error((error as Error).message)
  }
}

const resetPassword = async (email: string) => {
  try {
    await sendPasswordResetEmail(auth, email)
    return true
  } catch (error) {
    throw new Error((error as Error).message)
  }
}

const getFirebaseErrorMessage = (code: string) => {
  if (!code) return ''
  if (code.includes('auth/')) {
    return code.split('auth/')[1].replaceAll('-', ' ').replaceAll(')', '')
  } else {
    return code
  }
}

export {
  loginWithGoogle,
  loginWithEmail,
  signupWithEmail,
  logout,
  resetPassword,
  getFirebaseErrorMessage,
}
