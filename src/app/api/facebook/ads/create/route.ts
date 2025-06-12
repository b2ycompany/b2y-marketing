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
    const { adAccountId, adSetId, pageId, adName, message, headline, imageUrl, link } = body;

    if (!adAccountId || !adSetId || !pageId || !adName || !message || !headline || !imageUrl || !link) {
      return NextResponse.json({ error: "Dados do anúncio incompletos." }, { status: 400 });
    }

    const userDocRef = adminDb.collection('users').doc(uid);
    const userDoc = await userDocRef.get();
    const accessToken = userDoc.data()?.connections?.facebook?.accessToken;

    if (!accessToken) {
      return NextResponse.json({ error: "Conta do Facebook não conectada." }, { status: 400 });
    }

    // --- ETAPA 1: Criar o AdCreative ---
    const adCreativeUrl = `https://graph.facebook.com/v20.0/act_${adAccountId}/adcreatives`;
    const creativeData = {
      name: `Criativo para ${adName}`,
      object_story_spec: {
        page_id: pageId,
        link_data: {
          message: message,
          link: link,
          name: headline,
          image_url: imageUrl,
          // --- A LINHA QUE FALTAVA ---
          // Adicionando um botão de "Call to Action" ao anúncio.
          // 'LEARN_MORE' se traduz para "Saiba Mais".
          call_to_action: { type: 'LEARN_MORE' }
        }
      },
      access_token: accessToken,
    };

    const creativeResponse = await fetch(adCreativeUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(creativeData),
    });
    const creativeResponseData = await creativeResponse.json();

    if (creativeResponseData.error) {
      throw new Error(`Erro ao criar criativo: (${creativeResponseData.error.code}) ${creativeResponseData.error.message}`);
    }
    const creativeId = creativeResponseData.id;

    // --- ETAPA 2: Criar o Ad (Anúncio) ---
    const adUrl = `https://graph.facebook.com/v20.0/act_${adAccountId}/ads`;
    const adData = {
      name: adName,
      adset_id: adSetId,
      creative: {
        creative_id: creativeId,
      },
      status: 'PAUSED',
      access_token: accessToken,
    };

    const adResponse = await fetch(adUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(adData),
    });
    const adResponseData = await adResponse.json();

    if (adResponseData.error) {
      throw new Error(`Erro ao criar anúncio: (${adResponseData.error.code}) ${adResponseData.error.message}`);
    }

    return NextResponse.json({ success: true, adId: adResponseData.id });

  } catch (error: any) {
    console.error("Erro ao criar anúncio final:", error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}