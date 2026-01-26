import Link from 'next/link';
import { Header } from '@/components/layout/Header';

export default function Home() {
  return (
    <>
      <Header />
      <main className="flex min-h-screen flex-col items-center justify-center p-24 bg-gradient-to-br from-sunburst-50 to-wine-light">
      <div className="text-center max-w-3xl">
        <h1 className="text-6xl font-bold mb-6 text-wine-dark">Wine Club</h1>
        <p className="text-2xl text-gray-700 mb-4 italic">
          "Wine is sunlight, held together by water."
        </p>
        <p className="text-sm text-gray-500 mb-8">— Galileo Galilei</p>
        <p className="mt-4 text-lg text-gray-600 mb-12">
          Drink wine with (at least) seven strangers.
        </p>

        <Link
          href="/signup"
          className="inline-block px-8 py-4 bg-sunburst-600 hover:bg-sunburst-700 text-white text-lg font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all duration-200"
        >
          Get Started
        </Link>
      </div>
    </main>
    </>
  );
}
