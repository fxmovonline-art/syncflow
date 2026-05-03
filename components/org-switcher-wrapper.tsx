"use client";

import { OrganizationSwitcher } from "@clerk/nextjs";

export const OrgSwitcherWrapper = (props: any) => {
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
