import toast from "react-hot-toast";

const ConfirmToast = ({ msg }) => {
  return new Promise((resolve) => {
    let resolved = false;

    const safeResolve = (value, toastId) => {
      if (resolved) return;
      resolved = true;
      toast.dismiss(toastId);
      resolve(value);
    };

    const toastId = toast.custom(
      (t) => (
        <div
          tabIndex={0}
          autoFocus
          onKeyDown={(e) => {
            if (e.key === "Escape") safeResolve(false, toastId);
            if (e.key === "Enter") safeResolve(true, toastId);
          }}
          className="bg-white border rounded shadow-lg p-4 w-72 outline-none"
        >
          <p className="text-sm font-medium">{msg}</p>

          <div className="mt-3 flex justify-end gap-2">
            <button
              onClick={() => safeResolve(false, toastId)}
              className="px-3 py-1 rounded bg-gray-200 hover:bg-gray-300 transition hover:cursor-pointer"
            >
              Cancel
            </button>

            <button
              onClick={() => safeResolve(true, toastId)}
              className="px-3 py-1 rounded bg-red-600 text-white hover:cursor-pointer hover:bg-red-700 transition"
            >
              Delete
            </button>
          </div>
        </div>
      ),
      {
        duration: Infinity,
        position: "top-center",
      }
    );
  });
};

export default ConfirmToast;
