'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Filter,
  ChevronDown,
  ChevronUp,
  X,
  SortAsc,
  Check,
  Search,
} from 'lucide-react';

/** Si ya tenés FilterState en ../../types/filters, importalo y elimina esta definición */
export type FilterState = {
  selectedBrands: string[];
  selectedModels: string[];
  selectedEngines: string[];
  yearRange: { min: number; max: number };
  categoryId: string | null;
};

export interface ProductFiltersProps {
  filters: FilterState;
  onFilterChange: (patch: Partial<FilterState>) => void;

  // Facets del backend
  availableBrands: string[];
  availableModels: string[];
  availableEngines: string[];
  availableCategories: { id: string; name: string }[];

  // Sorting
  sortBy: 'name' | 'price' | 'brand' | 'year';
  sortOrder: 'asc' | 'desc';
  onSortChange: (sortBy: 'name' | 'price' | 'brand' | 'year') => void;

  // UI
  showFilters: boolean;
  onToggleFilters: () => void;
  onClearFilters: () => void;
  className?: string;
}

/* -------------------------- UI SUBCOMPONENTS -------------------------- */

type MultiSelectProps = {
  label: string;
  options: string[];
  selected: string[];
  onChange: (values: string[]) => void;
  placeholder?: string;
  className?: string;
};

