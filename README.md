# 🧾 Receipt OCR API

A REST API that extracts and parses data from receipt images using OCR (Optical Character Recognition). Built as a companion tool for the [Split Fair App](https://github.com/chloebeukman/chloe-python-portfolio/tree/main/projects/split_fair) — eliminating the need to manually type out receipt totals when splitting bills.

> 🏆 Built for a HyperDev competition in collaboration with a HyperDev Copilot.

**[Live Demo ↗](https://receipt-ocr-api-sage.vercel.app)**

---

## 💡 The Problem It Solves

The Split Fair App helps groups split bills fairly — but users still had to manually enter the amounts from their receipts. This API removes that friction by letting users upload a receipt image and automatically extracting the relevant data.

---

## ✨ Features

- Upload a receipt image and extract text via OCR
- Parses key receipt data (totals, line items)
- REST API design — easy to integrate with any frontend or app
- Deployed and live on Vercel

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Runtime | Node.js |
| Language | JavaScript |
| OCR | Optical Character Recognition library |
| Deployment | Vercel |

---

## 🚀 Getting Started

### Prerequisites
- Node.js installed
- A package manager (npm or yarn)

### Installation

```bash
# Clone the repository
git clone https://github.com/chloebeukman/receipt-ocr-api.git

# Navigate into the project
cd receipt-ocr-api

# Install dependencies
npm install

# Start the development server
npm run dev
```

### Usage

Send a POST request with a receipt image to the API endpoint:

```bash
POST /api
Content-Type: multipart/form-data

file: <your-receipt-image>
```

The API returns extracted text and parsed receipt data as JSON.

---

## 🔗 Related Project

This API was built as a companion to the **Split Fair App** — a bill-splitting application that handles unequal splits, tips, and multiple payers.

[View Split Fair App →](https://github.com/chloebeukman/chloe-python-portfolio/tree/main/projects/split_fair)

---

## 👩‍💻 Author

**Chloe Beukman**
- GitHub: [@chloebeukman](https://github.com/chloebeukman)
- LinkedIn: [chloe-beukman](https://www.linkedin.com/in/chloe-beukman)
