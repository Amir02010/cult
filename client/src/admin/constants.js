export const STATUSES = ['new', 'accepted', 'cooking', 'served', 'cancelled'];

export const STATUS_LABEL = {
  new: 'Новый',
  accepted: 'Принят',
  cooking: 'Готовится',
  served: 'Подан',
  cancelled: 'Отменён',
};

export const ICON_CHOICES = [
  'sushi', 'steak', 'pizza', 'bowl', 'leaf', 'cocktail', 'cake',
];

export function emptyLocalized() {
  return { ru: '', en: '', uz: '' };
}

export function formatTime(iso) {
  if (!iso) return '';
  const d = new Date(iso);
  return d.toLocaleString('ru-RU', {
    day: '2-digit',
    month: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
}
