const puppeteer = require("puppeteer");

/**
 * Generates a PDF buffer from HTML content.
 * @param {string} htmlContent - The full HTML string to render.
 * @returns {Promise<Buffer>} - The PDF file buffer.
 */
async function generatePDF(htmlContent) {
    let browser;
    try {
        browser = await puppeteer.launch({
            headless: "new",
            args: ["--no-sandbox", "--disable-setuid-sandbox"],
        });

        const page = await browser.newPage();

        // Set the content
        await page.setContent(htmlContent, {
            waitUntil: "networkidle0", // Wait for all assets to load
        });

        // Generate PDF
        const pdfBuffer = await page.pdf({
            format: "A4",
            printBackground: true,
            margin: {
                top: "20mm",
                right: "20mm",
                bottom: "20mm",
                left: "20mm",
            },
        });

        return pdfBuffer;
    } catch (error) {
        console.error("Puppeteer PDF generation error:", error);
        throw new Error("PDF generation failed.");
    } finally {
        if (browser) {
            await browser.close();
        }
    }
}

module.exports = { generatePDF };
