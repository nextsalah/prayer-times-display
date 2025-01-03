<script lang="ts">
    let { data } = $props<{ data: PageData }>();
    let files = $state<File[]>([]);
    let isDragging = $state(false);
    let uploadProgress = $state<Record<string, number>>({});

    interface MediaItem {
        id: string;
        url: string;
        name: string;
    }

    interface PageData {
        theme: {
            name: string;
            customization: Record<string, any>;
        };
        media?: MediaItem[];
    }

    // File handling functions
    function handleDragOver(e: DragEvent) {
        e.preventDefault();
        isDragging = true;
    }

    function handleDragLeave() {
        isDragging = false;
    }

    function handleDrop(e: DragEvent) {
        e.preventDefault();
        isDragging = false;
        
        if (e.dataTransfer?.files) {
            handleFiles(e.dataTransfer.files);
        }
    }

    function handleFileSelect(e: Event) {
        const input = e.target as HTMLInputElement;
        if (input.files) {
            handleFiles(input.files);
        }
    }

    function handleFiles(fileList: FileList) {
        const newFiles = Array.from(fileList).filter(file => {
            const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/svg+xml'];
            return validTypes.includes(file.type);
        });

        files = [...files, ...newFiles];
    }

    async function uploadFiles() {
        if (files.length === 0) return;

        const formData = new FormData();
        files.forEach(file => {
            formData.append('media', file);
            uploadProgress[file.name] = 0;
        });

        try {
            const response = await fetch('?/uploadMedia', {
                method: 'POST',
                body: formData
            });

            if (response.ok) {
                files = [];
                uploadProgress = {};
                window.location.reload();
            }
        } catch (error) {
            console.error('Upload failed:', error);
        }
    }

    function removeFile(index: number) {
        files = files.filter((_, i) => i !== index);
    }

    async function deleteMedia(mediaId: string) {
        try {
            const response = await fetch(`?/deleteMedia`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ mediaId })
            });

            if (response.ok) {
                window.location.reload();
            }
        } catch (error) {
            console.error('Delete failed:', error);
        }
    }
</script>

<div class="container mx-auto max-w-4xl">
    <!-- Upload Section -->
    <div class="card bg-base-100 shadow-lg mb-6">
        <div class="card-body">
            <div class="flex items-center justify-between mb-6">
                <h2 class="card-title flex gap-3">
                    <svg xmlns="http://www.w3.org/2000/svg" class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    Media Library
                </h2>
                <a href="/theme" class="btn btn-ghost">
                    Back to Theme
                </a>
            </div>

            <!-- Upload Area -->
            <div
                class="border-4 border-dashed rounded-lg p-8 text-center transition-colors"
                class:border-primary={isDragging}
                ondragover={handleDragOver}
                ondragleave={handleDragLeave}
                ondrop={handleDrop}
            >
                <input
                    type="file"
                    id="fileInput"
                    multiple
                    accept="image/*"
                    class="hidden"
                    onchange={handleFileSelect}
                />
                <label for="fileInput" class="cursor-pointer">
                    <div class="flex flex-col items-center gap-4">
                        <svg xmlns="http://www.w3.org/2000/svg" class="w-12 h-12 text-base-content/50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                        </svg>
                        <div class="text-lg">
                            Drag and drop images here or <span class="text-primary">browse</span>
                        </div>
                        <div class="text-sm text-base-content/60">
                            Supported formats: PNG, JPG, GIF, SVG
                        </div>
                    </div>
                </label>
            </div>

            <!-- File List -->
            {#if files.length > 0}
                <div class="mt-6">
                    <h3 class="text-lg font-semibold mb-4">Selected Files</h3>
                    <div class="space-y-3">
                        {#each files as file, index}
                            <div class="flex items-center justify-between p-3 bg-base-200 rounded-lg">
                                <div class="flex items-center gap-3">
                                    <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                    </svg>
                                    <span>{file.name}</span>
                                </div>
                                <button 
                                    class="btn btn-ghost btn-sm"
                                    onclick={() => removeFile(index)}
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>
                        {/each}
                    </div>
                    <div class="mt-4 flex justify-end">
                        <button class="btn btn-primary" onclick={uploadFiles}>
                            Upload {files.length} {files.length === 1 ? 'File' : 'Files'}
                        </button>
                    </div>
                </div>
            {/if}
        </div>
    </div>

    <!-- Existing Media -->
    {#if data.media && data.media.length > 0}
        <div class="card bg-base-100 shadow-lg">
            <div class="card-body">
                <h3 class="text-lg font-semibold mb-4">Current Media</h3>
                <div class="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {#each data.media as item}
                        <div class="relative group">
                            <img 
                                src={item.url} 
                                alt={item.name}
                                class="w-full h-48 object-cover rounded-lg"
                            />
                            <div class="absolute inset-0 bg-base-300/80 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-lg">
                                <button 
                                    class="btn btn-error btn-sm"
                                    onclick={() => deleteMedia(item.id)}
                                >
                                    Delete
                                </button>
                            </div>
                        </div>
                    {/each}
                </div>
            </div>
        </div>
    {/if}
</div>