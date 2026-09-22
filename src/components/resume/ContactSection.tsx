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
      data-scroll-reveal
      href={item.href}
      target={item.external ? "_blank" : undefined}
      rel={item.external ? "noopener noreferrer" : undefined}
      className="min-w-0 rounded-lg border border-border bg-card p-4 transition-colors hover:bg-muted/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
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
      <p data-scroll-reveal className="mb-3 text-2xl font-semibold tracking-[-0.025em]">함께 만들어 갈 이야기를 기다립니다<span className="text-brand">.</span></p>
      <p data-scroll-reveal className="mb-8 text-sm leading-7 text-muted-foreground">프로젝트와 개발에 관한 이야기는 아래 채널로 편하게 전해 주세요.</p>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {CONTACT_ITEMS.map((item) => (
          <ContactCard key={item.label} item={item} />
        ))}
      </div>
    </ResumeSection>
  );
}
