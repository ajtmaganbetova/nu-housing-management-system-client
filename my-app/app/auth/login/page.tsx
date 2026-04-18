import LoginForm from "@/components/auth/LoginForm";

export default function LoginPage() {
  return (
      <div className="mx-auto flex min-h-screen max-w-screen items-center justify-center bg-[radial-gradient(circle_at_top_left,_rgba(195,198,244,0.95),_rgba(239,241,247,0.88)_35%,_rgba(232,236,247,0.95)_70%,_rgba(211,216,243,0.98)_100%)] p-4 shadow-[0_20px_60px_rgba(109,121,160,0.12)] md:p-8">
        <LoginForm />
      </div>
  );
}