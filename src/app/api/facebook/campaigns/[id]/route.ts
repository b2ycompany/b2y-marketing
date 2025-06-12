// Documentação:
// API Route DINÂMICA para buscar os detalhes de UMA campanha específica,
// incluindo seus conjuntos de anúncios e anúncios aninhados.

import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/firebase/admin";
import admin from 'firebase-admin';

export const dynamic = 'force-dynamic';

// O segundo parâmetro 'context' nos dá acesso aos parâmetros da rota, como o [id]
export async function GET(request: NextRequest, context: { params: { id: string } }) {
  try {
    // 1. Validar o usuário
    const authorization = request.headers.get("Authorization");
    if (!authorization?.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Token de autorização ausente." }, { status: 401 });
    }
    const idToken = authorization.split("Bearer ")[1];
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    const uid = decodedToken.uid;

    // 2. Pegar o ID da campanha da URL
    const campaignId = context.params.id;
    if (!campaignId) {
      return NextResponse.json({ error: "ID da Campanha é obrigatório." }, { status: 400 });
    }

    // 3. Buscar o Access Token do usuário no Firestore
    const userDocRef = adminDb.collection('users').doc(uid);
    const userDoc = await userDocRef.get();
    const accessToken = userDoc.data()?.connections?.facebook?.accessToken;
    if (!accessToken) {
      return NextResponse.json({ error: "Conta do Facebook não conectada." }, { status: 400 });
    }

    // 4. Montar e fazer a chamada GET para a API Graph do Facebook
    // Esta é uma chamada poderosa com "aninhamento" de campos.
    // Pedimos a campanha e, dentro dela, expandimos seus 'adsets' (conjuntos).
    // E dentro de cada adset, expandimos seus 'ads' (anúncios).
    const fields = "name,objective,status,effective_status,adsets{name,status,effective_status,ads{name,status,effective_status,creative{body,image_url,image_hash}}}";
    const facebookApiUrl = `https://graph.facebook.com/v20.0/${campaignId}?fields=${fields}&access_token=${accessToken}`;

    const apiResponse = await fetch(facebookApiUrl);
    const responseData = await apiResponse.json();

    if (responseData.error) {
      throw new Error(`(${responseData.error.code}) ${responseData.error.message}`);
    }

    // 5. Retornar os dados detalhados da campanha
    return NextResponse.json(responseData);

  } catch (error: any) {
    console.error("Erro ao buscar detalhes da campanha:", error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}