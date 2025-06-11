// Documentação do Código:
// Este é um componente React 'client-side' (note o "use client" no topo).
// Ele renderiza um botão que, ao ser clicado, chama nossa função 
// de login com o Google.

"use client"; // Diretiva do Next.js para indicar que este é um componente de cliente

import { signInWithGoogle } from "@/firebase/auth"; // Importamos nossa função

export default function SignInButton() {
  const handleSignIn = async () => {
    await signInWithGoogle();
    // Após o login, o Firebase vai atualizar o estado de autenticação
    // e nosso app vai reagir a isso (faremos isso no Passo 3).
  };

  return (
    <button
      onClick={handleSignIn}
      className="px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-75 transition duration-150 ease-in-out"
    >
      Entrar com o Google
    </button>
  );
}