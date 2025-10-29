
"use client";

import { usePathname, useRouter } from "next/navigation";
import { useAuth, useUser } from "@/firebase";
import { SidebarTrigger } from "@/components/ui/sidebar";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";
import { Skeleton } from "../ui/skeleton";


export function AppHeader() {
    const { user, isUserLoading } = useUser();
    const auth = useAuth();
    const router = useRouter();

    const handleLogout = () => {
        if (auth) {
        auth.signOut();
        }
        router.push('/login');
    };

    return (
        <header className="sticky top-0 z-10 flex h-14 items-center justify-end gap-4 border-b bg-background px-4 sm:px-6">
            <SidebarTrigger className="md:hidden" />
            <div className="flex items-center gap-4">
                 {isUserLoading ? (
                    <Skeleton className="h-8 w-8 rounded-full" />
                ) : user ? (
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                                <Avatar className="h-8 w-8">
                                    <AvatarImage src={user.photoURL || undefined} alt={user.displayName || "User"} />
                                    <AvatarFallback>{user.email?.charAt(0).toUpperCase()}</AvatarFallback>
                                </Avatar>
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuLabel className="font-normal">
                                <div className="flex flex-col space-y-1">
                                    <p className="text-sm font-medium leading-none">{user.displayName || "User"}</p>
                                    <p className="text-xs leading-none text-muted-foreground">
                                        {user.email}
                                    </p>
                                </div>
                            </DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={handleLogout}>
                                <LogOut className="mr-2 h-4 w-4" />
                                <span>Log out</span>
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                ) : null}
            </div>
        </header>
    )
}
