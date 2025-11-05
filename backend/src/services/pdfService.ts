import puppeteer from "puppeteer";
import { promises as fs } from "fs";
import path from "path";
import { prisma } from "../db";
import { AppError } from "../middleware/errorHandler";
import {
  EducationContent,
  SwotContent,
  FeaturesContent,
  BusinessValuesContent,
  PmfContent,
  NextStepsContent,
  ViabilityContent,
} from "../ai/schemas";

interface Analysis {
  id: string;
  ideaId: string;
  sectionType: string;
  content: any;
  createdAt: Date;
}

interface Idea {
  id: string;
  userId: string;
  title: string;
  description: string;
  status: string;
  pdfPath: string | null;
  pdfGeneratedAt: Date | null;
  pdfVersion: number;
  createdAt: Date;
  updatedAt: Date;
}

const EXPORTS_DIR = path.join(process.cwd(), "exports", "pdf");

// Ensure exports directory exists
async function ensureExportsDir(userId: string): Promise<string> {
  const userDir = path.join(EXPORTS_DIR, userId);
  await fs.mkdir(userDir, { recursive: true });
  return userDir;
}

// Check if file exists
async function fileExists(filePath: string): Promise<boolean> {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}

// Determine if PDF needs to be regenerated
async function shouldRegeneratePdf(idea: Idea, analyses: Analysis[]): Promise<boolean> {
  // No PDF exists
  if (!idea.pdfPath || !idea.pdfGeneratedAt) {
    return true;
  }

  // Check if idea was updated after PDF generation
  if (idea.updatedAt > idea.pdfGeneratedAt) {
    return true;
  }

  // Check if any analysis was created after PDF generation
  const latestAnalysisDate = analyses.reduce((latest, analysis) => {
    return analysis.createdAt > latest ? analysis.createdAt : latest;
  }, new Date(0));

  if (latestAnalysisDate > idea.pdfGeneratedAt) {
    return true;
  }

  // Check if PDF file still exists
  const exists = await fileExists(idea.pdfPath);
  if (!exists) {
    return true;
  }

  return false; // Use cached version
}

