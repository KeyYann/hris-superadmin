'use client';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="mt-auto pt-10 pb-6 text-center text-xs text-gray-500">
      <p>
        Copyright © {currentYear}
      </p>
    </footer>
  );
}