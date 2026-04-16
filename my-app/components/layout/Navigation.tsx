import Link from "next/link";

const navItems = [
  { href: "/dashboard/student", label: "Student dashboard" },
  { href: "/dashboard/admin", label: "Admin dashboard" },
  { href: "/auth/login", label: "Login" },
];

export default function Navigation() {
  return (
    <nav className="border-b border-white/60 bg-white/72 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4 sm:px-6">
        <Link href="/" className="flex items-center gap-3 text-[#17172f]">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#17172f] text-sm font-semibold text-white">
            NU
          </div>
          <div>
            <p className="text-sm font-semibold tracking-tight">NU Housing</p>
            <p className="text-xs text-[#7d879b]">Modern resident portal</p>
          </div>
        </Link>

        <div className="flex flex-wrap items-center gap-2">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="rounded-full border border-white/70 bg-white/75 px-4 py-2 text-sm text-[#5e6578] shadow-[0_8px_24px_rgba(122,132,173,0.1)] transition hover:text-[#17172f]"
            >
              {item.label}
            </Link>
          ))}
        </div>
      </div>
    </nav>
  );
}
