"use client";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { signOut, useSession } from "@/lib/auth-client";
import {
  DropdownMenu,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@radix-ui/react-dropdown-menu";
import { LogOut, Package } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

const Header = () => {
  const path = usePathname();
  const isLoginPage: boolean = path === "/login";

  const { data: session, isPending } = useSession();
  const user = session?.user;
  const isAdminUser = user?.role === "admin";
  const router = useRouter();

  const handleLogout = async () => {
    await signOut({
      fetchOptions: {
        onSuccess: () => {
          router.push("/");
        },
      },
    });
  };
  if (isLoginPage) return null;

  return (
    <header className="fixed top-0 left-0 right-0 z-50 border-b bg-white">
      <div className="container flex h-16 items-center justify-between px-4">
        <div className="flex items-center gap-4">
          <Link href="/" className=" flex items-center gap-2">
            <div className="p-2 rounded-md bg-teal-500">
              <Package className="h-6 w-6 text-white" />
            </div>
            <span className="font-bold text-xl text-teal-600">
              Asset Platform
            </span>
          </Link>
          <nav className="items-center flex gap-6 ml-6 ">
            {!isPending && user && isAdminUser ? null : (
              <Link
                href="/gallery"
                className="text-sm font-medium hover:text-teal-600"
              >
                Gallery
              </Link>
            )}

            {!isPending && user && !isAdminUser && (
              <>
                <Link
                  href="/dashboard/assets"
                  className="text-sm font-medium hover:text-teal-600"
                >
                  Assets
                </Link>
                <Link
                  href="/dashboard/purchases"
                  className="text-sm font-medium hover:text-teal-600"
                >
                  My Purchases
                </Link>
              </>
            )}

            {!isPending && isAdminUser && user && (
              <>
                <Link
                  href="/admin/asset-approval"
                  className="text-sm font-medium hover:text-teal-600"
                >
                  Asset Approval
                </Link>
                <Link
                  href="/admin/settings"
                  className="text-sm font-medium hover:text-teal-600"
                >
                  Settings
                </Link>
              </>
            )}
          </nav>
        </div>
        <div className="flex items-center gap-6">
          {isPending ? null : user ? (
            <div className="flex items-center gap-3">
              {" "}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant={"ghost"}
                    className="relative h-8 w-8 rounded-md"
                  >
                    <Avatar className="h-8 w-8 border border-slate-300">
                      <AvatarFallback className="bg-teal-500 text-white">
                        {user?.name?.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuLabel>
                    <div className="flex  flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">
                        {user?.name}
                      </p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={handleLogout}
                    className="cursor-pointer text-red-500"
                  >
                    <LogOut className="m-2 h-2 w-4" />
                    <span className="font-medium">Logout</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          ) : (
            <Link href={"/login"}>
              <Button className="bg-teal-500 hover:bg-teal-600">Login</Button>
            </Link>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
