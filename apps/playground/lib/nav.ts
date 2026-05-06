export type NavItem = {
  title: string
  slug: string
  status?: 'experimental' | 'deprecated' | 'in-progress'
}
export type NavGroup = { title: string; items: NavItem[] }
export type NavSection = { title: string; groups: NavGroup[] }

export const nav: NavSection[] = [
  {
    title: 'Getting Started',
    groups: [
      {
        title: '',
        items: [
          { title: 'Installation', slug: 'getting-started/installation' },
          { title: 'Theming', slug: 'getting-started/theming' },
        ],
      },
    ],
  },
  {
    title: 'Foundations',
    groups: [
      {
        title: '',
        items: [
          { title: 'Colors', slug: 'foundations/colors' },
          { title: 'Typography', slug: 'foundations/typography' },
          { title: 'Spacing', slug: 'foundations/spacing' },
          { title: 'Radius', slug: 'foundations/radius' },
        ],
      },
    ],
  },
  {
    title: 'Components',
    groups: [
      {
        title: 'Primitives',
        items: [
          { title: 'Button', slug: 'components/button' },
          { title: 'Badge', slug: 'components/badge' },
          { title: 'Avatar', slug: 'components/avatar' },
          { title: 'Divider', slug: 'components/divider' },
        ],
      },
      {
        title: 'Forms',
        items: [
          { title: 'Input', slug: 'components/input' },
          { title: 'Textarea', slug: 'components/textarea' },
          { title: 'Select', slug: 'components/select' },
          { title: 'MultiSelect', slug: 'components/multi-select' },
          { title: 'Checkbox', slug: 'components/checkbox' },
          { title: 'Radio', slug: 'components/radio' },
          { title: 'Switch', slug: 'components/switch' },
          { title: 'Slider', slug: 'components/slider' },
          { title: 'DatePicker', slug: 'components/date-picker' },
          { title: 'DateRangePicker', slug: 'components/date-range-picker' },
          { title: 'TimePicker', slug: 'components/time-picker' },
          { title: 'FileUpload', slug: 'components/file-upload' },
          { title: 'Form', slug: 'components/form' },
          { title: 'Label', slug: 'components/label' },
        ],
      },
      {
        title: 'Overlays',
        items: [
          { title: 'Dialog', slug: 'components/dialog' },
          { title: 'AlertDialog', slug: 'components/alert-dialog' },
          { title: 'Sheet', slug: 'components/sheet' },
          { title: 'DropdownMenu', slug: 'components/dropdown-menu' },
          { title: 'Tooltip', slug: 'components/tooltip' },
          { title: 'Toast', slug: 'components/toast' },
          { title: 'Portal', slug: 'components/portal' },
        ],
      },
      {
        title: 'Layout',
        items: [
          { title: 'Container', slug: 'components/container' },
          { title: 'Grid', slug: 'components/grid' },
          { title: 'Stack', slug: 'components/stack' },
          { title: 'Separator', slug: 'components/separator' },
        ],
      },
      {
        title: 'Navigation',
        items: [
          { title: 'Navbar', slug: 'components/navbar' },
          { title: 'Sidebar', slug: 'components/sidebar' },
          { title: 'Breadcrumb', slug: 'components/breadcrumb' },
          { title: 'Tabs', slug: 'components/tabs' },
          { title: 'Pagination', slug: 'components/pagination' },
        ],
      },
      {
        title: 'Data',
        items: [
          { title: 'Table', slug: 'components/table' },
          { title: 'List', slug: 'components/list' },
          { title: 'Card', slug: 'components/card' },
        ],
      },
      {
        title: 'Feedback',
        items: [
          { title: 'Alert', slug: 'components/alert' },
          { title: 'Progress', slug: 'components/progress' },
          { title: 'Skeleton', slug: 'components/skeleton' },
          { title: 'Spinner', slug: 'components/spinner' },
          { title: 'EmptyState', slug: 'components/empty-state' },
        ],
      },
      {
        title: 'Utility',
        items: [{ title: 'ThemeProvider', slug: 'components/theme-provider' }],
      },
    ],
  },
  {
    title: 'Recipes',
    groups: [
      {
        title: '',
        items: [
          { title: 'Login form', slug: 'recipes/login-form' },
          { title: 'Settings panel', slug: 'recipes/settings-panel' },
          { title: 'Data dashboard', slug: 'recipes/data-dashboard' },
          { title: 'Multi-step form', slug: 'recipes/multi-step-form' },
          { title: 'Navigation patterns', slug: 'recipes/navigation' },
        ],
      },
    ],
  },
]

export function allNavSlugs(): string[] {
  return nav.flatMap((s) => s.groups.flatMap((g) => g.items.map((i) => i.slug)))
}
