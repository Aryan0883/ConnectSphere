export default function Footer() {
  return (
    <footer className="border-t border-gray-200 bg-white">
      <div className="max-w-4xl mx-auto px-6 py-8 text-sm text-center text-gray-600">
        © {new Date().getFullYear()} ClientSphere. All rights reserved.
      </div>
    </footer>
  )
}