export default function ToastExito({ mensaje, visible }) {
  if (!visible) return null;

  return (
    <div className="fixed bottom-6 right-6 bg-green-700 text-white text-sm font-medium rounded-lg px-4 py-3 shadow-lg z-50 animate-pulse">
      ✓ {mensaje}
    </div>
  );
}