/**
 * QR Code component
 */

import QRCode from 'qrcode';

/**
 * Generate and display QR code
 * @param {HTMLElement} container - Container element for QR code
 * @param {string} url - URL to encode in QR code
 * @param {Object} options - QR code options
 */
export async function generateQRCode(container, url, options = {}) {
  const { size = 256, margin = 2, colorDark = '#000000', colorLight = '#ffffff' } = options;

  try {
    // Create canvas element
    const canvas = document.createElement('canvas');
    container.innerHTML = ''; // Clear container
    container.appendChild(canvas);

    // Generate QR code
    await QRCode.toCanvas(canvas, url, {
      width: size,
      margin: margin,
      color: {
        dark: colorDark,
        light: colorLight,
      },
    });

    return canvas;
  } catch (error) {
    console.error('Error generating QR code:', error);
    container.innerHTML = '<p class="text-danger">Failed to generate QR code</p>';
    throw error;
  }
}

/**
 * Download QR code as image
 * @param {HTMLCanvasElement} canvas - Canvas element with QR code
 * @param {string} filename - Filename for download
 */
export function downloadQRCode(canvas, filename = 'qrcode.png') {
  const link = document.createElement('a');
  link.download = filename;
  link.href = canvas.toDataURL();
  link.click();
}

/**
 * Print QR code
 * @param {HTMLCanvasElement} canvas - Canvas element with QR code
 */
export function printQRCode(canvas) {
  const printWindow = window.open('', '_blank');
  printWindow.document.write(`
    <html>
      <head><title>QR Code</title></head>
      <body style="text-align:center; padding:20px;">
        <h2>LG QAMS QR Code</h2>
        <img src="${canvas.toDataURL()}" style="max-width:100%;" />
        <p>Scan this QR code to check in/out</p>
      </body>
    </html>
  `);
  printWindow.document.close();
  printWindow.print();
}
