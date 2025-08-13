// Documentação:
// API de Callback do Facebook. Recebe a autorização do usuário, troca o código
// por um token de acesso de longa duração e salva as informações de conexão no Firestore.

import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/firebase/admin";
import axios from 'axios';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");
  const uid = searchParams.get("state"); // O 'state' que enviamos é o UID do usuário

  // Validação para garantir que os parâmetros necessários foram recebidos.
  if (!code || !uid) {
    console.error("Callback do Facebook chamado sem 'code' ou 'state'.");
    return NextResponse.redirect(new URL('/settings?error=FacebookAuthFailed', request.url));
  }

  const appId = process.env.FACEBOOK_APP_ID;
  const appSecret = process.env.FACEBOOK_APP_SECRET;
  const redirectUri = `${process.env.NEXT_PUBLIC_BASE_URL}/api/auth/facebook/callback`;

  try {
    // Passo 1: Trocar o código por um token de acesso de curta duração.
    const tokenUrl = `https://graph.facebook.com/v20.0/oauth/access_token?client_id=${appId}&redirect_uri=${redirectUri}&client_secret=${appSecret}&code=${code}`;
    const tokenResponse = await axios.get(tokenUrl);
    const tokenData = tokenResponse.data;
    if (tokenData.error) {
      throw new Error(`Erro ao obter token de curta duração: ${tokenData.error.message}`);
    }
    const shortLivedToken = tokenData.access_token;

    // Passo 2: Trocar o token de curta duração por um de longa duração (válido por ~60 dias).
    const longLivedTokenUrl = `https://graph.facebook.com/oauth/access_token?grant_type=fb_exchange_token&client_id=${appId}&client_secret=${appSecret}&fb_exchange_token=${shortLivedToken}`;
    const longLivedTokenResponse = await axios.get(longLivedTokenUrl);
    const longLivedTokenData = longLivedTokenResponse.data;
    if (longLivedTokenData.error) {
      throw new Error(`Erro ao obter token de longa duração: ${longLivedTokenData.error.message}`);
    }
    const longLivedToken = longLivedTokenData.access_token;
    
    // Passo 3: Com o token, buscar o ID e nome do usuário do Facebook.
    const meResponse = await axios.get(`https://graph.facebook.com/me?fields=id,name&access_token=${longLivedToken}`);
    const meData = meResponse.data;
    if (meData.error) {
      throw new Error(`Erro ao obter dados do usuário: ${meData.error.message}`);
    }
    
    // Passo 4: Salvar as informações no Firestore usando a melhor prática { merge: true }.
    const userDocRef = adminDb.collection('users').doc(uid);
    await userDocRef.set({
      connections: {
        meta: {
          accessToken: longLivedToken,
          userId: meData.id,
          name: meData.name,
          connectedAt: new Date(),
        }
      }
    }, { merge: true });

    console.log("Token do Facebook salvo com sucesso para o usuário:", uid);

    // Passo 5: Redirecionar o usuário de volta para a página de Configurações com um status de sucesso.
    return NextResponse.redirect(new URL('/settings?meta_connected=true', request.url));

  } catch (error: any) {
    console.error("Erro completo no callback do Facebook:", error.message);
    return NextResponse.redirect(new URL(`/settings?error=${encodeURIComponent(error.message)}`, request.url));
  }
}