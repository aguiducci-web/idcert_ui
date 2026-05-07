import { Divider } from './index.js'

export const Default = () => (
  <div className="w-64">
    <p className="text-sm">Content above</p>
    <Divider className="my-4" />
    <p className="text-sm">Content below</p>
  </div>
)

export const Vertical = () => (
  <div className="flex h-8 items-center gap-3 text-sm">
    <span>Docs</span>
    <Divider orientation="vertical" />
    <span>API</span>
    <Divider orientation="vertical" />
    <span>Changelog</span>
  </div>
)

export const BetweenSections = () => (
  <div className="w-64">
    <div className="text-sm">
      <p className="font-medium">Account</p>
      <p className="text-muted-foreground">Profile, email, password</p>
    </div>
    <Divider className="my-4" />
    <div className="text-sm">
      <p className="font-medium">Billing</p>
      <p className="text-muted-foreground">Plan, invoices, payment</p>
    </div>
    <Divider className="my-4" />
    <div className="text-sm">
      <p className="font-medium">Team</p>
      <p className="text-muted-foreground">Members, roles, invites</p>
    </div>
  </div>
)
