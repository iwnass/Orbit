import { useState, useEffect } from 'react';

function UpdateNotification() {
  const [updateAvailable, setUpdateAvailable] = useState(false);
  const [updateDownloaded, setUpdateDownloaded] = useState(false);

  useEffect(() => {
    if (window.electron) {
      window.electron.onUpdateAvailable(() => {
        setUpdateAvailable(true);
      });

      window.electron.onUpdateDownloaded(() => {
        setUpdateDownloaded(true);
      });
    }
  }, []);

  const handleDownload = () => {
    if (window.electron) {
      window.electron.downloadUpdate();
    }
  };

  const handleInstall = () => {
    if (window.electron) {
      window.electron.installUpdate();
    }
  };

  if (!updateAvailable && !updateDownloaded) {
    return null;
  }

  return (
    <div className="fixed top-4 right-4 z-50">
      {updateDownloaded ? (
        <div className="bg-green-500 text-white px-6 py-4 rounded-lg shadow-lg flex items-center gap-4">
          <div>
            <p className="font-semibold">Update Ready!</p>
            <p className="text-sm">Restart to install the latest version</p>
          </div>
          <button
            onClick={handleInstall}
            className="px-4 py-2 bg-white text-green-600 rounded-md hover:bg-gray-100 font-medium"
          >
            Restart Now
          </button>
        </div>
      ) : (
        <div className="bg-blue-500 text-white px-6 py-4 rounded-lg shadow-lg flex items-center gap-4">
          <div>
            <p className="font-semibold">Update Available</p>
            <p className="text-sm">A new version of Orbit is available</p>
          </div>
          <button
            onClick={handleDownload}
            className="px-4 py-2 bg-white text-blue-600 rounded-md hover:bg-gray-100 font-medium"
          >
            Download
          </button>
        </div>
      )}
    </div>
  );
}

export default UpdateNotification;
