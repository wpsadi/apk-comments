'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { FileIcon, UploadIcon, AlertTriangleIcon } from 'lucide-react'
import { generateFileHash } from './hash-generator'


export default function Component() {
  const [file, setFile] = useState<File | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const router = useRouter()

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0]
    if (selectedFile) {
      if (selectedFile.type === 'application/vnd.android.package-archive') {
        setFile(selectedFile)
        setError(null)
      } else {
        setFile(null)
        setError('Please upload an APK file.')
      }
    }
  }

  const handleUpload = async () => {
    if (file) {
      setIsUploading(true)
      try {
        // Simulate file upload
        await new Promise(resolve => setTimeout(resolve, 1500))
        console.log('File uploaded:', file.name)
        setIsUploading(false)
      } catch (error) {
        setError('Upload failed. Please try again.')
        setIsUploading(false)
      }
    }
  }

  const handleSubmit = async () => {
    if (file) {
      setIsSubmitting(true)
      try {
        const fileHash = await generateFileHash(file)
        console.log("dhfdf")
        router.push(`/hash/${fileHash}`)
      } catch (error) {
        console.log(error)
        setError('Failed to generate hash. Please try again.')
        setIsSubmitting(false)
      }
    }
  }

  return (
    <div className="max-w-md mx-auto p-6 space-y-6">
      <h1 className="text-2xl font-bold text-center">APK File Uploader</h1>
      <div className="space-y-2">
        <Label htmlFor="apk-file">Upload APK File</Label>
        <Input
          id="apk-file"
          type="file"
          accept=".apk,application/vnd.android.package-archive"
          onChange={handleFileChange}
          ref={fileInputRef}
          className="hidden"
        />
        <div className="flex items-center justify-center w-full">
          <Button
            onClick={() => fileInputRef.current?.click()}
            className="w-full h-32 border-2 border-dashed rounded-lg flex flex-col items-center justify-center"
          >
            <UploadIcon className="h-8 w-8 mb-2" />
            <span>{file ? file.name : 'Click to select APK file'}</span>
          </Button>
        </div>
      </div>
      {error && (
        <Alert variant="destructive">
          <AlertTriangleIcon className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      {file && (
        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <FileIcon className="h-5 w-5" />
            <span className="text-sm">{file.name}</span>
          </div>
          <Button onClick={handleUpload} className="w-full" disabled={isUploading}>
            {isUploading ? 'Uploading...' : 'Upload APK'}
          </Button>
          <Button onClick={handleSubmit} className="w-full" disabled={isSubmitting || isUploading}>
            {isSubmitting ? 'Submitting...' : 'Submit and Generate Hash'}
          </Button>
        </div>
      )}
    </div>
  )
}