"use client"

import { useAuthContext } from "@/context/auth"
import { database } from "@/utils/firebase"
import { onValue, ref, serverTimestamp, set } from "firebase/database"
import Link from "next/link"
import * as React from 'react'

type Props = {}

export default function Page({ }: Props) {
  const [roomName, setRoomName] = React.useState<string>("");
  const [rooms, setRooms] = React.useState<any>();
  const { user } = useAuthContext();

  const handleGetRooms = async () => {
    const roomRef = ref(database, "rooms");
    onValue(roomRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const resetRooms = Object.entries(data).map(([_id, value]) => ({
          id: _id,
          ...value as any
        }))?.sort((a: any, b: any) => b.createdAt - a.createdAt);
        setRooms(resetRooms);
      }
    });
  }

  const handleCreateRoom = async () => {
    const roomRef = ref(database, `rooms/${roomName}`);
    await set(roomRef, {
      id: roomName,
      title: roomName?.charAt(0).toUpperCase() + roomName!.slice(1),
      createdAt: serverTimestamp()
    });
    setRoomName("");
    return roomRef.key;
  }

  React.useEffect(() => {
    const unsubscribe = handleGetRooms()
    return () => {
      unsubscribe
    }
  }, [])

  return (
    <>
      <section className="container flex flex-col items-center justify-center">
        <div className="mb-10">
          <input className="p-2 mr-3 text-pink-400 border-2 border-red-500"
            onKeyUp={event => {
              if (event.key === 'Enter') {
                handleCreateRoom();
              }
            }}
            type="text" placeholder="Room name"
            value={roomName}
            onChange={(e) => setRoomName(e.target.value)}
          />
          <button onClick={handleCreateRoom} className="px-4 py-2 bg-pink-400">Create Rooms</button>
        </div>
        <div>
          <h2 className="mb-5 text-4xl text-pink-600">Choose a Chat Room</h2>
          <ul className="grid grid-cols-2 gap-2">
            {rooms?.map((room: any) => (
              <li key={room.id}>
                <Link className="flex justify-center h-full p-10 text-pink-600 transition-transform border-2 border-pink-600 hover:scale-105" href={`/room/${room.id}`}>{room.title}</Link>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </>
  )
}
