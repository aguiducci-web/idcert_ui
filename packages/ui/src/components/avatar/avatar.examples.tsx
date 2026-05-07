import { Avatar, AvatarImage, AvatarFallback } from './index.js'

export const Default = () => (
  <Avatar>
    <AvatarImage src="https://i.pravatar.cc/100?img=1" alt="User one" />
    <AvatarFallback>U1</AvatarFallback>
  </Avatar>
)
