import { Separator } from './index.js'

export const Default = () => (
  <div className="w-64">
    <h4 className="text-sm font-semibold">Section A</h4>
    <p className="text-sm text-muted-foreground">Content for section A.</p>
    <Separator className="my-4" />
    <h4 className="text-sm font-semibold">Section B</h4>
    <p className="text-sm text-muted-foreground">Content for section B.</p>
  </div>
)

export const InCard = () => (
  <div className="w-72 rounded-md border bg-card p-4 text-card-foreground">
    <div className="space-y-1">
      <h4 className="text-sm font-semibold">Account</h4>
      <p className="text-xs text-muted-foreground">
        Manage your profile and preferences.
      </p>
    </div>
    <Separator className="my-3" />
    <ul className="space-y-2 text-sm">
      <li>Profile</li>
      <li>Notifications</li>
      <li>Billing</li>
    </ul>
  </div>
)

export const InMenu = () => (
  <div className="w-56 rounded-md border bg-popover p-1 text-popover-foreground">
    <div className="px-2 py-1.5 text-xs font-medium text-muted-foreground">
      Account
    </div>
    <div className="rounded-sm px-2 py-1.5 text-sm">Profile</div>
    <div className="rounded-sm px-2 py-1.5 text-sm">Settings</div>
    <Separator className="my-1" />
    <div className="px-2 py-1.5 text-xs font-medium text-muted-foreground">
      Workspace
    </div>
    <div className="rounded-sm px-2 py-1.5 text-sm">Members</div>
    <div className="rounded-sm px-2 py-1.5 text-sm">Integrations</div>
    <Separator className="my-1" />
    <div className="rounded-sm px-2 py-1.5 text-sm text-destructive">
      Sign out
    </div>
  </div>
)

export const BetweenSections = () => (
  <article className="w-80 space-y-4">
    <section className="space-y-1">
      <h3 className="text-base font-semibold">Overview</h3>
      <p className="text-sm text-muted-foreground">
        High-level summary of the report and its scope.
      </p>
    </section>
    <Separator />
    <section className="space-y-1">
      <h3 className="text-base font-semibold">Findings</h3>
      <p className="text-sm text-muted-foreground">
        Detailed breakdown of detected issues and remediation steps.
      </p>
    </section>
    <Separator />
    <section className="space-y-1">
      <h3 className="text-base font-semibold">Next steps</h3>
      <p className="text-sm text-muted-foreground">
        Recommended actions and owners.
      </p>
    </section>
  </article>
)
