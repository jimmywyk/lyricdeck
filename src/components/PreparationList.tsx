import { useAppStore } from '../store/appStore';
import { useI18n } from '../i18n';
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

interface PreparationListProps {
  mode: 'arrange' | 'present';
}

export function PreparationList({ mode }: PreparationListProps) {
  const {
    songs,
    selectedSongId,
    preparationList,
    removeFromPreparationList,
    reorderPreparationList,
    clearPreparationList,
    selectSong,
    selectFromPreparationList,
  } = useAppStore();
  const { t } = useI18n();

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const prepSongs = preparationList
    .map((id) => songs.find((s) => s.id === id))
    .filter((s): s is NonNullable<typeof s> => s != null);

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = preparationList.indexOf(active.id as string);
    const newIndex = preparationList.indexOf(over.id as string);
    const newList = arrayMove(preparationList, oldIndex, newIndex);
    reorderPreparationList(newList);
  }

  function handleItemClick(songId: string) {
    if (mode === 'present') {
      selectFromPreparationList(songId);
    } else {
      selectSong(songId);
    }
  }

  function handleClear() {
    if (confirm(t.preparationList.confirmClear)) {
      clearPreparationList();
    }
  }

  return (
    <div className="w-56 border-l border-surface-700 flex flex-col h-full">
      {/* Header */}
      <div className="p-3 border-b border-surface-700">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-medium text-surface-300">{t.preparationList.title}</h3>
          {prepSongs.length > 0 && (
            <button
              onClick={handleClear}
              className="text-xs text-red-400 hover:text-red-300"
            >
              {t.preparationList.clearAll}
            </button>
          )}
        </div>
        {prepSongs.length > 0 && (
          <p className="text-xs text-surface-500 mt-1">
            {t.preparationList.songCount.replace('{count}', String(prepSongs.length))}
          </p>
        )}
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto p-2">
        {prepSongs.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-32 text-surface-500 text-center px-3">
            <p className="text-xs">{t.preparationList.empty}</p>
            <p className="text-xs mt-1 text-surface-600">{t.preparationList.emptyHint}</p>
          </div>
        ) : (
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <SortableContext items={preparationList} strategy={verticalListSortingStrategy}>
              <div className="space-y-1">
                {prepSongs.map((song, index) => (
                  <SortablePrepItem
                    key={song.id}
                    id={song.id}
                    index={index}
                    title={song.title}
                    artist={song.artist}
                    isActive={song.id === selectedSongId}
                    onClick={() => handleItemClick(song.id)}
                    onRemove={() => removeFromPreparationList(song.id)}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>
        )}
      </div>
    </div>
  );
}

function SortablePrepItem({
  id,
  index,
  title,
  artist,
  isActive,
  onClick,
  onRemove,
}: {
  id: string;
  index: number;
  title: string;
  artist?: string;
  isActive: boolean;
  onClick: () => void;
  onRemove: () => void;
}) {
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
      className={`flex items-center gap-1.5 px-2 py-1.5 rounded-lg border group cursor-pointer transition-colors ${
        isActive
          ? 'bg-primary-600/20 border-primary-500 border-l-2'
          : 'bg-surface-800 border-surface-600 hover:bg-surface-700'
      }`}
      onClick={onClick}
    >
      <span
        {...attributes}
        {...listeners}
        className="cursor-grab active:cursor-grabbing text-surface-500 hover:text-surface-300 text-xs"
        onClick={(e) => e.stopPropagation()}
      >
        ⠿
      </span>
      <span className="text-xs text-surface-500 w-4">{index + 1}.</span>
      <div className="flex-1 min-w-0">
        <span className="text-xs text-white font-medium block truncate">{title}</span>
        {artist && (
          <span className="text-xs text-surface-400 block truncate">{artist}</span>
        )}
      </div>
      <button
        onClick={(e) => {
          e.stopPropagation();
          onRemove();
        }}
        className="opacity-0 group-hover:opacity-100 text-red-400 hover:text-red-300 text-xs p-0.5"
      >
        ✕
      </button>
    </div>
  );
}
