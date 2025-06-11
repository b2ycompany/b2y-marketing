// Documentação:
// Versão final da API de Callback, agora usando a SINTAXE CORRETA do Firebase Admin SDK
// para escrever no banco de dados com permissões de administrador.

import { NextRequest, NextResponse } from "next/server";
// CORREÇÃO: Não importamos mais 'doc' e 'updateDoc' aqui.
import { adminDb } from "@/firebase/admin"; // Importamos APENAS a conexão de ADMIN

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");
  const uid = searchParams.get("state"); // 'state' é o UID do usuário

  if (!code || !uid) {
    return NextResponse.redirect(new URL('/dashboard?error=MissingParams', request.url));
  }

  const appId = process.env.FACEBOOK_APP_ID;
  const appSecret = process.env.FACEBOOK_APP_SECRET;
  const redirectUri = `${process.env.NEXT_PUBLIC_BASE_URL}/api/auth/facebook/callback`;

  try {
    // A lógica para buscar o token do Facebook continua exatamente a mesma.
    const tokenUrl = `https://graph.facebook.com/v20.0/oauth/access_token?client_id=${appId}&redirect_uri=${redirectUri}&client_secret=${appSecret}&code=${code}`;
    const tokenResponse = await fetch(tokenUrl);
    const tokenData = await tokenResponse.json();
    if (tokenData.error) throw new Error(tokenData.error.message);
    const shortLivedToken = tokenData.access_token;

    const longLivedTokenUrl = `https://graph.facebook.com/oauth/access_token?grant_type=fb_exchange_token&client_id=${appId}&client_secret=${appSecret}&fb_exchange_token=${shortLivedToken}`;
    const longLivedTokenResponse = await fetch(longLivedTokenUrl);
    const longLivedTokenData = await longLivedTokenResponse.json();
    if (longLivedTokenData.error) throw new Error(longLivedTokenData.error.message);
    const longLivedToken = longLivedTokenData.access_token;
    
    // --- INÍCIO DA CORREÇÃO ---
    // USANDO O ACESSO DE ADMINISTRADOR COM A SINTAXE CORRETA
    
    // Passo 1: Criar a referência ao documento usando o método .collection().doc()
    const userDocRef = adminDb.collection('users').doc(uid);
    
    // Passo 2: Chamar o método .update() diretamente na referência do documento
    await userDocRef.update({
      'connections.facebook.accessToken': longLivedToken,
      'connections.facebook.connectedAt': new Date(),
    });

    // --- FIM DA CORREÇÃO ---

    console.log("Token do Facebook salvo com sucesso (via Admin) para o usuário:", uid);

    return NextResponse.redirect(new URL('/dashboard?success=true', request.url));

  } catch (error: any) {
    console.error("Erro no callback do Facebook:", error.message);
    return NextResponse.redirect(new URL(`/dashboard?error=${encodeURIComponent(error.message)}`, request.url));
  }
}