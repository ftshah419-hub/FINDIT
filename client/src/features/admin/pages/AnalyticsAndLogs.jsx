import React, { useState, useEffect } from 'react';
import adminService from '../services/adminService';
import Pagination from '../../../components/common/Pagination';
import { TableSkeleton } from '../../../components/common/LoadingSpinner';
import EmptyState from '../../../components/common/EmptyState';

const AnalyticsAndLogs = () => {
  const [logs, setLogs] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionFilter, setActionFilter] = useState('');
  const [entityFilter, setEntityFilter] = useState('');
  const [page, setPage] = useState(1);
  const [exporting, setExporting] = useState(false);

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const res = await adminService.getActivityLogs({
        page,
        limit: 15,
        action: actionFilter || undefined,
        entityType: entityFilter || undefined,
      });
      setLogs(res.logs);
      setPagination(res.pagination);
    } catch (err) {
      console.error('Error fetching activity logs:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [page, actionFilter, entityFilter]);

  const handleExportCSV = async () => {
    try {
      setExporting(true);
      const blob = await adminService.exportActivityLogs({
        action: actionFilter || undefined,
        entityType: entityFilter || undefined,
      });
      const url = window.URL.createObjectURL(new Blob([blob]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `findit-audit-logs-${Date.now()}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      alert(err.message || 'Failed to export activity logs.');
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="w-full px-4 sm:px-8 py-8 flex flex-col gap-6 max-w-7xl mx-auto">
      {/* Header Block */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center gap-2">
            <span className="font-code-tabular text-[11px] uppercase tracking-widest text-secondary font-semibold bg-surface-container-high dark:bg-surface-container px-2.5 py-0.5 rounded-full">
              Telemetry &amp; Compliance
            </span>
            <span className="inline-flex items-center gap-1 text-xs text-on-surface-variant font-code-tabular">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              Ledger Synchronized
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-on-surface tracking-tight">
            Analytics &amp; Activity Logs
          </h1>
          <p className="text-sm text-on-surface-variant max-w-2xl">
            Platform performance metrics, resolution velocity, and immutable system audit trails.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            disabled={exporting}
            onClick={handleExportCSV}
            className="h-10 px-4 bg-primary text-on-primary hover:bg-primary-container rounded-lg text-xs font-semibold flex items-center gap-2 shadow-xs transition-all active:scale-95 disabled:opacity-50"
          >
            <span className="material-symbols-outlined text-[18px]">download</span>
            <span>{exporting ? 'Generating Report...' : 'Export Audit Report (CSV)'}</span>
          </button>
        </div>
      </div>

      {/* Control Toolbar Panel */}
      <div className="bg-surface-container-lowest dark:bg-surface p-4 rounded-2xl shadow-xs border border-outline-variant/30 dark:border-outline/20 flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3 text-xs">
        <div className="flex flex-wrap items-center gap-3">
          {/* Action Filter */}
          <div className="relative min-w-[200px]">
            <select
              value={actionFilter}
              onChange={(e) => setActionFilter(e.target.value)}
              className="w-full h-10 px-3 pr-8 rounded-lg bg-surface-container-low dark:bg-surface-container text-on-surface text-xs appearance-none cursor-pointer outline-none focus:ring-2 focus:ring-primary/20 border border-outline-variant/30 dark:border-outline/20 font-medium"
            >
              <option value="">All Action Types</option>
              <option value="ITEM_REPORT_APPROVED">Item Report Approved</option>
              <option value="ITEM_REPORT_REJECTED">Item Report Rejected</option>
              <option value="CLAIM_APPROVED">Claim Approved</option>
              <option value="CLAIM_REJECTED">Claim Rejected</option>
              <option value="USER_ACTIVATED">User Activated</option>
              <option value="USER_SUSPENDED">User Suspended</option>
              <option value="CATEGORY_CREATED">Category Created</option>
              <option value="SETTING_UPDATED">Setting Updated</option>
            </select>
            <span className="material-symbols-outlined absolute right-2.5 top-1/2 -translate-y-1/2 text-[18px] pointer-events-none text-on-surface-variant">
              expand_more
            </span>
          </div>

          {/* Entity Filter */}
          <div className="relative min-w-[170px]">
            <select
              value={entityFilter}
              onChange={(e) => setEntityFilter(e.target.value)}
              className="w-full h-10 px-3 pr-8 rounded-lg bg-surface-container-low dark:bg-surface-container text-on-surface text-xs appearance-none cursor-pointer outline-none focus:ring-2 focus:ring-primary/20 border border-outline-variant/30 dark:border-outline/20 font-medium"
            >
              <option value="">All Entities</option>
              <option value="Item">Item</option>
              <option value="Claim">Claim</option>
              <option value="User">User</option>
              <option value="Category">Category</option>
              <option value="AIMatch">AI Match</option>
              <option value="SystemSetting">System Setting</option>
            </select>
            <span className="material-symbols-outlined absolute right-2.5 top-1/2 -translate-y-1/2 text-[18px] pointer-events-none text-on-surface-variant">
              expand_more
            </span>
          </div>

          {(actionFilter || entityFilter) && (
            <button
              onClick={() => {
                setActionFilter('');
                setEntityFilter('');
              }}
              className="text-secondary hover:underline font-semibold"
            >
              Reset Filters
            </button>
          )}
        </div>

        <div className="flex items-center gap-1.5 text-on-surface-variant text-xs">
          <span className="material-symbols-outlined text-[16px] text-emerald-600">verified</span>
          <span>Ledger: <strong>Zero Tampering Detected</strong></span>
        </div>
      </div>

      {/* Activity Logs Table */}
      <div className="bg-surface-container-lowest dark:bg-surface rounded-2xl shadow-xs border border-outline-variant/30 dark:border-outline/20 overflow-hidden flex flex-col">
        {loading ? (
          <TableSkeleton rows={8} cols={5} />
        ) : logs.length === 0 ? (
          <EmptyState
            icon="history"
            title="No activity logs found"
            description="No system administrative audit logs matching the chosen filter."
            actionLabel="Reset Filters"
            onAction={() => {
              setActionFilter('');
              setEntityFilter('');
            }}
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-surface-container-low dark:bg-surface-container text-on-surface-variant font-semibold uppercase tracking-wider text-[11px] border-b border-outline-variant/20">
                  <th className="py-3.5 px-4">Timestamp</th>
                  <th className="py-3.5 px-4">Action</th>
                  <th className="py-3.5 px-4">Actor</th>
                  <th className="py-3.5 px-4">Entity</th>
                  <th className="py-3.5 px-4">Description / Audit Trace</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-container/60 dark:divide-outline/10 text-on-surface">
                {logs.map((log) => (
                  <tr key={log._id} className="hover:bg-surface-container-low/50 dark:hover:bg-surface-container/40 transition-colors">
                    <td className="py-3 px-4 whitespace-nowrap font-code-tabular text-on-surface-variant">
                      {new Date(log.createdAt).toLocaleString()}
                    </td>

                    <td className="py-3 px-4 whitespace-nowrap">
                      <span className="px-2 py-0.5 rounded font-code-tabular font-bold text-[10px] bg-primary-fixed/40 text-on-primary-fixed">
                        {log.action}
                      </span>
                    </td>

                    <td className="py-3 px-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-on-surface">{log.actorId?.name || 'System'}</span>
                        <span className="text-[10px] text-on-surface-variant">({log.actorId?.role || 'AUTO'})</span>
                      </div>
                    </td>

                    <td className="py-3 px-4 whitespace-nowrap font-medium text-on-surface-variant">
                      {log.entityType}
                    </td>

                    <td className="py-3 px-4 text-on-surface leading-snug">
                      {log.description}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <Pagination pagination={pagination} onPageChange={(p) => setPage(p)} />
      </div>
    </div>
  );
};

export default AnalyticsAndLogs;
