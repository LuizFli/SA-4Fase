import Image from "next/image";

export default function Home() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      <main className="flex min-h-screen w-full max-w-3xl flex-col items-center justify-between py-32 px-16 bg-white dark:bg-black sm:items-start">
        <h1 className="text-3xl font-bold">SA - Concessionária</h1>
        <div className="flex flex-col items-center gap-6 text-center sm:items-start sm:text-left">
          <p className="text-lg">A simple frontend for the backend API. Use the links below to navigate.</p>
        </div>
        <div className="flex flex-col gap-4 text-base font-medium sm:flex-row">
          <a className="p-3 border rounded" href="/login">Login</a>
          <a className="p-3 border rounded" href="/register">Register</a>
          <a className="p-3 border rounded" href="/vehicles">Vehicles</a>
          <a className="p-3 border rounded" href="/iot">IoT Dashboard</a>
        </div>
      </main>
    </div>
  );
}
