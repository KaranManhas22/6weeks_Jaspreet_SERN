const fs = require('fs');
let shopCode = fs.readFileSync('app/shop/page.tsx', 'utf8');

const autoSwitchEffect = `
  // Auto-Switch Campus Logic
  useEffect(() => {
    // Only attempt auto-switch if they've granted permissions before or we just want to silently check
    // Browsers don't allow silent check without prompting, so we only prompt if they click a button usually.
    // However, the prompt is fine if we wrap it in a clean way, but to avoid spamming the user on every load, 
    // we will check navigator.permissions (not supported in all browsers but good for a silent check).
    if (navigator.permissions) {
      navigator.permissions.query({ name: 'geolocation' }).then((result) => {
        if (result.state === 'granted') {
          navigator.geolocation.getCurrentPosition(async (position) => {
            try {
              const lat = position.coords.latitude;
              const lng = position.coords.longitude;
              const res = await api.post<{ nearest: University, distanceKm: number, isWithinRadius: boolean }>('/api/universities/nearest', { lat, lng });
              
              if (res.isWithinRadius && res.nearest) {
                // If the nearest is different from what's currently selected
                if (userUniName && res.nearest.name !== userUniName) {
                  await api.put('/api/auth/me', { universityName: res.nearest.name });
                  setUserUniName(res.nearest.name);
                  setSearchUniQuery(res.nearest.name);
                  setSelectedUniId(res.nearest.id);
                  alert("Looks like you're at " + res.nearest.name + "! We've automatically updated your canteen.");
                }
              }
            } catch (err) {
              // Silent fail for background check
            }
          });
        }
      });
    }
  }, [userUniName]);

  // Handle Orders View
`;

shopCode = shopCode.replace(/\/\/ Handle Orders View/, autoSwitchEffect.trim());
fs.writeFileSync('app/shop/page.tsx', shopCode);
console.log("Auto-switch added!");
