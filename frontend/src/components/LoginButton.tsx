//components/LoginButton.tsx
import Link from "next/link";
import { UserIcon } from "@heroicons/react/24/outline";

export default function LoginButton() {
    return (
        <Link href="/login">
            <button
                className="btn btn-ghost btn-circle rounded-sm gap-2"
                title="Iniciar sesión"
            >
                <UserIcon className="h-6 w-6" />
            </button>
        </Link>
    );
}
