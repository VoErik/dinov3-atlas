export default function WarningModal({ onAccept }) {
  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
      <div className="bg-white p-8 rounded-lg max-w-lg text-center shadow-xl">
        <h2 className="text-2xl font-bold text-red-600 mb-4">Medical Imagery Warning</h2>
        <p className="text-gray-700 mb-6">
          This atlas contains real clinical imagery of skin diseases, including malignancies. 
          Viewer discretion is advised.
        </p>
        <button 
          onClick={onAccept}
          className="bg-blue-600 text-white px-6 py-2 rounded font-medium hover:bg-blue-700 transition"
        >
          I Understand
        </button>
      </div>
    </div>
  );
}