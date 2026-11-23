import { Shuffle } from 'lucide-react';
import type { ActiveTab } from '../types/ielts';

interface HeaderProps {
  activeTab: ActiveTab;
  onSelectTab: (tab: ActiveTab) => void;
  onStartBlindExam: () => void;
}

const NAV_ITEMS: Array<{ id: ActiveTab; label: string }> = [
  { id: 'practice', label: 'Luyện nói' },
  { id: 'bank', label: 'Ngân hàng đề' },
  { id: 'history', label: 'Lịch sử' },
  { id: 'descriptors', label: 'Thang điểm' },
];

export function Header({ activeTab, onSelectTab, onStartBlindExam }: HeaderProps) {
  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur border-b border-[#F3DCE5]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4 sm:gap-8">
        {/* Zone 1: Single-element Brand wordmark */}
        <button
          type="button"
          onClick={() => onSelectTab('practice')}
          className="text-lg font-bold tracking-tight text-[#2A1A22] hover:text-[#C93B72] transition-colors whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C93B72] rounded"
          style={{ fontFamily: 'var(--font-display)' }}
        >
          IELTS WITH FELIX
        </button>

        {/* Zone 2: Clean single-line text navigation links */}
        <nav
          aria-label="Điều hướng chính"
          className="hidden md:flex items-center gap-7 text-sm font-medium"
        >
          {NAV_ITEMS.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => onSelectTab(item.id)}
                aria-current={isActive ? 'page' : undefined}
                className={`relative py-5 transition-colors whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C93B72] rounded ${
                  isActive
                    ? 'text-[#C93B72] font-semibold'
                    : 'text-[#6E5662] hover:text-[#2A1A22]'
                }`}
              >
                {item.label}
                {isActive && (
                  <span
                    aria-hidden="true"
                    className="absolute inset-x-0 bottom-0 h-0.5 bg-[#C93B72] rounded-full"
                  />
                )}
              </button>
            );
          })}
        </nav>

        {/* Zone 3: Single Primary Action */}
        <div className="flex items-center shrink-0">
          <button
            type="button"
            onClick={onStartBlindExam}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-[#C93B72] hover:bg-[#B12F62] active:bg-[#982552] rounded-lg transition-colors whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C93B72] focus-visible:ring-offset-2"
          >
            <Shuffle className="w-4 h-4 shrink-0" aria-hidden="true" />
            <span>Thi thử ngẫu nhiên</span>
          </button>
        </div>
      </div>

      {/* Compact mobile navigation row */}
      <nav
        aria-label="Điều hướng di động"
        className="md:hidden border-t border-[#F8E8EE] bg-white px-2 flex items-center justify-around overflow-x-auto"
      >
        {NAV_ITEMS.map((item) => {
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onSelectTab(item.id)}
              aria-current={isActive ? 'page' : undefined}
              className={`px-3 py-2.5 text-xs font-medium whitespace-nowrap shrink-0 border-b-2 transition-colors ${
                isActive
                  ? 'text-[#C93B72] border-[#C93B72] font-semibold'
                  : 'text-[#6E5662] border-transparent hover:text-[#2A1A22]'
              }`}
            >
              {item.label}
            </button>
          );
        })}
      </nav>
    </header>
  );
}
