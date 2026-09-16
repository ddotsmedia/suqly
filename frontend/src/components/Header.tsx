import Link from 'next/link';

export default function Header() {
  return (
    <header className="sticky top-0 z-50 bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
        <Link href="/" className="text-2xl font-bold text-primary">
          Suqly
        </Link>

        <nav className="hidden md:flex gap-8">
          <Link href="/browse" className="text-gray-700 hover:text-primary">
            Browse
          </Link>
          <Link href="/sell" className="text-gray-700 hover:text-primary">
            Sell
          </Link>
          <Link href="/messages" className="text-gray-700 hover:text-primary">
            Messages
          </Link>
        </nav>

        <div className="flex gap-4">
          <Link
            href="/login"
            className="px-4 py-2 text-primary border border-primary rounded hover:bg-primary hover:text-white transition"
          >
            Login
          </Link>
          <Link
            href="/signup"
            className="px-4 py-2 bg-primary text-white rounded hover:bg-secondary transition"
          >
            Sign Up
          </Link>
        </div>
      </div>
    </header>
  );
}
