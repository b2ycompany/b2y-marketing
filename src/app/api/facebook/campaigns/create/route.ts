import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/firebase/admin";
import admin from 'firebase-admin';

export async function POST(request: NextRequest) {
  try {
    const authorization = request.headers.get("Authorization");
    if (!authorization?.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Token de autorização ausente." }, { status: 401 });
    }
    const idToken = authorization.split("Bearer ")[1];
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    const uid = decodedToken.uid;

    const body = await request.json();
    const { adAccountId, campaignName, objective } = body;

    if (!adAccountId || !campaignName || !objective) {
      return NextResponse.json({ error: "Dados da campanha incompletos." }, { status: 400 });
    }

    const userDocRef = adminDb.collection('users').doc(uid);
    const userDoc = await userDocRef.get();
    const accessToken = userDoc.data()?.connections?.facebook?.accessToken;

    if (!accessToken) {
      return NextResponse.json({ error: "Conta do Facebook não conectada." }, { status: 400 });
    }

    const facebookApiUrl = `https://graph.facebook.com/v20.0/act_${adAccountId}/campaigns`;
    
    const campaignData = {
      name: campaignName,
      objective: objective,
      status: 'PAUSED',
      // CORREÇÃO: Passando o valor como uma lista (array)
      special_ad_categories: ['NONE'], 
      access_token: accessToken,
    };

    const apiResponse = await fetch(facebookApiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(campaignData),
    });

    const responseData = await apiResponse.json();

    if (responseData.error) {
      // Adicionando mais detalhes ao erro para facilitar a depuração
      throw new Error(`(${responseData.error.code}) ${responseData.error.message}`);
    }

    return NextResponse.json({ success: true, campaignId: responseData.id });

  } catch (error: any) {
    console.error("Erro ao criar campanha:", error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}