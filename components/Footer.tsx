import { FC } from 'react'

const Footer: FC = () => {
  return (
    <footer className="border-t">
      <div className="container flex h-14 items-center px-4">
        <p className="text-sm text-muted-foreground">
          © {new Date().getFullYear()} ICT PPDJB. All rights reserved 2024.
        </p>
      </div>
    </footer>
  )
}

export default Footer 