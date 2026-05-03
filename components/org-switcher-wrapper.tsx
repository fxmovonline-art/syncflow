"use client";

import { OrganizationSwitcher, useOrganization } from "@clerk/nextjs";
import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";

export const OrgSwitcherWrapper = (props: any) => {
  const { organization } = useOrganization();
  const router = useRouter();
  const prevOrgRef = useRef<string | null>(null);

  useEffect(() => {
    const prev = prevOrgRef.current;
    const current = organization?.id || null;

    // If organization changed, navigate to dashboard with explicit workspace and orgId
    if (prev !== current) {
      prevOrgRef.current = current;
      if (current) {
        router.push(`/dashboard?workspace=organization&orgId=${current}`);
      } else {
        router.push(`/dashboard?workspace=personal`);
      }
    }
  }, [organization, router]);

  return (
    <OrganizationSwitcher
      {...props}
      hidePersonal={props?.hidePersonal ?? false}
      afterCreateOrganizationUrl={props?.afterCreateOrganizationUrl}
      afterLeaveOrganizationUrl={props?.afterLeaveOrganizationUrl}
      afterSelectOrganizationUrl={props?.afterSelectOrganizationUrl}
      afterSelectPersonalUrl={props?.afterSelectPersonalUrl}
      appearance={props?.appearance}
    />
  );
};
