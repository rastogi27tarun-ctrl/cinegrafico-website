"use client";

import { useState } from "react";

function reorderList(items, fromIndex, toIndex) {
  if (fromIndex === toIndex || fromIndex < 0 || toIndex < 0) return items;
  const next = [...items];
  const [moved] = next.splice(fromIndex, 1);
  next.splice(toIndex, 0, moved);
  return next;
}

export default function AdminSortableList({
  items,
  onReorder,
  onPersist,
  getItemId = (item) => item.id,
  className = "",
  hint = "Drag the handle to reorder. Order saves automatically.",
  children
}) {
  const [dragIndex, setDragIndex] = useState(null);
  const [overIndex, setOverIndex] = useState(null);
  const [saving, setSaving] = useState(false);

  const finishDrag = () => {
    setDragIndex(null);
    setOverIndex(null);
  };

  const handleDrop = async (dropIndex) => {
    if (dragIndex == null || dragIndex === dropIndex) {
      finishDrag();
      return;
    }

    const reordered = reorderList(items, dragIndex, dropIndex);
    onReorder(reordered);
    finishDrag();

    if (!onPersist) return;

    setSaving(true);
    try {
      await onPersist(reordered);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className={`admin-sortable ${className}`.trim()}>
      {hint ? (
        <p className="admin-sortable-hint" aria-live="polite">
          {saving ? "Saving order…" : hint}
        </p>
      ) : null}
      <div className="admin-sortable-list">
        {items.map((item, index) => {
          const id = getItemId(item);
          const isDragging = dragIndex === index;
          const isOver = overIndex === index && dragIndex != null && dragIndex !== index;

          return (
            <div
              key={id}
              className={[
                "admin-sortable-item",
                isDragging ? "admin-sortable-item--dragging" : "",
                isOver ? "admin-sortable-item--over" : ""
              ]
                .filter(Boolean)
                .join(" ")}
              onDragOver={(e) => {
                e.preventDefault();
                e.dataTransfer.dropEffect = "move";
                setOverIndex(index);
              }}
              onDragLeave={(e) => {
                if (e.currentTarget.contains(e.relatedTarget)) return;
                setOverIndex((prev) => (prev === index ? null : prev));
              }}
              onDrop={(e) => {
                e.preventDefault();
                void handleDrop(index);
              }}
            >
              <button
                type="button"
                className="admin-drag-handle"
                draggable
                aria-label={`Drag to reorder item ${index + 1}`}
                title="Drag to reorder"
                onDragStart={(e) => {
                  setDragIndex(index);
                  e.dataTransfer.effectAllowed = "move";
                  e.dataTransfer.setData("text/plain", String(index));
                }}
                onDragEnd={finishDrag}
              >
                <span aria-hidden>⋮⋮</span>
              </button>
              <div className="admin-sortable-item-body">{children(item, index)}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
