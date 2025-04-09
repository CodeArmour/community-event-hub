"use server"

import { v2 as cloudinary } from "cloudinary"

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

export async function uploadImage(formData: FormData) {
  try {
    const file = formData.get("file") as File

    if (!file) {
      return { error: "No file provided" }
    }

    // Convert file to base64
    const fileBuffer = await file.arrayBuffer()
    const base64File = Buffer.from(fileBuffer).toString("base64")
    const dataURI = `data:${file.type};base64,${base64File}`

    // Upload to Cloudinary
    const result = await new Promise((resolve, reject) => {
      cloudinary.uploader.upload(
        dataURI,
        {
          folder: "event-hub",
          resource_type: "image",
          transformation: [{ width: 1200, height: 675, crop: "limit" }, { quality: "auto:good" }],
        },
        (error, result) => {
          if (error) reject(error)
          else resolve(result)
        },
      )
    })

    return {
      success: true,
      data: result,
    }
  } catch (error) {
    console.error("Error uploading image:", error)
    return {
      success: false,
      error: "Failed to upload image",
    }
  }
}
