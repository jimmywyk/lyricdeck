import { useAppStore } from '../store/appStore';
import { useI18n } from '../i18n';
import { PreparationList } from './PreparationList';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

export function ArrangePanel() {
  const { songs, selectedSongId, addToArrangement, removeFromArrangement, setArrangement } =
    useAppStore();
  const { t } = useI18n();
  const song = songs.find((s) => s.id === selectedSongId);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  if (!song) {
    return (
      <div className="flex h-full">
        <div className="flex items-center justify-center flex-1 text-surface-400">
          <p>{t.arrange.selectSong}</p>
        </div>
        <PreparationList mode="arrange" />
      </div>
    );
  }

  const arrangement = song.arrangement;
  const arrangementItems = arrangement.map((sectionId, index) => ({
    id: `${sectionId}-${index}`,
    sectionId,
    index,
    section: song.sections.find((s) => s.id === sectionId),
  }));

  const songId = song.id;

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = arrangementItems.findIndex((item) => item.id === active.id);
    const newIndex = arrangementItems.findIndex((item) => item.id === over.id);

    const newArrangement = arrayMove(arrangement, oldIndex, newIndex);
    setArrangement(songId, newArrangement);
  }

  return (
    <div className="flex h-full">
      {/* Available Sections */}
      <div className="w-64 border-r border-surface-700 p-4 overflow-y-auto">
        <h3 className="text-sm font-medium text-surface-300 mb-3">{t.arrange.availableSections}</h3>
        <div className="space-y-2">
          {song.sections.map((section) => (
            <button
              key={section.id}
              onClick={() => addToArrangement(song.id, section.id)}
              className="w-full text-left px-3 py-2 bg-surface-800 hover:bg-surface-700 rounded-lg text-sm text-white transition-colors border border-surface-600"
            >
              <span className="font-medium">{section.label}</span>
              <span className="block text-xs text-surface-400 truncate mt-0.5">
                {section.lyrics.split('\n')[0] || t.arrange.empty}
              </span>
            </button>
          ))}
        </div>
        <p className="text-xs text-surface-500 mt-3">
          {t.arrange.clickToAdd}
        </p>
      </div>

      {/* Arrangement */}
      <div className="flex-1 p-4 overflow-y-auto">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-medium text-surface-300">
            {t.arrange.arrangement} ({arrangement.length} {t.arrange.slides})
          </h3>
          {arrangement.length > 0 && (
            <button
              onClick={() => setArrangement(song.id, [])}
              className="text-xs text-red-400 hover:text-red-300"
            >
              {t.arrange.clearAll}
            </button>
          )}
        </div>

        {arrangement.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-48 text-surface-400 border-2 border-dashed border-surface-700 rounded-lg">
            <p className="text-sm">{t.arrange.noArrangement}</p>
            <p className="text-xs mt-1">{t.arrange.noArrangementHint}</p>
          </div>
        ) : (
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <SortableContext items={arrangementItems.map((i) => i.id)} strategy={verticalListSortingStrategy}>
              <div className="space-y-1">
                {arrangementItems.map((item) => (
                  <SortableArrangementItem
                    key={item.id}
                    id={item.id}
                    index={item.index}
                    label={item.section?.label || 'Unknown'}
                    lyrics={item.section?.lyrics || ''}
                    onRemove={() => removeFromArrangement(song.id, item.index)}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>
        )}
      </div>

      {/* Preparation List */}
      <PreparationList mode="arrange" />
    </div>
  );
}

function SortableArrangementItem({
  id,
  index,
  label,
  lyrics,
  onRemove,
}: {
  id: string;
  index: number;
  label: string;
  lyrics: string;
  onRemove: () => void;
}) {
  const { t } = useI18n();
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="flex items-center gap-2 px-3 py-2 bg-surface-800 rounded-lg border border-surface-600 group"
    >
      <span
        {...attributes}
        {...listeners}
        className="cursor-grab active:cursor-grabbing text-surface-500 hover:text-surface-300"
      >
        ⠿
      </span>
      <span className="text-xs text-surface-500 w-6">{index + 1}.</span>
      <div className="flex-1 min-w-0">
        <span className="text-sm text-white font-medium">{label}</span>
        <span className="block text-xs text-surface-400 truncate">
          {lyrics.split('\n')[0] || t.arrange.empty}
        </span>
      </div>
      <button
        onClick={onRemove}
        className="opacity-0 group-hover:opacity-100 text-red-400 hover:text-red-300 text-sm p-1"
      >
        ✕
      </button>
    </div>
  );
}
