/**
 * QR Code Initialization Utility
 * Handles QR code generation for scan page
 */

/**
 * Initialize QR code on scan page
 * Waits for DOM element to exist before generating
 */
export async function initScanPageQRCode() {
  // Wait for DOM to be ready and element to exist
  const maxRetries = 10;
  let retries = 0;

  const tryInit = async () => {
    const qrContainer = document.getElementById('qr-code-display');

    if (qrContainer) {
      // Clear any existing content
      qrContainer.innerHTML = '';

      // Import and generate QR code
      const { generateQRCode } = await import('/src/components/qr-code/qr-code.js');
      const currentUrl = window.location.origin + '/checkin';

      try {
        await generateQRCode(qrContainer, currentUrl, { size: 256 });

        // Setup download and print functions
        window.downloadQR = async function () {
          const canvas = document.querySelector('#qr-code-display canvas');
          if (canvas) {
            const { downloadQRCode } = await import('/src/components/qr-code/qr-code.js');
            downloadQRCode(canvas, 'lg-qams-qrcode.png');
          }
        };

        window.printQR = async function () {
          const canvas = document.querySelector('#qr-code-display canvas');
          if (canvas) {
            const { printQRCode } = await import('/src/components/qr-code/qr-code.js');
            printQRCode(canvas);
          }
        };
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error('Error generating QR code:', error);
      }
    } else if (retries < maxRetries) {
      // Element not found yet, retry after a short delay
      retries++;
      setTimeout(tryInit, 50);
    }
  };

  // Start initialization
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', tryInit);
  } else {
    // DOM already loaded, try immediately
    tryInit();
  }
}
