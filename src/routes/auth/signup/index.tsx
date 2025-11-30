import { createFileRoute } from '@tanstack/react-router'
import { SignupForm } from '@/components/auth/signup-form'
import { Header } from '@/components/landing/header'

export const Route = createFileRoute('/auth/signup/')({
  component: RouteComponent,
})

function RouteComponent() {
  return (
    <div className="bg-panel min-h-screen flex flex-col">
      <Header />
      <main className="flex flex-1 items-center justify-center px-4">
        <SignupForm className="w-full max-w-md" />
      </main>
    </div>
  )
}
