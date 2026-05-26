"use client";

import { useEffect, useMemo, useState } from "react";

function reorderList(items, fromIndex, toIndex) {
  if (fromIndex === toIndex || fromIndex < 0 || toIndex < 0) return items;
  const next = [...items];
  const [moved] = next.splice(fromIndex, 1);
  next.splice(toIndex, 0, moved);
  return next;
}

function defaultGetItemId(item) {
  return item.id;
}

export default function AdminSortableList({
  items,
  onReorder,
  onPersist,
  getItemId = defaultGetItemId,
  className = "",
  hint = "Drag the handle to reorder, then save the layout.",
  children
}) {
  const [dragIndex, setDragIndex] = useState(null);
  const [overIndex, setOverIndex] = useState(null);
  const [saving, setSaving] = useState(false);
  const [hasUnsavedOrder, setHasUnsavedOrder] = useState(false);
  const itemIds = useMemo(() => items.map(getItemId), [items, getItemId]);
  const [savedOrder, setSavedOrder] = useState(() => itemIds);

  useEffect(() => {
    if (!hasUnsavedOrder) {
      setSavedOrder(itemIds);
    }
  }, [hasUnsavedOrder, itemIds]);

  const finishDrag = () => {
    setDragIndex(null);
    setOverIndex(null);
  };

  const handleDrop = (dropIndex) => {
    if (dragIndex == null || dragIndex === dropIndex) {
      finishDrag();
      return;
    }

    const reordered = reorderList(items, dragIndex, dropIndex);
    onReorder(reordered);
    finishDrag();

    if (onPersist) {
      setHasUnsavedOrder(true);
    }
  };

  const handleSaveOrder = async () => {
    if (!onPersist) return;

    setSaving(true);
    try {
      const result = await onPersist(items);
      if (result?.ok === false) return;
      setSavedOrder(itemIds);
      setHasUnsavedOrder(false);
    } finally {
      setSaving(false);
    }
  };

  const handleResetOrder = () => {
    const itemById = new Map(items.map((item) => [getItemId(item), item]));
    const restoredItems = savedOrder.map((id) => itemById.get(id)).filter(Boolean);
    const restoredIds = new Set(savedOrder);
    const newItems = items.filter((item) => !restoredIds.has(getItemId(item)));
    onReorder([...restoredItems, ...newItems]);
    setHasUnsavedOrder(false);
  };

  return (
    <div className={`admin-sortable ${className}`.trim()}>
      {hint || hasUnsavedOrder ? (
        <div className="admin-sortable-toolbar">
          <p className="admin-sortable-hint" aria-live="polite">
            {saving ? "Saving layout..." : hasUnsavedOrder ? "Layout changed. Save to publish this order." : hint}
          </p>
          {onPersist && hasUnsavedOrder ? (
            <div className="admin-sortable-actions">
              <button className="button" type="button" onClick={handleSaveOrder} disabled={saving}>
                {saving ? "Saving..." : "Save layout"}
              </button>
              <button className="button" type="button" onClick={handleResetOrder} disabled={saving}>
                Discard changes
              </button>
            </div>
          ) : null}
        </div>
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
                handleDrop(index);
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
