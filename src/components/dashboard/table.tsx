"use client";

import Image, { StaticImageData } from "next/image";
import React, { useState, useRef, useEffect } from "react";
import { LeftIcon } from "../icons";
import { Avatar1, Avatar2, Avatar3, Avatar4, Avatar5 } from "@/lib/assets";

interface UserCellProps {
  name: string;
  avatar: StaticImageData;
}

interface TableRow {
  id: number;
  name: { name: string; avatar: StaticImageData };
  product: string;
  email: string;
  credits: string;
  runtime: string;
  tags: string[];
}

type EditableField = "product" | "email" | "credits" | "runtime";

interface EditingCell {
  rowId: number;
  field: EditableField;
}

const ALL_TAGS = [
  "Frontend",
  "Backend",
  "Design",
  "PM",
  "DevOps",
  "QA",
  "Data",
  "Mobile",
];

const TAG_COLORS: Record<string, { bg: string; text: string }> = {
  Frontend: { bg: "#EEF4FF", text: "#3B82F6" },
  Backend: { bg: "#FFF7ED", text: "#F97316" },
  Design: { bg: "#F0FDF4", text: "#22C55E" },
  PM: { bg: "#FAF5FF", text: "#A855F7" },
  DevOps: { bg: "#FFF1F2", text: "#F43F5E" },
  QA: { bg: "#FEFCE8", text: "#CA8A04" },
  Data: { bg: "#F0FDFA", text: "#14B8A6" },
  Mobile: { bg: "#FDF2F8", text: "#EC4899" },
};

const DEFAULT_TAG_COLOR = { bg: "#F3F4F6", text: "#6B7280" };

function Tag({ label, onRemove }: { label: string; onRemove?: () => void }) {
  const color = TAG_COLORS[label] ?? DEFAULT_TAG_COLOR;
  return (
    <span
      className="inline-flex items-center gap-1 rounded-sm px-2.5 py-1.5 text-xs font-medium whitespace-nowrap"
      style={{ backgroundColor: color.bg, color: color.text }}
    >
      {label}
      {onRemove && (
        <button
          onClick={onRemove}
          className="ml-0.5 rounded-full hover:bg-black/10 size-3.5 inline-flex items-center justify-center transition-colors"
        >
          <svg width="8" height="8" viewBox="0 0 8 8" fill="none">
            <path
              d="M6 2L2 6M2 2l4 4"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
          </svg>
        </button>
      )}
    </span>
  );
}

