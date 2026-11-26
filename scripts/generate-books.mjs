import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import * as pdfjs from 'pdfjs-dist/legacy/build/pdf.mjs';
import { createCanvas } from '@napi-rs/canvas';
import { PDFDocument } from 'pdf-lib';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');
const workspaceRoot = path.resolve(projectRoot, '..');

const booksDir = path.join(projectRoot, 'public', 'books');
const coversDir = path.join(booksDir, 'covers');
const dataDir = path.join(projectRoot, 'src', 'data');
const rootDataDir = path.join(workspaceRoot, 'src', 'data');

// Ensure directories exist
fs.mkdirSync(coversDir, { recursive: true });
fs.mkdirSync(dataDir, { recursive: true });
fs.mkdirSync(rootDataDir, { recursive: true });

// Catalog of the 12 books with metadata
const CATALOG = [
  {
    id: 'atomic-habits',
    filename: 'Atomic habits ( PDFDrive ).pdf',
    title: 'Atomic Habits',
    author: 'James Clear',
    category: 'Productivity & Habits',
    year: 2018,
    spineColor: '#E65C00',
    spineAccent: '#FFD700',
    description: 'An easy and proven way to build good habits and break bad ones. Learn the 4 laws of behavior change showing how tiny 1% daily improvements compound into life-changing results.',
  },
  {
    id: 'mindset-psychology-of-success',
    filename: '20231124092918-Mindset_The_New_Psychology_of_Success.pdf',
    title: 'Mindset: The New Psychology of Success',
    author: 'Carol S. Dweck, Ph.D.',
    category: 'Psychology & Growth',
    year: 2006,
    spineColor: '#1F3FB0',
    spineAccent: '#60A5FA',
    description: 'The world-renowned Stanford psychologist reveals how our belief about our capabilities—the fixed vs. growth mindset—determines personal fulfillment, resilience, and achievement.',
  },
  {
    id: '7-habits-highly-effective-people',
    filename: 'Covey - The 7 habits of highly effective people.pdf',
    title: 'The 7 Habits of Highly Effective People',
    author: 'Stephen R. Covey',
    category: 'Leadership & Success',
    year: 1989,
    spineColor: '#0F766E',
    spineAccent: '#2DD4BF',
    description: 'A holistic, principle-centered architecture for solving personal and professional dilemmas, cultivating proactive character, synergy, and timeless effectiveness.',
  },
  {
    id: 'the-80-20-rule',
    filename: 'the-80-20-rule-personal-excellence-ebook.pdf',
    title: 'The 80/20 Rule: Pareto Principle',
    author: 'Celestine Chua',
    category: 'Focus & Efficiency',
    year: 2013,
    spineColor: '#7C2D12',
    spineAccent: '#FB923C',
    description: 'Pinpoint the vital 20% of your inputs that create 80% of your outcomes. Strip away unnecessary friction and amplify your daily productivity and peace of mind.',
  },
  {
    id: '101-questions-to-ask-yourself',
    filename: '101-questions-to-ask-yourself-personal-excellence-ebook.pdf',
    title: '101 Questions to Ask Yourself',
    author: 'Celestine Chua',
    category: 'Personal Development',
    year: 2012,
    spineColor: '#4338CA',
    spineAccent: '#A5B4FC',
    description: 'An introspective self-coaching compilation of 101 profound inquiries crafted to illuminate blind spots, clarify values, and steer intentional life direction.',
  },
  {
    id: '101-ways-to-be-a-better-person',
    filename: '101-ways-to-be-a-better-person-personal-excellence-ebook.pdf',
    title: '101 Ways to Be a Better Person',
    author: 'Celestine Chua',
    category: 'Self Improvement',
    year: 2011,
    spineColor: '#047857',
    spineAccent: '#6EE7B7',
    description: 'Practical, heartwarming, and deeply ethical actions to enrich your character, radiate kindness, strengthen social integrity, and live honorably.',
  },
  {
    id: '101-ways-to-live-your-best-life',
    filename: '101-ways-to-live-your-best-life-personal-excellence-ebook.pdf',
    title: '101 Ways to Live Your Best Life',
    author: 'Celestine Chua',
    category: 'Life Mastery',
    year: 2011,
    spineColor: '#BE185D',
    spineAccent: '#F472B6',
    description: 'A vibrant handbook packed with 101 actionable principles to overcome complacency, maximize energy, cultivate joy, and awaken your fullest potential.',
  },
  {
    id: 'how-to-deal-with-disappointment',
    filename: 'how-to-deal-with-disappointment-personal-excellence-ebook.pdf',
    title: 'How to Deal with Disappointment',
    author: 'Celestine Chua',
    category: 'Emotional Resilience',
    year: 2014,
    spineColor: '#374151',
    spineAccent: '#9CA3AF',
    description: 'A compassionate step-by-step framework to process disappointment, overcome frustration, recalibrate expectations, and emerge stronger after setbacks.',
  },
  {
    id: 'how-to-find-your-life-purpose',
    filename: 'how-to-find-your-life-purpose-personal-excellence-ebook.pdf',
    title: 'How to Find Your Life Purpose',
    author: 'Celestine Chua',
    category: 'Purpose & Vision',
    year: 2013,
    spineColor: '#1E3A8A',
    spineAccent: '#93C5FD',
    description: 'A comprehensive guide to discovering your life mission, aligning career aspirations with genuine passions, and creating enduring personal meaning.',
  },
  {
    id: 'how-to-make-true-friends',
    filename: 'how-to-make-true-friends-personal-excellence-ebook.pdf',
    title: 'How to Make True Friends',
    author: 'Celestine Chua',
    category: 'Relationships',
    year: 2013,
    spineColor: '#9D174D',
    spineAccent: '#FBCFE8',
    description: 'A thoughtful guide on nurturing authentic friendships, deepening emotional resonance, breaking through social loneliness, and keeping loyal bonds.',
  },
  {
    id: 'how-to-move-on-from-a-relationship',
    filename: 'how-to-move-on-from-a-relationship-personal-excellence-ebook.pdf',
    title: 'How to Move On from a Relationship',
    author: 'Celestine Chua',
    category: 'Healing & Closure',
    year: 2014,
    spineColor: '#831843',
    spineAccent: '#FDA4AF',
    description: 'Gentle, empowering wisdom to heal from heartbreak, release the emotional weight of past attachments, and courageously welcome a joyful new chapter.',
  },
  {
    id: 'how-to-overcome-perfectionism',
    filename: 'how-to-overcome-perfectionism-personal-excellence-ebook.pdf',
    title: 'How to Overcome Perfectionism',
    author: 'Celestine Chua',
    category: 'Mindset & Growth',
    year: 2012,
    spineColor: '#4C1D95',
    spineAccent: '#C4B5FD',
    description: 'Dismantle the paralyzing trap of perfectionism. Learn self-compassion, overcome procrastination rooted in fear, and embrace fulfilling excellence.',
  },
];

