import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/firebase/admin";
import admin from 'firebase-admin';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const authorization = request.headers.get("Authorization");
    if (!authorization?.startsWith("Bearer ")) return NextResponse.json({ error: "Token ausente." }, { status: 401 });
    
    const idToken = authorization.split("Bearer ")[1];
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    const uid = decodedToken.uid;

    const body = await request.json();
    // Agora recebemos um objeto 'targeting' completo
    const { adAccountId, campaignId, adSetName, dailyBudget, targeting } = body;

    if (!adAccountId || !campaignId || !adSetName || !dailyBudget || !targeting) {
      return NextResponse.json({ error: "Dados do conjunto de anúncios incompletos." }, { status: 400 });
    }

    const userDocRef = adminDb.collection('users').doc(uid);
    const userDoc = await userDocRef.get();
    const accessToken = userDoc.data()?.connections?.facebook?.accessToken;
    if (!accessToken) return NextResponse.json({ error: "Conta do Facebook não conectada." }, { status: 400 });

    const facebookApiUrl = `https://graph.facebook.com/v20.0/act_${adAccountId}/adsets`;

    // Preparamos o objeto de targeting, garantindo que 'genders' não seja enviado se estiver vazio.
    const finalTargeting = { ...targeting };
    if (targeting.genders && targeting.genders.length === 0) {
      delete finalTargeting.genders;
    }

    const adSetData = {
      name: adSetName,
      campaign_id: campaignId,
      daily_budget: dailyBudget,
      billing_event: 'IMPRESSIONS',
      optimization_goal: 'LINK_CLICKS',
      bid_strategy: 'LOWEST_COST_WITHOUT_CAP',
      start_time: new Date().toISOString(),
      targeting: finalTargeting, // Usando o objeto de targeting detalhado
      status: 'PAUSED',
      access_token: accessToken,
    };

    const apiResponse = await fetch(facebookApiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(adSetData),
    });

    const responseData = await apiResponse.json();
    if (responseData.error) {
      console.error("Erro da API da Meta:", responseData.error);
      throw new Error(`(${responseData.error.code}) ${responseData.error.error_user_title || responseData.error.message}`);
    }

    return NextResponse.json({ success: true, adSetId: responseData.id });
  } catch (error: any) {
    console.error("Erro ao criar conjunto de anúncios:", error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}