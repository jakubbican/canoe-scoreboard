# VS Code Integration Guide

This guide explains how to use the VS Code configurations set up for the Canoe Scoreboard project.

## Setup

1. **Install Recommended Extensions**
   - Open VS Code
   - Go to the Extensions view (Ctrl+Shift+X)
   - Type `@recommended` in the search box
   - Install the recommended extensions for this workspace

## Running the Application

From VS Code, you can easily run the application using the integrated terminal or tasks:

### Using Tasks (Recommended)

1. Press `Ctrl+Shift+P` to open the Command Palette
2. Type "Tasks: Run Task" and select it
3. Choose one of the following tasks:
   - **npm: dev** - Start the development server
   - **npm: build** - Build for production
   - **npm: preview** - Preview the production build
   - **npm: lint** - Run ESLint checks
   - **Prepare Assets** - Run the asset preparation script

Alternatively, press `Ctrl+Shift+B` to run the default build task (npm: dev).

### Using Terminal

1. Press `` Ctrl+` `` to open the integrated terminal
2. Run commands like `npm run dev` or `npm run build`

## Debugging

The project is configured with several debugging options:

### Debug in Chrome

1. Start the development server with `npm run dev`
2. Press F5 or go to the Run and Debug view (Ctrl+Shift+D)
3. Select "Launch Chrome against localhost" from the dropdown
4. The application will open in Chrome with debugging enabled

### Debug in Edge

1. Start the development server with `npm run dev`
2. Press F5 or go to the Run and Debug view (Ctrl+Shift+D)
3. Select "Launch Edge against localhost" from the dropdown
4. The application will open in Edge with debugging enabled

### Attach to Running Browser

If you already have the application running in Chrome:

1. Open Chrome with remote debugging enabled:
   - Windows: Right-click Chrome shortcut > Properties
   - Add `--remote-debugging-port=9222` to Target field
   - Example: `"C:\Program Files\Google\Chrome\Application\chrome.exe" --remote-debugging-port=9222`
2. In VS Code, select "Attach to Chrome" from the debug dropdown
3. Press F5 to attach to the running Chrome instance

### Debug Individual Node.js Files

To debug utility scripts or Node.js files:

1. Open the file you want to debug
2. Select "Debug Current File" from the debug dropdown
3. Press F5 to start debugging

## Editor Features

The VS Code setup includes several productivity enhancements:

### Code Formatting

- Files are automatically formatted on save using Prettier
- ESLint errors are automatically fixed on save when possible

### IntelliSense

- Path intellisense is configured to recognize the `@` alias (maps to `/src`)
- Emmet support is enabled for JSX files

### File Organization

- Related files are nested in the Explorer view (e.g., `.jsx` and `.css`)
- Folders are not compacted in the Explorer view

## Git Integration

- GitLens (if installed) provides enhanced Git capabilities
- The Source Control view (Ctrl+Shift+G) shows changes and commit history

## Customization

You can customize these settings by editing the files in the `.vscode` directory:

- `launch.json` - Debugging configurations
- `tasks.json` - Task definitions
- `settings.json` - Editor settings
- `extensions.json` - Recommended extensions

## Keyboard Shortcuts

Some useful keyboard shortcuts for this project:

- `Ctrl+Shift+B` - Run the default build task (start dev server)
- `F5` - Start debugging
- `Ctrl+Shift+D` - Open the Debug view
- `Ctrl+Shift+E` - Open the Explorer view
- `Ctrl+Shift+G` - Open the Source Control view
- `Ctrl+Shift+X` - Open the Extensions view
- `Ctrl+Shift+P` - Open the Command Palette
- `Alt+C` - Show/hide the application's Configuration Panel