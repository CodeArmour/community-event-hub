"use client"

import { useState, useRef } from "react"
import { Upload, X, ImageIcon, Plus } from "lucide-react"
import Image from "next/image"
import { toast } from "@/components/ui/toast"
import { Button } from "@/components/ui/button"
import { uploadImage } from "@/actions/upload-image"

interface EventImage {
  id?: string
  url: string
  caption?: string
  isPrimary: boolean
  position: number
}

interface MultipleImageUploadProps {
  onImagesUpdated: (images: EventImage[]) => void
  defaultImages?: EventImage[]
  maxImages?: number
}

export function MultipleImageUpload({ 
  onImagesUpdated, 
  defaultImages = [], 
  maxImages = 5 
}: MultipleImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false)
  const [images, setImages] = useState<EventImage[]>(defaultImages)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Check if we've reached the maximum number of images
    if (images.length >= maxImages) {
      toast.error({
        title: "Maximum images reached",
        description: `You can only upload up to ${maxImages} images`,
      })
      return
    }

    // Check file type
    if (!file.type.startsWith("image/")) {
      toast.error({
        title: "Invalid file type",
        description: "Please upload an image file (JPEG, PNG, etc.)",
      })
      return
    }

    // Check file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error({
        title: "File too large",
        description: "Please upload an image smaller than 5MB",
      })
      return
    }

    // Upload to Cloudinary
    setIsUploading(true)

    try {
      const formData = new FormData()
      formData.append("file", file)

      const response = await uploadImage(formData)

      if (response.success && response.data) {
        const imageUrl = response.data.secure_url
        
        // Create new image object
        const newImage: EventImage = {
          url: imageUrl,
          isPrimary: images.length === 0, // First image is primary by default
          position: images.length,
        }
        
        const updatedImages = [...images, newImage]
        setImages(updatedImages)
        onImagesUpdated(updatedImages)
        
        toast.success({
          title: "Image uploaded",
          description: "Your image has been uploaded successfully",
        })
        
        // Reset file input
        if (fileInputRef.current) {
          fileInputRef.current.value = ""
        }
      } else {
        throw new Error(response.error || "Failed to upload image")
      }
    } catch (error) {
      console.error("Upload error:", error)
      toast.error({
        title: "Upload failed",
        description: "There was a problem uploading your image",
      })
    } finally {
      setIsUploading(false)
    }
  }

  const handleRemoveImage = (index: number) => {
    const updatedImages = [...images]
    updatedImages.splice(index, 1)
    
    // If we removed the primary image and there are still images left,
    // make the first one primary
    if (images[index].isPrimary && updatedImages.length > 0) {
      updatedImages[0].isPrimary = true
    }
    
    // Update positions
    updatedImages.forEach((img, idx) => {
      img.position = idx
    })
    
    setImages(updatedImages)
    onImagesUpdated(updatedImages)
  }

  const setAsPrimary = (index: number) => {
    const updatedImages = images.map((img, idx) => ({
      ...img,
      isPrimary: idx === index
    }))
    
    setImages(updatedImages)
    onImagesUpdated(updatedImages)
    
    toast.success({
      title: "Primary image set",
      description: "This image will be used as the main event image",
    })
  }

  const triggerFileInput = () => {
    fileInputRef.current?.click()
  }

  return (
    <div className="space-y-4">
      <input 
        type="file" 
        ref={fileInputRef} 
        onChange={handleFileChange} 
        accept="image/*" 
        className="hidden" 
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {images.map((image, index) => (
          <div key={index} className="relative overflow-hidden rounded-lg border">
            <div className="aspect-video relative">
              <Image 
                src={image.url} 
                alt={`Event image ${index + 1}`} 
                fill 
                className="object-cover" 
              />
              {image.isPrimary && (
                <div className="absolute top-2 left-2 rounded-full bg-primary px-2 py-1 text-xs text-white">
                  Primary
                </div>
              )}
            </div>
            <div className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 transition-opacity hover:opacity-100">
              <div className="flex gap-2">
                {!image.isPrimary && (
                  <Button 
                    size="sm" 
                    variant="secondary" 
                    onClick={() => setAsPrimary(index)}
                  >
                    Set as Primary
                  </Button>
                )}
                <Button 
                  size="sm" 
                  variant="destructive" 
                  onClick={() => handleRemoveImage(index)}
                >
                  <X className="mr-2 h-4 w-4" />
                  Remove
                </Button>
              </div>
            </div>
          </div>
        ))}

        {images.length < maxImages && (
          <div
            onClick={triggerFileInput}
            className="flex aspect-video cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-primary/20 bg-muted/50 p-4 transition-colors hover:border-primary/50 hover:bg-muted"
          >
            <div className="flex flex-col items-center justify-center gap-2 text-center">
              <div className="rounded-full bg-primary/10 p-2">
                <Plus className="h-6 w-6 text-primary" />
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium">Add Image</p>
                <p className="text-xs text-muted-foreground">
                  {images.length} of {maxImages}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {isUploading && (
        <div className="flex items-center justify-center rounded-lg border bg-muted/50 p-4">
          <div className="flex items-center gap-2 text-muted-foreground">
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
            <p className="text-sm">Uploading image...</p>
          </div>
        </div>
      )}
    </div>
  )
}