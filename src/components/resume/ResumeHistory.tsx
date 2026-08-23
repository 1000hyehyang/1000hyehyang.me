import {
  AWARDS_DATA,
  CERTIFICATION_DATA,
  EDUCATION_DATA,
  LANGUAGE_DATA,
  ORGANIZATION_DATA,
} from "@/lib/resume-data";
import { CredentialSection } from "./CredentialSection";
import { ExperienceSection } from "./ExperienceSection";
import { TimelineSection } from "./TimelineSection";

export function ResumeHistory() {
  return (
    <>
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
      />
    </>
  );
}
