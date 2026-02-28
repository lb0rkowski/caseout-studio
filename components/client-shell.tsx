"use client";
import { usePathname } from "next/navigation";
import Link from "next/link";
import Nav from "./nav";
import Footer from "./footer";
import { Particles } from "./ui";

export default function ClientShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAdmin = pathname.startsWith("/vault-");
  return (
    <>
      <div className="grain" /><div className="scanlines" /><Particles />
      <div className="relative z-[1]">
        {!isAdmin && <Nav />}
        <main className="page-enter">{children}</main>
        {!isAdmin && <Footer />}
      </div>
      <Link href="/vault-x9k2m" className="fixed bottom-0 right-0 w-4 h-4 z-[9999] opacity-0" />
    </>
  );
}
