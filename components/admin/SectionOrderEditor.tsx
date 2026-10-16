"use client";

import { useState } from "react";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
  arrayMove,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import type { SectionConfig, SectionType } from "@/lib/db/schema";

export const SECTION_LABELS: Record<SectionType, string> = {
  highlights: "হাইলাইটস বার",
  whyChooseUs: "কেন আমরা — ফিচার গ্রিড",
  productDetail: "প্রোডাক্ট ডিটেইল",
  qualityBanner: "কোয়ালিটি ব্যানার",
};

function SortableRow({
  section,
  onToggle,
}: {
  section: SectionConfig;
  onToggle: () => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: section.type,
  });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="flex items-center gap-3 rounded-lg border border-surface-line bg-white px-3 py-2.5"
    >
      <button
        type="button"
        {...attributes}
        {...listeners}
        className="shrink-0 cursor-grab touch-none px-1 text-lg leading-none text-ink/40 hover:text-ink active:cursor-grabbing"
        aria-label="টেনে সাজান"
      >
        ⠿
      </button>
      <label className="flex flex-1 cursor-pointer items-center gap-2.5 text-sm font-medium text-ink">
        <input type="checkbox" checked={section.visible} onChange={onToggle} />
        {SECTION_LABELS[section.type]}
      </label>
    </div>
  );
}

export default function SectionOrderEditor({
  name,
  defaultValue,
}: {
  name: string;
  defaultValue: SectionConfig[];
}) {
  const [sections, setSections] = useState<SectionConfig[]>(defaultValue);
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 150, tolerance: 5 } }),
  );

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    setSections((items) => {
      const oldIndex = items.findIndex((i) => i.type === active.id);
      const newIndex = items.findIndex((i) => i.type === over.id);
      return arrayMove(items, oldIndex, newIndex);
    });
  }

  function toggle(type: SectionType) {
    setSections((items) =>
      items.map((i) => (i.type === type ? { ...i, visible: !i.visible } : i)),
    );
  }

  return (
    <div className="space-y-2">
      <input type="hidden" name={name} value={JSON.stringify(sections)} />
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={sections.map((s) => s.type)} strategy={verticalListSortingStrategy}>
          {sections.map((s) => (
            <SortableRow key={s.type} section={s} onToggle={() => toggle(s.type)} />
          ))}
        </SortableContext>
      </DndContext>
    </div>
  );
}
