# Application Icons

This directory should contain the application icons in the following formats:

## Required Icons

### Windows

- `icon.ico` - Windows application icon (256x256 or multiple sizes)

### macOS

- `icon.icns` - macOS application icon (512x512@2x recommended)

### Linux

- `icon.png` - Linux application icon (512x512 recommended)

## Icon Generation

You can use online tools or command-line utilities to generate these icons from a source image:

### Online Tools

- [iConvert Icons](https://iconverticons.com/online/)
- [ICO Convert](https://icoconvert.com/)
- [CloudConvert](https://cloudconvert.com/)

### Command Line Tools

#### Using ImageMagick (for .ico and .png)

```bash
# Install ImageMagick
# Windows: choco install imagemagick
# macOS: brew install imagemagick
# Linux: sudo apt-get install imagemagick

# Generate .ico file
magick convert source.png -define icon:auto-resize=256,128,64,48,32,16 icon.ico

# Generate .png file (512x512)
magick convert source.png -resize 512x512 icon.png
```

#### Using png2icns (for .icns on macOS)

```bash
# Install png2icns
brew install libicns

# Generate .icns file
png2icns icon.icns source.png
```

## Placeholder Icon

Until you have your custom icons, you can:

1. Use a free icon from [Flaticon](https://www.flaticon.com/) or [Icons8](https://icons8.com/)
2. Create a simple icon using tools like [Figma](https://www.figma.com/) or [Canva](https://www.canva.com/)
3. Use the electron-builder default icon (not recommended for production)

## Best Practices

- Use a square image as source (1024x1024 recommended)
- Keep the design simple and recognizable at small sizes
- Use transparency for non-rectangular shapes
- Test the icon at different sizes
- Ensure good contrast for both light and dark backgrounds
