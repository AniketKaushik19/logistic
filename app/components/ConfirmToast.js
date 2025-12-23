import React from 'react'
import toast from 'react-hot-toast';
const ConfirmToast = async({msg}) => {
   const confirmed = await new Promise((resolve) => {
      toast.custom(
        (t) => (
          <div className="bg-white border rounded shadow-lg p-4 w-72">
            <p className="text-sm font-medium">{msg}</p>
            <div className="mt-3 flex justify-end gap-2">
              <button
                onClick={() => {
                  toast.dismiss(t.id);
                  resolve(false);
                }}
                className="px-3 py-1 rounded bg-gray-200"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  toast.dismiss(t.id);
                  resolve(true);
                }}
                className="px-3 py-1 rounded bg-red-600 text-white"
              >
                Delete
              </button>
            </div>
          </div>
        ),
        { duration: Infinity }
      );
    });
    return confirmed
}

export default ConfirmToast