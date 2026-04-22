<script setup lang="ts">
import { ref, computed } from 'vue';

const input = ref('');
const version = ref('latest');
const isDownloading = ref(false);
const downloadError = ref<string | null>(null);

const extensionInfo = computed(() => {
  const trimmed = input.value.trim();
  if (!trimmed) return null;

  let identifier = '';
  try {
    if (trimmed.startsWith('http')) {
      const url = new URL(trimmed);
      identifier = url.searchParams.get('itemName') || '';
    } else {
      identifier = trimmed;
    }
  } catch (e) {
    identifier = trimmed;
  }

  if (!identifier.includes('.')) return null;

  const [publisher, name] = identifier.split('.');
  if (!publisher || !name) return null;

  return { publisher, name };
});

const downloadUrl = computed(() => {
  if (!extensionInfo.value) return '';
  const { publisher, name } = extensionInfo.value;
  const v = version.value.trim() || 'latest';

  return `https://${publisher}.gallery.vsassets.io/_apis/public/gallery/publisher/${publisher}/extension/${name}/${v}/assetbyname/Microsoft.VisualStudio.Services.VSIXPackage`;
});

async function handleDownload() {
  if (!extensionInfo.value || isDownloading.value) return;

  const { publisher, name } = extensionInfo.value;
  const v = version.value.trim() || 'latest';
  const filename = `${publisher}.${name}-${v}.vsix`;

  isDownloading.value = true;
  downloadError.value = null;

  try {
    const response = await fetch(downloadUrl.value);

    if (!response.ok) throw new Error('Network response was not ok');

    const blob = await response.blob();
    const blobUrl = window.URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.href = blobUrl;
    link.download = filename;
    document.body.appendChild(link);
    link.click();

    // Cleanup
    document.body.removeChild(link);
    window.URL.revokeObjectURL(blobUrl);
  } catch (err) {
    console.error('Download failed:', err);
    // Fallback: Try to open the link directly if fetch fails (likely CORS)
    window.open(downloadUrl.value, '_blank');
    downloadError.value = 'Direct download triggered (Custom naming blocked by CORS)';
  } finally {
    isDownloading.value = false;
  }
}
</script>

<template>
  <div class="min-h-screen bg-slate-50 flex items-center justify-center p-6">
    <div class="w-full max-w-lg bg-white shadow-xl rounded-2xl p-8 border border-slate-100">
      <header class="text-center mb-8">
        <h1 class="text-3xl font-bold text-slate-900">VSIX Downloader</h1>
        <p class="text-slate-500 mt-2">Download VS Code extensions directly</p>
      </header>

      <div class="space-y-6">
        <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div class="md:col-span-3">
            <label for="extension-input" class="block text-sm font-semibold text-slate-700 mb-2">
              Extension URL or Identifier
            </label>
            <input
              id="extension-input"
              v-model="input"
              type="text"
              placeholder="e.g., ms-vscode.cpptools"
              class="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all placeholder:text-slate-400"
            />
          </div>
          <div>
            <label for="version-input" class="block text-sm font-semibold text-slate-700 mb-2">
              Version
            </label>
            <input
              id="version-input"
              v-model="version"
              type="text"
              placeholder="latest"
              class="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all placeholder:text-slate-400"
            />
          </div>
        </div>

        <div v-if="extensionInfo" class="animate-in fade-in slide-in-from-top-2 duration-300">
          <div class="bg-blue-50 border border-blue-100 rounded-xl p-5">
            <h2 class="text-sm font-bold text-blue-900 uppercase tracking-wider mb-3">
              Ready to download
            </h2>

            <div class="flex flex-col gap-4">
              <div class="flex items-center justify-between text-sm">
                <span class="text-blue-700 font-medium">Extension:</span>
                <span class="text-blue-900 font-mono"
                  >{{ extensionInfo.publisher }}.{{ extensionInfo.name }}</span
                >
              </div>

              <div class="flex items-center justify-between text-sm">
                <span class="text-blue-700 font-medium">Target Version:</span>
                <span class="text-blue-900 font-mono">{{ version || 'latest' }}</span>
              </div>

              <button
                @click="handleDownload"
                :disabled="isDownloading"
                class="w-full flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-all shadow-lg shadow-blue-200 disabled:opacity-70 disabled:cursor-not-allowed"
              >
                <svg
                  v-if="!isDownloading"
                  xmlns="http://www.w3.org/2000/svg"
                  class="h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                  />
                </svg>
                <svg
                  v-else
                  class="animate-spin h-5 w-5 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    class="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    stroke-width="4"
                  ></circle>
                  <path
                    class="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                {{ isDownloading ? 'Downloading...' : 'Download VSIX' }}
              </button>

              <div v-if="downloadError" class="text-[10px] text-amber-600 font-medium text-center">
                {{ downloadError }}
              </div>

              <div class="relative group">
                <p
                  class="text-[10px] text-blue-400 truncate bg-white/50 p-2 rounded border border-blue-100"
                >
                  {{ downloadUrl }}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div v-else-if="input.trim()" class="text-center p-4">
          <p class="text-sm text-amber-600 font-medium">
            Please enter a valid extension ID (publisher.name)
          </p>
        </div>
      </div>

      <footer class="mt-12 text-center">
        <p class="text-xs text-slate-400">
          Tip: You can paste the URL directly from the Marketplace.
        </p>
      </footer>
    </div>
  </div>
</template>
