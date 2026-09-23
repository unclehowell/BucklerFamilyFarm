import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  BookOpen,
  FileText,
  Film,
  Image as ImageIcon,
  FileSpreadsheet,
  Download,
  ExternalLink,
  X,
  Search,
  Library,
} from 'lucide-react';
import {
  ARCHIVE_WIKI_PAGES,
  ARCHIVE_SOURCE_URL,
  ARCHIVE_IMPORTED_AT,
  EVIDENCE_CATEGORIES,
  EVIDENCE_ITEMS,
  EvidenceItem,
  EvidenceKind,
} from '../../data/greatHouseFarmWikiArchive';

interface GreatHouseFarmArchiveViewProps {
  initialTab?: 'pages' | 'evidence';
}

const KIND_LABELS: Record<EvidenceKind, { label: string; className: string }> = {
  record: { label: 'Record', className: 'text-emerald-300 border-emerald-500/40' },
  family: { label: 'Family', className: 'text-[#D9A95C] border-[#D9A95C]/40' },
  analysis: { label: 'Analysis (not evidence)', className: 'text-[#E07A6B] border-[#AA210F]/50' },
  background: { label: 'Background', className: 'text-[#9BA1A6] border-[#3E444B]' },
  media: { label: 'Footage', className: 'text-[#5FA3A7] border-[#5FA3A7]/40' },
};

const pageTitle = (slug: string) => ARCHIVE_WIKI_PAGES.find((p) => p.slug === slug)?.title ?? slug;

const readHash = (): { tab?: 'pages' | 'evidence'; slug?: string } => {
  const hash = window.location.hash.replace('#', '');
  if (hash === 'evidence' || hash === 'evidence-library') return { tab: 'evidence' };
  if (hash.startsWith('archive/')) return { tab: 'pages', slug: hash.slice('archive/'.length) };
  if (hash === 'archive') return { tab: 'pages', slug: 'main-page' };
  return {};
};

const FileTypeIcon: React.FC<{ type: string }> = ({ type }) => {
  if (type === 'mp4') return <Film className="w-4 h-4 text-[#5FA3A7]" />;
  if (type === 'jpg' || type === 'png') return <ImageIcon className="w-4 h-4 text-[#D9A95C]" />;
  if (type === 'xls' || type === 'xlsx') return <FileSpreadsheet className="w-4 h-4 text-emerald-400" />;
  return <FileText className="w-4 h-4 text-[#D08856]" />;
};

