import { readFileSync, writeFileSync, readdirSync, mkdirSync, existsSync } from 'fs';
import { join, basename } from 'path';
import { marked } from 'marked';
import { createHighlighter } from 'shiki';

const POSTS_DIR = 'scripts/blog-posts';
const OUTPUT_DIR = 'blog';
const GA_ID = 'G-NGE2BEE96H';

// Initialize Shiki highlighter with dual themes
const highlighter = await createHighlighter({
  themes: ['github-light', 'github-dark'],
  langs: ['json', 'javascript', 'typescript', 'html', 'css', 'bash', 'shell', 'yaml', 'markdown', 'text'],
});

// Custom marked renderer that uses Shiki for code blocks
const renderer = new marked.Renderer();
renderer.code = function ({ text, lang }) {
  const language = lang || 'text';
  try {
    return highlighter.codeToHtml(text, {
      lang: language,
      themes: { light: 'github-light', dark: 'github-dark' },
    });
  } catch (e) {
    // Fallback for unsupported languages
    return highlighter.codeToHtml(text, {
      lang: 'text',
      themes: { light: 'github-light', dark: 'github-dark' },
    });
  }
};

marked.setOptions({ renderer });

// Parse frontmatter (simple YAML between --- lines)
function parseFrontmatter(content) {
  const match = content.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
  if (!match) return { meta: {}, body: content };
  const meta = {};
  match[1].split('\n').forEach(line => {
    const colonIdx = line.indexOf(':');
    if (colonIdx === -1) return;
    const key = line.slice(0, colonIdx).trim();
    const val = line.slice(colonIdx + 1).trim();
    meta[key] = val;
  });
  return { meta, body: match[2] };
}

function escapeHtml(str) {
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function stripLeadingH1(html) {
  // Remove the first <h1>...</h1> from marked output since the template already has one
  return html.replace(/^\s*<h1[^>]*>[\s\S]*?<\/h1>\s*/, '');
}

function buildPostPage(meta, htmlContent, slug) {
  const title = meta.title || slug;
  const description = meta.description || '';
  const keywords = meta.keywords || '';
  const date = meta.date || '';

  // Strip the leading h1 from markdown-generated HTML (template provides its own)
  const body = stripLeadingH1(htmlContent);

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<script async src="https://www.googletagmanager.com/gtag/js?id=${GA_ID}"></script>
<script>window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments)}gtag('js',new Date());gtag('config','${GA_ID}');</script>
<title>${escapeHtml(title)} — json.express</title>
<meta name="description" content="${escapeHtml(description)}">
<meta name="keywords" content="${escapeHtml(keywords)}">
<meta property="og:title" content="${escapeHtml(title)} — json.express">
<meta property="og:description" content="${escapeHtml(description)}">
<meta property="og:image" content="https://json.express/og-card.png">
<meta property="og:url" content="https://json.express/blog/${slug}/">
<meta property="og:type" content="article">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="${escapeHtml(title)} — json.express">
<meta name="twitter:description" content="${escapeHtml(description)}">
<meta name="twitter:image" content="https://json.express/og-card.png">
<link rel="canonical" href="https://json.express/blog/${slug}/">
<link rel="icon" type="image/svg+xml" href="/favicon.svg">
<link rel="apple-touch-icon" href="/apple-touch-icon.png">
<link rel="stylesheet" href="/shared.css">
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "Article",
  "headline": "${escapeHtml(title)}",
  "description": "${escapeHtml(description)}",
  "url": "https://json.express/blog/${slug}/",
  "datePublished": "${date}",
  "image": "https://json.express/og-card.png",
  "author": {
    "@type": "Person",
    "name": "Udi Talias"
  },
  "publisher": {
    "@type": "Organization",
    "name": "json.express",
    "url": "https://json.express"
  }
}
</script>
</head>
<body>
<div class="page">

  <nav class="nav">
    <a class="nav-logo" href="/"><span class="brace">{</span> json.express <span class="brace">}</span></a>
    <div class="nav-links">
      <a href="/about/">About</a>
      <a href="/blog/">Blog</a>
    </div>
  </nav>

  <div class="breadcrumb">
    <a href="/">Home</a> &rsaquo; <a href="/blog/">Blog</a> &rsaquo; ${escapeHtml(title)}
  </div>

  <article class="article">
    <h1>${escapeHtml(title)}</h1>
    <p class="article-meta">${date} &middot; By Udi Talias</p>

    ${body}

    <div class="cta-banner">
      <p><strong>Try it yourself</strong></p>
      <p>json.express is a free, private JSON tool that runs entirely in your browser.</p>
      <a class="cta" href="/">Open json.express</a>
    </div>
  </article>

  <div class="section">
    <div class="section-title">Related Tools</div>
    <div class="related-tools">
      <a class="related-tool-link" href="/format/">Formatter</a>
      <a class="related-tool-link" href="/validate/">Validator</a>
      <a class="related-tool-link" href="/query/">Query</a>
      <a class="related-tool-link" href="/viewer/">Viewer</a>
      <a class="related-tool-link" href="/typescript/">TypeScript</a>
      <a class="related-tool-link" href="/compare/">Compare</a>
    </div>
  </div>

  <footer class="footer">
    <span><a href="/">json.express</a> — Free, open-source JSON tools</span>
    <span><a href="https://github.com/uditalias/json.my" target="_blank" rel="noopener">GitHub</a></span>
  </footer>

