# Canoe Scoreboard

A modern, responsive web application for displaying canoe competition scoreboards, compatible with the existing QML control application. This application is designed to work with different display types, including standard horizontal monitors, vertical displays, and custom LED walls.

## Features

- **Real-time updates** via WebSocket connection
- **Multiple display layouts** (horizontal, vertical, LED wall, and custom)
- **Component-based architecture** for easy maintenance
- **Configurable theming** via CSS variables
- **Responsive design** that adapts to different screen sizes
- **Compatible** with the existing QML control application

## Installation

### Prerequisites

- [Node.js](https://nodejs.org/) (v16 or newer)
- [npm](https://www.npmjs.com/) (v7 or newer)

### Setup

1. Clone the repository:

   ```bash
   git clone https://github.com/jakubbican/csk_scoreboard.git
   cd csk_scoreboard
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Prepare assets:
   ```bash
   node scripts/prepare-assets.js
   ```

### Development

Start the development server:

```bash
npm run dev
```

This will start a development server at http://localhost:3000.

### Building for Production

Build the application for production:

```bash
npm run build
```

This will create a `dist` directory with the production build of the application.

Preview the production build:

```bash
npm run preview
```

## Usage

### WebSocket Connection

The scoreboard connects to the QML control application via WebSocket. By default, it connects to `ws://localhost:8081/`, but this can be changed through the configuration panel or URL parameters.

### URL Parameters

You can configure the scoreboard through URL parameters:

- `?type=horizontal` - Set display type (options: `horizontal`, `vertical`, `ledwall`, `custom`)
- `?server=ws://192.168.1.100:8081/` - Set WebSocket server address
- `?width=1280&height=720` - Set custom dimensions when type is `custom`
- `?config=true` - Show configuration panel on load

Example:

```
http://localhost:3000/?type=vertical&server=ws://192.168.1.100:8081/
```

### Configuration Panel

Press `Alt+C` to show/hide the configuration panel, which allows you to change settings such as:

- WebSocket server URL
- Display type
- Custom dimensions

## Deployment

### Web Server

Deploy the contents of the `dist` directory to any web server.

### Raspberry Pi

1. Build the application:

   ```bash
   npm run build
   ```

2. Copy the contents of the `dist` directory to the Raspberry Pi.

3. Set up a simple web server on the Raspberry Pi (e.g., using [http-server](https://www.npmjs.com/package/http-server)):

   ```bash
   npx http-server ./dist -p 8080
   ```

4. Access the scoreboard via the Raspberry Pi's IP address:
   ```
   http://[raspberry-pi-ip]:8080/
   ```

### Pi Signage

1. Build the application:

   ```bash
   npm run build
   ```

2. Create a zip file of the `dist` directory:

   ```bash
   cd dist
   zip -r ../canoe-scoreboard.zip *
   ```

3. Upload the `canoe-scoreboard.zip` file to your Pi Signage server.

4. Configure Pi Signage to display the scoreboard as a web asset.

## Customization

### Images and Logos

Replace the following files in the `public/assets` directory:

- `logo.png` - Main logo
- `footer.png` - Footer with sponsor logos
- `flags/*.png` - Country flags

### CSS Variables

Edit the CSS variables in `src/styles/main.css` to customize colors, fonts, and sizes:

```css
:root {
  --primary-color: #003366; /* Dark blue */
  --primary-light: #0046b8; /* Lighter blue */
  --secondary-color: #ffffff; /* White */
  --accent-color: #ffff00; /* Yellow */
  --highlight-color: #ffc0cb; /* Pink */
  --error-color: #e32213; /* Red */
  /* ... other variables ... */
}
```

## Asset Management

The scoreboard uses an advanced asset management system that balances performance and flexibility:

1. **Static flag images** are compiled into the application as base64-encoded strings
2. **Dynamic assets** (logos, footers, etc.) are loaded through a JSON configuration file

### Asset Processing During Build Time

To prepare assets for the application, follow these steps:

1. **Initial Asset Setup**

   ```bash
   node scripts/prepare-assets.js
   ```

   This script:

   - Creates necessary directories if they don't exist
   - Copies assets from `assets-source` to `public/assets` if available
   - Creates placeholder assets if source files aren't available
   - Sets up required directory structure

2. **Flag Optimization (Optional)**

   ```bash
   node scripts/flags-to-base64.cjs
   ```

   This script:

   - Converts all flag images in `public/assets/flags` to base64-encoded strings
   - Generates `src/utils/flagsBase64.js` with the encoded data
   - Embeds flags directly in the application bundle
   - Reduces HTTP requests and improves performance

3. **Image Optimization (Optional)**
   ```bash
   node scripts/optimizeImages.js
   ```
   This script:
   - Resizes and compresses images for optimal performance
   - Maintains aspect ratio while limiting dimensions
   - Optimizes PNG quality settings

### Asset Configuration for Deployment

The application uses a JSON configuration file (`public/assets/config.json`) that can be easily edited after deployment without rebuilding the application:

```json
{
  "assets": {
    "logo": {
      "path": "logo.png",
      "type": "image/png",
      "description": "Main logo displayed in the top bar"
    },
    "partners": {
      "path": "partners.png",
      "type": "image/png",
      "description": "Partners/sponsors logos displayed in the top bar"
    },
    "footer": {
      "path": "footer.png",
      "type": "image/png",
      "description": "Footer image with sponsor logos"
    },
    "bib": {
      "path": "bib.png",
      "type": "image/png",
      "description": "Bib number background image"
    }
  },
  "settings": {
    "cacheVersion": 1,
    "preloadAssets": true
  }
}
```

To customize assets after deployment:

1. Replace the image files in the `public/assets` directory
2. Update the paths in `config.json` if using different filenames or formats
3. Set `cacheVersion` to a new value to force browsers to reload cached assets

### Recommended Image Sizes

For optimal display across different screen sizes, use these recommended dimensions:

| Asset        | Recommended Size | Format | Description                                          |
| ------------ | ---------------- | ------ | ---------------------------------------------------- |
| logo.png     | 300px × 80px     | PNG    | Main logo in header area                             |
| partners.png | 800px × 60px     | PNG    | Partner logos in header area                         |
| footer.png   | 1920px × 120px   | PNG    | Footer with sponsor logos                            |
| bib.png      | 80px × 80px      | PNG    | Background for competitor bib numbers                |
| flags/\*.bmp | 60px × 40px      | BMP    | Country flags (named by country code, e.g., CZE.bmp) |

Notes:

- PNG format supports transparency which is ideal for logos
- The application will automatically resize images to fit their containers
- SVG images can be converted to PNG using `scripts/simple-svg-to-png.cjs`
- Flag images are best provided as BMP files for compatibility with the control system

### Supported Image Formats

With the JSON configuration, you can use various image formats:

- PNG (recommended for logos and graphics with transparency)
- JPEG (good for photographs or complex images without transparency)
- WebP (modern format with excellent compression)
- SVG (vector graphics, ideal for logos that need to scale)
- BMP (used primarily for flag images)

Simply update the file extension in the configuration paths and ensure the `type` property matches the MIME type.

## Windows Build Instructions

To build and run the application on a Windows computer:

1. Install Node.js:

   - Download and install Node.js from [nodejs.org](https://nodejs.org/)
   - Choose the LTS (Long Term Support) version
   - Follow the installation wizard, accepting the default settings

2. Clone or download the repository:

   - If you have Git installed:
     ```
     git clone https://github.com/jakubbican/csk_scoreboard.git
     cd csk_scoreboard
     ```
   - Alternatively, download and extract the ZIP file from the repository

3. Open Command Prompt or PowerShell:

   - Navigate to the project directory:
     ```
     cd path\to\csk_scoreboard
     ```

4. Install dependencies:

   ```
   npm install
   ```

5. Prepare assets:

   ```
   node scripts\prepare-assets.js
   ```

6. Development mode:

   ```
   npm run dev
   ```

7. Build for production:

   ```
   npm run build
   ```

8. The production build will be available in the `dist` folder. You can deploy these files to any web server or open the `index.html` file directly in a browser.

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- Original QML scoreboard system by Czech Canoe
- React framework and community
- Vite.js build tool
