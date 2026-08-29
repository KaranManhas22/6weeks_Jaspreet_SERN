const fs = require('fs');
let code = fs.readFileSync('app/shop/page.tsx', 'utf8');

// The bug in my previous patch was that I reset setSearchUniQuery but not setSelectedUniId.
// Let's replace the whole handleSelectUni block to make it flawless.

const fixedHandleSelect = `
  async function handleSelectUni(uni: University) {
    if (!navigator.geolocation) {
      alert("Your browser does not support geolocation.");
      return;
    }
    
    setShowDropdown(false);
    if (uni.id === selectedUniId) return;

    alert("Checking your location to confirm you are near " + uni.name + "...");

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;
          
          const res = await api.post<{ nearest: University, distanceKm: number, isWithinRadius: boolean }>('/api/universities/nearest', { lat, lng });
          
          if (!res.isWithinRadius || !res.nearest || res.nearest.id !== uni.id) {
            alert("Your location doesn't match the university's location. We are keeping your registered campus: " + (userUniName || 'Unknown'));
            
            // Revert BOTH the text input AND the selected ID so vendors load correctly
            setSearchUniQuery(userUniName || '');
            const originalUni = universities.find(u => u.name === userUniName);
            if (originalUni) {
              setSelectedUniId(originalUni.id);
            }
            return;
          }

          await api.put('/api/auth/me', { universityName: uni.name });
          setSearchUniQuery(uni.name);
          setSelectedUniId(uni.id);
          setUserUniName(uni.name);
          alert("Successfully switched to " + uni.name);
        } catch (err: any) {
          alert("Error verifying location: " + err.message);
          setSearchUniQuery(userUniName || '');
          const originalUni = universities.find(u => u.name === userUniName);
          if (originalUni) setSelectedUniId(originalUni.id);
        }
      },
      (error) => {
        alert("Location permission is required to switch campuses (to prevent accidental orders). Please enable GPS.");
        setSearchUniQuery(userUniName || '');
        const originalUni = universities.find(u => u.name === userUniName);
        if (originalUni) setSelectedUniId(originalUni.id);
      },
      { timeout: 10000 }
    );
  }
`;

// Replace the old handleSelectUni
code = code.replace(/async function handleSelectUni\(uni: University\) \{[\s\S]*?\{ timeout: 10000 \}\n    \);\n  \}/, fixedHandleSelect.trim());

fs.writeFileSync('app/shop/page.tsx', code);
console.log("Dropdown restore logic fixed.");
