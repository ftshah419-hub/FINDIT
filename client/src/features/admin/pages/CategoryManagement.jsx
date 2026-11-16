import React, { useState, useEffect } from 'react';
import adminService from '../services/adminService';
import ConfirmationModal from '../../../components/common/ConfirmationModal';
import { TableSkeleton } from '../../../components/common/LoadingSpinner';
import EmptyState from '../../../components/common/EmptyState';

const CategoryManagement = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  // Create / Edit Modal
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [isActive, setIsActive] = useState(true);
  const [saving, setSaving] = useState(false);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const res = await adminService.getCategories({ search });
      setCategories(res);
    } catch (err) {
      console.error('Error fetching categories:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, [search]);

  const handleOpenCreate = () => {
    setEditingCategory(null);
    setName('');
    setDescription('');
    setIsActive(true);
    setModalOpen(true);
  };

  const handleOpenEdit = (cat) => {
    setEditingCategory(cat);
    setName(cat.name);
    setDescription(cat.description || '');
    setIsActive(cat.isActive);
    setModalOpen(true);
  };

  const handleSaveCategory = async () => {
    if (!name.trim()) {
      alert('Please provide a category name.');
      return;
    }
    try {
      setSaving(true);
      if (editingCategory) {
        await adminService.updateCategory(editingCategory._id, {
          name: name.trim(),
          description: description.trim(),
          isActive,
        });
      } else {
        await adminService.createCategory({
          name: name.trim(),
          description: description.trim(),
        });
      }
      setModalOpen(false);
      await fetchCategories();
    } catch (err) {
      alert(err.message || 'Failed to save category.');
    } finally {
      setSaving(false);
    }
  };

  const handleToggleActive = async (cat) => {
    try {
      await adminService.updateCategory(cat._id, {
        isActive: !cat.isActive,
      });
      await fetchCategories();
    } catch (err) {
      alert(err.message || 'Failed to toggle category state.');
    }
  };

  return (
    <div className="w-full px-4 sm:px-8 py-8 flex flex-col gap-6 max-w-7xl mx-auto">
      {/* Header Block */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center gap-2">
            <span className="font-code-tabular text-[11px] uppercase tracking-widest text-primary font-semibold bg-primary/10 px-2.5 py-0.5 rounded-full">
              Taxonomy Governance
            </span>
            <span className="text-xs text-on-surface-variant font-code-tabular">
              Relational Category Graph
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-on-surface tracking-tight">
            Category Management
          </h1>
          <p className="text-sm text-on-surface-variant max-w-2xl">
            Maintain item classification taxonomy. Soft deactivation preserves relational integrity for historical lost and found reports.
          </p>
        </div>

        <button
          onClick={handleOpenCreate}
          className="h-10 px-4 bg-primary text-on-primary hover:bg-primary-container rounded-lg text-xs font-semibold flex items-center gap-2 shadow-xs transition-all active:scale-95 self-start md:self-auto"
        >
          <span className="material-symbols-outlined text-[18px]">add</span>
          <span>Create New Category</span>
        </button>
      </div>

      {/* Search Toolbar */}
      <div className="bg-surface-container-lowest dark:bg-surface p-4 rounded-2xl shadow-xs border border-outline-variant/30 dark:border-outline/20 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
        <div className="relative w-full sm:w-80">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[18px] text-on-surface-variant">
            search
          </span>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search categories by name..."
            className="w-full h-10 pl-9 pr-3 rounded-lg bg-surface-container-low dark:bg-surface-container text-on-surface text-xs outline-none focus:ring-2 focus:ring-primary/20 border border-outline-variant/30 dark:border-outline/20"
          />
        </div>
        <div className="text-on-surface-variant font-medium">
          Total Categories: <strong className="text-on-surface">{categories.length}</strong>
        </div>
      </div>

      {/* Categories Grid / Table */}
      <div className="bg-surface-container-lowest dark:bg-surface rounded-2xl shadow-xs border border-outline-variant/30 dark:border-outline/20 overflow-hidden flex flex-col">
        {loading ? (
          <TableSkeleton rows={5} cols={5} />
        ) : categories.length === 0 ? (
          <EmptyState
            icon="category"
            title="No categories found"
            description="Create your first catalog category to classify lost and found property."
            actionLabel="Create Category"
            onAction={handleOpenCreate}
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-surface-container-low dark:bg-surface-container text-on-surface-variant font-semibold uppercase tracking-wider text-[11px] border-b border-outline-variant/20">
                  <th className="py-3.5 px-4">Category Name</th>
                  <th className="py-3.5 px-4">Description</th>
                  <th className="py-3.5 px-4">Associated Items</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-container/60 dark:divide-outline/10 text-on-surface">
                {categories.map((cat) => (
                  <tr key={cat._id} className="hover:bg-surface-container-low/50 dark:hover:bg-surface-container/40 transition-colors">
                    <td className="py-3 px-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-primary"></span>
                        <span className="font-bold text-on-surface">{cat.name}</span>
                      </div>
                    </td>

                    <td className="py-3 px-4 text-on-surface-variant max-w-sm">
                      {cat.description || 'No description provided.'}
                    </td>

                    <td className="py-3 px-4 whitespace-nowrap">
                      <span className="font-code-tabular font-semibold text-primary px-2.5 py-0.5 rounded-full bg-primary-container/10">
                        {cat.itemCount || 0} Items
                      </span>
                    </td>

                    <td className="py-3 px-4 whitespace-nowrap">
                      {cat.isActive ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 font-semibold text-[11px]">
                          Active
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-surface-container text-on-surface-variant font-semibold text-[11px]">
                          Deactivated
                        </span>
                      )}
                    </td>

                    <td className="py-3 px-4 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => handleOpenEdit(cat)}
                          className="px-2.5 py-1 rounded-lg bg-surface-container hover:bg-surface-container-high text-on-surface text-xs font-semibold transition-colors"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleToggleActive(cat)}
                          className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors ${
                            cat.isActive
                              ? 'text-error hover:bg-error-container/30'
                              : 'text-emerald-600 hover:bg-emerald-500/10'
                          }`}
                        >
                          {cat.isActive ? 'Deactivate' : 'Activate'}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Create / Edit Modal */}
      <ConfirmationModal
        isOpen={modalOpen}
        title={editingCategory ? 'Edit Category' : 'Create New Category'}
        confirmLabel={editingCategory ? 'Save Changes' : 'Create Category'}
        isLoading={saving}
        onConfirm={handleSaveCategory}
        onClose={() => setModalOpen(false)}
      >
        <div className="flex flex-col gap-3 mt-2">
          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold text-on-surface">Category Name *</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Electronics & Gadgets"
              className="w-full h-9 px-3 rounded-lg border border-outline-variant/40 dark:border-outline/30 bg-surface-container-low dark:bg-surface text-xs text-on-surface outline-none"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold text-on-surface">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Description of item types included under this classification..."
              className="w-full h-16 p-2 rounded-lg border border-outline-variant/40 dark:border-outline/30 bg-surface-container-low dark:bg-surface text-xs text-on-surface outline-none"
            ></textarea>
          </div>

          {editingCategory && (
            <div className="flex items-center gap-2 mt-1">
              <input
                type="checkbox"
                id="activeToggle"
                checked={isActive}
                onChange={(e) => setIsActive(e.target.checked)}
                className="w-4 h-4 rounded text-primary focus:ring-primary/20"
              />
              <label htmlFor="activeToggle" className="text-xs text-on-surface font-medium cursor-pointer">
                Category is actively selectable in report forms
              </label>
            </div>
          )}
        </div>
      </ConfirmationModal>
    </div>
  );
};

export default CategoryManagement;
