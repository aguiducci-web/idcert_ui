import type { Meta, StoryObj } from '@storybook/react'
import { User } from 'lucide-react'
import {
  Avatar,
  AvatarImage,
  AvatarFallback,
  AvatarGroup,
} from './index.js'

const meta = {
  title: 'DataDisplay/Avatar',
  component: Avatar,
  parameters: { layout: 'centered' },
  tags: ['autodocs'],
  argTypes: {
    size: { control: 'select', options: ['sm', 'md', 'lg', 'xl'] },
  },
} satisfies Meta<typeof Avatar>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: () => (
    <Avatar>
      <AvatarImage src="https://i.pravatar.cc/100?img=1" alt="User one" />
      <AvatarFallback>U1</AvatarFallback>
    </Avatar>
  ),
}

export const FallbackOnly: Story = {
  render: () => (
    <Avatar>
      <AvatarFallback>AG</AvatarFallback>
    </Avatar>
  ),
}

export const FallbackIcon: Story = {
  render: () => (
    <Avatar>
      <AvatarFallback><User /></AvatarFallback>
    </Avatar>
  ),
}

export const Sizes: Story = {
  render: () => (
    <div className="flex items-center gap-4">
      <Avatar size="sm"><AvatarFallback>S</AvatarFallback></Avatar>
      <Avatar size="md"><AvatarFallback>M</AvatarFallback></Avatar>
      <Avatar size="lg"><AvatarFallback>L</AvatarFallback></Avatar>
      <Avatar size="xl"><AvatarFallback>XL</AvatarFallback></Avatar>
    </div>
  ),
}

export const Group: Story = {
  render: () => (
    <AvatarGroup>
      <Avatar><AvatarImage src="https://i.pravatar.cc/100?img=1" alt="" /><AvatarFallback>U1</AvatarFallback></Avatar>
      <Avatar><AvatarImage src="https://i.pravatar.cc/100?img=2" alt="" /><AvatarFallback>U2</AvatarFallback></Avatar>
      <Avatar><AvatarImage src="https://i.pravatar.cc/100?img=3" alt="" /><AvatarFallback>U3</AvatarFallback></Avatar>
    </AvatarGroup>
  ),
}

export const GroupWithOverflow: Story = {
  render: () => (
    <AvatarGroup max={3}>
      <Avatar><AvatarImage src="https://i.pravatar.cc/100?img=1" alt="" /><AvatarFallback>U1</AvatarFallback></Avatar>
      <Avatar><AvatarImage src="https://i.pravatar.cc/100?img=2" alt="" /><AvatarFallback>U2</AvatarFallback></Avatar>
      <Avatar><AvatarImage src="https://i.pravatar.cc/100?img=3" alt="" /><AvatarFallback>U3</AvatarFallback></Avatar>
      <Avatar><AvatarImage src="https://i.pravatar.cc/100?img=4" alt="" /><AvatarFallback>U4</AvatarFallback></Avatar>
      <Avatar><AvatarImage src="https://i.pravatar.cc/100?img=5" alt="" /><AvatarFallback>U5</AvatarFallback></Avatar>
    </AvatarGroup>
  ),
}
