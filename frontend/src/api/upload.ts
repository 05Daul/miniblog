// src/pages/api/upload.ts
import type { NextApiRequest, NextApiResponse } from "next";
import fs from 'fs'
import path from 'path'

export const config = {
  api: {
    bodyParser: false,
  },
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") return res.status(405).end()

  const chunks: any[] = []
  req.on("data", (chunk) => chunks.push(chunk))

  req.on("end", () => {
    const buffer = Buffer.concat(chunks)
    const fileName = Date.now() + ".png"
    const filePath = path.join(process.cwd(), "public/uploads", fileName)

    fs.writeFileSync(filePath, buffer)

    return res.status(200).json({
      url: `/uploads/${fileName}`,
    })
  })
}