</div>
</body>
</html>`;
}

function buildIndexPage(posts) {
  const listHtml = posts.map(p => `
    <a class="blog-post-card" href="/blog/${p.slug}/">
      <div class="blog-post-date">${p.date}</div>
      <div class="blog-post-title">${escapeHtml(p.title)}</div>
      <div class="blog-post-excerpt">${escapeHtml(p.description)}</div>
    </a>`).join('\n');

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<script async src="https://www.googletagmanager.com/gtag/js?id=${GA_ID}"></script>
<script>window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments)}gtag('js',new Date());gtag('config','${GA_ID}');</script>
<title>Blog — json.express</title>
<meta name="description" content="Guides, tutorials, and tips for working with JSON. Learn about JSON querying, formatting, TypeScript generation, and more.">
<meta name="keywords" content="json blog, json tutorials, json guides, json tips, json query guide, json formatting tips">
<meta property="og:title" content="Blog — json.express">
<meta property="og:description" content="Guides, tutorials, and tips for working with JSON.">
<meta property="og:image" content="https://json.express/og-card.png">
<meta property="og:url" content="https://json.express/blog/">
<meta property="og:type" content="website">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="Blog — json.express">
<meta name="twitter:description" content="Guides, tutorials, and tips for working with JSON.">
<meta name="twitter:image" content="https://json.express/og-card.png">
<link rel="canonical" href="https://json.express/blog/">
<link rel="icon" type="image/svg+xml" href="/favicon.svg">
<link rel="apple-touch-icon" href="/apple-touch-icon.png">
<link rel="stylesheet" href="/shared.css">
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "Blog",
  "name": "json.express Blog",
  "description": "Guides, tutorials, and tips for working with JSON.",
  "url": "https://json.express/blog/",
  "publisher": {
    "@type": "Organization",
    "name": "json.express",
    "url": "https://json.express"
  }
}
</script>
</head>
<body>
<div class="page">

  <nav class="nav">
    <a class="nav-logo" href="/"><span class="brace">{</span> json.express <span class="brace">}</span></a>
    <div class="nav-links">
      <a href="/about/">About</a>
      <a href="/blog/">Blog</a>
    </div>
  </nav>

  <h1>Blog</h1>
  <p class="tagline">Guides, tutorials, and tips for working with JSON data.</p>

  <div class="blog-list">
${listHtml}
  </div>

  <footer class="footer">
    <span><a href="/">json.express</a> — Free, open-source JSON tools</span>
    <span><a href="https://github.com/uditalias/json.my" target="_blank" rel="noopener">GitHub</a></span>
  </footer>

</div>
</body>
</html>`;
}

// ============ Main ============

if (!existsSync(OUTPUT_DIR)) mkdirSync(OUTPUT_DIR, { recursive: true });

const posts = [];

for (const file of readdirSync(POSTS_DIR).filter(f => f.endsWith('.md'))) {
  const raw = readFileSync(join(POSTS_DIR, file), 'utf8');
  const { meta, body } = parseFrontmatter(raw);
  const slug = basename(file, '.md');
  const html = marked(body);

  const page = buildPostPage(meta, html, slug);

  const outDir = join(OUTPUT_DIR, slug);
  mkdirSync(outDir, { recursive: true });
  writeFileSync(join(outDir, 'index.html'), page);

  posts.push({
    slug,
    title: meta.title || slug,
    description: meta.description || '',
    date: meta.date || ''
  });

  console.log(`  Built: /blog/${slug}/`);
}

// Sort by date descending
posts.sort((a, b) => new Date(b.date) - new Date(a.date));

// Generate blog index
writeFileSync(join(OUTPUT_DIR, 'index.html'), buildIndexPage(posts));
console.log(`  Built: /blog/index.html`);
console.log(`\n  ${posts.length} blog posts built.`);
