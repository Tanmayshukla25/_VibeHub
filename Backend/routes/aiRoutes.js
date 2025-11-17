import express from "express";
import fetch from "node-fetch";

const router = express.Router();

router.post("/generate-caption", async (req, res) => {
  try {
    const { imageUrl } = req.body;

    if (!imageUrl) {
      return res.status(400).json({ error: "Image URL missing" });
    }

    const response = await fetch(process.env.chatAPI, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "user",
            content: [
              {
                type: "text",
                text: "Write a short aesthetic Instagram caption based on this image."
              },
              {
                type: "image_url",
                image_url: { url: imageUrl }
              }
            ]
          }
        ]
      }),
    });

    const result = await response.json();
    console.log("AI RESPONSE:", JSON.stringify(result, null, 2));

    if (result?.error) {
      console.log("AI ERROR:", result.error);
      return res.json({ caption: "✨ Aesthetic vibes ✨" });
    }

    const caption = result?.choices?.[0]?.message?.content?.trim()
      || "✨ Beautiful vibes ✨";

    res.json({ caption });

  } catch (error) {
    console.error("AI ERROR:", error);
    res.json({ caption: "✨ Lovely moment ✨" });
  }
});
  
export default router;
