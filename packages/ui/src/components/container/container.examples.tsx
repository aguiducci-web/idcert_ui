import { Container } from './index.js'

export const Default = () => (
  <Container>
    <div className="rounded-md bg-muted p-8 text-center text-sm">
      Container content
    </div>
  </Container>
)

export const Sizes = () => (
  <div className="space-y-3">
    {(['sm', 'md', 'lg', 'xl', '2xl'] as const).map((size) => (
      <Container key={size} size={size}>
        <div className="rounded-md bg-muted p-4 text-center text-xs font-mono">
          size=&quot;{size}&quot;
        </div>
      </Container>
    ))}
  </div>
)

export const Centered = () => (
  <Container size="md">
    <div className="rounded-md border bg-background p-8 text-center text-sm">
      Centered content with default horizontal padding (px-4 sm:px-6 lg:px-8).
    </div>
  </Container>
)

export const FullWidth = () => (
  <Container size="full">
    <div className="rounded-md bg-muted p-8 text-center text-sm">
      size=&quot;full&quot; — fills available width, padding still applied.
    </div>
  </Container>
)

export const Nested = () => (
  <Container size="lg">
    <header className="mb-4 border-b pb-4">
      <h2 className="text-lg font-semibold">Page header</h2>
      <p className="text-sm text-muted-foreground">
        Container constrains the header and body to the same max-width.
      </p>
    </header>
    <div className="rounded-md bg-muted p-6 text-sm">Page body</div>
  </Container>
)
