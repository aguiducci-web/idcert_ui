import { Avatar, AvatarImage, AvatarFallback, AvatarGroup } from './index.js'

export const Default = () => (
  <Avatar>
    <AvatarImage className='not-prose' src="https://i.pravatar.cc/100?img=1" alt="User one" />
    <AvatarFallback>U1</AvatarFallback>
  </Avatar>
)

export const WithFallback = () => (
  <Avatar>
    <AvatarImage className='not-prose' src="https://broken.example.com/missing.png" alt="Ada Lovelace" />
    <AvatarFallback>AL</AvatarFallback>
  </Avatar>
)

export const InitialsOnly = () => (
  <Avatar>
    <AvatarFallback>JD</AvatarFallback>
  </Avatar>
)

export const Sizes = () => (
  <div className="flex items-center gap-3">
    <Avatar size="sm">
      <AvatarImage className='not-prose' src="https://i.pravatar.cc/100?img=12" alt="User small" />
      <AvatarFallback>SM</AvatarFallback>
    </Avatar>
    <Avatar size="md">
      <AvatarImage className='not-prose' src="https://i.pravatar.cc/100?img=13" alt="User medium" />
      <AvatarFallback>MD</AvatarFallback>
    </Avatar>
    <Avatar size="lg">
      <AvatarImage className='not-prose' src="https://i.pravatar.cc/100?img=14" alt="User large" />
      <AvatarFallback>LG</AvatarFallback>
    </Avatar>
    <Avatar size="xl">
      <AvatarImage className='not-prose' src="https://i.pravatar.cc/100?img=15" alt="User extra large" />
      <AvatarFallback>XL</AvatarFallback>
    </Avatar>
  </div>
)

export const Group = () => (
  <AvatarGroup max={3} aria-label="Project members">
    <Avatar>
      <AvatarImage className='not-prose' src="https://i.pravatar.cc/100?img=21" alt="Member one" />
      <AvatarFallback>M1</AvatarFallback>
    </Avatar>
    <Avatar>
      <AvatarImage className='not-prose' src="https://i.pravatar.cc/100?img=22" alt="Member two" />
      <AvatarFallback>M2</AvatarFallback>
    </Avatar>
    <Avatar>
      <AvatarImage className='not-prose' src="https://i.pravatar.cc/100?img=23" alt="Member three" />
      <AvatarFallback>M3</AvatarFallback>
    </Avatar>
    <Avatar>
      <AvatarImage className='not-prose' src="https://i.pravatar.cc/100?img=24" alt="Member four" />
      <AvatarFallback>M4</AvatarFallback>
    </Avatar>
    <Avatar>
      <AvatarImage className='not-prose' src="https://i.pravatar.cc/100?img=25" alt="Member five" />
      <AvatarFallback>M5</AvatarFallback>
    </Avatar>
  </AvatarGroup>
)
