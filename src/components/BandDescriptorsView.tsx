import { useMemo, useState } from 'react';
import { Download, ExternalLink, FileText } from 'lucide-react';
import { IELTS_BAND_DESCRIPTORS, OFFICIAL_PDF_URL } from '../data/bandDescriptors';

type BandRange = 'all' | 'high' | 'mid' | 'low';

export function BandDescriptorsView() {
  const [range, setRange] = useState<BandRange>('all');

  const rows = useMemo(() => {
    if (range === 'high') return IELTS_BAND_DESCRIPTORS.filter((r) => r.band >= 7);
    if (range === 'mid') return IELTS_BAND_DESCRIPTORS.filter((r) => r.band >= 5 && r.band <= 6);
    if (range === 'low') return IELTS_BAND_DESCRIPTORS.filter((r) => r.band <= 4);
    return IELTS_BAND_DESCRIPTORS;
  }, [range]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-2xl sm:text-3xl font-bold text-[#2A1A22] tracking-tight">
            Thang điểm IELTS Speaking Band Descriptors
          </h1>
          <p className="text-sm text-[#6E5662]">
            Tiêu chí chấm điểm công khai chính thức từ IELTS (Academic & General Training) được tích hợp trực tiếp vào hệ thống đánh giá.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
          <a
            href={OFFICIAL_PDF_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs sm:text-sm font-medium text-[#2A1A22] bg-white border border-[#F3DCE5] hover:bg-[#FFF3F7] rounded-lg transition-colors whitespace-nowrap"
          >
            <ExternalLink className="w-4 h-4 text-[#C93B72]" aria-hidden="true" />
            <span>Mở bản PDF gốc</span>
          </a>
          <a
            href={OFFICIAL_PDF_URL}
            download="IELTS-Speaking-Band-Descriptors.pdf"
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs sm:text-sm font-semibold text-white bg-[#3B1F2B] hover:bg-[#4E2939] rounded-lg transition-colors whitespace-nowrap"
          >
            <Download className="w-4 h-4" aria-hidden="true" />
            <span>Tải PDF IELTS</span>
          </a>
        </div>
      </div>

      {/* Band Range Filter + Official Rounding Note */}
      <div className="bg-white border border-[#F3DCE5] rounded-xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div
          role="tablist"
          aria-label="Lọc mức Band điểm"
          className="inline-flex items-center p-1 bg-[#FCEBF1] rounded-lg self-start"
        >
          {(
            [
              { id: 'all', label: 'Tất cả (9–0)' },
              { id: 'high', label: 'Mục tiêu cao (7–9)' },
              { id: 'mid', label: 'Trung cấp (5–6)' },
              { id: 'low', label: 'Nền tảng (0–4)' },
            ] as const
          ).map((item) => (
            <button
              key={item.id}
              type="button"
              role="tab"
              aria-selected={range === item.id}
              onClick={() => setRange(item.id)}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
                range === item.id
                  ? 'bg-white text-[#2A1A22] shadow-sm font-semibold'
                  : 'text-[#6E5662] hover:text-[#2A1A22]'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>

        <p className="text-xs text-[#7A606D] flex items-center gap-2">
          <FileText className="w-4 h-4 text-[#C93B72] shrink-0" aria-hidden="true" />
          <span>
            4 tiêu chí chấm theo số nguyên (0–9); Overall Band lấy trung bình 4 tiêu chí làm tròn đến 0.5 gần nhất (.25 → .5, .75 → tăng 1.0).
          </span>
        </p>
      </div>

      {/* Official Matrix Table */}
      <div className="bg-white border border-[#F3DCE5] rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="bg-[#3B1F2B] text-white text-xs font-semibold">
                <th className="py-3.5 px-4 w-20 text-center">Band</th>
                <th className="py-3.5 px-5 min-w-[230px]">Fluency and Coherence</th>
                <th className="py-3.5 px-5 min-w-[220px]">Lexical Resource</th>
                <th className="py-3.5 px-5 min-w-[220px]">Grammatical Range and Accuracy</th>
                <th className="py-3.5 px-5 min-w-[230px]">Pronunciation</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F3DCE5] align-top">
              {rows.map((row) => (
                <tr key={row.band} className="hover:bg-[#FFF8FA] transition-colors">
                  <td className="py-5 px-4 text-center bg-[#FFF3F7] border-r border-[#F3DCE5]">
                    <span className="text-2xl font-extrabold font-mono text-[#C93B72] tabular-nums">
                      {row.band}
                    </span>
                  </td>
                  <td className="py-5 px-5 text-xs sm:text-[13px] text-[#4A3440] leading-relaxed border-r border-[#F8E8EE]">
                    <ul className="space-y-2">
                      {row.fluencyCoherence.map((line, i) => (
                        <li key={i}>{line}</li>
                      ))}
                    </ul>
                  </td>
                  <td className="py-5 px-5 text-xs sm:text-[13px] text-[#4A3440] leading-relaxed border-r border-[#F8E8EE]">
                    <ul className="space-y-2">
                      {row.lexicalResource.map((line, i) => (
                        <li key={i}>{line}</li>
                      ))}
                    </ul>
                  </td>
                  <td className="py-5 px-5 text-xs sm:text-[13px] text-[#4A3440] leading-relaxed border-r border-[#F8E8EE]">
                    <ul className="space-y-2">
                      {row.grammaticalRange.map((line, i) => (
                        <li key={i}>{line}</li>
                      ))}
                    </ul>
                  </td>
                  <td className="py-5 px-5 text-xs sm:text-[13px] text-[#4A3440] leading-relaxed">
                    <ul className="space-y-2">
                      {row.pronunciation.map((line, i) => (
                        <li key={i}>{line}</li>
                      ))}
                    </ul>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
