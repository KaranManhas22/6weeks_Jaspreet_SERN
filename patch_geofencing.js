const fs = require('fs');

let shopCode = fs.readFileSync('app/shop/page.tsx', 'utf8');

const newHandleSelect = `
  async function handleSelectUni(uni: University) {
    if (!navigator.geolocation) {
      alert("Your browser does not support geolocation.");
      return;
    }
    
    // Optimistically close dropdown and show loading state
    setShowDropdown(false);
    
    // Prevent switching if they are already on this university
    if (uni.id === selectedUniId) return;

    alert("Checking your location to confirm you are near " + uni.name + "...");

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;
          
          const res = await api.post<{ nearest: University, distanceKm: number, isWithinRadius: boolean }>('/api/universities/nearest', { lat, lng });
          
          if (!res.isWithinRadius || !res.nearest || res.nearest.id !== uni.id) {
            alert("Your location doesn't match the university's location (You must be within 10km). Nearest found: " + (res.nearest?.name || 'Unknown'));
            // Revert the search box back to current university
            setSearchUniQuery(userUniName || '');
            return;
          }

          // If valid, update the backend profile
          await api.put('/api/auth/me', { universityName: uni.name });
          
          // Update local state
          setSearchUniQuery(uni.name);
          setSelectedUniId(uni.id);
          setUserUniName(uni.name);
          
          // Refresh token logic normally happens in background, but the local state is enough to fetch new vendors
          alert("Successfully switched to " + uni.name);
        } catch (err: any) {
          alert("Error verifying location: " + err.message);
          setSearchUniQuery(userUniName || '');
        }
      },
      (error) => {
        alert("Location permission is required to switch campuses (to prevent accidental orders). Please enable GPS.");
        setSearchUniQuery(userUniName || '');
      },
      { timeout: 10000 }
    );
  }
`;

shopCode = shopCode.replace(/function handleSelectUni\(uni: University\) \{[\s\S]*?setShowDropdown\(false\);\n  \}/, newHandleSelect.trim());

fs.writeFileSync('app/shop/page.tsx', shopCode);
console.log("Geofencing manual switch added to shop page.");
