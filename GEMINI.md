# Alexander Ciz Yori Portfolio — Workspace Rules

## Search Engine Optimization (SEO) & Indexing Rules

1. **Homepage Singular Indexing Rule**:
   - **Only** the main homepage (`https://alexcizyori.com/` / `index.html`) must ever be indexed by search engines.
   - When searching for "Alexander Ciz Yori", only the main landing page should appear in search results to maintain a clean, high-ranking search footprint without clutter.

2. **Project / Subpage De-indexing Requirement**:
   - Every existing and newly added subpage or case study page (in `/projects/` or any other subfolder) **MUST** include:
     ```html
     <meta name="robots" content="noindex, follow">
     ```
   - Never set `<meta name="robots" content="index, follow">` on project pages or subpages.
   - Using `noindex, follow` guarantees search engines do not display subpages in search results, while still following internal links back to the homepage to channel all link authority and PageRank to `https://alexcizyori.com/`.

3. **Sitemap Protocol (`sitemap.xml`)**:
   - `sitemap.xml` must strictly list **ONLY** the root homepage URL:
     ```xml
     <?xml version="1.0" encoding="UTF-8"?>
     <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
       <url>
         <loc>https://alexcizyori.com/</loc>
         <lastmod>[CURRENT_DATE]</lastmod>
         <changefreq>weekly</changefreq>
         <priority>1.0</priority>
       </url>
     </urlset>
     ```
   - Do **NOT** add `/projects/...` or other subpages to `sitemap.xml`.

4. **Git Synchronization**:
   - Whenever changes are made to site pages, always commit and push to GitHub using `sync_to_github.ps1`.
