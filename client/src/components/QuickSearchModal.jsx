import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { itemService } from '../features/user/services/itemService';

export const QuickSearchModal = ({ isOpen, onClose }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setQuery('');
      setResults([]);
    }
  }, [isOpen]);

  // Global shortcut ⌘K / Ctrl+K
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        if (isOpen) onClose();
        else onClose(true); // toggle
      } else if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Search debounce
  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }

    const timer = setTimeout(async () => {
      try {
        setLoading(true);
        const res = await itemService.getPublicItems({ search: query, limit: 6 });
        setResults(res.data?.items || []);
      } catch (err) {
        console.error('Search error:', err);
      } finally {
        setLoading(false);
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [query]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4 bg-on-surface/40 dark:bg-black/60 backdrop-blur-sm animate-fadeIn">
      <div
        className="w-full max-w-2xl bg-surface-container-lowest dark:bg-[#151F30] rounded-2xl shadow-2xl border border-outline-variant/40 dark:border-[#29364A] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Input Box */}
        <div className="p-4 border-b border-outline-variant/30 dark:border-[#29364A] flex items-center gap-3 bg-surface-container-low/40 dark:bg-[#1D2A40]/40">
          <span className="material-symbols-outlined text-[24px] text-primary dark:text-[#4D8DFF]">
            search
          </span>
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search items by keyword, serial number, location, brand..."
            className="w-full bg-transparent text-on-surface dark:text-[#F8FAFC] font-body-lg text-body-lg placeholder:text-on-surface-variant/60 focus:outline-none"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="text-on-surface-variant hover:text-on-surface p-1"
            >
              <span className="material-symbols-outlined text-[18px]">close</span>
            </button>
          )}
          <kbd className="px-2 py-1 rounded bg-surface-container-high dark:bg-[#29364A] text-on-surface-variant dark:text-[#A8B5CA] text-xs font-code-tabular">
            ESC
          </kbd>
        </div>

        {/* Results Container */}
        <div className="max-h-96 overflow-y-auto p-2">
          {loading && (
            <div className="p-8 text-center text-on-surface-variant flex items-center justify-center gap-2">
              <span className="material-symbols-outlined animate-spin text-[20px]">sync</span>
              <span>Scanning institutional catalog...</span>
            </div>
          )}

          {!loading && query && results.length === 0 && (
            <div className="p-8 text-center text-on-surface-variant">
              <span className="material-symbols-outlined text-[36px] text-outline mb-2">
                sentiment_dissatisfied
              </span>
              <p className="font-title-md text-on-surface dark:text-[#F8FAFC]">
                No matching items found
              </p>
              <p className="font-body-sm mt-1">
                Try searching with different keywords or file a report.
              </p>
            </div>
          )}

          {!loading && !query && (
            <div className="p-6 text-center text-on-surface-variant">
              <p className="font-label-md uppercase tracking-wider text-outline text-xs">
                Suggested Searches
              </p>
              <div className="flex flex-wrap justify-center gap-2 mt-3">
                {['MacBook', 'Headphones', 'Keys', 'Backpack', 'Water Bottle', 'Library'].map((tag) => (
                  <button
                    key={tag}
                    onClick={() => setQuery(tag)}
                    className="px-3 py-1 rounded-full bg-surface-container dark:bg-[#1D2A40] hover:bg-surface-container-high text-xs font-medium text-on-surface dark:text-[#F8FAFC] transition-colors"
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>
          )}

          {results.map((item) => (
            <div
              key={item._id}
              onClick={() => {
                navigate(`/items/${item._id}`);
                onClose();
              }}
              className="p-3 rounded-xl hover:bg-surface-container-low dark:hover:bg-[#1D2A40] transition-colors cursor-pointer flex items-center justify-between gap-4 group"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-12 h-12 rounded-lg bg-surface-container overflow-hidden shrink-0">
                  {item.images?.[0]?.url ? (
                    <img
                      src={item.images[0].url}
                      alt={item.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                    />
                  ) : (
                    <span className="material-symbols-outlined text-[24px] text-primary flex items-center justify-center h-full">
                      inventory_2
                    </span>
                  )}
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span
                      className={`px-1.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                        item.type === 'FOUND'
                          ? 'bg-[#16845B]/10 text-[#16845B]'
                          : 'bg-[#B7791F]/10 text-[#B7791F]'
                      }`}
                    >
                      {item.type}
                    </span>
                    <span className="font-title-md text-sm font-semibold text-on-surface dark:text-[#F8FAFC] truncate group-hover:text-primary dark:group-hover:text-[#4D8DFF]">
                      {item.title}
                    </span>
                  </div>
                  <p className="font-body-sm text-xs text-on-surface-variant dark:text-[#A8B5CA] truncate mt-0.5">
                    {item.location?.name || 'Campus Location'} • {new Date(item.itemDate).toLocaleDateString()}
                  </p>
                </div>
              </div>
              <span className="material-symbols-outlined text-outline group-hover:text-primary text-[18px]">
                arrow_forward
              </span>
            </div>
          ))}
        </div>

        {/* Modal Footer */}
        <div className="p-3 border-t border-outline-variant/30 dark:border-[#29364A] bg-surface-container-low/20 dark:bg-[#1D2A40]/20 flex items-center justify-between text-xs text-on-surface-variant">
          <span>Press ESC or click outside to dismiss</span>
          <button
            onClick={() => {
              navigate('/items');
              onClose();
            }}
            className="text-primary dark:text-[#4D8DFF] font-medium hover:underline flex items-center gap-1"
          >
            <span>Open full catalog</span>
            <span className="material-symbols-outlined text-[14px]">open_in_new</span>
          </button>
        </div>
      </div>
    </div>
  );
};
