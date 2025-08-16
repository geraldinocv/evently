import Link from "next/link"
import { user } from "../path/to/user" // Assuming user is imported from a module

const Navigation = () => {
  return (
    <nav>
      {user && (
        <Link href="/dashboard/earnings" className="text-sm font-medium hover:text-primary transition-colors">
          Meus Ganhos
        </Link>
      )}

      {/* rest of code here */}
    </nav>
  )
}

export default Navigation
