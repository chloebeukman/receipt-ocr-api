export default async function handler(req, res) {
  // Only allow POST requests
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { imageBase64 } = req.body;

    if (!imageBase64) {
      return res.status(400).json({ error: "No image provided" });
    }

    const endpoint = process.env.AZURE_OCR_ENDPOINT;
    const key = process.env.AZURE_OCR_KEY;

    if (!endpoint || !key) {
      return res.status(500).json({ error: "OCR service not configured" });
    }

    // Convert base64 to binary buffer for Azure
    const imageBuffer = Buffer.from(imageBase64, "base64");

    // Call Azure Computer Vision OCR endpoint
    const azureUrl = `${endpoint}vision/v3.2/ocr?language=unk&detectOrientation=true`;

    const azureResponse = await fetch(azureUrl, {
      method: "POST",
      headers: {
        "Ocp-Apim-Subscription-Key": key,
        "Content-Type": "application/octet-stream",
      },
      body: imageBuffer,
    });

    if (!azureResponse.ok) {
      const errorText = await azureResponse.text();
      console.error("Azure error:", errorText);
      return res.status(500).json({ error: "OCR processing failed" });
    }

    const azureData = await azureResponse.json();

    // Extract all text from Azure's response structure
    const extractedText = azureData.regions
      ?.flatMap((region) => region.lines)
      ?.flatMap((line) => line.words)
      ?.map((word) => word.text)
      ?.join(" ") || "";

    return res.status(200).json({ result: extractedText });

  } catch (error) {
    console.error("Handler error:", error);
    return res.status(500).json({ error: "OCR processing failed" });
  }
}
