import { useEffect } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import cloudflareLogo from './assets/Cloudflare_Logo.svg'
import { Button } from '@repo/ui/button'
import { api } from './trpc/react'
import { authClient } from './lib/auth'

function App() {
  const utils = api.useUtils();
  const { data: session } = authClient.useSession()

  const getUser = api.auth.getUserProtected.useQuery({ id: "9XzMxcbWxKqNsAMqnsnsiH0qsyHdjJ6S" }, {
    enabled: !!session?.user,
  });

  useEffect(() => {
    if (session?.user) {
      utils.auth.getUserProtected.invalidate();
    }
  }, [session?.user, utils]);

  async function createNewUser() {
    const result = await authClient.signUp.email({
      email: `test${Math.random().toString(36).substring(2, 15)}@test.com`,
      password: "Password123!",
      name: "Test User",
    });

    if (result.error) {
      console.error(result.error);
    }
  }

  function signOut() {
    authClient.signOut();
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-orange-50 via-white to-blue-50">
      {/* Header */}
      <header className="border-b border-gray-200 bg-white/80 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <img src={cloudflareLogo} alt="Cloudflare" className="h-8" />
              <span className="text-2xl font-bold text-gray-900">Admin Portal</span>
            </div>
            <div className="flex items-center space-x-4">
              {session?.user && (
                <div className="text-sm">
                  <span className="text-gray-600">Signed in as </span>
                  <span className="font-medium text-gray-900">{session.user.email}</span>
                </div>
              )}
              {session?.user ? (
                <Button onClick={signOut} variant="outline">Sign Out</Button>
              ) : (
                <Button onClick={createNewUser}>Get Started</Button>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center space-y-8">
          <div className="flex justify-center items-center space-x-8 mb-8">
            <img src={viteLogo} alt="Vite" className="h-24 w-24 hover:scale-110 transition-transform duration-300" />
            <div className="text-6xl text-gray-300">+</div>
            <img src={reactLogo} alt="React" className="h-24 w-24 hover:rotate-180 transition-transform duration-500" />
            <div className="text-6xl text-gray-300">+</div>
            <img src={cloudflareLogo} alt="Cloudflare" className="h-24 hover:scale-110 transition-transform duration-300" />
          </div>

          <h1 className="text-6xl font-bold text-gray-900 leading-tight">
            Full-Stack Admin Portal
          </h1>

          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Built with React, Vite, and Cloudflare Workers.
            A modern, blazing-fast monorepo architecture for building scalable applications.
          </p>

          <div className="flex justify-center space-x-4 pt-4">
            <Button onClick={createNewUser} className="px-8 py-6 text-lg">
              Create Test User
            </Button>
            <Button variant="outline" className="px-8 py-6 text-lg">
              Learn More
            </Button>
          </div>
        </div>

        {/* Feature Cards */}
        <div className="grid md:grid-cols-3 gap-8 mt-20">
          <div className="bg-white rounded-xl shadow-lg p-8 border border-gray-100 hover:shadow-xl transition-shadow">
            <div className="flex items-center justify-center w-16 h-16 bg-purple-100 rounded-lg mb-4">
              <img src={viteLogo} alt="Vite" className="h-10 w-10" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Lightning Fast</h3>
            <p className="text-gray-600">
              Powered by Vite for instant HMR and optimized builds that keep your development experience smooth.
            </p>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-8 border border-gray-100 hover:shadow-xl transition-shadow">
            <div className="flex items-center justify-center w-16 h-16 bg-blue-100 rounded-lg mb-4">
              <img src={reactLogo} alt="React" className="h-10 w-10" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Modern React</h3>
            <p className="text-gray-600">
              Built with the latest React patterns, hooks, and best practices for maintainable component architecture.
            </p>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-8 border border-gray-100 hover:shadow-xl transition-shadow">
            <div className="flex items-center justify-center w-16 h-16 bg-orange-100 rounded-lg mb-4">
              <img src={cloudflareLogo} alt="Cloudflare" className="h-10" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Edge Computing</h3>
            <p className="text-gray-600">
              Deploy globally on Cloudflare&apos;s edge network for ultra-low latency and unmatched performance.
            </p>
          </div>
        </div>

        {/* User Info Section - Protected Route Demo */}
        {session?.user && (
          <div className="mt-16 bg-linear-to-r from-orange-500 to-pink-500 rounded-2xl shadow-xl p-8 text-white">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-3xl font-bold">Protected Route Data</h2>
              <span className="bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full text-sm font-medium">
                🔒 Authenticated
              </span>
            </div>
            <p className="text-orange-100 mb-6">
              This data is fetched from a protected tRPC endpoint that requires authentication
            </p>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 border border-white/20">
                <p className="text-sm text-orange-100 mb-2">User Name (Protected)</p>
                <p className="text-xl font-semibold">
                  {getUser.isLoading ? (
                    <span className="animate-pulse">Loading...</span>
                  ) : getUser.error ? (
                    <span className="text-red-200">Error loading</span>
                  ) : (
                    getUser.data?.name ?? 'No data'
                  )}
                </p>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 border border-white/20">
                <p className="text-sm text-orange-100 mb-2">User ID (Protected)</p>
                <p className="text-sm font-mono break-all">
                  {getUser.isLoading ? (
                    <span className="animate-pulse">Loading...</span>
                  ) : getUser.error ? (
                    <span className="text-red-200">Error loading</span>
                  ) : (
                    getUser.data?.id ?? 'No data'
                  )}
                </p>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 border border-white/20">
                <p className="text-sm text-orange-100 mb-2">Session Email</p>
                <p className="text-sm font-semibold break-all">{session.user.email}</p>
              </div>
            </div>
            {getUser.error && (
              <div className="mt-4 bg-red-500/20 backdrop-blur-sm rounded-lg p-4 border border-red-300/30">
                <p className="text-sm font-semibold mb-1">Error Details:</p>
                <p className="text-sm font-mono">{getUser.error.message}</p>
              </div>
            )}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-200 mt-20 bg-white/80 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-between">
            <p className="text-gray-600 text-sm">
              © 2025 Cloudflare Admin. Built with modern web technologies.
            </p>
            <div className="flex items-center space-x-6">
              <a href="#" className="text-gray-600 hover:text-gray-900 transition-colors">
                Documentation
              </a>
              <a href="#" className="text-gray-600 hover:text-gray-900 transition-colors">
                Support
              </a>
              <a href="#" className="text-gray-600 hover:text-gray-900 transition-colors">
                GitHub
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default App
