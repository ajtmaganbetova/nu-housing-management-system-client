import { Mail, Phone, Building2, Clock3, Lightbulb } from "lucide-react";

export function SupportTab() {
  const contactInfo = [
    {
      icon: <Mail size={18} />,
      label: "Email",
      value: "student_housing@nu.edu.kz",
      href: "mailto:student_housing@nu.edu.kz",
    },
    {
      icon: <Phone size={18} />,
      label: "Phone",
      value: "8 (7172) 70-6471",
      href: "tel:+77172706471",
    },
    {
      icon: <Building2 size={18} />,
      label: "Office",
      value: "Block 24, Office 050",
    },
    {
      icon: <Clock3 size={18} />,
      label: "Working hours",
      value: "10:00 – 18:00 (Mon-Fri)",
    },
  ];

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_350px]">
      {/* Main Contact Section */}
      <div className="rounded-[32px] border border-[#eceff6] bg-white p-8">
        <h2 className="text-2xl font-bold text-[#17172f]">
          Contact Housing Office
        </h2>
        <p className="mt-2 text-[#7d879b]">
          Reach out if you have issues with your application, required
          documents, or the submission process.
        </p>

        <div className="mt-8 grid gap-4 sm:grid-cols-2">
          {contactInfo.map((item, idx) => (
            <div key={idx} className="flex items-center gap-4 p-2">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#6f63ff]/10 text-[#6f63ff]">
                {item.icon}
              </div>
              <div className="overflow-hidden">
                <p className="text-xs font-bold uppercase tracking-wider text-[#98a2b3]">
                  {item.label}
                </p>
                {item.href ? (
                  <a
                    href={item.href}
                    className="mt-0.5 block truncate text-sm font-semibold text-[#17172f] hover:text-[#6f63ff] transition-colors"
                  >
                    {item.value}
                  </a>
                ) : (
                  <p className="mt-0.5 text-sm font-semibold text-[#17172f]">
                    {item.value}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Simplified Reminders Section */}
      <div className="rounded-[32px] border border-[#eceff6] bg-[#17172f] p-8 text-white shadow-2xl p-8 text-white">
        <div className="absolute right-0 top-0 h-full w-1/3 bg-gradient-to-l from-[#6f63ff]/20 to-transparent opacity-50" />
        <div className="absolute -bottom-24 -right-24 h-64 w-64 rounded-full bg-[#6f63ff] blur-[100px] opacity-20 animate-pulse" />

        <div className="flex items-center gap-2 text-amber-400">
          <Lightbulb size={20} />
          <p className="text-xs font-bold uppercase tracking-widest">
            Quick Tips
          </p>
        </div>

        <div className="mt-6 space-y-6">
          <div className="space-y-1">
            <p className="text-sm font-bold text-white">Use PDF Format</p>
            <p className="text-xs leading-relaxed text-white/60">
              Ensure all documents are clear scans in PDF format.
            </p>
          </div>
          <div className="space-y-1 border-t border-white/10 pt-6">
            <p className="text-sm font-bold text-white">
              Check Mandatory Fields
            </p>
            <p className="text-xs leading-relaxed text-white/60">
              Incomplete applications will not be processed by the registrar.
            </p>
          </div>
          <div className="space-y-1 border-t border-white/10 pt-6">
            <p className="text-sm font-bold text-white">Track Progress</p>
            <p className="text-xs leading-relaxed text-white/60">
              Check the `&quot;`My Applications`&quot;` tab for real-time status
              updates.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
