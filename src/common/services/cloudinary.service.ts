import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { v2 as cloudinary, UploadApiResponse } from 'cloudinary'

@Injectable()
export class CloudinaryService {
  constructor(private configService: ConfigService) {
    cloudinary.config({
      cloud_name: this.configService.get('CLOUDINARY_CLOUD_NAME'),
      api_key: this.configService.get('CLOUDINARY_API_KEY'),
      api_secret: this.configService.get('CLOUDINARY_API_SECRET'),
    });
  }

  async uploadImageToCloudinary(
    file: Express.Multer.File,
    folder?: string,
  ): Promise<UploadApiResponse> {
    return new Promise((resolve, reject) => {
      cloudinary.uploader.upload_stream(
          {
            folder: folder || 'images',
            resource_type: 'auto',
          },
          (error, result) => {
            if (error) return reject(new Error(error.message || 'Upload failed'))
            if (!result) return reject(new Error('Upload result is undefined'));
            resolve(result)
          },
        )
        .end(file.buffer) // Ghi dữ liệu vào stream và đóng stream
    })
  }

  async deleteImageFromCloudinary(publicId: string): Promise<{ result: string }> {
    try {
      const result = await cloudinary.uploader.destroy(publicId)
      return result
    } catch (error) {
      throw new Error(
        error instanceof Error ? error.message : 'Delete failed',
      )
    }
  }

async uploadVideoToCloudinary(
  file: Express.Multer.File,
  folder?: string,
): Promise<UploadApiResponse> {
  return new Promise((resolve, reject) => {
    cloudinary.uploader.upload_stream(
      {
        folder: folder || 'videos',
        resource_type: 'video',
        chunk_size: 6000000, // 6MB chunks (Chia video thành các "chunks" nhỏ 6MB để upload, tùy chọn, tốt cho file lớn)
        // eager: [
        //   { width: 300, height: 300, crop: 'pad', audio_codec: 'none' }, // Tạo thêm video Thumbnail
        //   { width: 160, height: 90, crop: 'fill', gravity: 'auto', format: 'jpg' } // Tạo thêm ảnh xem trước Preview image
        // ],
        // eager_async: true, // Xử lý transformations không đồng bộ
      },
      (error, result) => {
        if (error) return reject(new Error(error.message || 'Upload video failed'))
        if (!result) return reject(new Error('Upload result is undefined'))
        resolve(result)
      },
    ).end(file.buffer)
  })
}
}