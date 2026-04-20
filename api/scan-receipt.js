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

    // Extract full text lines from Azure's response
    const lines = azureData.regions
      ?.flatMap((region) => region.lines)
      ?.map((line) => line.words.map((word) => word.text).join(" ")) || [];

    // Parse lines into items and total
    const items = [];
    let total = null;

    // Keywords to skip — these are not line items
    const skipPatterns = [
      /^(sub)?total/i,
      /^vat/i,
      /^tax/i,
      /^tip/i,
      /^gratuity/i,
      /^change/i,
      /^cash/i,
      /^card/i,
      /^payment/i,
      /^balance/i,
      /^amount due/i,
      /^thank you/i,
      /^receipt/i,
      /^invoice/i,
      /^date/i,
      /^time/i,
      /^table/i,
      /^server/i,
      /^cashier/i,
      /^tel/i,
      /^www/i,
      /^\d{4}[-\/]\d{2}[-\/]\d{2}/, // dates
    ];

    // Regex to detect a price at the end of a line (e.g. "12.50" or "R12.50")
    const pricePattern = /R?\s*(\d+[.,]\d{2})\s*$/i;

    // Detect total line
    const totalPattern = /total.*?R?\s*(\d+[.,]\d{2})\s*$/i;

    for (const line of lines) {
      // Check if it's a total line
      const totalMatch = line.match(totalPattern);
      if (totalMatch && /total/i.test(line)) {
        total = parseFloat(totalMatch[1].replace(",", "."));
        continue;
      }

      // Skip non-item lines
      if (skipPatterns.some((pattern) => pattern.test(line.trim()))) {
        continue;
      }

      // Try to extract a line item with a price
      const priceMatch = line.match(pricePattern);
      if (priceMatch) {
        const price = parseFloat(priceMatch[1].replace(",", "."));
        // Remove the price from the end to get the item name
        const name = line
          .replace(pricePattern, "")
          .replace(/^[\d\s]+/, "") // remove leading quantities
          .trim();

        if (name.length > 1 && price > 0 && price < 10000) {
          items.push({ name, price });
        }
      }
    }

    // If no total found, sum up the items
    if (!total && items.length > 0) {
      total = parseFloat(
        items.reduce((sum, item) => sum + item.price, 0).toFixed(2)
      );
    }

    // Also return raw text as fallback
    const rawText = lines.join("\n");

    return res.status(200).json({
      result: rawText,
      items,
      total,
    });

  } catch (error) {
    console.error("Handler error:", error);
    return res.status(500).json({ error: "OCR processing failed" });
  }
}
