"use client"
import { usePathname } from "next/navigation"

const Header = () => {
    const path = usePathname();
    const isLoginPage: boolean = path === '/login';

    if (isLoginPage) return null;

  return (
    <div>header</div>
  )
}

export default Header