import { InputHTMLAttributes } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
}

export default function Input({ label, className = "", ...props }: InputProps) {
  return (
    <div className="space-y-2">
      {label && (
        <label
          htmlFor={props.id}
          className="block text-sm font-medium tracking-tight text-[#5e6578]"
        >
          {label}
        </label>
      )}
      <input
        className={`block w-full rounded-2xl border border-[#e5e9f4] bg-white/90 px-4 py-3 text-sm text-[#17172f] outline-none transition placeholder:text-[#9aa3b8] focus:border-[#bfc8e6] focus:bg-white focus:ring-4 focus:ring-[#dfe6fb] ${className}`}
        {...props}
      />
    </div>
  );
}
