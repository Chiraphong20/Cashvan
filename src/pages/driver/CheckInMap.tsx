import React, { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle, Polyline, useMap } from 'react-leaflet';
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
      <div class="relative flex items-center justify-center w-8 h-8 z-30 transition-transform duration-300 hover:scale-110 active:scale-95">
        <div class="absolute w-7 h-7 ${isSurveyed ? 'bg-[#10b981]' : 'bg-[#f43f5e]'} shadow-xl border-2 border-white" 
             style="border-radius: 50% 50% 50% 0; transform: rotate(-45deg);"></div>
        ${isSurveyed
        ? `<span class="material-symbols-outlined text-white text-[14px] z-10" style="font-variation-settings: 'FILL' 1; font-weight: 900; transform: translateY(-1px);">check</span>`
        : `<div class="absolute w-2.5 h-2.5 bg-white rounded-full z-10 animate-pulse"></div>`
      }
      </div>
    `,
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -32]
  });
};

export default function CheckInMap() {
  const { stores, surveyTargets, currentDriverId } = useStoreDB();
  const [userPos, setUserPos] = useState<{ lat: number, lng: number } | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<{ type: 'store' | 'zone', data: any }[]>([]);
  const [map, setMap] = useState<L.Map | null>(null);
  const [isLockedToUser, setIsLockedToUser] = useState(true);

  // GPS Trail
  const [gpsTrail, setGpsTrail] = useState<[number, number][]>([]);
  const pendingPoints = useRef<{ lat: number; lng: number; recorded_at: string }[]>([]);

  useEffect(() => {
    if (!("geolocation" in navigator)) return;

    const watchId = navigator.geolocation.watchPosition(
      (pos) => {
        const { latitude: lat, longitude: lng } = pos.coords;
        setUserPos({ lat, lng });
        setGpsTrail(prev => {
          // Skip if moved less than 5m (avoid duplicates while stationary)
          if (prev.length > 0) {
            const [prevLat, prevLng] = prev[prev.length - 1];
            const dLat = (lat - prevLat) * 111000;
            const dLng = (lng - prevLng) * 111000 * Math.cos(lat * Math.PI / 180);
            if (Math.sqrt(dLat * dLat + dLng * dLng) < 5) return prev;
          }
          return [...prev, [lat, lng]];
        });
        pendingPoints.current.push({ lat, lng, recorded_at: new Date().toISOString() });
      },
      (err) => console.error(err),
      { enableHighAccuracy: true, distanceFilter: 5 } as any
    );

    // Flush GPS points to server every 10 seconds
    const flushInterval = setInterval(async () => {
      if (pendingPoints.current.length === 0 || !currentDriverId) return;
      const toSend = [...pendingPoints.current];
      pendingPoints.current = [];
      try {
        await fetch('/api/gps-track', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ driver_id: currentDriverId, points: toSend })
        });
      } catch {
        // Put points back if send failed
        pendingPoints.current = [...toSend, ...pendingPoints.current];
      }
    }, 10000);

    return () => {
      navigator.geolocation.clearWatch(watchId);
      clearInterval(flushInterval);
    };
  }, [currentDriverId]);

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
            <button onClick={() => { setSearchTerm(''); setSearchResults([]); }} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300">
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
                  <div className="flex flex-col gap-2">
                    <a
                      href={isSurveyed ? `/driver/sales?storeId=${store.id}` : `/driver/check-in?storeId=${store.id}`}
                      className={`block w-full text-white text-center py-2 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg active:scale-95 transition-all ${isSurveyed ? 'bg-primary shadow-primary/20' : 'bg-white-500 shadow-red-500/20'}`}
                    >
                      {isSurveyed ? 'เปิดเมนูขาย' : 'เข้าไปสำรวจร้าน'}
                    </a>
                    <a
                      href={`https://www.google.com/maps/dir/?api=1&destination=${store.lat},${store.lng}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex w-full items-center justify-center gap-1 text-blue-600 bg-blue-50 text-center py-2 rounded-xl text-[10px] font-black uppercase tracking-widest active:scale-95 transition-all border border-blue-100"
                    >
                      <span className="material-symbols-outlined text-xs">navigation</span>
                      นำทาง
                    </a>
                  </div>
                </div>
              </Popup>
            </Marker>
          );
        })}

        {/* GPS Trail Polyline */}
        {gpsTrail.length > 1 && (
          <Polyline
            positions={gpsTrail}
            pathOptions={{ color: '#3b82f6', weight: 4, opacity: 0.85, lineCap: 'round', lineJoin: 'round' }}
          />
        )}

        {/* Current Location — รถกำลังเดิน */}
        {userPos && (
          <Marker
            position={[userPos.lat, userPos.lng]}
            icon={L.divIcon({
              className: 'bg-transparent border-0',
              html: `
                <div style="position:relative;display:flex;align-items:center;justify-content:center;">
                  <div style="position:absolute;width:48px;height:48px;border-radius:50%;background:rgba(59,130,246,0.2);animation:ping 1.5s cubic-bezier(0,0,0.2,1) infinite;"></div>
                  <div style="width:36px;height:36px;background:#1d4ed8;border-radius:50%;border:3px solid white;box-shadow:0 3px 12px rgba(29,78,216,0.5);display:flex;align-items:center;justify-content:center;">
                    <span class="material-symbols-outlined" style="font-size:18px;color:white;font-variation-settings:'FILL' 1;">directions_car</span>
                  </div>
                </div>
              `,
              iconSize: [36, 36],
              iconAnchor: [18, 18],
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

      {/* GPS Trail Status Badge */}
      {gpsTrail.length > 0 && (
        <div className="absolute bottom-32 left-4 z-[1000] bg-white/95 backdrop-blur rounded-2xl px-4 py-2.5 shadow-lg flex items-center gap-2.5 border border-blue-100">
          <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></div>
          <div>
            <p className="text-[9px] font-black text-blue-600 uppercase tracking-widest">กำลังบันทึกเส้นทาง</p>
            <p className="text-[10px] font-bold text-slate-600">{gpsTrail.length} จุด</p>
          </div>
        </div>
      )}

      {/* Floating GPS Recenter Button */}
      {userPos && (
        <button
          onClick={() => setIsLockedToUser(true)}
          className={`absolute bottom-28 right-6 w-12 h-12 rounded-2xl shadow-xl flex items-center justify-center z-[1000] active:scale-90 transition-all ${isLockedToUser ? 'bg-primary text-white' : 'bg-white text-primary'}`}
        >
          <span className="material-symbols-outlined">my_location</span>
        </button>
      )}

      <style>{`@keyframes ping { 75%,100%{transform:scale(2);opacity:0} }`}</style>
    </div>
  );
}
