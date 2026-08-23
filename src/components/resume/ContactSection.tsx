import type { LucideIcon } from "lucide-react";
import { Github, Instagram, Linkedin, Mail } from "lucide-react";
import { SITE_LINKS } from "@/lib/config";
import { ResumeSection } from "./ResumeSection";

type ContactItem = {
  label: string;
  value: string;
  href: string;
  ariaLabel: string;
  icon: LucideIcon;
  external?: boolean;
};

const CONTACT_ITEMS: readonly ContactItem[] = [
  {
    label: "Email",
    value: "ducogus12@gmail.com",
    href: "mailto:ducogus12@gmail.com",
    ariaLabel: "이메일 보내기",
    icon: Mail,
  },
  {
    label: "GitHub",
    value: "github.com/1000hyehyang",
    href: SITE_LINKS.github,
    ariaLabel: "GitHub 프로필 보기",
    icon: Github,
    external: true,
  },
  {
    label: "LinkedIn",
    value: "linkedin.com/in/1000hyehyang",
    href: SITE_LINKS.linkedin,
    ariaLabel: "LinkedIn 프로필 보기",
    icon: Linkedin,
    external: true,
  },
  {
    label: "Instagram",
    value: "instagram.com/thousandhyehyang",
    href: SITE_LINKS.instagram,
    ariaLabel: "Instagram 프로필 보기",
    icon: Instagram,
    external: true,
  },
];

function ContactCard({ item }: { item: ContactItem }) {
  const Icon = item.icon;

  return (
    <a
      href={item.href}
      target={item.external ? "_blank" : undefined}
      rel={item.external ? "noopener noreferrer" : undefined}
      className="rounded-lg border border-border bg-card p-4 transition-colors hover:bg-accent/10"
      aria-label={item.ariaLabel}
    >
      <div className="flex items-center gap-3">
        <Icon className="size-5 shrink-0 text-muted-foreground" />
        <div className="min-w-0">
          <div className="text-sm font-medium">{item.label}</div>
          <div className="truncate text-sm text-muted-foreground">{item.value}</div>
        </div>
      </div>
    </a>
  );
}

export function ContactSection() {
  return (
    <ResumeSection id="contact" title="Contact.">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {CONTACT_ITEMS.map((item) => (
          <ContactCard key={item.label} item={item} />
        ))}
      </div>
    </ResumeSection>
  );
}