// Generate HTML content for PDF
function generatePdfHtml(idea: Idea, analyses: Analysis[]): string {
  const analysesByType = new Map<string, any>();
  analyses.forEach((analysis) => {
    analysesByType.set(analysis.sectionType, analysis.content);
  });

  const education = analysesByType.get("education") as EducationContent | undefined;
  const swot = analysesByType.get("swot") as SwotContent | undefined;
  const features = analysesByType.get("features") as FeaturesContent | undefined;
  const businessValues = analysesByType.get("business_values") as BusinessValuesContent | undefined;
  const pmf = analysesByType.get("pmf") as PmfContent | undefined;
  const nextSteps = analysesByType.get("next_steps") as NextStepsContent | undefined;
  const viability = analysesByType.get("viability") as ViabilityContent | undefined;

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${idea.title} - Analysis Report</title>
  <style>
    @page {
      size: A4;
      margin: 2cm;
    }

    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }

    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', sans-serif;
      font-size: 11pt;
      line-height: 1.6;
      color: #1f2937;
      background: white;
    }

    .header {
      margin-bottom: 2em;
      border-bottom: 3px solid #3b82f6;
      padding-bottom: 1em;
    }

    .header h1 {
      font-size: 28pt;
      color: #1f2937;
      margin-bottom: 0.3em;
      font-weight: 700;
    }

    .header .meta {
      display: flex;
      justify-content: space-between;
      align-items: center;
      color: #6b7280;
      font-size: 10pt;
    }

    .badge {
      display: inline-block;
      padding: 0.3em 0.8em;
      border-radius: 4px;
      font-weight: 600;
      font-size: 9pt;
      text-transform: capitalize;
      background-color: #dcfce7;
      color: #166534;
    }

    .description {
      background: #f9fafb;
      padding: 1.2em;
      border-radius: 8px;
      margin-bottom: 2em;
      font-size: 11pt;
      line-height: 1.7;
      border-left: 4px solid #3b82f6;
    }

    .section {
      margin-bottom: 2em;
      page-break-inside: avoid;
    }

    .section-header {
      display: flex;
      align-items: center;
      gap: 0.5em;
      margin-bottom: 0.8em;
      padding-bottom: 0.5em;
      border-bottom: 2px solid #e5e7eb;
    }

    .section-header h2 {
      font-size: 18pt;
      color: #1f2937;
      font-weight: 600;
    }

    .section-description {
      color: #6b7280;
      font-size: 10pt;
      margin-bottom: 1em;
    }

    .subsection {
      margin-bottom: 1.5em;
    }

    .subsection h3 {
      font-size: 13pt;
      color: #1f2937;
      margin-bottom: 0.6em;
      font-weight: 600;
    }

    .subsection h4 {
      font-size: 11pt;
      color: #374151;
      margin-bottom: 0.5em;
      font-weight: 600;
    }

    ul, ol {
      margin-left: 1.5em;
      margin-bottom: 1em;
    }

    li {
      margin-bottom: 0.4em;
      color: #4b5563;
    }

    .grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 1.5em;
      margin-bottom: 1.5em;
    }

    .card {
      background: #f9fafb;
      padding: 1em;
      border-radius: 6px;
      border: 1px solid #e5e7eb;
    }

    .card h4 {
      color: #1f2937;
      margin-bottom: 0.5em;
      font-size: 11pt;
      font-weight: 600;
    }

    .card p {
      color: #6b7280;
      font-size: 10pt;
      line-height: 1.6;
      margin-bottom: 0.4em;
    }

    .card strong {
      color: #374151;
    }

    .swot-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 1em;
      margin-bottom: 1em;
    }

    .swot-box {
      padding: 1em;
      border-radius: 6px;
      page-break-inside: avoid;
    }

    .swot-box h4 {
      margin-bottom: 0.6em;
      font-size: 12pt;
      font-weight: 600;
    }

    .swot-box.strengths {
      background: #dcfce7;
      border-left: 4px solid #16a34a;
    }

    .swot-box.weaknesses {
      background: #fef3c7;
      border-left: 4px solid #f59e0b;
    }

    .swot-box.opportunities {
      background: #dbeafe;
      border-left: 4px solid #3b82f6;
    }

    .swot-box.threats {
      background: #fee2e2;
      border-left: 4px solid #ef4444;
    }

    .keywords {
      display: flex;
      flex-wrap: wrap;
      gap: 0.5em;
      margin-bottom: 1em;
    }

    .keyword {
      background: #dbeafe;
      color: #1e40af;
      padding: 0.3em 0.7em;
      border-radius: 4px;
      font-size: 9pt;
      font-weight: 500;
    }

    .table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 1.5em;
      font-size: 10pt;
    }

    .table th {
      background: #f3f4f6;
      padding: 0.6em;
      text-align: left;
      font-weight: 600;
      border-bottom: 2px solid #d1d5db;
    }

    .table td {
      padding: 0.6em;
      border-bottom: 1px solid #e5e7eb;
    }

    .table tr:last-child td {
      border-bottom: none;
    }

    .check {
      color: #16a34a;
      font-weight: bold;
    }

    .cross {
      color: #ef4444;
      font-weight: bold;
    }

    .step-number {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 2em;
      height: 2em;
      background: #3b82f6;
      color: white;
      border-radius: 50%;
      font-weight: bold;
      font-size: 11pt;
      margin-right: 0.8em;
      flex-shrink: 0;
    }

    .step-item {
      display: flex;
      align-items: flex-start;
      margin-bottom: 1.2em;
      page-break-inside: avoid;
    }

    .step-content h4 {
      color: #1f2937;
      margin-bottom: 0.3em;
      font-size: 11pt;
    }

    .step-content p {
      color: #6b7280;
      font-size: 10pt;
      margin-bottom: 0.3em;
    }

    .step-content .time {
      color: #9ca3af;
      font-size: 9pt;
      font-style: italic;
    }

    .viability-score {
      text-align: center;
      padding: 1.5em;
      background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
      color: white;
      border-radius: 8px;
      margin-bottom: 1.5em;
    }

    .viability-score .score {
      font-size: 48pt;
      font-weight: bold;
      line-height: 1;
    }

    .viability-score .label {
      font-size: 12pt;
      opacity: 0.9;
      margin-top: 0.3em;
    }

    .factor-item {
      margin-bottom: 1em;
      padding: 0.8em;
      background: #f9fafb;
      border-radius: 6px;
      border-left: 4px solid #3b82f6;
    }

    .factor-item h4 {
      color: #1f2937;
      margin-bottom: 0.3em;
      font-size: 11pt;
    }

    .factor-item .score {
      display: inline-block;
      background: #3b82f6;
      color: white;
      padding: 0.2em 0.6em;
      border-radius: 4px;
      font-weight: 600;
      font-size: 10pt;
      margin-bottom: 0.4em;
    }

    .factor-item p {
      color: #6b7280;
      font-size: 10pt;
      line-height: 1.6;
    }

    .footer {
      margin-top: 3em;
      padding-top: 1em;
      border-top: 2px solid #e5e7eb;
      text-align: center;
      color: #9ca3af;
      font-size: 9pt;
    }

    .strategy-badge {
      display: inline-block;
      padding: 0.2em 0.6em;
      border-radius: 4px;
      font-size: 9pt;
      font-weight: 600;
      margin-right: 0.5em;
    }

    .badge-low {
      background: #dcfce7;
      color: #166534;
    }

    .badge-medium {
      background: #fef3c7;
      color: #92400e;
    }

    .badge-high {
      background: #fee2e2;
      color: #991b1b;
    }

    .badge-info {
      background: #dbeafe;
      color: #1e40af;
    }
  </style>