const MultiSelect: React.FC<MultiSelectProps> = ({
  label,
  options,
  selected,
  onChange,
  placeholder = 'Todas',
  className = '',
}) => {
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState('');
  const ref = useRef<HTMLDivElement>(null);

  const filtered = useMemo(() => {
    if (!q.trim()) return options;
    const s = q.toLowerCase();
    return options.filter((o) => o.toLowerCase().includes(s));
  }, [options, q]);

  const toggle = (value: string) => {
    if (selected.includes(value)) {
      onChange(selected.filter((v) => v !== value));
    } else {
      onChange([...selected, value]);
    }
  };

  // Cerrar al clickear fuera
  useEffect(() => {
    const onClickOutside = (e: MouseEvent) => {
      if (!ref.current) return;
      if (!ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', onClickOutside);
    return () => document.removeEventListener('mousedown', onClickOutside);
  }, []);

  return (
    <div className={`relative ${className}`} ref={ref}>
      <label className="block text-sm font-semibold text-gray-700 mb-2">
        {label}
      </label>

      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md text-sm flex items-center justify-between hover:bg-gray-50"
      >
        <span className="truncate text-left">
          {selected.length
            ? `${selected.length} seleccionada${selected.length > 1 ? 's' : ''}`
            : placeholder}
        </span>
        <ChevronDown
          size={16}
          className={`ml-2 transition-transform ${open ? 'rotate-180' : ''}`}
        />
      </button>

      {open && (
        <div className="absolute z-50 mt-2 w-full bg-white border border-gray-200 rounded-lg shadow-xl">
          <div className="p-2 border-b">
            <div className="flex items-center gap-2 px-2 py-1 rounded-md bg-gray-50 border">
              <Search size={14} className="text-gray-400" />
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Buscar…"
                className="w-full bg-transparent text-sm outline-none"
              />
            </div>
          </div>

          <ul className="max-h-56 overflow-y-auto py-1">
            {filtered.length ? (
              filtered.map((opt) => {
                const isSel = selected.includes(opt);
                return (
                  <li key={opt}>
                    <button
                      type="button"
                      onClick={() => toggle(opt)}
                      className={`w-full px-3 py-2 text-left text-sm flex items-center justify-between hover:bg-gray-50 ${
                        isSel ? 'bg-blue-50 text-blue-700' : ''
                      }`}
                    >
                      <span className="truncate">{opt}</span>
                      {isSel && <Check size={16} />}
                    </button>
                  </li>
                );
              })
            ) : (
              <li className="px-3 py-3 text-sm text-gray-500">
                Sin opciones.
              </li>
            )}
          </ul>

          <div className="flex items-center justify-between px-3 py-2 border-t bg-gray-50 rounded-b-lg">
            <button
              type="button"
              onClick={() => onChange([])}
              className="text-xs text-gray-600 hover:text-gray-800"
            >
              Limpiar
            </button>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="text-xs text-blue-600 hover:text-blue-700"
            >
              Hecho
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

type SingleSelectProps = {
  label: string;
  value: string | null;
  onChange: (v: string | null) => void;
  options: { id: string; name: string }[];
  placeholder?: string;
  className?: string;
};

const SingleSelect: React.FC<SingleSelectProps> = ({
  label,
  value,
  onChange,
  options,
  placeholder = 'Todas',
  className = '',
}) => (
  <div className={className}>
    <label className="block text-sm font-semibold text-gray-700 mb-2">
      {label}
    </label>
    <select
      value={value ?? ''}
      onChange={(e) => onChange(e.target.value || null)}
      className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
    >
      <option value="">{placeholder}</option>
      {options.map((o) => (
        <option key={o.id} value={o.id}>
          {o.name}
        </option>
      ))}
    </select>
  </div>
);

/* ------------------------------ MAIN UI ------------------------------ */

const ProductFilters: React.FC<ProductFiltersProps> = ({
  filters,
  onFilterChange,
  availableBrands = [],
  availableModels = [],
  availableEngines = [],
  availableCategories = [],
  sortBy,
  sortOrder,
  onSortChange,
  showFilters,
  onToggleFilters,
  onClearFilters,
  className = '',
}) => {
  const currentYear = new Date().getFullYear();

  // Normalización para seguridad
  const f: FilterState = {
    selectedBrands: filters?.selectedBrands ?? [],
    selectedModels: filters?.selectedModels ?? [],
    selectedEngines: filters?.selectedEngines ?? [],
    yearRange:
      filters?.yearRange ?? ({ min: 1990, max: currentYear } as FilterState['yearRange']),
    categoryId: filters?.categoryId ?? null,
  };

  // Helpers
  const isYearActive = () =>
    f.yearRange.min > 1990 || f.yearRange.max < currentYear;

  const activeCount = () => {
    let c = 0;
    if (f.selectedBrands.length) c++;
    if (f.selectedModels.length) c++;
    if (f.selectedEngines.length) c++;
    if (f.categoryId) c++;
    if (isYearActive()) c++;
    return c;
  };

  const handleYearChange = (type: 'min' | 'max', value: number) => {
    const safe = Number.isFinite(value)
      ? value
      : type === 'min'
      ? 1990
      : currentYear;
    onFilterChange({ yearRange: { ...f.yearRange, [type]: safe } });
  };

  const resetYear = () =>
    onFilterChange({ yearRange: { min: 1990, max: currentYear } });

  return (
    <div className={className}>
      {/* Top row: toggle + sorting */}
      <div className="flex flex-col gap-4 mb-4">
        <div className="flex justify-between items-center">
          <button
            onClick={onToggleFilters}
            className={`px-4 py-2 rounded-lg border transition-colors flex items-center gap-2 ${
              showFilters
                ? 'bg-blue-100 border-blue-300 text-blue-700'
                : 'bg-white border-gray-300 hover:bg-gray-50'
            }`}
          >
            <Filter size={20} />
            Filtros
            {activeCount() > 0 && (
              <span className="bg-blue-600 text-white text-xs rounded-full px-2 py-1">
                {activeCount()}
              </span>
            )}
            {showFilters ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>

          <div className="flex flex-wrap gap-2 items-center">
            <span className="text-sm text-gray-600 mr-2">Ordenar por:</span>
            {([
              { key: 'name' as const, label: 'Nombre' },
              { key: 'brand' as const, label: 'Marca' },
              { key: 'year' as const, label: 'Año' },
            ]).map(({ key, label }) => (
              <button
                key={key}
                onClick={() => onSortChange(key)}
                className={`px-3 py-1 rounded-md text-sm font-medium transition-colors flex items-center gap-1 ${
                  sortBy === key
                    ? 'bg-blue-100 text-blue-700 border border-blue-200'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {label}
                {sortBy === key && (
                  <div className="flex items-center gap-1">
                    <SortAsc
                      size={14}
                      className={`transform ${
                        sortOrder === 'desc' ? 'rotate-180' : ''
                      }`}
                    />
                    <span className="text-xs">
                      {key === 'year'
                        ? sortOrder === 'asc'
                          ? 'Antiguo'
                          : 'Reciente'
                        : sortOrder === 'asc'
                        ? 'A-Z'
                        : 'Z-A'}
                    </span>
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Panel de filtros */}
      {showFilters && (
        <div className="bg-white border border-gray-200 rounded-xl p-4 mb-4 shadow-sm">
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
            <MultiSelect
              label="Marca"
              options={availableBrands}
              selected={f.selectedBrands}
              onChange={(values) => onFilterChange({ selectedBrands: values })}
            />

            <MultiSelect
              label="Modelo"
              options={availableModels}
              selected={f.selectedModels}
              onChange={(values) => onFilterChange({ selectedModels: values })}
            />

            <MultiSelect
              label="Motor"
              options={availableEngines}
              selected={f.selectedEngines}
              onChange={(values) => onFilterChange({ selectedEngines: values })}
            />

            <SingleSelect
              label="Categoría"
              value={f.categoryId}
              options={availableCategories}
              onChange={(v) => onFilterChange({ categoryId: v })}
            />

            {/* Año (ocupa dos columnas en desktop) */}
            <div className="md:col-span-2 xl:col-span-4">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Año del vehículo
              </label>
              <div className="flex items-center gap-3">
                <div className="flex-1">
                  <label className="block text-xs text-gray-500 mb-1">
                    Desde
                  </label>
                  <input
                    type="number"
                    value={f.yearRange.min}
                    onChange={(e) =>
                      handleYearChange('min', parseInt(e.target.value, 10))
                    }
                    min={1990}
                    max={currentYear}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="1990"
                  />
                </div>
                <span className="text-gray-400 mt-5">-</span>
                <div className="flex-1">
                  <label className="block text-xs text-gray-500 mb-1">
                    Hasta
                  </label>
                  <input
                    type="number"
                    value={f.yearRange.max}
                    onChange={(e) =>
                      handleYearChange('max', parseInt(e.target.value, 10))
                    }
                    min={1990}
                    max={currentYear}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder={String(currentYear)}
                  />
                </div>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Filtra repuestos compatibles con vehículos de estos años.
              </p>
            </div>
          </div>

          <div className="flex justify-end gap-2 mt-4">
            <button
              onClick={onClearFilters}
              className="px-3 py-1 text-sm text-gray-600 hover:text-gray-800 flex items-center gap-1"
            >
              <X size={14} /> Limpiar filtros
            </button>
          </div>
        </div>
      )}

      {/* Chips de filtros activos */}
      {activeCount() > 0 && (
        <div className="flex flex-wrap gap-2 mb-4">
          {f.selectedBrands.map((brand) => (
            <span
              key={brand}
              className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-sm flex items-center gap-1"
            >
              {brand}
              <button
                onClick={() =>
                  onFilterChange({
                    selectedBrands: f.selectedBrands.filter((b) => b !== brand),
                  })
                }
              >
                <X size={12} />
              </button>
            </span>
          ))}

          {f.selectedModels.map((model) => (
            <span
              key={model}
              className="bg-purple-100 text-purple-800 px-2 py-1 rounded-full text-sm flex items-center gap-1"
            >
              {model}
              <button
                onClick={() =>
                  onFilterChange({
                    selectedModels: f.selectedModels.filter((m) => m !== model),
                  })
                }
              >
                <X size={12} />
              </button>
            </span>
          ))}

          {f.selectedEngines.map((engine) => (
            <span
              key={engine}
              className="bg-amber-100 text-amber-800 px-2 py-1 rounded-full text-sm flex items-center gap-1"
            >
              {engine}
              <button
                onClick={() =>
                  onFilterChange({
                    selectedEngines: f.selectedEngines.filter((e) => e !== engine),
                  })
                }
              >
                <X size={12} />
              </button>
            </span>
          ))}

          {f.categoryId && (
            <span className="bg-emerald-100 text-emerald-800 px-2 py-1 rounded-full text-sm flex items-center gap-1">
              {availableCategories.find((c) => c.id === f.categoryId)?.name ||
                'Categoría'}
              <button onClick={() => onFilterChange({ categoryId: null })}>
                <X size={12} />
              </button>
            </span>
          )}

          {isYearActive() && (
            <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-sm flex items-center gap-1">
              {f.yearRange.min} - {f.yearRange.max}
              <button onClick={resetYear}>
                <X size={12} />
              </button>
            </span>
          )}
        </div>
      )}
    </div>
  );
};

export default ProductFilters;
