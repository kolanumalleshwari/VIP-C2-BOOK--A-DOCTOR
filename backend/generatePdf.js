import puppeteer from 'puppeteer-core';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const run = async () => {
  console.log('Launching Puppeteer-core with Google Chrome...');
  const browser = await puppeteer.launch({
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-gpu'],
  });

  try {
    const page = await browser.newPage();
    const htmlPath = path.join(__dirname, '..', 'documentation.html');
    const fileUrl = `file://${htmlPath.replace(/\\/g, '/')}`;
    
    console.log(`Loading HTML source: ${fileUrl}`);
    await page.goto(fileUrl, { waitUntil: 'networkidle0' });
    
    const targetPdfPath = 'C:\\Users\\Kolan\\OneDrive\\Documents\\MedConnect_FSD_Documentation.pdf';
    console.log(`Printing PDF to: ${targetPdfPath}`);
    
    await page.pdf({
      path: targetPdfPath,
      format: 'A4',
      printBackground: true,
      margin: {
        top: '20mm',
        bottom: '20mm',
        left: '15mm',
        right: '15mm',
      },
    });
    
    console.log('PDF Document compiled successfully!');
  } catch (error) {
    console.error('Error compiling PDF:', error.message);
  } finally {
    await browser.close();
    console.log('Chrome process closed.');
  }
};

run();
