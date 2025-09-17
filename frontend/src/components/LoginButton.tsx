import Link from "next/link";
import { ArrowRightEndOnRectangleIcon } from "@heroicons/react/24/outline";

export default function LoginButton() {
    return (
        <Link href="/login">
            <button className="btn btn-ghost btn-circle rounded-sm gap-2">
                <ArrowRightEndOnRectangleIcon className="h-6 w-6" />
            </button>
        </Link>
    );
}
