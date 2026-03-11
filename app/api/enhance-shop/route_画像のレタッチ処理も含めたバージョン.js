export const runtime = "nodejs"; // Ensure Node runtime for FormData/File handling

export async function POST(req) {
  try {
    const form = await req.formData();
    const file = form.get("image");
    const description = String(form.get("description") || "");

    if (!file || !description) {
      return new Response("image & description are required", { status: 400 });
    }

    // ---------- 1) Text enhancement (Chat Completions) ----------
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
            content: `元の説明文:\n${description}\n\n出力要件:\n- 自然で読みやすい日本語\n- 1〜2文、最大120字\n- 最後に#キーワードとして店名や主要食材などを3〜5個\n`,
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

    // ---------- 2) Image enhancement (Images Edits) ----------
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
      headers: {
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: apiForm,
    });

    if (!imgRes.ok) {
      const t = await imgRes.text();
      return new Response(`image API error: ${t}`, { status: 500 });
    }

    const imgJson = await imgRes.json();
    const b64 = imgJson.data?.[0]?.b64_json;
    if (!b64) return new Response("image generation failed", { status: 500 });

    const dataUrl = `data:image/png;base64,${b64}`;

    return Response.json({ desc: improvedDesc, imageUrl: dataUrl });
  } catch (err) {
    return new Response(`unexpected error: ${err?.message || err}`, { status: 500 });
  }
}
