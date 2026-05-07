import * as React from 'react'
import { Grid } from './index.js'

const Cell = ({ children }: { children: React.ReactNode }) => (
  <div className="rounded-md bg-muted p-4 text-center text-sm">{children}</div>
)

export const Default = () => (
  <Grid cols={3} gap={4}>
    {Array.from({ length: 6 }, (_, i) => <Cell key={i}>{i + 1}</Cell>)}
  </Grid>
)
