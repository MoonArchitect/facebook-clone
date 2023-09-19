"use client"

import { PropsWithChildren } from "react"

import { Navbar } from "@facebook-clone/web/components/navbar/navbar"

import "./global.css"

export default function IndexLayout(props: PropsWithChildren) {
  const { children } = props

  return (
    <html lang="en">
      <body className="bright-theme">
        <Navbar />
        {children}
      </body>
    </html>
  )
}
