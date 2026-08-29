const fs = require('fs');
let code = fs.readFileSync('app/vendor/(dashboard)/settings/page.tsx', 'utf8');

const injection = `
  const [isDetecting, setIsDetecting] = useState(false);

  const handleDetectLocation = () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser");
      return;
    }
    setIsDetecting(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;
          
          // Optionally reverse geocode for areaName (Using bigdatacloud like in signup)
          const geoRes = await fetch(\`https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=\${lat}&longitude=\${lng}&localityLanguage=en\`);
          const geoData = await geoRes.json();
          const areaName = geoData.locality || geoData.city || 'Campus Area';

          await api.post('/api/universities/location', { lat, lng, areaName });
          alert("Campus Location Successfully Pinned to: " + areaName);
        } catch (err: any) {
          alert("Error saving location: " + err.message);
        } finally {
          setIsDetecting(false);
        }
      },
      (error) => {
        alert("Please enable location permissions to pin your campus.");
        setIsDetecting(false);
      }
    );
  };

  const handleSave = async`;

code = code.replace("const handleSave = async", injection);

const buttonUI = `
          {/* Location Pinning */}
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-6 shadow-sm">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Campus Location (Geofencing)</h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
              Pin your current physical location to this campus. Students will only be able to order from you if they are physically within 10km of this GPS coordinate.
            </p>
            <button
              onClick={handleDetectLocation}
              disabled={isDetecting}
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl flex items-center gap-2 transition-all disabled:opacity-70"
            >
              <MapPin className="w-5 h-5" />
              {isDetecting ? 'Detecting GPS...' : 'Pin Current Location as Campus'}
            </button>
          </div>

          <div className="bg-white dark:bg-gray-900 border`;

code = code.replace('<div className="bg-white dark:bg-gray-900 border', buttonUI);

// Make sure MapPin is imported
if (!code.includes('MapPin')) {
  code = code.replace('import {', 'import { MapPin,');
}

fs.writeFileSync('app/vendor/(dashboard)/settings/page.tsx', code);
console.log("Vendor settings patched with location pinning.");
