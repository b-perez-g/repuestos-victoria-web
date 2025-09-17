interface DropdownItem {
  label: string;
  href: string;
}

interface AvatarDropdownProps {
  items: DropdownItem[];
}

export default function AvatarDropdown({ items }: AvatarDropdownProps) {
  return (
    <div className="dropdown dropdown-end">
      <div tabIndex={0} role="button" className="btn btn-ghost btn-circle">
        <div className="avatar avatar-placeholder">
          <div className="bg-neutral text-neutral-content w-8 rounded-full">
            <span className="text-xs">UI</span>
          </div>
        </div>
      </div>
      <ul
        tabIndex={0}
        className="menu menu-sm dropdown-content bg-primary rounded-box z-1 mt-3 w-52 p-2 shadow"
      >
        {items.map((item, idx) => (
          <li key={idx}>
            <a href={item.href}>{item.label}</a>
          </li>
        ))}
      </ul>
    </div>
  );
}
