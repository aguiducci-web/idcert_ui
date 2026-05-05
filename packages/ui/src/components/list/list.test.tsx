import { render, screen } from '@testing-library/react'
import * as React from 'react'
import { describe, expect, test } from 'vitest'
import { List, ListItem } from './index.js'

describe('List', () => {
  test('renders a <ul>', () => {
    const { container } = render(
      <List>
        <ListItem>Item</ListItem>
      </List>,
    )
    expect(container.querySelector('ul')).not.toBeNull()
  })

  test('ListItem renders a <li>', () => {
    const { container } = render(
      <List>
        <ListItem>Item</ListItem>
      </List>,
    )
    expect(container.querySelector('li')).not.toBeNull()
  })

  test('divider prop applies divide-y class', () => {
    render(
      <List divider data-testid="list">
        <ListItem>A</ListItem>
        <ListItem>B</ListItem>
      </List>,
    )
    expect(screen.getByTestId('list')).toHaveClass('divide-y')
  })

  test('without divider, default gap classes apply', () => {
    render(
      <List data-testid="list">
        <ListItem>A</ListItem>
      </List>,
    )
    expect(screen.getByTestId('list')).toHaveClass('gap-2')
  })

  test('renders multiple items', () => {
    render(
      <List>
        <ListItem>One</ListItem>
        <ListItem>Two</ListItem>
        <ListItem>Three</ListItem>
      </List>,
    )
    expect(screen.getByText('One')).toBeInTheDocument()
    expect(screen.getByText('Two')).toBeInTheDocument()
    expect(screen.getByText('Three')).toBeInTheDocument()
  })

  test('forwards ref to List', () => {
    const ref = React.createRef<HTMLUListElement>()
    render(
      <List ref={ref}>
        <ListItem>x</ListItem>
      </List>,
    )
    expect(ref.current).toBeInstanceOf(HTMLUListElement)
  })
})
