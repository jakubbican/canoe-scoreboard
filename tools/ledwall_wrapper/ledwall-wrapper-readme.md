# LED Wall Wrapper

A simple, single-file HTML utility for displaying content on LED walls and other digital displays with specific resolution requirements.

## Overview

The LED Wall Wrapper is designed to solve a common problem when displaying web content on LED walls or digital signage: ensuring the exact pixel dimensions and positioning of content. This wrapper creates a clean, black background with an iframe positioned precisely at the top-left corner (0,0) that loads content from a specified URL.

## Features

- Single, self-contained HTML file
- Positions content iframe at exact coordinates (0,0)
- Configurable iframe dimensions via URL parameters
- Cache-busting mechanism to ensure fresh content
- Fallback default values for URL and dimensions
- Clean black background that won't interfere with LED wall displays

## Use Cases

- Digital scoreboard displays for sports events
- LED walls at concerts, conferences, and events
- Digital signage in public spaces
- Any display that requires precise pixel positioning and dimensions

## Usage

1. Download the `ledwall_wrapper.html` file to your web server or local machine.

2. Open the file in a browser with URL parameters to configure:

```
ledwall_wrapper.html?url=https://example.com/scoreboard&width=1920&height=1080
```

### URL Parameters

| Parameter | Description | Default |
|-----------|-------------|---------|
| `url` | The URL of the content to display | about:blank |
| `width` | Width of the iframe in pixels | 1280 |
| `height` | Height of the iframe in pixels | 720 |

## Example Scenarios

### Sports Scoreboard on a 1080p Display

```
ledwall_wrapper.html?url=https://scoreboard.example.com/live&width=1920&height=1080
```

### Vertical Digital Signage (Portrait Mode)

```
ledwall_wrapper.html?url=https://ads.example.com/vertical&width=1080&height=1920
```

### Unusual LED Wall Dimensions

```
ledwall_wrapper.html?url=https://custom.example.com/display&width=3840&height=648
```

## Technical Details

- The wrapper adds a cache-busting parameter to the content URL to prevent browsers from showing stale content
- No regular refresh is performed - content remains stable once loaded
- The iframe has no border and the page has no scrollbars
- The background is set to pure black (#000000) to ensure clean display on LED walls

## Customization

The HTML file is intentionally simple and can be modified if needed:

- Change the background color in the CSS if a different base color is required
- Modify the default values in the JavaScript section
- Add custom error handling or logging

## Troubleshooting

- **Content not displaying**: Check that the URL parameter is correctly formatted and the content source is accessible
- **Wrong dimensions**: Verify the width and height parameters match your display's requirements
- **Cross-origin issues**: Ensure the content source allows embedding in iframes (no X-Frame-Options restrictions)

## License

This tool is provided as-is for public use without warranty. Feel free to modify and distribute as needed.