async function run() {
  console.log('--- Starting Book Data & Cover Generation ---');

  const booksResult = [];

  for (const item of CATALOG) {
    const srcPdf = path.join(workspaceRoot, item.filename);
    const destPdf = path.join(booksDir, item.filename);

    if (!fs.existsSync(srcPdf)) {
      console.warn(`[WARN] Source PDF not found: ${srcPdf}`);
      continue;
    }

    // 1. Copy PDF to public/books/
    fs.copyFileSync(srcPdf, destPdf);
    console.log(`Copied ${item.filename} -> public/books/`);

    const pdfBuffer = fs.readFileSync(destPdf);
    const pdfBytes = new Uint8Array(pdfBuffer);

    // 2. Count pages via pdf-lib
    let pageCount = null;
    try {
      const pdfDoc = await PDFDocument.load(pdfBytes, { ignoreEncryption: true });
      pageCount = pdfDoc.getPageCount();
    } catch (e) {
      console.warn(`[WARN] Page count error for ${item.id}:`, e.message);
    }

    // 3. Render 1st page cover to PNG
    const coverFilename = `${item.id}.png`;
    const coverPath = path.join(coversDir, coverFilename);
    const coverPublicUrl = `/books/covers/${coverFilename}`;

    try {
      const doc = await pdfjs.getDocument({ data: pdfBytes, useSystemFonts: true }).promise;
      const page = await doc.getPage(1);
      
      // Target around 600px width for crisp high-dpi covers
      const unscaledViewport = page.getViewport({ scale: 1.0 });
      const scale = Math.max(1.5, 600 / unscaledViewport.width);
      const viewport = page.getViewport({ scale });

      const canvas = createCanvas(viewport.width, viewport.height);
      const ctx = canvas.getContext('2d');
      await page.render({ canvasContext: ctx, viewport }).promise;

      const pngBuf = canvas.toBuffer('image/png');
      fs.writeFileSync(coverPath, pngBuf);
      console.log(`Rendered cover: ${coverPublicUrl} (${Math.round(viewport.width)}x${Math.round(viewport.height)}, ${Math.round(pngBuf.length / 1024)} KB)`);
    } catch (err) {
      console.error(`[ERROR] Rendering cover for ${item.id}:`, err);
    }

    const stat = fs.statSync(destPdf);

    booksResult.push({
      id: item.id,
      title: item.title,
      author: item.author,
      category: item.category,
      year: item.year,
      pages: pageCount,
      description: item.description,
      format: 'PDF',
      file_path: `/books/${encodeURIComponent(item.filename)}`,
      cover_url: coverPublicUrl,
      size_bytes: stat.size,
      access: 'free',
      tags: ['book', 'pdf', 'guide', 'ebook', item.category.toLowerCase()],
      spine: {
        color: item.spineColor,
        accent: item.spineAccent,
        label: 'PDF',
      },
      created_at: new Date(Date.now() - booksResult.length * 86400000).toISOString(),
    });
  }

  // 4. Save to src/data/books.json in both locations
  const jsonContent = JSON.stringify(booksResult, null, 2);
  const outPath1 = path.join(dataDir, 'books.json');
  const outPath2 = path.join(rootDataDir, 'books.json');
  fs.writeFileSync(outPath1, jsonContent, 'utf-8');
  fs.writeFileSync(outPath2, jsonContent, 'utf-8');

  console.log(`Successfully generated ${booksResult.length} books in:`);
  console.log(`  - ${outPath1}`);
  console.log(`  - ${outPath2}`);
}

run().catch((err) => {
  console.error('Fatal error during generation:', err);
  process.exit(1);
});
