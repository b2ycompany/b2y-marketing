import { 
  GoogleAuthProvider, 
  signInWithPopup, 
  signOut,
  createUserWithEmailAndPassword, // Importa a função de cadastro
  signInWithEmailAndPassword, // Importa a função de login
} from "firebase/auth";
import { auth } from "./config";
import { createUserProfile } from "./firestore";

// --- LOGIN COM GOOGLE (JÁ EXISTE) ---
export async function signInWithGoogle() {
  const provider = new GoogleAuthProvider();
  try {
    const result = await signInWithPopup(auth, provider);
    if (result.user) {
      await createUserProfile(result.user);
    }
    console.log("Usuário autenticado com sucesso via Google:", result.user.displayName);
    return result;
  } catch (error) {
    console.error("Erro ao fazer login com o Google:", error);
    return null;
  }
}

// --- CADASTRO COM E-MAIL E SENHA (NOVO) ---
export async function signUpWithEmail(email: string, password: string) {
  try {
    const result = await createUserWithEmailAndPassword(auth, email, password);
    // Após o cadastro, também criamos o perfil dele no Firestore
    if (result.user) {
      await createUserProfile(result.user);
    }
    console.log("Usuário cadastrado com sucesso via E-mail:", result.user.email);
    return result;
  } catch (error: any) {
    console.error("Erro ao cadastrar com e-mail:", error.message);
    // Retornamos a mensagem de erro para exibir ao usuário
    return { error: error.message };
  }
}

// --- LOGIN COM E-MAIL E SENHA (NOVO) ---
export async function signInWithEmail(email: string, password: string) {
    try {
        const result = await signInWithEmailAndPassword(auth, email, password);
        console.log("Usuário autenticado com sucesso via E-mail:", result.user.email);
        return result;
    } catch (error: any) {
        console.error("Erro ao logar com e-mail:", error.message);
        return { error: error.message };
    }
}


// --- LOGOUT (JÁ EXISTE) ---
export async function logout() {
  try {
    await signOut(auth);
    console.log("Usuário desconectado com sucesso.");
  } catch (error) {
    console.error("Erro ao fazer logout:", error);
  }
}