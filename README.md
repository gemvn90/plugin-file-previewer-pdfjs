# NocoBase Plugin: File Previewer - PDF.js

A NocoBase plugin that provides comprehensive PDF file preview functionality using PDF.js library with advanced viewing controls.

## Features

- 📄 **PDF File Preview** - High-quality PDF rendering with PDF.js
- 📑 **Page Navigation** 
  - Previous/Next page buttons
  - Direct page number input
  - Page counter display
- 🔍 **Zoom Controls**
  - Zoom in/out buttons
  - Zoom level selector (50%, 75%, 100%, 125%, 150%, 200%, 250%, 300%)
  - Fit to width/page buttons
- 🔄 **Rotate Controls**
  - Rotate left (counter-clockwise)
  - Rotate right (clockwise)
  - Support 0°, 90°, 180°, 270° rotation
- 🔎 **Text Search**
  - Real-time text search with highlighting
  - Navigate through matches (previous/next)
  - Match counter showing current position
  - Case-insensitive search
  - Yellow highlight for all matches, orange for current match
- ⬇️ **Download PDF Files** - Save PDF files to local storage
- 🌐 **Internationalization** - Full support for English and Chinese (简体中文)
- 🎨 **Professional UI** - Dark background viewer with intuitive toolbar
- 📱 **Responsive Design** - Works on various screen sizes

## Installation

Simply install the plugin:

```bash
npm install @gemvn90/plugin-file-previewer-pdfjs
```

**That's it!** All dependencies (`pdfjs-dist`, `react-pdf`, `file-saver`) are bundled with the plugin. No additional installation required.

**Worker Configuration:** The PDF.js worker is automatically configured using a **Blob URL approach**:

1. **Fetch from CDN:** Worker downloaded from `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/{version}/pdf.worker.min.js`
2. **Create Blob URL:** Convert response to Blob and create `blob://` URL
3. **Set Worker Source:** Configure pdfjs to use Blob URL

**Why Blob URL?**
- ✅ Prevents AMD/RequireJS from intercepting the URL
- ✅ AMD won't add `.js` extension to blob URLs
- ✅ Works reliably in NocoBase's AMD environment
- ✅ Overrides react-pdf's default worker setting
- ✅ No 404 errors for local worker files

This approach solves AMD module resolution conflicts in NocoBase's environment.

## Usage

Once installed, the plugin automatically registers a PDF previewer for all PDF files in NocoBase attachment fields.

### Viewer Controls

The PDF viewer includes a comprehensive toolbar with the following controls:

**Page Navigation:**
- Click Previous/Next buttons or use the page number input to navigate
- Direct page jump by entering page number

**Zoom:**
- Use zoom in/out buttons for quick adjustments
- Select specific zoom level from dropdown (50% - 300%)
- Use "Fit to width" or "Fit to page" for automatic sizing

**Rotate:**
- Rotate document left or right in 90° increments

**Search:**
- Click the search button to open search bar
- Enter text to search within the PDF document
- Use Previous/Next buttons to navigate through matches
- Press Enter to jump to next match
- All matches are highlighted in yellow, current match in orange
- Match counter shows your position (e.g., "2 / 5")

**Download:**
- Download the PDF file to your local storage

## Development

### Build

```bash
npm run build
```

### Package

```bash
npm pack
```

## Dependencies

All dependencies are bundled with the plugin:
- react-pdf: ^10.2.0 (includes pdfjs-dist 5.4.296)
- file-saver: ^2.0.5

**Note:** All PDF-related libraries are bundled into the plugin for maximum compatibility with NocoBase's AMD environment.

## Changelog

### v1.0.3
- **Major Improvement:** Simplified installation - single command installation
- `react-pdf` and `file-saver` are now bundled into the plugin
- All PDF-related dependencies included in bundle for AMD compatibility
- Fixed "Script error for react-pdf" by bundling instead of externalizing
- **Worker CDN:** Switched from cdnjs to unpkg (cdnjs doesn't have PDF.js 5.x)
- **Worker URL:** Verified and using `.mjs` format (only format available on unpkg)
- **Worker Loading:** Using Blob URL approach to prevent AMD/RequireJS interception
- **AMD Compatibility:** Fetch worker from CDN, convert to Blob URL to avoid module resolution conflicts
- **Worker Timing:** Moved worker configuration into component useEffect
- Added error handling for worker setup in AMD environment
- **CDN Validation:** All CDN URLs verified and working correctly

### v1.0.2
- **Simplified Installation:** react-pdf and file-saver now included as dependencies (auto-installed)
- **Breaking Change:** Updated react-pdf from 7.7.3 to 10.2.0 (includes pdfjs-dist 5.4.296)
- **Worker Configuration:** Worker loaded from cdnjs CDN (compatible with NocoBase AMD environment)
  - Worker version automatically matched with pdfjs-dist version
  - ES modules format (`.mjs`) for PDF.js 5.x compatibility
- Externalized react-pdf and pdfjs-dist (no longer bundled) - reduces bundle size from 930kB to 31.6kB
- **No manual dependency installation required** - everything installs automatically
- Fixed "Cannot set properties of undefined (setting 'onPull')" error by using CDN worker
- Improved compatibility with NocoBase AMD module system
- All features working: Page navigation, Zoom, Rotate, Text Search, Download

### v1.0.1
- Added text search functionality
- Added comprehensive toolbar with zoom, rotate controls
- Enhanced UI/UX

## License

AGPL-3.0

## Author

NocoBase Plugin Development
