import { ButtonHTMLAttributes } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary";
  size?: "sm" | "md" | "lg";
}

export default function Button({
  children,
  variant = "primary",
  size = "md",
  className = "",
  ...props
}: ButtonProps) {
  const baseStyles =
    "inline-flex w-full items-center justify-center rounded-full font-medium tracking-tight transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#17172f]/20 disabled:cursor-not-allowed disabled:opacity-60";

  const variants = {
    primary:
      "bg-[#17172f] text-white shadow-[0_14px_30px_rgba(23,23,47,0.18)] hover:-translate-y-0.5 hover:shadow-[0_18px_36px_rgba(23,23,47,0.22)]",
    secondary:
      "border border-white/70 bg-white/75 text-[#17172f] backdrop-blur-sm shadow-[0_12px_28px_rgba(95,107,145,0.12)] hover:bg-white",
  };

  const sizes = {
    sm: "px-4 py-2 text-sm",
    md: "px-5 py-3 text-sm",
    lg: "px-6 py-3.5 text-base",
  };

  return (
    <button
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
