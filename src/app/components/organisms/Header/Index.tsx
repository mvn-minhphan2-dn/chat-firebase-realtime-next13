"use client";

import Link from "next/link"
import * as React from 'react'
import { usePathname } from 'next/navigation';
import { Routes } from "@/app/routes";

type Props = {}

export default function Index({ }: Props) {
  const pathname = usePathname();

  return (
    <>
      <section className="container">
        <nav className="flex items-center justify-center gap-5 py-8">
          {Routes?.map((route) => (
            <Link key={route.name} className={`transition-all hover:scale-105 text-xl hover:text-red-500 ${pathname === route.url && "text-red-500"}`} href={route.url}>{route.name}</Link>
          ))}
        </nav>
      </section>
    </>
  )
}
