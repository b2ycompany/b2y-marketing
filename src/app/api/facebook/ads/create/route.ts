import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/firebase/admin";
import admin from 'firebase-admin';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    // --- Autenticação do Usuário (sem mudanças) ---
    const authorization = request.headers.get("Authorization");
    if (!authorization?.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Token de autorização ausente." }, { status: 401 });
    }
    const idToken = authorization.split("Bearer ")[1];
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    const uid = decodedToken.uid;

    const body = await request.json();
       // --- LINHA DE DEPURAÇÃO NO BACKEND ---
    console.log("BODY RECEBIDO PELA API:", body);
    
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

    // --- INÍCIO DA NOVA LÓGICA ---

    // ETAPA 1: Registrar a imagem para obter um 'image_hash'
    const imageHashUrl = `https://graph.facebook.com/v20.0/act_${adAccountId}/adimages`;
    const imageResponse = await fetch(imageHashUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        url: imageUrl,
        access_token: accessToken,
      }),
    });
    const imageData = await imageResponse.json();
    if (imageData.error || !imageData.images[imageUrl]) {
      throw new Error(`Erro ao registrar imagem: (${imageData.error?.code}) ${imageData.error?.message || 'Imagem inválida ou inacessível.'}`);
    }
    const imageHash = imageData.images[imageUrl].hash;

    // ETAPA 2: Criar o AdCreative usando o 'image_hash'
    const adCreativeUrl = `https://graph.facebook.com/v20.0/act_${adAccountId}/adcreatives`;
    const creativeData = {
      name: `Criativo para ${adName}`,
      object_story_spec: {
        page_id: pageId,
        link_data: {
          message: message,
          link: link,
          name: headline,
          image_hash: imageHash, // Usando o hash em vez da URL
          call_to_action: { type: 'LEARN_MORE' },
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

    // ETAPA 3: Criar o Ad (Anúncio) final (sem mudanças aqui)
    const adUrl = `https://graph.facebook.com/v20.0/act_${adAccountId}/ads`;
    const adData = {
      name: adName,
      adset_id: adSetId,
      creative: { creative_id: creativeId },
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