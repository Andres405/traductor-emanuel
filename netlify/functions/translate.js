exports.handler = async function(event) {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method Not Allowed" };
  }

  const { text, from, to } = JSON.parse(event.body || "{}");

  if (!text || !from || !to) {
    return { statusCode: 400, body: JSON.stringify({ error: "Missing params" }) };
  }

  const DEEPL_KEY = process.env.DEEPL_KEY;
  if (!DEEPL_KEY) {
    return { statusCode: 500, body: JSON.stringify({ error: "No API key configured" }) };
  }

  const langMap = { es: "ES", en: "EN" };

  try {
    const res = await fetch("https://api-free.deepl.com/v2/translate", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        auth_key: DEEPL_KEY,
        text: text,
        source_lang: langMap[from] || from.toUpperCase(),
        target_lang: langMap[to] || to.toUpperCase()
      })
    });

    if (!res.ok) {
      const errText = await res.text();
      return { statusCode: res.status, body: JSON.stringify({ error: errText }) };
    }

    const data = await res.json();
    const translated = data.translations?.[0]?.text || "";

    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ translated })
    };
  } catch (e) {
    return { statusCode: 500, body: JSON.stringify({ error: e.message }) };
  }
};
