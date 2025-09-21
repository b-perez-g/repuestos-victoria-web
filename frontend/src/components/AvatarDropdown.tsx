import Link from "next/link";
import { User } from "@/contexts/auth/AuthContext";

interface DropdownItem {
  label: string;
  href: string;
  onClick?: () => void;
}

interface AvatarDropdownProps {
  items: DropdownItem[];
  user?: User | null;
  onLogout?: () => void;
}

export default function AvatarDropdown({ items, user, onLogout }: AvatarDropdownProps) {
  const getInitials = (name: string) => {
    if (!name) return "U";
    const words = name.trim().split(" ");
    if (words.length === 1) {
      return words[0].substring(0, 2).toUpperCase();
    }
    return (words[0][0] + words[words.length - 1][0]).toUpperCase();
  };

  const handleItemClick = (item: DropdownItem) => {
    if (item.onClick) {
      item.onClick();
    }
  };

  return (
    <div className="dropdown dropdown-end">
      <div tabIndex={0} role="button" className="btn btn-ghost btn-circle" title={user?.name || "Usuario"}>
        <div className="avatar avatar-placeholder">
          <div className="bg-accent text-white w-8 rounded-full flex items-center justify-center">
            <span className="text-xs font-medium">
              {getInitials(user?.name || "Usuario")}
            </span>
          </div>
        </div>
      </div>
      <ul
        tabIndex={0}
        className="menu menu-sm dropdown-content bg-surface border border-border rounded-box z-[1] mt-3 w-52 p-2 shadow-lg"
      >
        {/* Información del usuario */}
        {user && (
          <>
            <li className="px-2 py-2 border-b border-border">
              <div className="flex flex-col">
                <span className="font-medium text-primary truncate">{user.name}</span>
                <span className="text-xs text-muted truncate">{user.email}</span>
                {user.role && (
                  <span className="text-xs text-accent capitalize">{user.role}</span>
                )}
              </div>
            </li>
            <div className="divider my-1"></div>
          </>
        )}
        
        {/* Items del menú */}
        {items.map((item, idx) => (
          <li key={idx}>
            {item.onClick ? (
              <button
                onClick={() => handleItemClick(item)}
                className="w-full text-left hover:bg-surface-secondary transition-colors"
              >
                {item.label}
              </button>
            ) : (
              <Link 
                href={item.href}
                className="hover:bg-surface-secondary transition-colors"
              >
                {item.label}
              </Link>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}