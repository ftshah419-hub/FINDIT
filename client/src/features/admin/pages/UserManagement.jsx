import React, { useState, useEffect } from 'react';
import adminService from '../services/adminService';
import Pagination from '../../../components/common/Pagination';
import ConfirmationModal from '../../../components/common/ConfirmationModal';
import { TableSkeleton } from '../../../components/common/LoadingSpinner';
import EmptyState from '../../../components/common/EmptyState';

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [page, setPage] = useState(1);

  // User detail drawer
  const [selectedUser, setSelectedUser] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [showDetailDrawer, setShowDetailDrawer] = useState(false);

  // Status toggle modal
  const [statusModalOpen, setStatusModalOpen] = useState(false);
  const [userToToggle, setUserToToggle] = useState(null);
  const [toggleReason, setToggleReason] = useState('');
  const [toggleLoading, setToggleLoading] = useState(false);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await adminService.getUsers({
        page,
        limit: 10,
        search,
        role: roleFilter,
        status: statusFilter,
      });
      setUsers(res.users);
      setPagination(res.pagination);
    } catch (err) {
      console.error('Error fetching users:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [page, roleFilter, statusFilter]);

  // Debounced search
  useEffect(() => {
    const handler = setTimeout(() => {
      setPage(1);
      fetchUsers();
    }, 400);
    return () => clearTimeout(handler);
  }, [search]);

  const handleOpenUserDetail = async (userId) => {
    try {
      setShowDetailDrawer(true);
      setDetailLoading(true);
      const res = await adminService.getUser(userId);
      setSelectedUser(res);
    } catch (err) {
      alert(err.message || 'Failed to load user details.');
      setShowDetailDrawer(false);
    } finally {
      setDetailLoading(false);
    }
  };

  const handleToggleStatus = async () => {
    if (!userToToggle) return;
    try {
      setToggleLoading(true);
      const newStatus = !userToToggle.isActive;
      await adminService.updateUserStatus(userToToggle._id, {
        isActive: newStatus,
        reason: toggleReason || (newStatus ? 'Account restored by admin' : 'Policy compliance review'),
      });
      setStatusModalOpen(false);
      setUserToToggle(null);
      setToggleReason('');
      await fetchUsers();
    } catch (err) {
      alert(err.message || 'Failed to update user status.');
    } finally {
      setToggleLoading(false);
    }
  };

  const handleExportCSV = () => {
    if (!users.length) return;
    const headers = ['User ID', 'Name', 'Email', 'Role', 'Status', 'Lost Reports', 'Found Reports', 'Claims Filed', 'Joined Date'];
    const rows = users.map((u) => [
      `"${u._id}"`,
      `"${u.name}"`,
      `"${u.email}"`,
      `"${u.role}"`,
      `"${u.isActive ? 'Active' : 'Suspended'}"`,
      u.totalLostReports || 0,
      u.totalFoundReports || 0,
      u.totalClaims || 0,
      `"${new Date(u.createdAt).toLocaleDateString()}"`,
    ]);
    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `findit-users-directory-${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Quick summary counts
  const totalCount = pagination?.total || users.length;
  const activeCount = users.filter((u) => u.isActive).length;
  const suspendedCount = users.filter((u) => !u.isActive).length;

  return (
    <div className="w-full px-4 sm:px-8 py-8 flex flex-col gap-6 max-w-7xl mx-auto">
      {/* Section Header & Metadata Bento Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-secondary-fixed dark:bg-secondary-container/40 text-on-secondary-fixed text-[11px] font-semibold tracking-wide uppercase">
              Identity & Governance
            </span>
            <span className="w-1.5 h-1.5 rounded-full bg-outline-variant"></span>
            <span className="font-code-tabular text-xs text-on-surface-variant uppercase">
              AUTH-SYS v2.4.9
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-on-surface tracking-tight">User Management</h1>
          <p className="text-sm text-on-surface-variant max-w-2xl">
            Manage verified campus members, staff custody officers, and student accounts. Review custody privilege delegations, claim audit histories, and enforce organizational policy.
          </p>
        </div>

        {/* Quick Metrics Ribbon */}
        <div className="flex items-center gap-4 bg-surface-container-low dark:bg-surface-container p-2.5 rounded-xl shadow-xs border border-outline-variant/30 dark:border-outline/20">
          <div className="px-2 py-1 flex flex-col">
            <span className="text-[10px] text-on-surface-variant uppercase tracking-wider font-semibold">Total Enrolled</span>
            <span className="text-sm font-bold text-on-surface font-code-tabular">{totalCount}</span>
          </div>
          <div className="w-px h-7 bg-surface-container-highest dark:bg-outline-variant/30"></div>
          <div className="px-2 py-1 flex flex-col">
            <span className="text-[10px] text-on-surface-variant uppercase tracking-wider font-semibold">Active Members</span>
            <span className="text-sm font-bold text-primary font-code-tabular">{activeCount}</span>
          </div>
          <div className="w-px h-7 bg-surface-container-highest dark:bg-outline-variant/30"></div>
          <div className="px-2 py-1 flex flex-col">
            <span className="text-[10px] text-error uppercase tracking-wider font-semibold">Suspended</span>
            <span className="text-sm font-bold text-error font-code-tabular">{suspendedCount}</span>
          </div>
        </div>
      </div>

      {/* Operational Action Bar */}
      <div className="bg-surface-container-lowest dark:bg-surface rounded-2xl p-4 shadow-xs border border-outline-variant/30 dark:border-outline/20 flex flex-col xl:flex-row gap-4 justify-between items-stretch xl:items-center">
        {/* Search Field with Filter Inputs */}
        <div className="flex-1 flex flex-col md:flex-row gap-3 items-stretch md:items-center">
          {/* Search Input */}
          <div className="relative flex-1 min-w-[260px]">
            <span className="material-symbols-outlined absolute left-3 top-2.5 text-on-surface-variant text-[20px]">
              search
            </span>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search users by name, campus email, student ID..."
              className="w-full h-10 pl-10 pr-9 rounded-lg bg-surface-container-low dark:bg-surface-container text-on-surface placeholder:text-outline text-xs outline-none focus:ring-2 focus:ring-primary/20 transition-all border border-outline-variant/30 dark:border-outline/20"
            />
            {search && (
              <button
                onClick={() => setSearch('')}
                className="absolute right-2.5 top-2.5 text-on-surface-variant hover:text-on-surface"
              >
                <span className="material-symbols-outlined text-[18px]">cancel</span>
              </button>
            )}
          </div>

          {/* Role Filter */}
          <div className="relative min-w-[150px]">
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="w-full h-10 px-3 pr-8 rounded-lg bg-surface-container-low dark:bg-surface-container text-on-surface text-xs appearance-none cursor-pointer outline-none focus:ring-2 focus:ring-primary/20 transition-all border border-outline-variant/30 dark:border-outline/20 font-medium"
            >
              <option value="all">Role: All Roles</option>
              <option value="user">Users / Students</option>
              <option value="admin">Administrators</option>
            </select>
            <span className="material-symbols-outlined absolute right-2.5 top-2.5 pointer-events-none text-on-surface-variant text-[20px]">
              expand_more
            </span>
          </div>

          {/* Status Filter */}
          <div className="relative min-w-[150px]">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full h-10 px-3 pr-8 rounded-lg bg-surface-container-low dark:bg-surface-container text-on-surface text-xs appearance-none cursor-pointer outline-none focus:ring-2 focus:ring-primary/20 transition-all border border-outline-variant/30 dark:border-outline/20 font-medium"
            >
              <option value="all">Status: All Statuses</option>
              <option value="active">Active Only</option>
              <option value="suspended">Suspended Only</option>
            </select>
            <span className="material-symbols-outlined absolute right-2.5 top-2.5 pointer-events-none text-on-surface-variant text-[20px]">
              filter_list
            </span>
          </div>
        </div>

        {/* Action Button Group */}
        <div className="flex items-center gap-2.5 self-end xl:self-auto">
          <button
            onClick={handleExportCSV}
            className="h-10 px-4 rounded-lg bg-surface-container-low dark:bg-surface-container hover:bg-surface-container text-on-surface text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-xs border border-outline-variant/30 dark:border-outline/20"
          >
            <span className="material-symbols-outlined text-[18px] text-secondary">file_download</span>
            <span>Export User Directory (CSV)</span>
          </button>
        </div>
      </div>

      {/* Applied Scopes & Active Status */}
      <div className="flex items-center justify-between flex-wrap gap-2 px-1 text-xs">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-[11px] text-on-surface-variant uppercase tracking-wider font-semibold">Active Filter:</span>
          {(roleFilter !== 'all' || statusFilter !== 'all' || search) && (
            <button
              onClick={() => {
                setRoleFilter('all');
                setStatusFilter('all');
                setSearch('');
              }}
              className="text-secondary hover:underline font-medium"
            >
              Reset all filters
            </button>
          )}
        </div>
        <div className="flex items-center gap-1.5 text-on-surface-variant text-xs">
          <span className="material-symbols-outlined text-[16px] text-emerald-600">verified_user</span>
          <span>Authentication sync with MongoDB Atlas: <strong>Operational</strong></span>
        </div>
      </div>

      {/* Users Table Container */}
      <div className="bg-surface-container-lowest dark:bg-surface rounded-2xl shadow-xs border border-outline-variant/30 dark:border-outline/20 overflow-hidden flex flex-col">
        {loading ? (
          <TableSkeleton rows={8} cols={7} />
        ) : users.length === 0 ? (
          <EmptyState
            icon="person_search"
            title="No users match your criteria"
            description="Try adjusting your search query, status or role filters."
            actionLabel="Clear Filters"
            onAction={() => {
              setSearch('');
              setRoleFilter('all');
              setStatusFilter('all');
            }}
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-surface-container-low dark:bg-surface-container text-on-surface-variant font-semibold uppercase tracking-wider text-[11px] border-b border-outline-variant/20">
                  <th className="py-3.5 px-4">User Identity</th>
                  <th className="py-3.5 px-4">Campus ID / Email</th>
                  <th className="py-3.5 px-4">Role &amp; Custody</th>
                  <th className="py-3.5 px-4">Joined Date</th>
                  <th className="py-3.5 px-4">Total Reports</th>
                  <th className="py-3.5 px-4">Claims Filed</th>
                  <th className="py-3.5 px-4">Account Status</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-container/60 dark:divide-outline/10 text-on-surface">
                {users.map((u) => (
                  <tr key={u._id} className="hover:bg-surface-container-low/50 dark:hover:bg-surface-container/40 transition-colors group">
                    <td className="py-3 px-4 min-w-[200px]">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full overflow-hidden bg-primary-fixed flex items-center justify-center shrink-0 border border-primary/20">
                          {u.profileImage ? (
                            <img src={u.profileImage} alt={u.name} className="w-full h-full object-cover" />
                          ) : (
                            <span className="material-symbols-outlined text-[18px] text-primary">person</span>
                          )}
                        </div>
                        <div className="flex flex-col min-w-0">
                          <button
                            onClick={() => handleOpenUserDetail(u._id)}
                            className="font-semibold text-on-surface truncate group-hover:text-primary transition-colors text-left"
                          >
                            {u.name}
                          </button>
                          <span className="text-[11px] text-on-surface-variant flex items-center gap-1">
                            <span className="material-symbols-outlined text-[13px] text-primary">school</span>
                            {u.role === 'ADMIN' ? 'Staff Administrator' : 'Verified Member'}
                          </span>
                        </div>
                      </div>
                    </td>

                    <td className="py-3 px-4">
                      <div className="flex flex-col">
                        <span className="font-code-tabular font-bold text-on-surface">
                          #USR-{u._id.toString().slice(-5).toUpperCase()}
                        </span>
                        <span className="text-[11px] text-on-surface-variant truncate">{u.email}</span>
                      </div>
                    </td>

                    <td className="py-3 px-4">
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-surface-container text-on-surface-variant font-medium text-[11px]">
                        <span className="material-symbols-outlined text-[14px]">badge</span>
                        {u.role}
                      </span>
                    </td>

                    <td className="py-3 px-4 whitespace-nowrap text-on-surface-variant font-code-tabular">
                      {new Date(u.createdAt).toLocaleDateString()}
                    </td>

                    <td className="py-3 px-4 whitespace-nowrap">
                      <div className="flex items-center gap-1.5 font-code-tabular">
                        <span className="px-2 py-0.5 rounded bg-error-container/40 text-on-error-container font-medium text-[11px]">
                          {u.totalLostReports || 0} Lost
                        </span>
                        <span className="px-2 py-0.5 rounded bg-primary-fixed/40 text-on-primary-fixed font-medium text-[11px]">
                          {u.totalFoundReports || 0} Found
                        </span>
                      </div>
                    </td>

                    <td className="py-3 px-4 whitespace-nowrap font-code-tabular font-semibold">
                      {u.totalClaims || 0}
                    </td>

                    <td className="py-3 px-4 whitespace-nowrap">
                      {u.isActive ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 font-semibold text-[11px]">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                          Active
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-error-container text-on-error-container font-semibold text-[11px]">
                          <span className="w-1.5 h-1.5 rounded-full bg-error"></span>
                          Suspended
                        </span>
                      )}
                    </td>

                    <td className="py-3 px-4 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => handleOpenUserDetail(u._id)}
                          className="p-1.5 rounded-lg hover:bg-surface-container text-on-surface-variant hover:text-on-surface transition-colors"
                          title="Inspect User Details"
                        >
                          <span className="material-symbols-outlined text-[18px]">visibility</span>
                        </button>
                        <button
                          onClick={() => {
                            setUserToToggle(u);
                            setStatusModalOpen(true);
                          }}
                          className={`p-1.5 rounded-lg transition-colors ${
                            u.isActive
                              ? 'hover:bg-error-container/30 text-on-surface-variant hover:text-error'
                              : 'hover:bg-emerald-500/10 text-emerald-600'
                          }`}
                          title={u.isActive ? 'Suspend User' : 'Activate User'}
                        >
                          <span className="material-symbols-outlined text-[18px]">
                            {u.isActive ? 'block' : 'check_circle'}
                          </span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <Pagination pagination={pagination} onPageChange={(p) => setPage(p)} />
      </div>

      {/* User Detail Drawer / Slide-Over */}
      {showDetailDrawer && (
        <div className="fixed inset-0 z-50 overflow-hidden bg-black/40 backdrop-blur-xs flex justify-end">
          <div className="w-full max-w-lg bg-surface-container-lowest dark:bg-surface h-full shadow-2xl border-l border-outline-variant/30 dark:border-outline/20 p-6 flex flex-col justify-between overflow-y-auto animate-in slide-in-from-right duration-200">
            {detailLoading ? (
              <div className="m-auto">
                <span className="w-8 h-8 border-3 border-primary/20 border-t-primary rounded-full animate-spin"></span>
              </div>
            ) : selectedUser ? (
              <div className="flex flex-col gap-6">
                {/* Header */}
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full overflow-hidden bg-primary-fixed flex items-center justify-center shrink-0 border border-primary/20">
                      {selectedUser.user?.profileImage ? (
                        <img src={selectedUser.user.profileImage} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <span className="material-symbols-outlined text-[24px] text-primary">person</span>
                      )}
                    </div>
                    <div>
                      <h2 className="text-base font-bold text-on-surface">{selectedUser.user?.name}</h2>
                      <p className="text-xs text-on-surface-variant">{selectedUser.user?.email}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setShowDetailDrawer(false)}
                    className="p-1 rounded-lg hover:bg-surface-container text-on-surface-variant"
                  >
                    <span className="material-symbols-outlined text-[20px]">close</span>
                  </button>
                </div>

                {/* Identity Attributes */}
                <div className="grid grid-cols-2 gap-3 p-3.5 rounded-xl bg-surface-container-low dark:bg-surface-container/50 text-xs">
                  <div>
                    <span className="text-[10px] text-on-surface-variant uppercase font-semibold">User Role</span>
                    <p className="font-semibold text-on-surface mt-0.5">{selectedUser.user?.role}</p>
                  </div>
                  <div>
                    <span className="text-[10px] text-on-surface-variant uppercase font-semibold">Account Status</span>
                    <p className="font-semibold text-on-surface mt-0.5">
                      {selectedUser.user?.isActive ? 'Active' : 'Suspended'}
                    </p>
                  </div>
                  <div>
                    <span className="text-[10px] text-on-surface-variant uppercase font-semibold">Phone</span>
                    <p className="font-semibold text-on-surface mt-0.5">{selectedUser.user?.phone || 'Not recorded'}</p>
                  </div>
                  <div>
                    <span className="text-[10px] text-on-surface-variant uppercase font-semibold">Email Verified</span>
                    <p className="font-semibold text-emerald-600 mt-0.5">
                      {selectedUser.user?.isEmailVerified ? 'Verified' : 'Pending'}
                    </p>
                  </div>
                </div>

                {/* Recent Items Submitted */}
                <div>
                  <h3 className="text-xs font-bold text-on-surface uppercase tracking-wider mb-2">
                    Recent Item Submissions ({selectedUser.recentItems?.length || 0})
                  </h3>
                  <div className="flex flex-col gap-2">
                    {selectedUser.recentItems?.length === 0 ? (
                      <p className="text-xs text-on-surface-variant">No items reported by this user.</p>
                    ) : (
                      selectedUser.recentItems?.map((item) => (
                        <div key={item._id} className="p-2.5 rounded-lg bg-surface-container-low dark:bg-surface-container flex items-center justify-between text-xs">
                          <div>
                            <span className="font-semibold text-on-surface">{item.title}</span>
                            <span className="text-[11px] text-on-surface-variant ml-2 font-code-tabular">
                              {new Date(item.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                          <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                            item.type === 'LOST' ? 'bg-error-container/40 text-on-error-container' : 'bg-primary-fixed/40 text-on-primary-fixed'
                          }`}>
                            {item.type} · {item.status}
                          </span>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                {/* Recent Claims Submitted */}
                <div>
                  <h3 className="text-xs font-bold text-on-surface uppercase tracking-wider mb-2">
                    Recent Claims Filed ({selectedUser.recentClaims?.length || 0})
                  </h3>
                  <div className="flex flex-col gap-2">
                    {selectedUser.recentClaims?.length === 0 ? (
                      <p className="text-xs text-on-surface-variant">No claims filed by this user.</p>
                    ) : (
                      selectedUser.recentClaims?.map((claim) => (
                        <div key={claim._id} className="p-2.5 rounded-lg bg-surface-container-low dark:bg-surface-container flex items-center justify-between text-xs">
                          <span className="font-semibold text-on-surface">{claim.itemId?.title || 'Item Claim'}</span>
                          <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-surface-container text-on-surface">
                            {claim.status}
                          </span>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            ) : null}

            <div className="pt-4 border-t border-outline-variant/30 dark:border-outline/20">
              <button
                onClick={() => setShowDetailDrawer(false)}
                className="w-full py-2 bg-surface-container hover:bg-surface-container-high text-on-surface rounded-lg text-xs font-semibold"
              >
                Close Drawer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Modal for User Activation/Suspension */}
      <ConfirmationModal
        isOpen={statusModalOpen}
        title={userToToggle?.isActive ? 'Suspend User Account' : 'Reactivate User Account'}
        message={
          userToToggle?.isActive
            ? `Are you sure you want to suspend ${userToToggle?.name} (${userToToggle?.email})? The user will immediately be barred from filing reports or accessing private claims.`
            : `Reactivate account for ${userToToggle?.name}? They will regain full platform privileges.`
        }
        confirmLabel={userToToggle?.isActive ? 'Suspend User' : 'Reactivate User'}
        isDestructive={userToToggle?.isActive}
        isLoading={toggleLoading}
        onConfirm={handleToggleStatus}
        onClose={() => {
          setStatusModalOpen(false);
          setUserToToggle(null);
          setToggleReason('');
        }}
      >
        <div className="flex flex-col gap-1 mt-2">
          <label className="text-xs font-semibold text-on-surface">Administrative Reason / Audit Note</label>
          <input
            type="text"
            value={toggleReason}
            onChange={(e) => setToggleReason(e.target.value)}
            placeholder="e.g., Multiple fraudulent ownership claims or verified identity restitution."
            className="w-full h-9 px-3 rounded-lg border border-outline-variant/40 dark:border-outline/30 bg-surface-container-low dark:bg-surface text-xs text-on-surface outline-none focus:ring-2 focus:ring-primary/20"
          />
        </div>
      </ConfirmationModal>
    </div>
  );
};

export default UserManagement;
