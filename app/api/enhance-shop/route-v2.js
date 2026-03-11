export const runtime = "nodejs"; // NodeランタイムでFormData/Fileを扱う

export async function POST(req) {
  try {
    const form = await req.formData();
    const file = form.get("image");
    const description = String(form.get("description") || "");

    if (!file || !description) {
      return new Response("image & description are required", { status: 400 });
    }

    // ----- 1) テキスト補正（Chat Completions） -----
    const textRes = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content:
              "あなたは飲食店・物販の販促コピーに特化した日本語編集者です。誠実で食欲・来店意欲を高めるトーンで、40〜120字程度の本文に整え、不要な重複や曖昧な表現を避けてください。固有名詞や数値は保持し、食品表示に反する誇大表現は避けます。",
          },
          {
            role: "user",
            content:
              `元の説明文:\n${description}\n\n` +
              `出力要件:\n- 自然で読みやすい日本語\n- 1〜2文、最大120字\n- 最後に#キーワードとして店名や主要食材などを3〜5個\n`,
          },
        ],
        temperature: 0.6,
      }),
    });

    if (!textRes.ok) {
      const t = await textRes.text();
      return new Response(`text API error: ${t}`, { status: 500 });
    }
    const textJson = await textRes.json();
    const improvedDesc = (textJson.choices?.[0]?.message?.content || "").trim();

    // ----- 2) 画像補正（Images Edits） + 課金リミット時フォールバック -----
    let dataUrl;
    let warn = null;

    try {
      const apiForm = new FormData();
      apiForm.append("image", file);
      apiForm.append(
        "prompt",
        [
          "Retouch this photo for an online store.",
          "Keep the same subject and composition.",
          "White or very light neutral background, balanced color, mild sharpening.",
          "Remove noise/dust, fix white balance, subtle contrast.",
          "Do not add text or watermarks.",
        ].join(" ")
      );
      apiForm.append("size", "1024x1024");

      const imgRes = await fetch("https://api.openai.com/v1/images/edits", {
        method: "POST",
        headers: { Authorization: `Bearer ${process.env.OPENAI_API_KEY}` },
        body: apiForm,
      });

      if (!imgRes.ok) {
        const t = await imgRes.text();
        throw new Error(t);
      }

      const imgJson = await imgRes.json();
      const b64 = imgJson.data?.[0]?.b64_json;
      if (!b64) throw new Error("image generation failed");
      dataUrl = `data:image/png;base64,${b64}`;
    } catch (e) {
      // --- フォールバック：元画像そのまま返す（Billing hard limit など） ---
      const buf = Buffer.from(await file.arrayBuffer());
      const base64 = buf.toString("base64");
      const mime = file.type || "image/png";
      dataUrl = `data:${mime};base64,${base64}`;
      warn = "画像レタッチは現在スキップ（課金リミット到達など）。";
    }

    return Response.json({ desc: improvedDesc, imageUrl: dataUrl, warn });
  } catch (err) {
    return new Response(`unexpected error: ${err?.message || err}`, { status: 500 });
  }
}
