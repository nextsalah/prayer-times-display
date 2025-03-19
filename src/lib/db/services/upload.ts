// lib/db/image-service.ts
import { db } from '$lib/db';
import { eq } from 'drizzle-orm';
import { uploadedImages, type ImageMetadata } from '../schemas';

export const imageService = {
    /**
     * Upload an image to the database
     */
    async uploadImage(file: File, description: string = '', themeName: string = 'default'): Promise<ImageMetadata> {
        // Convert the file to a buffer
        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        // Insert the image into the database
        const result = await db.insert(uploadedImages).values({
            filename: file.name,
            mimeType: file.type,
            description,
            themeName,
            data: buffer,
            size: file.size,
            createdAt: new Date()
        }).returning({
            id: uploadedImages.id,
            filename: uploadedImages.filename,
            mimeType: uploadedImages.mimeType,
            description: uploadedImages.description,
            themeName: uploadedImages.themeName,
            size: uploadedImages.size,
            createdAt: uploadedImages.createdAt
        });

        // Check if the insert was successful
        if (result.length === 0) {
            throw new Error('Failed to upload image');
        }
        // Return the metadata of the uploaded image
        return result[0];
    },

    /**
     * Get all images (metadata only, not the actual image data)
     */
    async getAllImages(): Promise<ImageMetadata[]> {
        const images = await db.select({
            id: uploadedImages.id,
            filename: uploadedImages.filename,
            mimeType: uploadedImages.mimeType,
            description: uploadedImages.description,
            themeName: uploadedImages.themeName,
            size: uploadedImages.size,
            createdAt: uploadedImages.createdAt
        }).from(uploadedImages).orderBy(uploadedImages.createdAt);

        return images;
    },

    /**
     * Get image metadata by ID
     */
    async getImageMetadata(id: number): Promise<ImageMetadata | null> {
        const images = await db.select({
            id: uploadedImages.id,
            filename: uploadedImages.filename,
            mimeType: uploadedImages.mimeType,
            description: uploadedImages.description,
            themeName: uploadedImages.themeName,
            size: uploadedImages.size,
            createdAt: uploadedImages.createdAt
        }).from(uploadedImages).where(eq(uploadedImages.id, id));

        return images.length > 0 ? images[0] : null;
    },

    /**
     * Get image data by ID
     */
    async getImageData(id: number): Promise<{ data: Buffer; mimeType: string } | null> {
        const images = await db.select({
            data: uploadedImages.data,
            mimeType: uploadedImages.mimeType
        }).from(uploadedImages).where(eq(uploadedImages.id, id));

        if (images.length === 0) return null;
        
        // Cast the unknown data to Buffer
        return {
            data: images[0].data as Buffer,
            mimeType: images[0].mimeType
        };
    },

    /**
     * Delete an image by ID
     */
    async deleteImage( id: number): Promise<boolean> {
        const result = await db.delete(uploadedImages).where(eq(uploadedImages.id, id));
        return true;
    },

    /**
     * Get images by theme ID
     */
    async getImagesByTheme(themeName: string): Promise<ImageMetadata[]> {
        const images = await db.select({
            id: uploadedImages.id,
            filename: uploadedImages.filename,
            mimeType: uploadedImages.mimeType,
            description: uploadedImages.description,
            themeName: uploadedImages.themeName,
            size: uploadedImages.size,
            createdAt: uploadedImages.createdAt
        }).from(uploadedImages)
        .where(eq(uploadedImages.themeName, themeName))
        .orderBy(uploadedImages.createdAt);

        return images;
    }
};