"use client";

import Link from "next/link"
import * as React from 'react'
import { usePathname } from 'next/navigation';
import { Routes } from "@/contants/Routes";

type Props = {}

export default function Index({ }: Props) {
  const pathname = usePathname();

  return (
    <>
      <section className="container">
        <nav className="flex gap-5 py-3">
          {Routes?.map((route) => (
            <Link key={route.name} className={`transition-all hover:scale-105 hover:text-red-500 ${pathname === route.url && "text-red-500"}`} href={route.url}>{route.name}</Link>
          ))}
        </nav>
      </section>
    </>
  )
}
