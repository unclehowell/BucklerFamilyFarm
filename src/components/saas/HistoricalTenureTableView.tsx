import React, { useState, useMemo } from 'react';
import {
  Table,
  Search,
  Calendar,
  User,
  Building,
  FileText,
  Copy,
  Check,
  Filter,
  ArrowUpDown,
  FileSpreadsheet,
  Download,
  BookOpen,
  Sparkles,
  ShieldCheck,
} from 'lucide-react';
import {
  HISTORICAL_TENURE_TABLE_DATA,
  HistoricalTenureRecord,
} from '../../data/historicalTenureTableData';
import { ShareButton } from './ShareButton';

interface HistoricalTenureTableViewProps {
  onSwitchToWiki?: () => void;
}

export const HistoricalTenureTableView: React.FC<HistoricalTenureTableViewProps> = ({
  onSwitchToWiki,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedParcelFilter, setSelectedParcelFilter] = useState<string>('all');
  const [sortAscending, setSortAscending] = useState(true);
  const [copiedRowId, setCopiedRowId] = useState<string | null>(null);

  // Filtered and sorted dataset
  const filteredData = useMemo(() => {
    let list = [...HISTORICAL_TENURE_TABLE_DATA];

    if (selectedParcelFilter !== 'all') {
      list = list.filter(
        (item) => item.parcelContext === selectedParcelFilter || item.parcelContext === 'Entire Holding'
      );
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        (item) =>
          item.year.toLowerCase().includes(q) ||
          item.owner.toLowerCase().includes(q) ||
          item.occupant.toLowerCase().includes(q) ||
          item.details.toLowerCase().includes(q) ||
          (item.legalSignificance && item.legalSignificance.toLowerCase().includes(q)) ||
          (item.archivalSource && item.archivalSource.toLowerCase().includes(q))
      );
    }

    if (!sortAscending) {
      list.reverse();
    }

    return list;
  }, [searchQuery, selectedParcelFilter, sortAscending]);

  const handleCopyRow = (item: HistoricalTenureRecord, e: React.MouseEvent) => {
    e.stopPropagation();
    const formatted = `[${item.year}] Owner: ${item.owner} | Occupant/Tenant: ${item.occupant}\nDetails: ${item.details}\nLegal Status: ${item.legalSignificance || 'N/A'}\nSource: ${item.archivalSource || 'Archival Record'}`;
    navigator.clipboard.writeText(formatted);
    setCopiedRowId(item.id);
    setTimeout(() => setCopiedRowId(null), 2000);
  };

  const handleExportCSV = () => {
    const headers = ['Year', 'Owner', 'Occupant/Tenant', 'Details', 'Parcel Context', 'Legal Significance', 'Archival Source'];
    const rows = filteredData.map((d) => [
      `"${d.year.replace(/"/g, '""')}"`,
      `"${d.owner.replace(/"/g, '""')}"`,
      `"${d.occupant.replace(/"/g, '""')}"`,
      `"${d.details.replace(/"/g, '""')}"`,
      `"${(d.parcelContext || '').replace(/"/g, '""')}"`,
      `"${(d.legalSignificance || '').replace(/"/g, '""')}"`,
      `"${(d.archivalSource || '').replace(/"/g, '""')}"`,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Historical_Tenure_Chronology_Table_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div id="historical-tenure-table-view" className="w-full space-y-6 animate-in fade-in duration-200">
      {/* Top Action Header */}
      <div className="p-4 sm:p-6 rounded-3xl bg-[#202428] border-2 border-[#3E4446] shadow-xl flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2.5 flex-wrap">
            <div className="w-8 h-8 rounded-xl bg-[#AA210F] text-[#FFFFFF] flex items-center justify-center font-bold shadow-md">
              <Table className="w-4 h-4" />
            </div>
            <h2 className="text-lg sm:text-2xl font-serif font-black text-[#FFFFFF] tracking-tight">
              Historical Ownership & Tenure Chronology Table
            </h2>
            <span className="px-2.5 py-0.5 rounded-full bg-[#181A1B] text-emerald-400 font-mono text-[10px] font-bold border border-emerald-500/40">
              {filteredData.length} Verified Archival Records
            </span>
          </div>
          <p className="text-xs text-[#9BA1A6] max-w-3xl">
            Chronological forensic comparison of paper ownership against unbroken customary domestic occupancy (1667–Present) for Great House Farm (Ty Mawr), Llandough.
          </p>
        </div>

        {/* Action Controls: Switch to Wiki, Export CSV, Share Direct URL */}
        <div className="flex items-center gap-2.5 flex-wrap self-start md:self-auto">
          {onSwitchToWiki && (
            <button
              onClick={onSwitchToWiki}
              className="py-1.5 px-3.5 rounded-xl bg-[#2D2C28] hover:bg-[#3E4446] border border-[#52504C] text-xs font-bold text-[#6B9CD2] hover:text-[#FFFFFF] flex items-center gap-1.5 transition-all cursor-pointer shadow-sm"
              title="Switch to Case Wiki Narrative View"
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>Wiki Narrative View</span>
            </button>
          )}

          <button
            onClick={handleExportCSV}
            className="py-1.5 px-3 rounded-xl bg-[#2D2C28] hover:bg-[#3E4446] border border-[#52504C] text-xs text-[#E8E6E3] hover:text-[#FFFFFF] flex items-center gap-1.5 transition-all cursor-pointer shadow-sm"
            title="Download table data as CSV"
          >
            <Download className="w-3.5 h-3.5 text-emerald-400" />
            <span className="hidden sm:inline">Export CSV</span>
          </button>

          <ShareButton viewTarget="table" buttonLabel="Share Table" variant="primary" />
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-2xl bg-[#1C1F22] border border-[#3E4446] flex flex-col sm:flex-row items-center justify-between gap-3">
        {/* Search input */}
        <div className="relative w-full sm:w-80">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search year, owner, occupant, citations..."
            className="w-full py-2 pl-8 pr-3 rounded-xl bg-[#202428] border border-[#454D55] text-xs text-[#E8E6E3] placeholder-[#7E868C] focus:outline-none focus:border-[#6B9CD2]"
          />
          <Search className="w-3.5 h-3.5 text-[#7E868C] absolute left-2.5 top-2.5" />
        </div>

        {/* Parcel selector and sort toggles */}
        <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-end">
          <div className="flex items-center gap-1.5 text-xs text-[#9BA1A6]">
            <Filter className="w-3.5 h-3.5 text-[#D08856]" />
            <select
              value={selectedParcelFilter}
              onChange={(e) => setSelectedParcelFilter(e.target.value)}
              className="py-1.5 px-2.5 rounded-lg bg-[#202428] border border-[#454D55] text-xs text-[#E8E6E3] focus:outline-none focus:border-[#6B9CD2] cursor-pointer"
            >
              <option value="all">All Parcels</option>
              <option value="Parcel B (Ty Mawr House)">Parcel B: House & Domestic Garden</option>
              <option value="Parcel A (Farmland)">Parcel A: Farmland / Agricultural Acreage</option>
              <option value="Parcel C (Cottages)">Parcel C: Limeworks & Cottages</option>
            </select>
          </div>

          <button
            onClick={() => setSortAscending(!sortAscending)}
            className="py-1.5 px-2.5 rounded-lg bg-[#202428] hover:bg-[#2D2C28] border border-[#454D55] text-xs text-[#E8E6E3] flex items-center gap-1 transition-colors cursor-pointer"
            title={`Sort order: ${sortAscending ? 'Chronological (Oldest First)' : 'Reverse Chronological (Newest First)'}`}
          >
            <ArrowUpDown className="w-3.5 h-3.5 text-[#D08856]" />
            <span className="font-mono text-[11px]">{sortAscending ? '1667 ➔ 2026' : '2026 ➔ 1667'}</span>
          </button>
        </div>
      </div>

      {/* The 4-Column Table */}
      <div className="rounded-3xl bg-[#181A1B] border-2 border-[#3E4446] shadow-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs sm:text-sm">
            <thead>
              <tr className="bg-[#202428] border-b-2 border-[#3E4446] text-[#FFFFFF] font-bold text-xs uppercase tracking-wider">
                <th scope="col" className="p-4 sm:p-5 w-28 sm:w-36 font-mono text-[#D08856]">
                  <div className="flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>Year</span>
                  </div>
                </th>
                <th scope="col" className="p-4 sm:p-5 w-48 sm:w-60 text-[#6B9CD2]">
                  <div className="flex items-center gap-1.5">
                    <Building className="w-3.5 h-3.5" />
                    <span>Owner</span>
                  </div>
                </th>
                <th scope="col" className="p-4 sm:p-5 w-52 sm:w-64 text-emerald-400">
                  <div className="flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5" />
                    <span>Occupant / Tenant</span>
                  </div>
                </th>
                <th scope="col" className="p-4 sm:p-5 text-[#E8E6E3]">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <FileText className="w-3.5 h-3.5 text-[#9BA1A6]" />
                      <span>Details & Historical Evidence</span>
                    </div>
                    <span className="text-[10px] font-mono text-[#7E868C] font-normal normal-case hidden md:inline">
                      Click copy button on any row for citation
                    </span>
                  </div>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#2D3237] text-xs">
              {filteredData.length === 0 ? (
                <tr>
                  <td colSpan={4} className="p-8 text-center text-[#9BA1A6] font-mono">
                    No archival tenure records matching &quot;{searchQuery}&quot;
                  </td>
                </tr>
              ) : (
                filteredData.map((row) => (
                  <tr
                    key={row.id}
                    className="hover:bg-[#202428]/70 transition-colors group relative"
                  >
                    {/* 1. Year Column */}
                    <td className="p-4 sm:p-5 font-mono font-bold text-[#D08856] align-top whitespace-nowrap">
                      <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-[#202428] border border-[#3E4446]">
                        <span>{row.year}</span>
                      </div>
                      {row.parcelContext && (
                        <div className="mt-2 text-[10px] font-sans font-medium text-[#7E868C]">
                          {row.parcelContext}
                        </div>
                      )}
                    </td>

                    {/* 2. Owner Column */}
                    <td className="p-4 sm:p-5 text-[#E8E6E3] font-semibold align-top">
                      <div className="space-y-1">
                        <div className="text-xs sm:text-sm text-[#FFFFFF] leading-snug">{row.owner}</div>
                        {row.legalSignificance && (
                          <div className="inline-block text-[10px] font-mono text-[#6B9CD2] bg-[#202428] px-2 py-0.5 rounded border border-[#3E4446]/60">
                            {row.legalSignificance}
                          </div>
                        )}
                      </div>
                    </td>

                    {/* 3. Occupant / Tenant Column */}
                    <td className="p-4 sm:p-5 text-emerald-300 font-medium align-top">
                      <div className="space-y-1">
                        <div className="text-xs sm:text-sm leading-snug">{row.occupant}</div>
                        {row.archivalSource && (
                          <div className="text-[10px] text-[#9BA1A6] font-mono">
                            Ref: {row.archivalSource}
                          </div>
                        )}
                      </div>
                    </td>

                    {/* 4. Details Column */}
                    <td className="p-4 sm:p-5 text-[#C5CAD0] leading-relaxed align-top">
                      <div className="flex items-start justify-between gap-3">
                        <p className="text-xs sm:text-sm text-[#D2D6DC] leading-relaxed">
                          {row.details}
                        </p>
                        <button
                          onClick={(e) => handleCopyRow(row, e)}
                          className="opacity-60 group-hover:opacity-100 p-1.5 rounded-lg bg-[#202428] hover:bg-[#343A40] border border-[#454D55] text-[#9BA1A6] hover:text-[#FFFFFF] transition-all flex-shrink-0 cursor-pointer"
                          title="Copy row citation to clipboard"
                        >
                          {copiedRowId === row.id ? (
                            <Check className="w-3.5 h-3.5 text-emerald-400" />
                          ) : (
                            <Copy className="w-3.5 h-3.5" />
                          )}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Table Footer with Summary and Share Link */}
        <div className="p-4 sm:p-5 bg-[#202428] border-t-2 border-[#3E4446] flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-[#9BA1A6]">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400 flex-shrink-0" />
            <span>
              All entries triangulated against Glamorgan Archives, The National Archives (Kew), and Court of Appeal Law Reports.
            </span>
          </div>

          <div className="flex items-center gap-2">
            <ShareButton viewTarget="table" buttonLabel="Share This Table" variant="subtle" />
          </div>
        </div>
      </div>
    </div>
  );
};
