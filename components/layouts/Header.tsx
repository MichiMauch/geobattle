"use client";

import { useState } from "react";
import { useSession, signIn, signOut } from "next-auth/react";
import { Bars3Icon } from "@heroicons/react/24/outline";
import { ChevronDown } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import BellNotification from "@/components/BellNotification";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetClose,
} from "@/components/ui/sheet";
import { X } from "lucide-react";

const navigation = [
  { name: "Home", href: "/" },
  { name: "Highscores", href: "/highscores" },
];

const userNavigation = [
  { name: "Highscore", href: "/highscores" },
  { name: "Logout", href: "#", action: () => signOut() },
];

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { data: session, status } = useSession();

  return (
    <header className="relative bg-gradient-to-r  from-main-dark1 via-main-purple to-main-dark1">
      <nav className="mx-auto flex max-w-7xl items-center justify-between p-6 lg:px-8">
        <div className="flex lg:flex-1">
          <a href="/" className="-m-1.5 p-1.5">
            <span className="sr-only">GeoBattle</span>
            <img
              alt="GeoBattle Logo"
              src="/images/logos/geobattle.webp"
              className="max-h-12 w-auto scale-150"
            />
          </a>
        </div>
        <div className="flex lg:hidden">
          <button
            type="button"
            onClick={() => setMobileMenuOpen(true)}
            className="-m-2.5 inline-flex items-center justify-center rounded-md p-2.5 text-white"
          >
            <span className="sr-only">Open main menu</span>
            <Bars3Icon aria-hidden="true" className="size-6" />
          </button>
        </div>
        <div className="hidden lg:flex lg:gap-x-12">
          {navigation.map((item) => (
            <a
              key={item.name}
              href={item.href}
              className="text-sm font-semibold text-white hover:text-main-pink"
            >
              {item.name}
            </a>
          ))}
        </div>
        <div className="hidden lg:flex lg:flex-1 lg:justify-end">
          {session?.user ? (
            <div className="flex items-center gap-4">
              <BellNotification
                setActiveDuelId={(id) => {
                  setMobileMenuOpen(false);
                  window.location.href = "/";
                }}
              />
              <img
                src={session.user.image ?? "/default-image.png"}
                alt="User Image"
                className="w-8 h-8 rounded-full"
              />
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="text-white hover:text-main-pink flex items-center gap-1">
                    <strong>{session.user.name}</strong>
                    <ChevronDown className="h-4 w-4" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  {userNavigation.map((item) => (
                    <DropdownMenuItem
                      key={item.name}
                      asChild={!item.action}
                      onClick={item.action}
                    >
                      {item.action ? (
                        item.name
                      ) : (
                        <a href={item.href}>{item.name}</a>
                      )}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          ) : (
            <button
              className="rounded bg-main-gradientStart hover:bg-main-gradientEnd text-white px-3 py-1 flex items-center"
              onClick={() => signIn("google")}
            >
              Login mit Google
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="w-4 h-4 ml-2"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M13.5 4.5l6 6m0 0l-6 6m6-6H3"
                />
              </svg>
            </button>
          )}
        </div>
      </nav>
      {/* Mobile menu */}
      <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
        <SheetContent side="left" className="bg-main-dark1 border-main-purple">
          <SheetHeader className="border-b border-main-purple pb-4 mb-4">
            <SheetTitle className="text-white flex items-center justify-between">
              <a href="/" className="flex items-center">
                <img
                  alt="GeoBattle Logo"
                  src="/images/logos/geobattle.webp"
                  className="max-h-10 w-auto"
                />
              </a>
              <SheetClose className="rounded-full p-1 hover:bg-main-purple/20">
                <X className="h-5 w-5 text-white" />
              </SheetClose>
            </SheetTitle>
          </SheetHeader>

          <div className="py-4 flex flex-col gap-4">
            {navigation.map((item) => (
              <a
                key={item.name}
                href={item.href}
                className="text-base font-semibold text-white hover:text-main-pink"
                onClick={() => setMobileMenuOpen(false)}
              >
                {item.name}
              </a>
            ))}

            <div className="pt-4 border-t border-main-purple mt-2">
              {session?.user ? (
                <div className="flex flex-col gap-4">
                  <div className="flex items-center gap-3">
                    <img
                      src={session.user.image ?? "/default-image.png"}
                      alt="User Image"
                      className="w-8 h-8 rounded-full"
                    />
                    <span className="text-white font-bold">
                      {session.user.name}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <BellNotification
                      setActiveDuelId={(id) => {
                        setMobileMenuOpen(false);
                        window.location.href = "/";
                      }}
                    />
                    <span className="text-white text-sm">Notifications</span>
                  </div>
                  {userNavigation.map((item) => (
                    <a
                      key={item.name}
                      href={item.href}
                      className="text-base font-semibold text-white hover:text-main-pink"
                      onClick={(e) => {
                        if (item.action) {
                          e.preventDefault();
                          item.action();
                        }
                        setMobileMenuOpen(false);
                      }}
                    >
                      {item.name}
                    </a>
                  ))}
                </div>
              ) : (
                <button
                  className="rounded bg-main-gradientStart hover:bg-main-gradientEnd text-white px-3 py-2 flex items-center"
                  onClick={() => {
                    signIn("google");
                    setMobileMenuOpen(false);
                  }}
                >
                  Login mit Google
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                    className="w-4 h-4 ml-2"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M13.5 4.5l6 6m0 0l-6 6m6-6H3"
                    />
                  </svg>
                </button>
              )}
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </header>
  );
}
