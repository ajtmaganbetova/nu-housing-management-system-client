interface CardProps {
  children: React.ReactNode;
  className?: string;
}

export default function Card({ children, className = "" }: CardProps) {
  return (
    <div
      className={`rounded-[32px] border border-white/60 bg-white/72 p-6 shadow-[0_24px_60px_rgba(122,132,173,0.18)] backdrop-blur-xl md:p-8 ${className}`}
    >
      {children}
    </div>
  );
}
