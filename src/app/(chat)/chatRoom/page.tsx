import { chatRooms } from "@/contants/ChatRoom"
import Link from "next/link"
import React from 'react'

type Props = {}

export default function Page({ }: Props) {
  return (
    <>
      <section className="container flex flex-col items-center justify-center h-screen">
        <h2>Choose a Chat Room</h2>
        <ul className="grid grid-cols-2 gap-2">
          {chatRooms.map((room) => (
            <li key={room.id}>
              <Link className="flex h-full p-10 bg-slate-500" href={`/room/${room.id}`}>{room.title}</Link>
            </li>
          ))}
        </ul>
      </section>
    </>
  )
}
