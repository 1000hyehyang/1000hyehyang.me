import {
  AWARDS_DATA,
  DESIGN_CERTIFICATION_DATA,
  EDUCATION_DATA,
  ETC_CERTIFICATION_DATA,
  IT_CERTIFICATION_DATA,
  ORGANIZATION_DATA,
} from "@/lib/resume-data";
import { CredentialGroup } from "./CredentialGroup";
import { ExperienceSection } from "./ExperienceSection";
import { ResumeSection } from "./ResumeSection";
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
      <ResumeSection id="certification" title="Certification.">
        <div className="space-y-8">
          <CredentialGroup title="IT" items={IT_CERTIFICATION_DATA} />
          <CredentialGroup title="Design" items={DESIGN_CERTIFICATION_DATA} />
          <CredentialGroup title="ETC" items={ETC_CERTIFICATION_DATA} />
        </div>
      </ResumeSection>
    </>
  );
}
