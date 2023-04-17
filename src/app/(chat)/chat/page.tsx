"use client"

import { app, database } from "@/utils/firebase";
import { get, getDatabase, onChildAdded, onValue, push, ref, set } from "firebase/database";
import * as React from "react";
import { GoogleAuthProvider, getAuth, onAuthStateChanged, signInWithPopup } from 'firebase/auth';
import { useRouter } from "next/navigation";

type Props = {}
interface Message {
  id: string;
  text: string;
  createdAt?: number;
}
const inputClass = "px-2 py-1 text-red-400";

export default function Page({ }: Props) {
  const [room, setRoom] = React.useState<any>();
  const [roomId, setRoomId] = React.useState<any>();
  const [messages, setMessages] = React.useState<Message[]>([]);
  const auth = getAuth(app);
  const router = useRouter();

  React.useEffect(() => {
    const messagesRef = ref(database, "messages");
    onValue(messagesRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const messages = Object.entries(data).map(([_id, value]) => ({
          id: _id,
          ...value as any,
        }));
        setMessages(messages);
      }
    });
  }, []);

  const handleCreateRoom = async (e: React.FormEvent) => {
    e.preventDefault();
    const newRoomRef = push(ref(database, 'rooms'));
    await set(newRoomRef, {
      room,
      createdAt: Date.now()
    });
    console.log(newRoomRef);
    
    return newRoomRef.key;
  };
  const getRooms = async () => {
    const snapshot = await get(ref(database, 'rooms'));
    const rooms = [] as any;
    snapshot.forEach((child) => {
      rooms.push({
        id: child.key,
        ...child.val()
      });
    });
    setRoomId(rooms[0]);
    console.log(rooms);
    
    return rooms;
  };
  const joinRoom = async (roomId: any, userId: unknown) => {
    const newMemberRef = push(ref(database, `rooms/${roomId}/users`));
    await set(newMemberRef, userId);
    return newMemberRef.key;
  };

  const provider = new GoogleAuthProvider();
  const hasExistUser = async (uid: any) => {
    const userRef = ref(database, `users`);
    const result = (await get(userRef)).val();
    const checkUserExist = Object.entries(result).some((f: any) => f[1].uid === uid);
    return checkUserExist;
  }
  const signInWithGoogle = async () => {
    try {
      const result = await signInWithPopup(auth, provider);
      const user = auth.currentUser;
      const { uid, accessToken, displayName, photoURL } = result.user as any;
      const checkHasExistUser = await hasExistUser(user?.uid);
      if(!checkHasExistUser){
        const newuserRef = push(ref(database, 'users'));
        set(newuserRef, {
          uid,
          displayName,
          photoURL,
          createdAt: Date.now()
        });
        sessionStorage.setItem("accessToken", accessToken);
      }
      router.push("/chatRoom");
      return result.user;
    } catch (error) {
      console.log(error);
    }
  };


  return (
    <>
      <section className="container">
        <h1>chat</h1>
        <div>
        <form onSubmit={handleCreateRoom}>
          <input type="text" name="room" onChange={(e) => setRoom(e.target.value)} className={`${inputClass}`} />
          <button>Create room</button>
        </form>
        </div>
        <button type="button" onClick={signInWithGoogle} className="text-white">SignIn</button>
      </section>
    </>
  )
}
