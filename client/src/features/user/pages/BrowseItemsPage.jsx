import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { itemService } from '../services/itemService';
import { CAMPUS_ZONES } from '../../../constants/index.js';

export const BrowseItemsPage = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  // Filters State from URL query or defaults
  const typeFilter = searchParams.get('type') || 'all';
  const categoryFilter = searchParams.get('category') || 'all';
  const zoneFilter = searchParams.get('campusZone') || 'all';
  const timeWindow = searchParams.get('timeWindow') || 'all';
  const searchKeyword = searchParams.get('search') || '';
  const currentPage = parseInt(searchParams.get('page'), 10) || 1;

  const [searchInput, setSearchInput] = useState(searchKeyword);
  const [items, setItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [counts, setCounts] = useState({ all: 0, lost: 0, found: 0 });
  const [pagination, setPagination] = useState({ totalPages: 1, totalItems: 0, currentPage: 1 });
  const [loading, setLoading] = useState(true);
  const [bookmarkedIds, setBookmarkedIds] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('findit_bookmarks') || '[]');
    } catch {
      return [];
    }
  });

  // Load Categories once
  useEffect(() => {
    const fetchCats = async () => {
      try {
        const res = await itemService.getCategories();
        setCategories(res.data || []);
      } catch (err) {
        console.error('Failed to load categories:', err);
      }
    };
    fetchCats();
  }, []);

  // Fetch Items matching filter
  const fetchItems = useCallback(async () => {
    try {
      setLoading(true);
      const params = {
        type: typeFilter,
        category: categoryFilter,
        campusZone: zoneFilter,
        timeWindow,
        search: searchKeyword,
        page: currentPage,
        limit: 9,
      };
      const res = await itemService.getPublicItems(params);
      if (res.data) {
        setItems(res.data.items || []);
        setPagination(res.data.pagination || { totalPages: 1, totalItems: 0, currentPage: 1 });
        setCounts(res.data.counts || { all: 0, lost: 0, found: 0 });
      }
    } catch (err) {
      console.error('Failed to load catalog items:', err);
    } finally {
      setLoading(false);
    }
  }, [typeFilter, categoryFilter, zoneFilter, timeWindow, searchKeyword, currentPage]);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  const updateParam = (key, value) => {
    const next = new URLSearchParams(searchParams);
    if (value && value !== 'all') {
      next.set(key, value);
    } else {
      next.delete(key);
    }
    next.set('page', '1'); // Reset to page 1 on filter change
    setSearchParams(next);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    updateParam('search', searchInput.trim());
  };

  const clearAllFilters = () => {
    setSearchInput('');
    setSearchParams({});
  };

  const toggleBookmark = (e, id) => {
    e.stopPropagation();
    setBookmarkedIds((prev) => {
      const next = prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id];
      localStorage.setItem('findit_bookmarks', JSON.stringify(next));
      return next;
    });
  };

  const activeFilters = [];
  if (categoryFilter !== 'all') {
    const cat = categories.find((c) => c._id === categoryFilter);
    activeFilters.push({ key: 'category', label: `Category: ${cat?.name || categoryFilter}` });
  }
  if (zoneFilter !== 'all') {
    activeFilters.push({ key: 'campusZone', label: `Zone: ${zoneFilter}` });
  }
  if (timeWindow !== 'all') {
    activeFilters.push({ key: 'timeWindow', label: `Time: Last ${timeWindow.replace('last', '')} Days` });
  }
  if (searchKeyword) {
    activeFilters.push({ key: 'search', label: `Keyword: "${searchKeyword}"` });
  }

  return (
    <div className="flex flex-col w-full gap-space-xl pb-space-2xl">
      {/* Top Intro Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-space-md">
        <div className="flex flex-col gap-space-xs max-w-2xl">
          <div className="flex items-center gap-space-xs">
            <span className="inline-flex items-center justify-center w-2 h-2 rounded-full bg-primary dark:bg-[#4D8DFF] animate-pulse"></span>
            <span className="font-label-md text-label-md text-primary dark:text-[#4D8DFF] tracking-wider uppercase font-semibold">
              Live Institutional Registry
            </span>
          </div>
          <h1 className="font-display text-display text-on-surface dark:text-[#F8FAFC] tracking-tight font-bold">
            Browse Lost & Found Directory
          </h1>
          <p className="font-body-lg text-body-lg text-on-surface-variant dark:text-[#A8B5CA]">
            Search verified items discovered across campus, departments, and transit facilities.
          </p>
        </div>

        {/* Quick Status Counter Bar */}
        <div className="flex items-center gap-space-sm bg-surface-container dark:bg-[#1D2A40] p-1 rounded-xl shrink-0 self-start md:self-auto border border-outline-variant/30 dark:border-[#29364A]">
          <button
            onClick={() => updateParam('type', 'all')}
            className={`px-space-md py-2 rounded-lg font-label-lg text-label-lg transition-all ${
              typeFilter === 'all'
                ? 'bg-surface-container-lowest dark:bg-[#151F30] text-primary dark:text-[#4D8DFF] font-semibold shadow-sm'
                : 'text-on-surface-variant dark:text-[#A8B5CA] hover:text-on-surface dark:hover:text-[#F8FAFC]'
            }`}
          >
            All Items{' '}
            <span className="ml-1 text-on-surface-variant dark:text-[#A8B5CA] font-code-tabular text-label-sm px-1.5 py-0.5 rounded-full bg-surface-container-high dark:bg-[#29364A]">
              {counts.all}
            </span>
          </button>
          <button
            onClick={() => updateParam('type', 'lost')}
            className={`px-space-md py-2 rounded-lg font-label-lg text-label-lg transition-all ${
              typeFilter === 'lost'
                ? 'bg-surface-container-lowest dark:bg-[#151F30] text-primary dark:text-[#4D8DFF] font-semibold shadow-sm'
                : 'text-on-surface-variant dark:text-[#A8B5CA] hover:text-on-surface dark:hover:text-[#F8FAFC]'
            }`}
          >
            Lost Belongings{' '}
            <span className="ml-1 text-on-surface-variant dark:text-[#A8B5CA] font-code-tabular text-label-sm px-1.5 py-0.5 rounded-full bg-surface-container-high dark:bg-[#29364A]">
              {counts.lost}
            </span>
          </button>
          <button
            onClick={() => updateParam('type', 'found')}
            className={`px-space-md py-2 rounded-lg font-label-lg text-label-lg transition-all ${
              typeFilter === 'found'
                ? 'bg-surface-container-lowest dark:bg-[#151F30] text-primary dark:text-[#4D8DFF] font-semibold shadow-sm'
                : 'text-on-surface-variant dark:text-[#A8B5CA] hover:text-on-surface dark:hover:text-[#F8FAFC]'
            }`}
          >
            Found Items{' '}
            <span className="ml-1 text-on-surface-variant dark:text-[#A8B5CA] font-code-tabular text-label-sm px-1.5 py-0.5 rounded-full bg-surface-container-high dark:bg-[#29364A]">
              {counts.found}
            </span>
          </button>
        </div>
      </div>

      {/* Search & Filter Console */}
      <div className="flex flex-col gap-space-md p-space-lg bg-surface-container-lowest dark:bg-[#151F30] rounded-xl shadow-sm border border-outline-variant/40 dark:border-[#29364A]">
        <form onSubmit={handleSearchSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-space-md items-center">
          {/* Search Input */}
          <div className="lg:col-span-5 relative">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant dark:text-[#A8B5CA] text-[20px]">
              search
            </span>
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Search by keyword, brand, color, serial number..."
              className="w-full h-11 pl-10 pr-space-md rounded-lg bg-surface-container-low dark:bg-[#1D2A40] font-body-md text-body-md text-on-surface dark:text-[#F8FAFC] placeholder:text-on-surface-variant/70 focus:outline-none focus:ring-2 focus:ring-primary/20 dark:focus:ring-[#4D8DFF]/20 transition-all border border-outline-variant/30 dark:border-[#29364A]"
            />
          </div>

          {/* Category Filter */}
          <div className="lg:col-span-2 relative">
            <select
              value={categoryFilter}
              onChange={(e) => updateParam('category', e.target.value)}
              className="w-full h-11 px-space-md pr-8 rounded-lg bg-surface-container-low dark:bg-[#1D2A40] text-on-surface dark:text-[#F8FAFC] font-label-lg text-label-lg appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all border border-outline-variant/30 dark:border-[#29364A]"
            >
              <option value="all">All Categories</option>
              {categories.map((c) => (
                <option key={c._id} value={c._id}>
                  {c.name}
                </option>
              ))}
            </select>
            <span className="material-symbols-outlined absolute right-2.5 top-1/2 -translate-y-1/2 text-on-surface-variant pointer-events-none text-[18px]">
              expand_more
            </span>
          </div>

          {/* Campus Zone Filter */}
          <div className="lg:col-span-2 relative">
            <select
              value={zoneFilter}
              onChange={(e) => updateParam('campusZone', e.target.value)}
              className="w-full h-11 px-space-md pr-8 rounded-lg bg-surface-container-low dark:bg-[#1D2A40] text-on-surface dark:text-[#F8FAFC] font-label-lg text-label-lg appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all border border-outline-variant/30 dark:border-[#29364A]"
            >
              <option value="all">All Campus Zones</option>
              {CAMPUS_ZONES.map((zone) => (
                <option key={zone} value={zone}>
                  {zone}
                </option>
              ))}
            </select>
            <span className="material-symbols-outlined absolute right-2.5 top-1/2 -translate-y-1/2 text-on-surface-variant pointer-events-none text-[18px]">
              expand_more
            </span>
          </div>

          {/* Time Window Filter */}
          <div className="lg:col-span-2 relative">
            <select
              value={timeWindow}
              onChange={(e) => updateParam('timeWindow', e.target.value)}
              className="w-full h-11 px-space-md pr-8 rounded-lg bg-surface-container-low dark:bg-[#1D2A40] text-on-surface dark:text-[#F8FAFC] font-label-lg text-label-lg appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all border border-outline-variant/30 dark:border-[#29364A]"
            >
              <option value="all">All Time</option>
              <option value="7d">Last 7 Days</option>
              <option value="30d">Last 30 Days</option>
              <option value="90d">Last 90 Days</option>
            </select>
            <span className="material-symbols-outlined absolute right-2.5 top-1/2 -translate-y-1/2 text-on-surface-variant pointer-events-none text-[18px]">
              expand_more
            </span>
          </div>

          {/* Reset / Clear */}
          <div className="lg:col-span-1 flex justify-end">
            <button
              type="button"
              onClick={clearAllFilters}
              className="w-full lg:w-11 h-11 flex items-center justify-center rounded-lg bg-surface-container dark:bg-[#1D2A40] hover:bg-surface-container-high text-on-surface-variant dark:text-[#A8B5CA] transition-colors"
              title="Clear Filters"
            >
              <span className="material-symbols-outlined text-[20px]">filter_alt_off</span>
            </button>
          </div>
        </form>

        {/* Active Tags Row */}
        {activeFilters.length > 0 && (
          <div className="flex flex-wrap items-center gap-space-xs pt-space-xs border-t border-outline-variant/20 dark:border-[#29364A]">
            <span className="font-label-sm text-label-sm text-on-surface-variant dark:text-[#A8B5CA] font-medium pr-space-xs">
              Active Filters:
            </span>
            {activeFilters.map((af) => (
              <span
                key={af.key}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-surface-container-low dark:bg-[#1D2A40] text-on-surface dark:text-[#F8FAFC] font-label-sm text-label-sm border border-outline-variant/30 dark:border-[#29364A]"
              >
                {af.label}
                <span
                  onClick={() => updateParam(af.key, 'all')}
                  className="material-symbols-outlined text-[14px] cursor-pointer hover:text-error"
                >
                  close
                </span>
              </span>
            ))}
            <button
              onClick={clearAllFilters}
              className="text-primary dark:text-[#4D8DFF] hover:underline font-label-sm text-label-sm ml-space-xs font-semibold"
            >
              Reset all
            </button>
          </div>
        )}
      </div>

      {/* Catalog Grid Section */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-space-lg">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div
              key={i}
              className="h-96 rounded-xl bg-surface-container-low dark:bg-[#151F30] animate-pulse border border-outline-variant/30 dark:border-[#29364A]"
            ></div>
          ))}
        </div>
      ) : items.length === 0 ? (
        <div className="p-16 bg-surface-container-lowest dark:bg-[#151F30] rounded-xl text-center border border-outline-variant/40 dark:border-[#29364A]">
          <span className="material-symbols-outlined text-[54px] text-outline mb-3">
            search_off
          </span>
          <h3 className="font-headline-sm text-on-surface dark:text-[#F8FAFC] font-bold">
            No matching items found
          </h3>
          <p className="font-body-md text-on-surface-variant dark:text-[#A8B5CA] max-w-md mx-auto mt-1">
            Try adjusting your search criteria or clearing active filters to browse the complete registry.
          </p>
          <button
            onClick={clearAllFilters}
            className="mt-6 px-6 py-2.5 rounded-lg bg-primary text-on-primary font-label-lg font-semibold hover:bg-primary-container transition-all"
          >
            Clear All Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-space-lg">
          {items.map((item) => (
            <div
              key={item._id}
              onClick={() => navigate(`/items/${item._id}`)}
              className="group flex flex-col bg-surface-container-lowest dark:bg-[#151F30] rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-200 border border-outline-variant/40 dark:border-[#29364A] cursor-pointer"
            >
              <div className="relative h-52 w-full overflow-hidden bg-surface-container-low dark:bg-[#1D2A40]">
                <img
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  src={
                    item.images?.[0]?.url ||
                    'https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=600&q=80'
                  }
                  alt={item.title}
                />
                <div className="absolute top-3 left-3">
                  <span
                    className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-label-sm font-label-sm font-semibold backdrop-blur-md ${
                      item.type === 'FOUND'
                        ? 'text-[#16845B] bg-[#16845B]/15'
                        : 'text-[#B7791F] bg-[#B7791F]/15'
                    }`}
                  >
                    <span
                      className={`w-1.5 h-1.5 rounded-full ${
                        item.type === 'FOUND' ? 'bg-[#16845B]' : 'bg-[#B7791F]'
                      }`}
                    ></span>{' '}
                    {item.type}
                  </span>
                </div>
                <div className="absolute top-3 right-3 bg-surface-container-lowest/90 dark:bg-[#151F30]/90 backdrop-blur-md px-2 py-0.5 rounded text-on-surface-variant dark:text-[#A8B5CA] font-code-tabular text-label-sm font-medium">
                  #{item._id.toString().slice(-4).toUpperCase()}
                </div>
              </div>

              <div className="p-space-lg flex flex-col flex-1 justify-between gap-space-md">
                <div className="flex flex-col gap-space-xs">
                  <div className="flex items-center justify-between text-on-surface-variant dark:text-[#A8B5CA] font-label-sm text-label-sm">
                    <span className="uppercase font-semibold tracking-wider text-secondary dark:text-[#4D8DFF]">
                      {item.categoryId?.name || 'General Item'}
                    </span>
                    <span className="font-code-tabular">
                      {new Date(item.itemDate).toLocaleDateString([], {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </span>
                  </div>
                  <h3 className="font-title-md text-title-md text-on-surface dark:text-[#F8FAFC] font-semibold group-hover:text-primary dark:group-hover:text-[#4D8DFF] transition-colors line-clamp-1">
                    {item.title}
                  </h3>
                  <p className="font-body-sm text-body-sm text-on-surface-variant dark:text-[#A8B5CA] line-clamp-2">
                    {item.description}
                  </p>
                </div>

                <div className="flex flex-col gap-space-md pt-space-xs">
                  <div className="flex items-center gap-space-xs text-on-surface-variant dark:text-[#A8B5CA] font-label-md text-label-md">
                    <span className="material-symbols-outlined text-[16px] text-primary dark:text-[#4D8DFF]">
                      pin_drop
                    </span>
                    <span className="truncate">{item.location?.name}</span>
                  </div>
                  <div className="flex items-center gap-space-sm pt-space-xs">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/items/${item._id}`);
                      }}
                      className="flex-1 py-2 px-space-md rounded-lg bg-primary hover:bg-primary-container text-on-primary font-label-lg text-label-lg transition-colors text-center font-medium shadow-sm"
                    >
                      View Details
                    </button>
                    <button
                      onClick={(e) => toggleBookmark(e, item._id)}
                      className={`p-2 rounded-lg bg-surface-container-low dark:bg-[#1D2A40] hover:bg-surface-container text-on-surface-variant transition-colors ${
                        bookmarkedIds.includes(item._id) ? 'text-primary dark:text-[#4D8DFF]' : ''
                      }`}
                      title="Bookmark Item"
                    >
                      <span className="material-symbols-outlined text-[20px]">
                        {bookmarkedIds.includes(item._id) ? 'bookmark' : 'bookmark_border'}
                      </span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination Controls */}
      {pagination.totalPages > 1 && (
        <div className="flex items-center justify-between pt-space-lg border-t border-outline-variant/30 dark:border-[#29364A]">
          <span className="font-body-sm text-body-sm text-on-surface-variant dark:text-[#A8B5CA]">
            Showing page {pagination.currentPage} of {pagination.totalPages} ({pagination.totalItems} total items)
          </span>
          <div className="flex items-center gap-2">
            <button
              disabled={pagination.currentPage <= 1}
              onClick={() => updateParam('page', String(pagination.currentPage - 1))}
              className="px-3 py-1.5 rounded-lg bg-surface-container-lowest dark:bg-[#151F30] border border-outline-variant/40 dark:border-[#29364A] text-on-surface dark:text-[#F8FAFC] font-label-md disabled:opacity-50 transition-colors"
            >
              Previous
            </button>
            {Array.from({ length: pagination.totalPages }).map((_, idx) => {
              const p = idx + 1;
              return (
                <button
                  key={p}
                  onClick={() => updateParam('page', String(p))}
                  className={`w-9 h-9 rounded-lg font-label-md text-label-md transition-colors ${
                    pagination.currentPage === p
                      ? 'bg-primary text-on-primary font-semibold'
                      : 'bg-surface-container-lowest dark:bg-[#151F30] border border-outline-variant/40 dark:border-[#29364A] text-on-surface dark:text-[#F8FAFC]'
                  }`}
                >
                  {p}
                </button>
              );
            })}
            <button
              disabled={pagination.currentPage >= pagination.totalPages}
              onClick={() => updateParam('page', String(pagination.currentPage + 1))}
              className="px-3 py-1.5 rounded-lg bg-surface-container-lowest dark:bg-[#151F30] border border-outline-variant/40 dark:border-[#29364A] text-on-surface dark:text-[#F8FAFC] font-label-md disabled:opacity-50 transition-colors"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
