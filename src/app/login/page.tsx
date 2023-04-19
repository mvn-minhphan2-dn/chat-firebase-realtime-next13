"use client"

import { app, database } from "@/utils/firebase";
import { GoogleAuthProvider, getAuth, signInWithPopup } from "firebase/auth";
import { get, push, ref, set } from "firebase/database";
import { useRouter } from "next/navigation";
import React from 'react'

type Props = {}

export default function Page({ }: Props) {
  const auth = getAuth(app);
  const router = useRouter();
  const provider = new GoogleAuthProvider();
  const hasExistUser = async (uid: any) => {
    const userRef = ref(database, `users`);
    const result = (await get(userRef)).val();
    if(result) {
      const checkUserExist = Object.entries(result).some((f: any) => f[1].uid === uid);
      return checkUserExist;
    }
    return false;
  }
  const signInWithGoogle = async () => {
    try {
      const result = await signInWithPopup(auth, provider);
      const user = auth.currentUser;
      const { uid, accessToken, displayName, photoURL } = result.user as any;
      const checkHasExistUser = await hasExistUser(user?.uid);
      if (!checkHasExistUser) {
        // const newuserRef = await push(ref(database, `users/${uid}`));
        const newuserRef = ref(database, `users/${uid}`);
        await set(newuserRef, {
          uid,
          displayName,
          photoURL,
          createdAt: Date.now()
        });
      }
      router.push("/rooms");
      return result.user;
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <>
      <section className="container">
        <div className="text-center">
          <h1 className="mb-10 text-5xl text-pink-600">Signin to chat rooms</h1>
          <button type="button" onClick={signInWithGoogle} className="px-6 py-2 text-white transition-transform bg-pink-600 rounded-md hover:scale-105">SignIn</button>
        </div>
      </section>
    </>
  )
}
