import { ReactNode } from "react";
import { Navbar } from "./Navbar";

export function Layout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col flex-1">
      <Navbar />
      <main className="flex-1 flex flex-col">{children}</main>
      <footer className="border-t py-6 md:py-0">
        <div className="container mx-auto px-4 md:px-6 flex flex-col items-center justify-between gap-4 md:h-20 md:flex-row">
          <p className="text-center text-sm leading-loose text-muted-foreground md:text-left">
            Built for India's workforce. RozgarPlus &copy; {new Date().getFullYear()}
          </p>
          <div className="flex gap-4 items-center">
            <a href="#" className="text-sm text-muted-foreground hover:text-foreground">Terms</a>
            <a href="#" className="text-sm text-muted-foreground hover:text-foreground">Privacy</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
