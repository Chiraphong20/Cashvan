import React, { useState, useEffect, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle, useMap } from 'react-leaflet';
import L from 'leaflet';
import { useStoreDB } from '../../store/StoreContext';

// Helper to center map
function ChangeView({ center, zoom }: { center: [number, number], zoom: number }) {
  const map = useMap();
  useEffect(() => {
    map.setView(center, zoom);
  }, [center, zoom, map]);
  return null;
}

const getDriverMarker = (status: string) => {
  const isSurveyed = status === 'SUCCESS';
  return L.divIcon({
    className: 'bg-transparent border-0',
    html: `
      <div class="relative flex items-center justify-center">
        <div class="w-8 h-8 ${isSurveyed ? 'bg-[#10b981]' : 'bg-[#f43f5e]'} rounded-full border-2 border-white shadow-xl flex items-center justify-center transition-transform hover:scale-110 active:scale-95">
          <span class="material-symbols-outlined text-white text-[16px]" style="font-variation-settings: 'FILL' 1">
            ${isSurveyed ? 'check_circle' : 'location_on'}
          </span>
        </div>
        <div class="absolute -bottom-1 w-2 h-2 ${isSurveyed ? 'bg-[#10b981]' : 'bg-[#f43f5e]'} rotate-45 border-r border-b border-white"></div>
      </div>
    `,
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -32]
  });
};

