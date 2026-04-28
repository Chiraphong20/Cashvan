/**
 * Cloudinary Utility for handling image uploads
 * Replace placeholders with your actual Cloudinary credentials
 */

const CLOUDINARY_URL = import.meta.env.VITE_CLOUDINARY_URL || 'https://api.cloudinary.com/v1_1/YOUR_CLOUD_NAME/image/upload';
const UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET || 'cashvan_preset';

export const uploadToCloudinary = async (file: File | Blob): Promise<string> => {
    // Canvas compression utility for Base64 fallback
    const compressImage = async (file: File | Blob): Promise<string> => {
        return new Promise((resolve) => {
            const reader = new FileReader();
            reader.onload = (e) => {
                const img = new Image();
                img.onload = () => {
                    const canvas = document.createElement('canvas');
                    let width = img.width;
                    let height = img.height;
                    const MAX_SIZE = 800; // Resize to max 800px to save massive DB space

                    if (width > height && width > MAX_SIZE) {
                        height *= MAX_SIZE / width;
                        width = MAX_SIZE;
                    } else if (height > MAX_SIZE) {
                        width *= MAX_SIZE / height;
                        height = MAX_SIZE;
                    }

                    canvas.width = width;
                    canvas.height = height;
                    const ctx = canvas.getContext('2d');
                    if (ctx) {
                        ctx.drawImage(img, 0, 0, width, height);
                        // Export compressed JPEG base64 (60% quality)
                        resolve(canvas.toDataURL('image/jpeg', 0.6));
                    } else {
                        resolve(e.target?.result as string); // fallback
                    }
                };
                img.src = e.target?.result as string;
            };
            reader.readAsDataURL(file);
        });
    };

    // Fallback: If still using placeholder, return a compressed Base64 local URL
    if (CLOUDINARY_URL.includes('YOUR_CLOUD_NAME')) {
        console.warn('Cloudinary not configured. Using compressed Base64 fallback.');
        return await compressImage(file);
    }
    // 1. Simple Image Compression (Optional - Canvas based)
    // For now we use the raw file as Cloudinary handles compression well with transformation flags

    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', UPLOAD_PRESET);

    try {
        const response = await fetch(CLOUDINARY_URL, {
            method: 'POST',
            body: formData,
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            const errorMessage = errorData.error?.message || 'Unknown error';
            console.error('❌ Cloudinary Error Details:', errorMessage);
            throw new Error(`Cloudinary upload failed: ${errorMessage}`);
        }

        const data = await response.json();
        // Returns the secure URL
        return data.secure_url;
    } catch (error) {
        console.error('Error uploading to Cloudinary:', error);
        // Fallback: return Base64 instead of transient blob
        return await compressImage(file);
    }
};

/**
 * Example usage:
 * const url = await uploadToCloudinary(myFile);
 * setPhotoUrl(url);
 */