function TagCell({
  tags,
  isEditing,
  onDoubleClick,
  onRemoveTag,
  onAddTag,
}: {
  tags: string[];
  isEditing: boolean;
  onDoubleClick: () => void;
  onRemoveTag: (tag: string) => void;
  onAddTag: (tag: string) => void;
}) {
  const cellRef = useRef<HTMLDivElement>(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const availableTags = ALL_TAGS.filter((t) => !tags.includes(t));

  useEffect(() => {
    if (isEditing) {
      setDropdownOpen(true);
    } else {
      setDropdownOpen(false);
    }
  }, [isEditing]);

  return (
    <div
      ref={cellRef}
      className="relative"
      onDoubleClick={!isEditing ? onDoubleClick : undefined}
    >
      <div className="flex flex-wrap items-center gap-1.5">
        {tags.map((tag) => (
          <Tag
            key={tag}
            label={tag}
            onRemove={isEditing ? () => onRemoveTag(tag) : undefined}
          />
        ))}
        {isEditing && availableTags.length > 0 && (
          <button
            onClick={() => setDropdownOpen((v) => !v)}
            className="inline-flex items-center justify-center size-5 rounded-full border border-dashed border-gray-300 text-gray-400 hover:border-gray-400 hover:text-gray-500 transition-colors"
          >
            <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
              <path
                d="M5 1v8M1 5h8"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
            </svg>
          </button>
        )}
      </div>

      {isEditing && dropdownOpen && availableTags.length > 0 && (
        <div
          className="absolute top-full left-0 mt-1.5 bg-white rounded-lg border border-gray-200 py-1 z-50 min-w-[140px]"
          style={{ boxShadow: "0 4px 16px rgba(0,0,0,0.1)" }}
        >
          {availableTags.map((tag) => {
            const color = TAG_COLORS[tag] ?? DEFAULT_TAG_COLOR;
            return (
              <button
                key={tag}
                onClick={() => {
                  onAddTag(tag);
                  setDropdownOpen(false);
                }}
                className="w-full px-3 py-1.5 text-left text-xs font-medium hover:bg-gray-50 flex items-center gap-2 transition-colors"
              >
                <span
                  className="size-2 rounded-full"
                  style={{ backgroundColor: color.text }}
                />
                {tag}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

const initialData: TableRow[] = [
  {
    id: 1,
    name: { name: "Raji Oladeji", avatar: Avatar1 },
    product: "ChatGpt",
    email: "raji@gmail.com",
    credits: "30,000 Credits",
    runtime: "240h",
    tags: ["Frontend", "DevOps"],
  },
  {
    id: 2,
    name: { name: "John Doe", avatar: Avatar2 },
    product: "Claude",
    email: "john@gmail.com",
    credits: "25,000 Credits",
    runtime: "180h",
    tags: ["Backend", "Data"],
  },
  {
    id: 3,
    name: { name: "Jane Smith", avatar: Avatar3 },
    product: "Gemini",
    email: "jane@gmail.com",
    credits: "45,000 Credits",
    runtime: "320h",
    tags: ["Design", "Frontend"],
  },
  {
    id: 4,
    name: { name: "Mike Johnson", avatar: Avatar4 },
    product: "ChatGpt",
    email: "mike@gmail.com",
    credits: "18,000 Credits",
    runtime: "120h",
    tags: ["PM"],
  },
  {
    id: 5,
    name: { name: "Sarah Wilson", avatar: Avatar5 },
    product: "Claude",
    email: "sarah@gmail.com",
    credits: "52,000 Credits",
    runtime: "400h",
    tags: ["Frontend", "QA", "Mobile"],
  },
];

const AvatarHeader = () => {
  return (
    <div className="flex items-center gap-1">
      <button
        className="rounded-sm size-7 bg-white flex items-center justify-center"
        style={{ boxShadow: "0px 0px 0px 1px #D2D2D240" }}
      >
        <LeftIcon />
      </button>
      <button
        className="rounded-sm size-7 bg-white flex items-center justify-center rotate-180"
        style={{ boxShadow: "0px 0px 0px 1px #D2D2D240" }}
      >
        <LeftIcon />
      </button>
    </div>
  );
};

const UserCell = ({ name, avatar }: UserCellProps) => {
  return (
    <div className="flex items-center gap-3">
      <Image
        src={avatar}
        alt={name}
        width={28}
        height={28}
        className="rounded-full object-cover"
      />
      <span>{name}</span>
    </div>
  );
};

const tableHeaders = [
  { id: 1, content: <AvatarHeader /> },
  { id: 2, content: "Product" },
  { id: 3, content: "Email" },
  { id: 4, content: "Total credits Used" },
  { id: 5, content: "Runtime" },
  { id: 6, content: "Tags" },
];

function EditableCell({
  value,
  isEditing,
  isRowLoading,
  onDoubleClick,
  onSubmit,
  onCancel,
}: {
  value: string;
  isEditing: boolean;
  isRowLoading: boolean;
  onDoubleClick: () => void;
  onSubmit: (value: string) => void;
  onCancel: () => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [draft, setDraft] = useState(value);

  useEffect(() => {
    if (isEditing) {
      setDraft(value);
      requestAnimationFrame(() => inputRef.current?.focus());
    }
  }, [isEditing, value]);

  return (
    <div className="relative">
      <span
        onDoubleClick={isRowLoading ? undefined : onDoubleClick}
        className={`block cursor-default select-none rounded px-2 py-1 transition-colors ${
          isEditing ? "invisible" : isRowLoading ? "" : "hover:bg-gray-100"
        }`}
      >
        {value}
      </span>

      {isEditing && !isRowLoading && (
        <input
          ref={inputRef}
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              onSubmit(draft);
            } else if (e.key === "Escape") {
              onCancel();
            }
          }}
          onBlur={() => onSubmit(draft)}
          className="absolute inset-0 bg-[#F1F1F1] rounded-[8px] px-2 py-1 text-base font-medium text-[#4E5356] outline-none  w-full"
        />
      )}
    </div>
  );
}

const Table = () => {
  const [rows, setRows] = useState<TableRow[]>(initialData);
  const [editingCell, setEditingCell] = useState<EditingCell | null>(null);
  const [loadingCell, setLoadingCell] = useState<EditingCell | null>(null);
  const [editingTagsRowId, setEditingTagsRowId] = useState<number | null>(null);
  const tagCellRefs = useRef<Map<number, HTMLTableCellElement>>(new Map());

  useEffect(() => {
    if (editingTagsRowId === null) return;
    function handleClickOutside(e: MouseEvent) {
      const cell = tagCellRefs.current.get(editingTagsRowId!);
      if (cell && !cell.contains(e.target as Node)) {
        setEditingTagsRowId(null);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [editingTagsRowId]);

  const handleRemoveTag = (rowId: number, tag: string) => {
    setRows((prev) =>
      prev.map((r) =>
        r.id === rowId ? { ...r, tags: r.tags.filter((t) => t !== tag) } : r,
      ),
    );
  };

  const handleAddTag = (rowId: number, tag: string) => {
    setRows((prev) =>
      prev.map((r) => (r.id === rowId ? { ...r, tags: [...r.tags, tag] } : r)),
    );
  };

  const handleSubmit = async (
    rowId: number,
    field: EditableField,
    newValue: string,
  ) => {
    setEditingCell(null);

    // If value unchanged, skip
    const row = rows.find((r) => r.id === rowId);
    if (!row || row[field] === newValue) return;

    // Start loading
    setLoadingCell({ rowId, field });

    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 800));

    // Update data
    setRows((prev) =>
      prev.map((r) => (r.id === rowId ? { ...r, [field]: newValue } : r)),
    );
    setLoadingCell(null);
  };

  const isEditing = (rowId: number, field: EditableField) =>
    editingCell?.rowId === rowId && editingCell?.field === field;

  const isRowLoading = (rowId: number) => loadingCell?.rowId === rowId;

  const editableFields: EditableField[] = [
    "product",
    "email",
    "credits",
    "runtime",
  ];

  return (
    <div className="overflow-x-auto rounded-lg border border-gray-200">
      <table className="w-full border-collapse">
        <thead className="bg-[#F9F9FB]">
          <tr>
            {tableHeaders.map((th) => (
              <th
                key={th.id}
                className="px-6 py-4 text-left text-[#151515] font-medium text-sm"
              >
                {th.content}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200 bg-white">
          {rows.map((row) => (
            <tr
              key={row.id}
              className={`transition-all ${
                isRowLoading(row.id)
                  ? "opacity-40 pointer-events-none"
                  : "hover:bg-gray-50"
              }`}
            >
              <td className="px-6 py-3 text-base font-medium text-[#4E5356]">
                <UserCell name={row.name.name} avatar={row.name.avatar} />
              </td>
              {editableFields.map((field) => (
                <td
                  key={field}
                  className="px-6 py-3 text-base font-medium text-[#4E5356]"
                >
                  <EditableCell
                    value={row[field]}
                    isEditing={isEditing(row.id, field)}
                    isRowLoading={!!isRowLoading(row.id)}
                    onDoubleClick={() =>
                      setEditingCell({ rowId: row.id, field })
                    }
                    onSubmit={(val) => handleSubmit(row.id, field, val)}
                    onCancel={() => setEditingCell(null)}
                  />
                </td>
              ))}
              <td
                className="px-6 py-3"
                ref={(el) => {
                  if (el) tagCellRefs.current.set(row.id, el);
                }}
              >
                <TagCell
                  tags={row.tags}
                  isEditing={editingTagsRowId === row.id}
                  onDoubleClick={() => setEditingTagsRowId(row.id)}
                  onRemoveTag={(tag) => handleRemoveTag(row.id, tag)}
                  onAddTag={(tag) => handleAddTag(row.id, tag)}
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Table;