export default function CheckInMap() {
  const { stores, surveyTargets, currentDriverId } = useStoreDB();
  const [userPos, setUserPos] = useState<{lat: number, lng: number} | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<{type: 'store' | 'zone', data: any}[]>([]);
  const [map, setMap] = useState<L.Map | null>(null);
  const [isLockedToUser, setIsLockedToUser] = useState(true);

  useEffect(() => {
    if ("geolocation" in navigator) {
      const watchId = navigator.geolocation.watchPosition(
        (pos) => setUserPos({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
        (err) => console.error(err),
        { enableHighAccuracy: true }
      );
      return () => navigator.geolocation.clearWatch(watchId);
    }
  }, []);

  const handleSearch = (val: string) => {
    setSearchTerm(val);
    if (!val.trim()) {
      setSearchResults([]);
      return;
    }

    const matchedStores = stores
      .filter(s => !s.is_admin_only && s.status !== 'NOT_FOUND' && s.name.toLowerCase().includes(val.toLowerCase()))
      .slice(0, 5)
      .map(s => ({ type: 'store' as const, data: s }));

    const matchedZones = surveyTargets
      .filter(z => z.name.toLowerCase().includes(val.toLowerCase()))
      .slice(0, 3)
      .map(z => ({ type: 'zone' as const, data: z }));

    setSearchResults([...matchedZones, ...matchedStores]);
  };

  const goToLocation = (lat: number, lng: number, type: 'store' | 'zone') => {
    if (map) {
      setIsLockedToUser(false);
      const zoomLevel = type === 'store' ? 17 : 16;
      map.flyTo([lat, lng], zoomLevel, {
        animate: true,
        duration: 1.2,
        easeLinearity: 0.25
      });
      setSearchTerm('');
      setSearchResults([]);
    }
  };

  return (
    <div className="h-screen w-full relative bg-slate-100 font-body">
      {/* Search Overlay */}
      <div className="absolute top-4 left-4 right-4 z-[1000] space-y-2">
        <div className="relative group">
           <div className="absolute left-4 top-1/2 -translate-y-1/2">
              <span className="material-symbols-outlined text-slate-400 group-focus-within:text-primary transition-colors">search</span>
           </div>
           <input 
            type="text" 
            placeholder="ค้นหาร้านค้า หรือ พื้นที่เป้าหมาย..."
            className="w-full bg-white/95 backdrop-blur-xl border-none p-4 pl-12 rounded-2xl shadow-2xl text-xs font-black outline-none focus:ring-2 ring-primary/20 transition-all placeholder:text-slate-300"
            value={searchTerm}
            onChange={(e) => handleSearch(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && searchResults.length > 0) {
                const first = searchResults[0];
                goToLocation(first.data.lat, first.data.lng, first.type);
              }
            }}
           />
           {searchTerm && (
             <button onClick={() => {setSearchTerm(''); setSearchResults([]);}} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300">
                <span className="material-symbols-outlined text-sm">close</span>
             </button>
           )}
        </div>

        {/* Results Dropdown */}
        {searchResults.length > 0 && (
          <div className="bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-white overflow-hidden animate-in fade-in slide-in-from-top-2 duration-300">
             {searchResults.map((res, idx) => (
               <button 
                key={idx}
                onClick={() => goToLocation(res.data.lat, res.data.lng, res.type)}
                className="w-full p-4 flex items-center gap-3 hover:bg-slate-50 transition-colors border-b border-slate-50 last:border-0 text-left"
               >
                 <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-white ${res.type === 'zone' ? 'bg-amber-500' : 'bg-primary'}`}>
                    <span className="material-symbols-outlined text-sm">{res.type === 'zone' ? 'track_changes' : 'storefront'}</span>
                 </div>
                 <div className="text-left">
                    <p className="text-[11px] font-black text-slate-800 leading-tight">{res.data.name}</p>
                    <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">
                       {res.type === 'zone' ? 'เป้าหมายพื้นที่' : (res.data.district_name || 'ไม่ระบุอำเภอ')}
                    </p>
                 </div>
                 <span className="ml-auto material-symbols-outlined text-slate-300 text-sm">arrow_forward_ios</span>
               </button>
             ))}
          </div>
        )}
      </div>

      <MapContainer 
        center={userPos ? [userPos.lat, userPos.lng] : [14.9799, 102.0978]} 
        zoom={15} 
        zoomControl={false}
        className="h-full w-full z-0"
        ref={setMap as any}
      >
        <TileLayer 
          url="https://{s}.google.com/vt/lyrs=m&x={x}&y={y}&z={z}"
          subdomains={['mt0', 'mt1', 'mt2', 'mt3']}
          attribution="&copy; Google Maps"
        />

        {/* Target Zones Overlay with Labels */}
        {surveyTargets.map(target => (
          <React.Fragment key={target.id}>
            <Circle 
              center={[target.lat, target.lng]} 
              radius={target.radius} 
              pathOptions={{ fillColor: target.color, color: target.color, fillOpacity: 0.1, weight: 2, dashArray: '5, 5' }}
            />
            <Marker 
              position={[target.lat, target.lng]} 
              icon={L.divIcon({
                className: 'bg-transparent border-0',
                html: `
                  <div class="flex flex-col items-center">
                    <div class="px-2 py-0.5 bg-white/90 backdrop-blur-sm border rounded-full shadow-md whitespace-nowrap" style="border-color: ${target.color}">
                      <span class="text-[8px] font-black text-slate-800 uppercase tracking-tighter">${target.name}</span>
                    </div>
                  </div>
                `,
                iconSize: [80, 20],
                iconAnchor: [40, 10]
              })}
              interactive={false}
            />
          </React.Fragment>
        ))}

        {userPos && isLockedToUser && <ChangeView center={[userPos.lat, userPos.lng]} zoom={15} />}

        {/* All Stores Layer (excluding admin-only hidden pins and not found pins) */}
        {stores.filter(s => !s.is_admin_only && s.status !== 'NOT_FOUND').map(store => {
          const isSurveyed = store.status === 'SUCCESS';
          return (
          <Marker 
            key={store.id} 
            position={[store.lat, store.lng]} 
            icon={getDriverMarker(store.status)}
          >
            <Popup className="precision-popup">
              <div className="p-1 min-w-[120px]">
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">{store.type}</p>
                <h4 className="font-bold text-sm text-on-surface leading-tight mb-3">{store.name}</h4>
                <a 
                  href={isSurveyed ? `/driver/sales?storeId=${store.id}` : `/driver/check-in?storeId=${store.id}`}
                  className={`block w-full text-white text-center py-2 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg active:scale-95 transition-all ${isSurveyed ? 'bg-primary shadow-primary/20' : 'bg-red-500 shadow-red-500/20'}`}
                >
                  {isSurveyed ? 'เปิดเมนูขาย' : 'เข้าไปสำรวจร้าน'}
                </a>
              </div>
            </Popup>
          </Marker>
          );
        })}

        {/* Current Location Marker */}
        {userPos && (
          <Marker 
            position={[userPos.lat, userPos.lng]}
            icon={L.divIcon({
              className: 'bg-transparent border-0',
              html: `
                <div class="relative flex items-center justify-center">
                  <div class="absolute w-12 h-12 bg-primary/20 rounded-full animate-ping"></div>
                  <div class="absolute w-6 h-6 bg-primary/30 rounded-full"></div>
                  <div class="w-4 h-4 bg-primary border-2 border-white rounded-full shadow-2xl"></div>
                </div>
              `
            })}
          />
        )}

        {/* Targets / Zones Layer */}
        {surveyTargets
          .filter(t => !t.assigned_driver_id || t.assigned_driver_id === currentDriverId)
          .map(target => (
            <Circle
              key={target.id}
              center={[target.lat, target.lng]}
              radius={target.radius}
              pathOptions={{ 
                fillColor: '#f59e0b', 
                color: '#f59e0b', 
                fillOpacity: 0.1,
                dashArray: '10, 10',
                weight: 2
              }}
            />
          ))}
      </MapContainer>

      {/* Floating GPS Recenter Button */}
      {userPos && (
        <button 
          onClick={() => setIsLockedToUser(true)} 
          className={`absolute bottom-28 right-6 w-12 h-12 rounded-2xl shadow-xl flex items-center justify-center z-[1000] active:scale-90 transition-all ${isLockedToUser ? 'bg-primary text-white' : 'bg-white text-primary'}`}
        >
          <span className="material-symbols-outlined">my_location</span>
        </button>
      )}
    </div>
  );
}
