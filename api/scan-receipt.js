import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export default async function handler(req, res) {
  try {
    const { imageBase64 } = req.body;

    if (!imageBase64) {
      return res.status(400).json({ error: "No image provided" });
    }

    const response = await openai.responses.create({
      model: "gpt-4.1",
      input: [
        {
          role: "user",
          content: [
            {
              type: "input_text",
              text: "Extract purchased items and their prices from this receipt. Ignore tax, subtotal, total, VAT, and payment lines. Return ONLY valid JSON in this format: [{\"name\":\"Item name\",\"price\":12.34}]",
            },
            {
              type: "input_image",
              image_url: `data:image/jpeg;base64,${imageBase64}`,
            },
          ],
        },
      ],
    });

    return res.status(200).json({
      result: response.output_text,
    });

  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "OCR processing failed" });
  }
}
