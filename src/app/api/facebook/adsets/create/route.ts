// Documentação:
// API Route para CRIAR um novo Conjunto de Anúncios (Ad Set).
// Versão corrigida ADICIONANDO o parâmetro 'start_time'.

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
    const { adAccountId, campaignId, adSetName, dailyBudget, targetingCountry } = body;

    if (!adAccountId || !campaignId || !adSetName || !dailyBudget || !targetingCountry) {
      return NextResponse.json({ error: "Dados do conjunto de anúncios incompletos." }, { status: 400 });
    }

    const userDocRef = adminDb.collection('users').doc(uid);
    const userDoc = await userDocRef.get();
    const accessToken = userDoc.data()?.connections?.facebook?.accessToken;

    if (!accessToken) {
      return NextResponse.json({ error: "Conta do Facebook não conectada." }, { status: 400 });
    }

    const facebookApiUrl = `https://graph.facebook.com/v20.0/act_${adAccountId}/adsets`;

    const adSetData = {
      name: adSetName,
      campaign_id: campaignId,
      daily_budget: parseInt(dailyBudget, 10),
      billing_event: 'IMPRESSIONS',
      optimization_goal: 'LINK_CLICKS',
      bid_strategy: 'LOWEST_COST_WITHOUT_CAP',
      // --- CORREÇÃO PRINCIPAL ---
      // Adicionando a data de início. Usamos a data e hora atuais no formato ISO.
      start_time: new Date().toISOString(),
      targeting: {
        geo_locations: {
          countries: [targetingCountry],
        },
        age_min: 18,
        age_max: 65,
        publisher_platforms: ['facebook', 'instagram'],
      },
      status: 'PAUSED',
      access_token: accessToken,
    };

    const apiResponse = await fetch(facebookApiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(adSetData),
    });

    const responseData = await apiResponse.json();

    if (responseData.error) {
      // Retornando um log mais detalhado do erro do Facebook para facilitar a depuração
      console.error("Erro da API da Meta:", responseData.error);
      throw new Error(`(${responseData.error.code}) ${responseData.error.error_user_title} - ${responseData.error.error_user_msg}`);
    }

    return NextResponse.json({ success: true, adSetId: responseData.id });

  } catch (error: any) {
    console.error("Erro ao criar conjunto de anúncios:", error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}