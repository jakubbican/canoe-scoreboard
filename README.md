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
  --primary-color: #003366;       /* Dark blue */
  --primary-light: #0046b8;       /* Lighter blue */
  --secondary-color: #FFFFFF;     /* White */
  --accent-color: #FFFF00;        /* Yellow */
  --highlight-color: #FFC0CB;     /* Pink */
  --error-color: #E32213;         /* Red */
  /* ... other variables ... */
}
```

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