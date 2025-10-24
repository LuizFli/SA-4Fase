"use client";
import { useRouter } from "next/navigation";

export default function AccessDenied({ message = 'Acesso negado: você não tem permissão para ver esta página.' }) {
  const router = useRouter();

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="max-w-md w-full text-center bg-white dark:bg-gray-800 border rounded p-6">
        <h2 className="text-xl font-semibold mb-2">Acesso negado</h2>
        <p className="mb-4 text-gray-600">{message}</p>
        <div className="flex justify-center gap-3">
          <button onClick={() => router.push('/login')} className="px-4 py-2 bg-blue-600 text-white rounded">Ir para login</button>
          <button onClick={() => router.push('/')} className="px-4 py-2 bg-gray-200 dark:bg-gray-700 rounded">Voltar</button>
        </div>
      </div>
    </div>
  );
}
