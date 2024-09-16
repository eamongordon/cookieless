import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { User } from "lucide-react"
import Link from "next/link"
import { signOut } from "next-auth/react"

interface UserMenuProps {
  imageSrc?: string
  name?: string
  email?: string
}

export default function UserMenu({ imageSrc, name, email }: UserMenuProps) {
  const initials = name
    ? name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
    : ''
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-8 w-8 rounded-full">
          <Avatar className="h-8 w-8">
            {imageSrc ? (
              <AvatarImage src={imageSrc} alt={name || "User avatar"} />
            ) : null}
            <AvatarFallback>
              {initials || <User className="h-4 w-4" />}
            </AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" forceMount>
        <DropdownMenuItem className="flex items-center">
          <div className="flex flex-col space-y-1">
            {name && (
              <p className="text-sm font-medium leading-none">{name || "Guest User"}</p>
            )}
            {email && (
              <p className={name ? `text-xs leading-none text-muted-foreground` : `text-sm font-medium leading-none`}>
                {email}
              </p>
            )}
          </div>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link href="/settings">Settings</Link>
        </DropdownMenuItem>
        <DropdownMenuItem>
          Billing
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => signOut()}>
          Log out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}