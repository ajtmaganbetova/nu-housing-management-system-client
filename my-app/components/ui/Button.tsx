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
    "w-full flex justify-center font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 transition duration-200";

  const variants = {
    primary:
      "border border-transparent text-white bg-blue-600 hover:bg-blue-700 focus:ring-blue-500",
    secondary:
      "border border-transparent text-white bg-gray-600 hover:bg-gray-700 focus:ring-gray-500",
  };

  const sizes = {
    sm: "py-1 px-3 text-sm",
    md: "py-2 px-4 text-sm",
    lg: "py-3 px-6 text-base",
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
