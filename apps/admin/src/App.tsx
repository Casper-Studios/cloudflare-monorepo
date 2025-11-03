import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import cloudflareLogo from './assets/Cloudflare_Logo.svg'
import { Button } from '@repo/ui/button'
import { api } from './trpc/react'
import { authClient } from './lib/auth'

function App() {
  const { data: session } = authClient.useSession()

  const getUser = api.auth.getUser.useQuery({ id: "9XzMxcbWxKqNsAMqnsnsiH0qsyHdjJ6S" });

  async function createNewUser() {
    const result = await authClient.signUp.email({
      email: "test23@test.com",
      password: "Password123!",
      name: "Test User",
    });

    if (result.error) {
      console.error(result.error);
    }

    console.log(result);
  }

  function signOut() {
    authClient.signOut();
  }

  return (
    <div className="bg-red-500">
      {getUser.data?.name ?? 'No user found'}
      {session?.user?.email ?? 'No session found'}
      <Button onClick={createNewUser}>Create New User</Button>
      <Button onClick={signOut}>Sign Out</Button>
    </div>
  )
}

export default App
