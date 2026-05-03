"use client";

import { OrgSwitcherWrapper } from "@/components/org-switcher-wrapper";
import { useOrganization, useUser } from "@clerk/nextjs";

export function DashboardOrganizationSelector() {
  const { organization } = useOrganization();
  const { user } = useUser();
  const orgMemberships = user?.organizationMemberships || [];

  const hasMultipleOrgs = orgMemberships.length > 0;

  if (!hasMultipleOrgs) {
    return null;
  }

  return (
    <div className="mb-8 p-4 bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900/50 rounded-lg">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h2 className="text-sm font-semibold text-blue-900 dark:text-blue-300 mb-1">
            Current Workspace
          </h2>
          <p className="text-xs text-blue-700 dark:text-blue-400">
            {organization?.name ? (
              <>
                Viewing boards from <strong>{organization.name}</strong>
              </>
            ) : (
              <>Viewing your <strong>personal</strong> boards</>
            )}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-blue-600 dark:text-blue-400 font-medium">Switch workspace:</span>
          <OrgSwitcherWrapper
            hidePersonal={false}
            afterSelectOrganizationUrl="/dashboard?workspace=organization"
            afterSelectPersonalUrl="/dashboard?workspace=personal"
            appearance={{
              elements: {
                rootBox: "flex justify-center items-center",
                organizationSwitcherTrigger: "py-2 px-3 border border-blue-300 dark:border-blue-700 rounded-md bg-white dark:bg-blue-900/50 text-blue-900 dark:text-blue-100 hover:bg-blue-100 dark:hover:bg-blue-900 font-medium text-sm",
              }
            }}
          />
        </div>
      </div>
    </div>
  );
}
