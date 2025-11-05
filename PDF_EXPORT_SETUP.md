# PDF Export Feature - Setup Instructions

## Overview
The PDF export feature has been fully implemented. This document provides instructions for completing the setup.

## Database Migration

The Prisma schema has been updated to include PDF caching fields. To apply these changes to your database, run:

```bash
cd backend
pnpm run db:generate  # Already completed
pnpm run db:migrate   # Run this when database is available
```

The migration adds three new fields to the `ideas` table:
- `pdf_path` - Stores the file path of the cached PDF
- `pdf_generated_at` - Timestamp of PDF generation
- `pdf_version` - Version number for cache invalidation

## How It Works

### Backend
1. **Route**: `GET /api/v1/ideas/:id/export/pdf`
2. **Caching Logic**: 
   - Checks if cached PDF exists and is up-to-date
   - Regenerates PDF if idea or analyses have been updated
   - Stores PDFs in `backend/exports/pdf/{userId}/{ideaId}.pdf`
3. **PDF Generation**: Uses Puppeteer to render HTML template to PDF
4. **Security**: Validates ownership before generating/serving PDFs

### Frontend
1. **Button**: "Export as PDF" button appears on idea detail page when status is "completed"
2. **Download**: Automatically triggers browser download with sanitized filename
3. **Loading State**: Shows loading spinner during PDF generation

## File Structure

```
backend/
├── exports/pdf/           # PDF cache directory (auto-created, gitignored)
├── src/
│   ├── services/
│   │   └── pdfService.ts # PDF generation & caching logic
│   ├── controllers/
│   │   └── ideaController.ts # Added exportPdf method
│   └── routes/v1/
│       └── ideaRoutes.ts # Added PDF export route

frontend/
├── src/
│   ├── services/
│   │   └── ideaService.ts # Added exportIdeaToPdf method
│   └── pages/app/
│       └── IdeaDetail.tsx # Added export button & handler
```

## Testing

1. Create an idea and complete its analysis
2. Navigate to the idea detail page
3. Click "Export as PDF" button
4. PDF should download with all analysis sections
5. Click "Export as PDF" again - should use cached version (faster)
6. Edit the idea or regenerate analysis
7. Click "Export as PDF" - should regenerate with new data

## Dependencies

- **puppeteer** (v24.29.0): Headless browser for PDF generation
- Automatically installed with `pnpm install`

## Configuration

The PDF export feature works out of the box with default settings:
- PDF format: A4
- Margins: 2cm on all sides
- Storage: Local file system
- Cache invalidation: Automatic based on content updates

## Production Considerations

For production deployment:
1. **Storage**: Consider migrating to cloud storage (S3, Google Cloud Storage) for multi-server deployments
2. **Cleanup**: Implement a job to clean up old PDFs (optional)
3. **Puppeteer**: May need to install additional dependencies in Docker/Linux environments
4. **Rate Limiting**: Consider adding rate limiting to prevent abuse

## Puppeteer in Docker

If running in Docker, you may need to add these packages to your Dockerfile:

```dockerfile
RUN apt-get update && apt-get install -y \
    chromium \
    libgbm1 \
    libnss3 \
    libatk-bridge2.0-0 \
    libdrm2 \
    libxkbcommon0 \
    libxcomposite1 \
    libxdamage1 \
    libxfixes3 \
    libxrandr2 \
    libgtk-3-0 \
    libasound2
```

## Troubleshooting

**Issue**: PDF generation is slow on first request
- **Solution**: This is normal - Puppeteer launches a headless browser. Subsequent requests use cached PDFs.

**Issue**: "Failed to launch chrome" error
- **Solution**: Install Chrome dependencies (see Docker section above)

**Issue**: PDF doesn't match web UI exactly
- **Solution**: The PDF HTML template can be customized in `pdfService.ts` (search for `generatePdfHtml` function)

**Issue**: Cached PDF not invalidating
- **Solution**: Check `shouldRegeneratePdf` logic in `pdfService.ts`