</head>
<body>
  <div class="header">
    <h1>${idea.title}</h1>
    <div class="meta">
      <span>Created: ${new Date(idea.createdAt).toLocaleDateString()}</span>
      <span class="badge">${idea.status}</span>
    </div>
  </div>

  <div class="description">
    <p>${idea.description}</p>
  </div>

  ${
    education
      ? `
  <div class="section">
    <div class="section-header">
      <h2>Market Education</h2>
    </div>
    <p class="section-description">Understanding the industry landscape and key concepts</p>
    
    <div class="subsection">
      <h4>Industry Keywords</h4>
      <div class="keywords">
        ${education.keywords.map((kw) => `<span class="keyword">${kw}</span>`).join("")}
      </div>
    </div>

    <div class="subsection">
      <h4>Industry Overview</h4>
      <p>${education.industryOverview}</p>
    </div>

    <div class="subsection">
      <h4>Key Terminology</h4>
      <ul>
        ${Object.entries(education.terminology)
          .map(([term, def]) => `<li><strong>${term}:</strong> ${def}</li>`)
          .join("")}
      </ul>
    </div>
  </div>
  `
      : ""
  }

  ${
    swot
      ? `
  <div class="section">
    <div class="section-header">
      <h2>SWOT Analysis</h2>
    </div>
    <p class="section-description">Comprehensive analysis of internal and external factors</p>
    
    <div class="swot-grid">
      <div class="swot-box strengths">
        <h4>Strengths</h4>
        <ul>
          ${swot.strengths.map((s) => `<li>${s}</li>`).join("")}
        </ul>
      </div>

      <div class="swot-box weaknesses">
        <h4>Weaknesses</h4>
        <ul>
          ${swot.weaknesses.map((w) => `<li>${w}</li>`).join("")}
        </ul>
      </div>

      <div class="swot-box opportunities">
        <h4>Opportunities</h4>
        <ul>
          ${swot.opportunities.map((o) => `<li>${o}</li>`).join("")}
        </ul>
      </div>

      <div class="swot-box threats">
        <h4>Threats</h4>
        <ul>
          ${swot.threats.map((t) => `<li>${t}</li>`).join("")}
        </ul>
      </div>
    </div>

    ${
      swot.personalizedInsights
        ? `
    <div class="card">
      <h4>Personalized Insights</h4>
      <p>${swot.personalizedInsights}</p>
    </div>
    `
        : ""
    }
  </div>
  `
      : ""
  }

  ${
    features
      ? `
  <div class="section">
    <div class="section-header">
      <h2>Core Features & Competitive Analysis</h2>
    </div>
    <p class="section-description">Recommended features and competitive landscape</p>
    
    <div class="subsection">
      <h4>Recommended Features</h4>
      <ul>
        ${features.features.map((f) => `<li>${f}</li>`).join("")}
      </ul>
    </div>

    <div class="subsection">
      <h4>Competitive Analysis</h4>
      <table class="table">
        <thead>
          <tr>
            <th>Competitor</th>
            ${features.features.map((f) => `<th>${f}</th>`).join("")}
          </tr>
        </thead>
        <tbody>
          ${features.competitiveAnalysis
            .map(
              (comp) => `
            <tr>
              <td><strong>${comp.competitor}</strong><br/><span style="font-size: 9pt; color: #6b7280;">${comp.url}</span></td>
              ${features.features
                .map((f) => `<td>${comp.features[f] ? '<span class="check">✓</span>' : '<span class="cross">✗</span>'}</td>`)
                .join("")}
            </tr>
          `
            )
            .join("")}
        </tbody>
      </table>
    </div>
  </div>
  `
      : ""
  }

  ${
    businessValues
      ? `
  <div class="section">
    <div class="section-header">
      <h2>Business Values</h2>
    </div>
    <p class="section-description">Core differentiators and business strategy</p>
    
    <div class="grid">
      <div class="subsection">
        <h4>Product Differentiators (Moats)</h4>
        <ul>
          ${businessValues.moats.map((m) => `<li>${m}</li>`).join("")}
        </ul>
      </div>

      <div class="subsection">
        <h4>Target Market</h4>
        <p><strong>Size:</strong> ${businessValues.targetMarket.size}</p>
        <p><strong>Segments:</strong> ${businessValues.targetMarket.segments.join(", ")}</p>
        <p>${businessValues.targetMarket.description}</p>
      </div>

      <div class="subsection">
        <h4>Pricing Strategies</h4>
        ${businessValues.pricingStrategies
          .map(
            (ps) => `
          <div class="card">
            <h4>${ps.model}</h4>
            <p>${ps.rationale}</p>
          </div>
        `
          )
          .join("")}
      </div>

      <div class="subsection">
        <h4>Timeline to Market</h4>
        <p>${businessValues.timelineToMarket}</p>
      </div>
    </div>
  </div>
  `
      : ""
  }

  ${
    pmf
      ? `
  <div class="section">
    <div class="section-header">
      <h2>Product-Market Fit Strategies</h2>
    </div>
    <p class="section-description">Quick validation approaches</p>
    
    ${pmf.strategies
      .map(
        (strategy) => `
      <div class="card" style="margin-bottom: 1em;">
        <h4>${strategy.title}</h4>
        <div style="margin-bottom: 0.5em;">
          <span class="strategy-badge badge-${strategy.effort}">${strategy.effort} effort</span>
          <span class="strategy-badge badge-info">${strategy.timeline}</span>
        </div>
        <p>${strategy.description}</p>
      </div>
    `
      )
      .join("")}
  </div>
  `
      : ""
  }

  ${
    nextSteps
      ? `
  <div class="section">
    <div class="section-header">
      <h2>Next Steps</h2>
    </div>
    <p class="section-description">Recommended actions to get started</p>
    
    ${nextSteps.steps
      .sort((a, b) => a.priority - b.priority)
      .map(
        (step) => `
      <div class="step-item">
        <div class="step-number">${step.priority}</div>
        <div class="step-content">
          <h4>${step.title}</h4>
          <p>${step.description}</p>
          <p class="time">Estimated time: ${step.estimatedTime}</p>
        </div>
      </div>
    `
      )
      .join("")}
  </div>
  `
      : ""
  }

  ${
    viability
      ? `
  <div class="section">
    <div class="section-header">
      <h2>Viability Assessment</h2>
    </div>
    <p class="section-description">Overall viability evaluation</p>
    
    <div class="viability-score">
      <div class="score">${viability.score}</div>
      <div class="label">Viability Score</div>
    </div>

    <div class="subsection">
      <h4>Factor Breakdown</h4>
      ${viability.factors
        .map(
          (factor) => `
        <div class="factor-item">
          <h4>${factor.category}</h4>
          <span class="score">${factor.score}/100</span>
          <p>${factor.reasoning}</p>
        </div>
      `
        )
        .join("")}
    </div>

    <div class="card">
      <h4>Overall Assessment</h4>
      <p>${viability.overallAssessment}</p>
    </div>
  </div>
  `
      : ""
  }

  <div class="footer">
    <p>Generated by Ideator • ${new Date().toLocaleString()} • This is an AI-generated analysis</p>
  </div>
