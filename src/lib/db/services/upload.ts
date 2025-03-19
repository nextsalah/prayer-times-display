import { db } from '$lib/db';
import { eq } from 'drizzle-orm';
import { uploadedFiles, type FileMetadata } from '../schemas';

export const fileService = {
    /**
     * Upload a file to the database
     */
    async uploadFile(file: File, description: string = '', themeName: string = 'default'): Promise<FileMetadata> {
        // Convert the file to a buffer
        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        // Insert the file into the database
        const result = await db.insert(uploadedFiles).values({
            name: file.name,
            type: file.type,
            description,
            themeName,
            data: buffer,
            size: file.size,
            createdAt: new Date()
        }).returning({
            id: uploadedFiles.id,
            name: uploadedFiles.name,
            type: uploadedFiles.type,
            description: uploadedFiles.description,
            themeName: uploadedFiles.themeName,
            size: uploadedFiles.size,
            createdAt: uploadedFiles.createdAt
        });

        // Check if the insert was successful
        if (result.length === 0) {
            throw new Error('Failed to upload file');
        }
        // Return the metadata of the uploaded file
        return result[0];
    },

    /**
     * Get all files (metadata only, not the actual file data)
     */
    async getAllFiles(): Promise<FileMetadata[]> {
        const files = await db.select({
            id: uploadedFiles.id,
            name: uploadedFiles.name,
            type: uploadedFiles.type,
            description: uploadedFiles.description,
            themeName: uploadedFiles.themeName,
            size: uploadedFiles.size,
            createdAt: uploadedFiles.createdAt
        }).from(uploadedFiles).orderBy(uploadedFiles.createdAt);

        return files;
    },

    /**
     * Get file metadata by ID
     */
    async getFileMetadata(id: number): Promise<FileMetadata | null> {
        const files = await db.select({
            id: uploadedFiles.id,
            name: uploadedFiles.name,
            type: uploadedFiles.type,
            description: uploadedFiles.description,
            themeName: uploadedFiles.themeName,
            size: uploadedFiles.size,
            createdAt: uploadedFiles.createdAt
        }).from(uploadedFiles).where(eq(uploadedFiles.id, id));

        return files.length > 0 ? files[0] : null;
    },

    /**
     * Get file data by ID
     */
    async getFileData(id: number): Promise<{ data: Buffer; type: string } | null> {
        const files = await db.select({
            data: uploadedFiles.data,
            type: uploadedFiles.type
        }).from(uploadedFiles).where(eq(uploadedFiles.id, id));

        if (files.length === 0) return null;
        
        return {
            data: files[0].data as Buffer,
            type: files[0].type
        };
    },

    /**
     * Delete a file by ID
     */
    async deleteFile(id: number): Promise<boolean> {
        await db.delete(uploadedFiles).where(eq(uploadedFiles.id, id));
        // Since we can't check rowsAffected directly, we'll check if the file still exists
        const fileStillExists = await this.getFileMetadata(id);
        return fileStillExists === null;
    },

    /**
     * Get files by theme ID
     */
    async getFilesByTheme(themeName: string): Promise<FileMetadata[]> {
        const files = await db.select({
            id: uploadedFiles.id,
            name: uploadedFiles.name,
            type: uploadedFiles.type,
            description: uploadedFiles.description,
            themeName: uploadedFiles.themeName,
            size: uploadedFiles.size,
            createdAt: uploadedFiles.createdAt
        }).from(uploadedFiles)
        .where(eq(uploadedFiles.themeName, themeName))
        .orderBy(uploadedFiles.createdAt);

        return files;
    }
};