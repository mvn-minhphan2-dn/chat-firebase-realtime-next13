"use client"

import { database } from "@/utils/firebase";
import { get, push, ref, set } from "firebase/database";
import * as React from "react";

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

  return (
    <>
      <section className="container">
        <div>
          <form onSubmit={handleCreateRoom}>
            <input type="text" name="room" onChange={(e) => setRoom(e.target.value)} className={`${inputClass}`} />
            <button>Create room</button>
          </form>
        </div>
      </section>
    </>
  )
}
