import { primitives } from './primitives.js'

export type SemanticTokens = {
  background: string
  foreground: string
  card: string
  cardForeground: string
  primary: string
  primaryForeground: string
  secondary: string
  secondaryForeground: string
  muted: string
  mutedForeground: string
  accent: string
  accentForeground: string
  destructive: string
  destructiveForeground: string
  border: string
  input: string
  ring: string
}

export const semantic: { light: SemanticTokens; dark: SemanticTokens } = {
  light: {
    background:            primitives.color.neutral[50],
    foreground:            primitives.color.neutral[950],
    card:                  '#ffffff',
    cardForeground:        primitives.color.neutral[950],
    primary:               primitives.color.brand[600],
    primaryForeground:     primitives.color.neutral[50],
    secondary:             primitives.color.neutral[100],
    secondaryForeground:   primitives.color.neutral[900],
    muted:                 primitives.color.neutral[100],
    mutedForeground:       primitives.color.neutral[600],
    accent:                primitives.color.neutral[100],
    accentForeground:      primitives.color.neutral[900],
    destructive:           primitives.color.red[600],
    destructiveForeground: primitives.color.neutral[50],
    border:                primitives.color.neutral[200],
    input:                 primitives.color.neutral[200],
    ring:                  primitives.color.brand[600],
  },
  dark: {
    background:            primitives.color.neutral[950],
    foreground:            primitives.color.neutral[50],
    card:                  primitives.color.neutral[900],
    cardForeground:        primitives.color.neutral[50],
    primary:               primitives.color.brand[500],
    primaryForeground:     primitives.color.neutral[950],
    secondary:             primitives.color.neutral[800],
    secondaryForeground:   primitives.color.neutral[50],
    muted:                 primitives.color.neutral[800],
    mutedForeground:       primitives.color.neutral[400],
    accent:                primitives.color.neutral[800],
    accentForeground:      primitives.color.neutral[50],
    destructive:           primitives.color.red[500],
    destructiveForeground: primitives.color.neutral[50],
    border:                primitives.color.neutral[800],
    input:                 primitives.color.neutral[800],
    ring:                  primitives.color.brand[500],
  },
}
