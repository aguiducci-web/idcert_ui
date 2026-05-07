import * as React from 'react'
import { Grid } from './index.js'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../card/index.js'

const Cell = ({ children }: { children: React.ReactNode }) => (
  <div className="rounded-md bg-muted p-4 text-center text-sm">{children}</div>
)

export const Default = () => (
  <Grid cols={3} gap={4}>
    {Array.from({ length: 6 }, (_, i) => <Cell key={i}>{i + 1}</Cell>)}
  </Grid>
)

export const Columns = () => (
  <div className="space-y-6">
    <Grid cols={2} gap={4}>
      {Array.from({ length: 4 }, (_, i) => <Cell key={i}>{i + 1}</Cell>)}
    </Grid>
    <Grid cols={3} gap={4}>
      {Array.from({ length: 6 }, (_, i) => <Cell key={i}>{i + 1}</Cell>)}
    </Grid>
    <Grid cols={4} gap={4}>
      {Array.from({ length: 8 }, (_, i) => <Cell key={i}>{i + 1}</Cell>)}
    </Grid>
  </div>
)

export const Gaps = () => (
  <div className="space-y-6">
    <Grid cols={4} gap={2}>
      {Array.from({ length: 4 }, (_, i) => <Cell key={i}>gap 2</Cell>)}
    </Grid>
    <Grid cols={4} gap={4}>
      {Array.from({ length: 4 }, (_, i) => <Cell key={i}>gap 4</Cell>)}
    </Grid>
    <Grid cols={4} gap={8}>
      {Array.from({ length: 4 }, (_, i) => <Cell key={i}>gap 8</Cell>)}
    </Grid>
  </div>
)

export const WithCards = () => (
  <Grid cols={3} gap={4}>
    <Card>
      <CardHeader>
        <CardTitle>Alpha</CardTitle>
        <CardDescription>First tier</CardDescription>
      </CardHeader>
      <CardContent>Equal-width column with card content.</CardContent>
    </Card>
    <Card>
      <CardHeader>
        <CardTitle>Beta</CardTitle>
        <CardDescription>Second tier</CardDescription>
      </CardHeader>
      <CardContent>Grid keeps siblings aligned on a shared baseline.</CardContent>
    </Card>
    <Card>
      <CardHeader>
        <CardTitle>Gamma</CardTitle>
        <CardDescription>Third tier</CardDescription>
      </CardHeader>
      <CardContent>Children stretch to fill their column track.</CardContent>
    </Card>
  </Grid>
)
