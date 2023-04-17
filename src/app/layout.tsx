
import { AuthContextProvider } from "@/context/auth"
import './globals.css'
import { AnimatePresence } from "framer-motion"
import PageTransition from "./components/PageTransition"
import Header from "./components/organisms/Header/Index"

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        <Header />
        <AuthContextProvider>
          <PageTransition children={children} />
        </AuthContextProvider>
      </body>
    </html>
  )
}
