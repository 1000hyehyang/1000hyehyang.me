import { CredentialSection } from "@/components/about/CredentialSection";
import { ExperienceSection } from "@/components/about/ExperienceSection";
import { TimelineSection } from "@/components/about/TimelineSection";
import {
  AWARDS_DATA,
  CERTIFICATION_DATA,
  EDUCATION_DATA,
  LANGUAGE_DATA,
  ORGANIZATION_DATA,
} from "@/lib/about-data";

export default function AboutPage() {
  return (
    <div className="mx-auto">
      <ExperienceSection id="education" title="Education." items={EDUCATION_DATA} />
      <ExperienceSection
        id="organization"
        title="Organization."
        items={ORGANIZATION_DATA}
        spacing="relaxed"
      />
      <TimelineSection id="awards" title="Awards." items={AWARDS_DATA} />
      <CredentialSection
        id="certification"
        title="Certification."
        items={CERTIFICATION_DATA}
      />
      <CredentialSection
        id="language"
        title="Language."
        items={LANGUAGE_DATA}
        columns={3}
        showDivider={false}
      />
    </div>
  );
}