export const GreatHouseFarmArchiveView: React.FC<GreatHouseFarmArchiveViewProps> = ({ initialTab = 'pages' }) => {
  const initial = readHash();
  const [tab, setTab] = useState<'pages' | 'evidence'>(initial.tab ?? initialTab);
  const [slug, setSlug] = useState<string>(
    initial.slug && ARCHIVE_WIKI_PAGES.some((p) => p.slug === initial.slug) ? initial.slug : 'main-page',
  );
  const [preview, setPreview] = useState<EvidenceItem | null>(null);
  const [query, setQuery] = useState('');
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onHash = () => {
      const h = readHash();
      if (h.tab) setTab(h.tab);
      if (h.slug && ARCHIVE_WIKI_PAGES.some((p) => p.slug === h.slug)) setSlug(h.slug);
    };
    window.addEventListener('hashchange', onHash);
    return () => window.removeEventListener('hashchange', onHash);
  }, []);

  useEffect(() => {
    if (!preview) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setPreview(null);
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [preview]);

  const page = ARCHIVE_WIKI_PAGES.find((p) => p.slug === slug) ?? ARCHIVE_WIKI_PAGES[0];

  const openPage = (next: string) => {
    setTab('pages');
    setSlug(next);
    window.location.hash = `archive/${next}`;
    contentRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const openEvidence = () => {
    setTab('evidence');
    window.location.hash = 'evidence';
  };

  // Intercept links inside the imported HTML: wiki pages switch in place, evidence files open in the viewer.
  const handleContentClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const a = (e.target as HTMLElement).closest('a');
    if (!a) return;
    const href = a.getAttribute('href') ?? '';
    if (a.dataset.kind === 'page' && href.startsWith('#archive/')) {
      e.preventDefault();
      openPage(href.slice('#archive/'.length));
    } else if (a.dataset.kind === 'file') {
      const item = EVIDENCE_ITEMS.find((i) => i.file === href);
      if (item) {
        e.preventDefault();
        setPreview(item);
      }
    }
  };

  const filteredItems = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return EVIDENCE_ITEMS;
    return EVIDENCE_ITEMS.filter((i) => `${i.title} ${i.date} ${i.note ?? ''}`.toLowerCase().includes(q));
  }, [query]);

  return (
    <div className="space-y-4">
      {/* Source banner */}
      <div className="p-3 sm:p-4 rounded-2xl bg-[#151B26] border border-[#3A4459] text-xs text-[#A9B1B8] flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <span>
          Complete copy of the <strong className="text-[#F2ECDD]">Great House Farm Wiki</strong>: {ARCHIVE_WIKI_PAGES.length} pages and{' '}
          {EVIDENCE_ITEMS.length} evidence files, imported {ARCHIVE_IMPORTED_AT}. Statements are labelled{' '}
          <strong className="text-[#F2ECDD]">[Record]</strong>, <strong className="text-[#F2ECDD]">[Family account]</strong> or{' '}
          <strong className="text-[#F2ECDD]">[Contention]</strong>.
        </span>
        <a
          href={ARCHIVE_SOURCE_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="shrink-0 text-[#5FA3A7] hover:text-[#FFFFFF] flex items-center gap-1 font-mono"
        >
          <ExternalLink className="w-3.5 h-3.5" /> greathousefarmwiki.wordpress.com
        </a>
      </div>

      {/* Tabs */}
      <div className="flex gap-2">
        <button
          onClick={() => openPage(slug)}
          className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-colors ${
            tab === 'pages' ? 'bg-[#AA210F] text-[#FFFFFF]' : 'bg-[#202428] text-[#C5CAD0] border border-[#3E444B] hover:text-[#FFFFFF]'
          }`}
        >
          <BookOpen className="w-3.5 h-3.5" /> Wiki pages ({ARCHIVE_WIKI_PAGES.length})
        </button>
        <button
          onClick={openEvidence}
          className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-colors ${
            tab === 'evidence' ? 'bg-[#AA210F] text-[#FFFFFF]' : 'bg-[#202428] text-[#C5CAD0] border border-[#3E444B] hover:text-[#FFFFFF]'
          }`}
        >
          <Library className="w-3.5 h-3.5" /> Evidence files ({EVIDENCE_ITEMS.length})
        </button>
      </div>

      {tab === 'pages' && (
        <div ref={contentRef} className="grid grid-cols-1 lg:grid-cols-[220px_1fr] gap-4 scroll-mt-20">
          {/* Page list (select on small screens) */}
          <div className="lg:hidden">
            <label className="sr-only" htmlFor="archive-page-select">Wiki page</label>
            <select
              id="archive-page-select"
              value={slug}
              onChange={(e) => openPage(e.target.value)}
              className="w-full bg-[#202428] border border-[#3E444B] rounded-lg px-3 py-2 text-sm text-[#E8E6E3]"
            >
              {ARCHIVE_WIKI_PAGES.map((p) => (
                <option key={p.slug} value={p.slug}>
                  {p.title}
                </option>
              ))}
            </select>
          </div>
          <nav className="hidden lg:block rounded-2xl bg-[#1A1D20] border border-[#2D3238] p-2 self-start max-h-[75vh] overflow-y-auto">
            {ARCHIVE_WIKI_PAGES.map((p) => (
              <button
                key={p.slug}
                onClick={() => openPage(p.slug)}
                className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs cursor-pointer transition-colors ${
                  p.slug === slug ? 'bg-[#AA210F] text-[#FFFFFF] font-bold' : 'text-[#C5CAD0] hover:bg-[#22262B] hover:text-[#FFFFFF]'
                }`}
              >
                {p.title}
              </button>
            ))}
          </nav>

          <article className="rounded-2xl bg-[#16181B] border border-[#2D3238] p-4 sm:p-6 min-w-0">
            <div className="flex flex-wrap items-baseline justify-between gap-2 border-b border-[#2D3238] pb-3 mb-2">
              <h2 className="font-serif font-black text-xl sm:text-2xl text-[#FFFFFF]">{page.title}</h2>
              <a
                href={page.sourceUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[10px] font-mono text-[#9BA1A6] hover:text-[#FFFFFF] flex items-center gap-1"
              >
                <ExternalLink className="w-3 h-3" /> original, updated {page.modified}
              </a>
            </div>
            <div
              className="ghf-archive"
              onClick={handleContentClick}
              dangerouslySetInnerHTML={{ __html: page.html }}
            />
          </article>
        </div>
      )}

      {tab === 'evidence' && (
        <div className="space-y-5">
          <div className="relative">
            <Search className="w-4 h-4 text-[#656D76] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search evidence files…"
              className="w-full bg-[#202428] border border-[#3E444B] rounded-lg pl-9 pr-3 py-2 text-sm text-[#E8E6E3] placeholder:text-[#656D76]"
            />
          </div>

          {EVIDENCE_CATEGORIES.map((cat) => {
            const items = filteredItems.filter((i) => i.category === cat.id);
            if (items.length === 0) return null;
            return (
              <section key={cat.id} className="space-y-2">
                <h3 className="font-bold text-sm text-[#F2ECDD]">
                  {cat.title} <span className="text-[#656D76] font-mono text-xs">({items.length})</span>
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {items.map((item) => (
                    <div
                      key={item.id}
                      className="p-3 rounded-xl bg-[#1A1D20] border border-[#2D3238] hover:border-[#D08856]/60 transition-colors flex flex-col gap-2"
                    >
                      <div className="flex items-start gap-2">
                        <FileTypeIcon type={item.fileType} />
                        <div className="min-w-0 flex-1">
                          <button
                            onClick={() => setPreview(item)}
                            className="text-left text-xs font-bold text-[#FFFFFF] hover:text-[#5FA3A7] cursor-pointer"
                          >
                            {item.title}
                          </button>
                          <div className="flex flex-wrap items-center gap-1.5 mt-1 text-[10px] font-mono text-[#9BA1A6]">
                            {item.date && <span>{item.date}</span>}
                            <span>· {item.fileType.toUpperCase()}</span>
                            {item.pages && <span>· {item.pages} pp</span>}
                            <span>· {item.sizeKb >= 1024 ? `${(item.sizeKb / 1024).toFixed(1)} MB` : `${item.sizeKb} KB`}</span>
                            <span className={`px-1.5 py-0.5 rounded border ${KIND_LABELS[item.kind].className}`}>
                              {KIND_LABELS[item.kind].label}
                            </span>
                          </div>
                        </div>
                      </div>
                      {item.note && <p className="text-[11px] text-[#A9B1B8]">{item.note}</p>}
                      <div className="flex flex-wrap items-center gap-2 text-[11px]">
                        <button
                          onClick={() => setPreview(item)}
                          className="px-2 py-1 rounded-md bg-[#1E2636] border border-[#5FA3A7]/40 text-[#5FA3A7] hover:text-[#FFFFFF] cursor-pointer"
                        >
                          View
                        </button>
                        <a
                          href={item.file}
                          download
                          className="px-2 py-1 rounded-md bg-[#202428] border border-[#3E444B] text-[#C5CAD0] hover:text-[#FFFFFF] flex items-center gap-1"
                        >
                          <Download className="w-3 h-3" /> Download
                        </a>
                        {item.explainedOn.map((s) => (
                          <button
                            key={s}
                            onClick={() => openPage(s)}
                            className="text-[#9BA1A6] hover:text-[#FFFFFF] underline underline-offset-2 cursor-pointer"
                          >
                            {pageTitle(s)}
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            );
          })}
          {filteredItems.length === 0 && <p className="text-xs text-[#9BA1A6]">No evidence files match that search.</p>}
        </div>
      )}

      {/* Evidence viewer */}
      {preview && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={preview.title}
          className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-2 sm:p-6"
          onClick={() => setPreview(null)}
        >
          <div
            className="w-full max-w-5xl h-[calc(100dvh-1rem)] sm:h-[calc(100dvh-3rem)] bg-[#16181B] border border-[#2D3238] rounded-2xl flex flex-col overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-4 py-3 border-b border-[#2D3238] flex items-center justify-between gap-3">
              <div className="min-w-0">
                <div className="text-sm font-bold text-[#FFFFFF] truncate">{preview.title}</div>
                <div className="text-[10px] font-mono text-[#9BA1A6]">
                  {preview.date} · {preview.file.split('/').pop()}
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <a
                  href={preview.file}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 rounded-lg bg-[#202428] border border-[#3E444B] text-[#C5CAD0] hover:text-[#FFFFFF]"
                  aria-label="Open in new tab"
                >
                  <ExternalLink className="w-4 h-4" />
                </a>
                <button
                  onClick={() => setPreview(null)}
                  className="p-2 rounded-lg bg-[#202428] border border-[#3E444B] text-[#C5CAD0] hover:text-[#FFFFFF] cursor-pointer"
                  aria-label="Close viewer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
            <div className="flex-1 min-h-0 bg-[#0D0F11] flex items-center justify-center">
              {preview.fileType === 'pdf' && (
                <iframe title={preview.title} src={preview.file} className="w-full h-full border-0 bg-white" />
              )}
              {preview.fileType === 'mp4' && (
                <video src={preview.file} controls playsInline className="w-full max-h-full" />
              )}
              {(preview.fileType === 'jpg' || preview.fileType === 'png') && (
                <img src={preview.file} alt={preview.title} className="max-w-full max-h-full object-contain" />
              )}
              {['doc', 'docx', 'xls', 'xlsx'].includes(preview.fileType) && (
                <div className="text-center space-y-3 p-6">
                  <FileTypeIcon type={preview.fileType} />
                  <p className="text-sm text-[#C5CAD0]">
                    {preview.fileType.toUpperCase()} files cannot be shown in the browser. Download to open.
                  </p>
                  <a
                    href={preview.file}
                    download
                    className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-[#AA210F] text-[#FFFFFF] text-xs font-bold"
                  >
                    <Download className="w-3.5 h-3.5" /> Download
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