</body>
</html>
  `;
}

// Generate PDF for an idea
export async function generatePdfForIdea(ideaId: string, userId: string): Promise<Buffer> {
  // Get idea with ownership verification
  const idea = await prisma.idea.findFirst({
    where: {
      id: ideaId,
      userId,
    },
  });

  if (!idea) {
    throw new AppError(404, "Idea not found");
  }

  // Only allow PDF generation for completed analyses
  if (idea.status !== "completed") {
    throw new AppError(400, "Analysis must be completed before generating PDF");
  }

  // Get all analyses
  const analyses = await prisma.analysis.findMany({
    where: { ideaId },
    orderBy: { createdAt: "asc" },
  });

  if (analyses.length === 0) {
    throw new AppError(400, "No analyses found for this idea");
  }

  // Check if we should use cached PDF
  const shouldRegenerate = await shouldRegeneratePdf(idea, analyses);

  if (!shouldRegenerate && idea.pdfPath) {
    // Return cached PDF
    const pdfBuffer = await fs.readFile(idea.pdfPath);
    return pdfBuffer;
  }

  // Generate new PDF
  let browser;
  try {
    // Launch puppeteer
    browser = await puppeteer.launch({
      headless: true,
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    });

    const page = await browser.newPage();

    // Generate HTML
    const html = generatePdfHtml(idea, analyses);

    // Set content and generate PDF
    await page.setContent(html, { waitUntil: "networkidle0" });

    const pdfBuffer = await page.pdf({
      format: "A4",
      printBackground: true,
      margin: {
        top: "2cm",
        right: "2cm",
        bottom: "2cm",
        left: "2cm",
      },
    });

    // Save PDF to file system
    const userDir = await ensureExportsDir(userId);
    const pdfPath = path.join(userDir, `${ideaId}.pdf`);
    await fs.writeFile(pdfPath, pdfBuffer);

    // Update idea with PDF metadata
    await prisma.idea.update({
      where: { id: ideaId },
      data: {
        pdfPath,
        pdfGeneratedAt: new Date(),
        pdfVersion: idea.pdfVersion + 1,
      },
    });

    return pdfBuffer;
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}

// Get cached PDF path if exists
export async function getCachedPdfPath(ideaId: string, userId: string): Promise<string | null> {
  const idea = await prisma.idea.findFirst({
    where: {
      id: ideaId,
      userId,
    },
  });

  if (!idea || !idea.pdfPath) {
    return null;
  }

  const exists = await fileExists(idea.pdfPath);
  return exists ? idea.pdfPath : null;
}
