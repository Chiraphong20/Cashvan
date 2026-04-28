import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useStoreDB } from '../../store/StoreContext';
import { useLineAuth } from '../../store/LineAuthContext';
import { MapContainer, TileLayer, Marker, useMap, useMapEvents, ZoomControl } from 'react-leaflet';
import L from 'leaflet';
import { mockDistricts, mockSubDistricts } from '../../store/mockData';
import { uploadToCloudinary } from '../../utils/cloudinary';

// Distance calculation helper (Haversine formula)
const getDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
  const R = 6371e3; // metres
  const φ1 = lat1 * Math.PI / 180;
  const φ2 = lat2 * Math.PI / 180;
  const Δφ = (lat2 - lat1) * Math.PI / 180;
  const Δλ = (lon2 - lon1) * Math.PI / 180;

  const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) *
    Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c; // in metres
};

// Component to dynamically update map center
function ChangeMapView({ coords }: { coords: { lat: number; lng: number } }) {
  const map = useMap();
  useEffect(() => {
    map.flyTo([coords.lat, coords.lng], map.getZoom(), { animate: true, duration: 1 });
  }, [coords, map]);
  return null;
}

// Component to track map movement and update the state to the center coordinates
function MapCenterTracker({ setPinPosition }: { setPinPosition: (pos: { lat: number, lng: number }) => void }) {
  const map = useMapEvents({
    move: () => {
      const center = map.getCenter();
      setPinPosition({ lat: center.lat, lng: center.lng });
    }
  });
  return null;
}

// Custom Pin Icon for Check-in
const fixedPinIcon = L.divIcon({
  className: 'bg-transparent border-0',
  html: `<div class="relative flex flex-col items-center">
    <div class="absolute -top-8 bg-emerald-600 text-white px-3 py-1 rounded-full text-[10px] font-black shadow-lg shadow-emerald-500/30 whitespace-nowrap z-50 flex items-center gap-1">
      <span class="material-symbols-outlined text-[14px]">my_location</span> พิกัดปัจจุบันของคุณ
    </div>
    <div class="relative flex items-center justify-center w-10 h-10">
      <div class="absolute w-8 h-8 bg-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.8)] border-2 border-white z-20" style="border-radius: 50% 50% 50% 0; transform: rotate(-45deg);"></div>
      <div class="absolute w-3 h-3 bg-white rounded-full z-30 animate-pulse"></div>
    </div>
  </div>`,
  iconSize: [40, 40],
  iconAnchor: [20, 40],
});

const fetchAddressFromCoordinates = async (lat: number, lng: number): Promise<any> => {
  try {
    const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1&accept-language=th`);
    const data = await res.json();
    return data?.address || null;
  } catch (error) {
    return null;
  }
};

// Helper to clean Thai location names for better matching
const cleanThaiName = (name: string) => {
  if (!name) return '';
  return name.replace(/^(อำเภอ|ตำบล|จังหวัด|เขต|แขวง|ต\.|อ\.|จ\.)/, '').trim();
};


export default function CheckInPage() {
  const [searchParams] = useSearchParams();
  const { stores, addVisit, updateStore, addStore } = useStoreDB();
  const { currentDriver } = useLineAuth();
  const navigate = useNavigate();
  const storeId = searchParams.get('storeId') || searchParams.get('id');
  const store = stores.find(s => s.id === storeId);

  const [formData, setFormData] = useState({
    name: store?.name || '',
    type: store?.type || 'grocery',
    is_customer: store?.is_customer || false,
    sub_district: 'ในเมือง',
    district: 'เมืองนครราชสีมา',
    soi: '',
    moo: '',
    house_number: '',
    phone: store?.phone || '',
    additional_info: store?.additional_info || ''
  });

  const [photos, setPhotos] = useState<string[]>([]);
  const [photoFiles, setPhotoFiles] = useState<File[]>([]);
  const [accuracy, setAccuracy] = useState(32);
  const [saving, setSaving] = useState(false);
  const [saveProgress, setSaveProgress] = useState(0);
  const [saveStatusText, setSaveStatusText] = useState('');
  const [discrepancyReason, setDiscrepancyReason] = useState('');
  const [isLocating, setIsLocating] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Custom Draggable Pin position
  const [pinPosition, setPinPosition] = useState<{ lat: number, lng: number }>({
    lat: store?.lat || 14.9736,
    lng: store?.lng || 102.0945
  });

  const distance = useMemo(() => {
    if (!store) return 0;
    return getDistance(pinPosition.lat, pinPosition.lng, store.lat, store.lng);
  }, [pinPosition, store]);

  const isFarAway = store && distance > 100;

  const getCurrentLocation = (updateAddress = true) => {
    setAccuracy(32);
    setIsLocating(true);

    if (navigator.geolocation) {
      let watchId: number;
      let bestAccuracy = 999;
      let bestPos = { lat: 0, lng: 0 };
      let timeoutId: NodeJS.Timeout;

      const finalizeLocation = async (lat: number, lng: number, acc: number) => {
        navigator.geolocation.clearWatch(watchId);
        clearTimeout(timeoutId);
        setIsLocating(false);
        setPinPosition({ lat, lng });
        setAccuracy(Math.max(5, Math.round(acc)));

        if (updateAddress) {
          const addressData = await fetchAddressFromCoordinates(lat, lng);
          if (addressData) {
            const rawDist = cleanThaiName(addressData.county || addressData.city || addressData.district || '');
            const rawSub = cleanThaiName(addressData.suburb || addressData.town || addressData.village || addressData.hamlet || '');

            const matchedDistrict = mockDistricts.find(d => cleanThaiName(d.name_th).includes(rawDist) || rawDist.includes(cleanThaiName(d.name_th)));

            let matchedSubDistrict = null;
            if (matchedDistrict) {
              matchedSubDistrict = mockSubDistricts.find(s =>
                s.parent_id === matchedDistrict.id &&
                (cleanThaiName(s.name_th).includes(rawSub) || rawSub.includes(cleanThaiName(s.name_th)))
              );
            }
            if (!matchedSubDistrict) {
              matchedSubDistrict = mockSubDistricts.find(s => cleanThaiName(s.name_th).includes(rawSub) || rawSub.includes(cleanThaiName(s.name_th)));
            }

            setFormData(prev => ({
              ...prev,
              district: matchedDistrict?.name_th || prev.district,
              sub_district: matchedSubDistrict?.name_th || prev.sub_district,
              house_number: addressData.house_number || prev.house_number,
              soi: addressData.road || '',
            }));
          }
        }
      };

      watchId = navigator.geolocation.watchPosition(
        (position) => {
          const acc = position.coords.accuracy;
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;

          // Keep track of the best reading
          if (acc < bestAccuracy) {
            bestAccuracy = acc;
            bestPos = { lat, lng };
          }

          // Update UI immediately
          setPinPosition({ lat, lng });
          setAccuracy(Math.round(acc));

          // If accuracy is great (< 15 meters), stop early
          if (acc <= 15) {
            finalizeLocation(lat, lng, acc);
          }
        },
        (error) => {
          console.error("Error getting location", error);
          setIsLocating(false);
          setAccuracy(15);
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
      );

      // Force stop after 5 seconds and use the best position
      timeoutId = setTimeout(() => {
        if (bestAccuracy !== 999) {
          finalizeLocation(bestPos.lat, bestPos.lng, bestAccuracy);
        } else {
          navigator.geolocation.clearWatch(watchId);
          setIsLocating(false);
        }
      }, 5000);
    } else {
      setIsLocating(false);
    }
  };

  useEffect(() => {
    if (store) {
      setFormData(prev => ({
        ...prev,
        name: store.name || prev.name,
        type: store.type || prev.type,
        is_customer: store.is_customer ?? prev.is_customer,
        sub_district: store.sub_district_name || prev.sub_district,
        district: store.district_name || prev.district,
        phone: store.phone || prev.phone,
        additional_info: store.additional_info || prev.additional_info
      }));
      setPinPosition({ lat: store.lat, lng: store.lng });
      // ALWAYS pull real GPS to enforce presence, but don't overwrite existing store address
      getCurrentLocation(false);
    } else {
      // If it's a new store, pull GPS immediately and auto-fill address
      getCurrentLocation(true);
    }
  }, [store]);

  const handleSave = async () => {
    setSaving(true);
    setSaveProgress(10);
    setSaveStatusText('กำลังเตรียมข้อมูล...');

    // 1. Upload Photos to Cloudinary
    let uploadedUrls: string[] = [];
    try {
      if (photoFiles.length > 0) {
        setSaveStatusText(`กำลังอัปโหลดรูปภาพ...`);
        let completed = 0;
        
        // Parallel upload for much faster performance
        const uploadPromises = photoFiles.map(async (file) => {
          const url = await uploadToCloudinary(file);
          completed++;
          const p = 10 + Math.round((completed / photoFiles.length) * 60); // progress reaches 70%
          setSaveProgress(p);
          return url;
        });
        
        uploadedUrls = await Promise.all(uploadPromises);
      } else {
        // Use existing photo URLs (mockup mode)
        uploadedUrls = photos;
        setSaveProgress(70);
        setSaveStatusText('เตรียมรูปภาพเสร็จสิ้น...');
      }
      console.log("📸 Uploaded URLs:", uploadedUrls);
    } catch (error) {
      console.error("Cloudinary error:", error);
      uploadedUrls = photos; // Fallback to whatever we have (previews or mockups)
    }

    setSaveProgress(80);
    setSaveStatusText('กำลังบันทึกข้อมูลสาขาลงแอปพลิเคชัน...');

    // Create a clean address with only specific details
    const cleanAddressLines = [];
    if (formData.house_number) cleanAddressLines.push(`เลขที่ ${formData.house_number}`);
    if (formData.moo) cleanAddressLines.push(`หมู่ ${formData.moo}`);
    if (formData.soi) cleanAddressLines.push(`ซอย ${formData.soi}`);
    const cleanAddress = cleanAddressLines.join(' ');

    // Map sub-district name to its ID
    const zone = mockSubDistricts.find(z => z.name_th === formData.sub_district);
    const subDistrictId = zone?.id || null;

    // Prepare photo URLs for JSON storage
    const finalPhotos = uploadedUrls.length > 0 ? uploadedUrls : photos;
    const photoJson = JSON.stringify(finalPhotos);

    if (storeId) {
      await addVisit({
        store_id: storeId,
        status: 'SUCCESS',
        photo_url: photoJson,
        notes: `Checked in (Dist: ${distance.toFixed(0)}m). Reason: ${discrepancyReason || '-'}`
      });
      await updateStore(storeId, {
        status: 'SUCCESS',
        is_customer: formData.is_customer,
        photo_url: photoJson,
        address: cleanAddress,
        sub_district: formData.sub_district,
        district: formData.district,
        phone: formData.phone,
        sub_district_id: subDistrictId,
        created_at: new Date(Date.now() + 7 * 60 * 60 * 1000).toISOString().slice(0, 19).replace('T', ' ')
      });
    } else {
      await addStore({
        name: formData.name,
        type: formData.type || 'grocery',
        is_customer: formData.is_customer,
        address: cleanAddress,
        sub_district: formData.sub_district,
        district: formData.district,
        phone: formData.phone,
        additional_info: formData.additional_info,
        lat: pinPosition.lat,
        lng: pinPosition.lng,
        status: 'SUCCESS',
        photo_url: photoJson,
        created_by: currentDriver ? currentDriver.name : 'Driver (Check-in)',
        discrepancy_reason: discrepancyReason,
        verification_status: 'PENDING',
        sub_district_id: subDistrictId,
        created_at: new Date(Date.now() + 7 * 60 * 60 * 1000).toISOString().slice(0, 19).replace('T', ' ')
      });
    }

    setSaveProgress(100);
    setSaveStatusText('บันทึกสำเร็จ!');

    setTimeout(() => {
      setSaving(false);
      setSaveProgress(0);
      if (storeId) {
        navigate(`/driver/sales?storeId=${storeId}`);
      } else {
        navigate('/driver');
      }
    }, 400); // Reduced delay to make it feel faster
  };

  const handleNotFound = async () => {
    if (window.confirm('คุณแน่ใจหรือไม่ว่าไม่มีร้านค้าอยู่ในพิกัดนี้? หมุดนี้จะถูกลบออกจากการมองเห็นของคนขับทันที')) {
      setSaving(true);
      setSaveProgress(50);
      setSaveStatusText('กำลังอัปเดตระบบ (ไม่พบร้านค้า)...');
      
      try {
        await updateStore(storeId!, {
          status: 'NOT_FOUND',
          verification_status: 'REJECTED',
          discrepancy_reason: discrepancyReason || 'ไม่พบร้านค้าในพิกัดจริง (แจ้งโดยคนขับ)'
        });
        
        await addVisit({
          store_id: storeId!,
          status: 'FAILED',
          notes: 'ไม่พบร้านค้าในพิกัดจริง (Driver reported: No Store)'
        });

        setSaveProgress(100);
        setTimeout(() => {
          setSaving(false);
          navigate('/driver');
        }, 400);
      } catch (err) {
        console.error(err);
        setSaving(false);
      }
    }
  };

  const isFormValid = useMemo(() => {
    const baseValid = formData.name.trim() !== '' && (storeId ? photos.length >= 3 : photoFiles.length >= 3);
    if (isFarAway) {
      return baseValid && discrepancyReason.trim().length > 5;
    }
    return baseValid;
  }, [formData.name, photos.length, photoFiles.length, storeId, isFarAway, discrepancyReason]);

  const getValidationError = () => {
    if (formData.name.trim() === '') return 'กรุณาระบุชื่อร้านค้า';
    if (storeId && photos.length < 3) return 'กรุณาอัปโหลดภาพให้ครบ 3 รูป';
    if (!storeId && photoFiles.length < 3) return 'กรุณาอัปโหลดภาพให้ครบ 3 รูป';
    if (isFarAway && discrepancyReason.trim().length <= 5) return 'เนื่องจากคุณอยู่นอกพื้นที่ รบกวนระบุเหตุผล (อย่างน้อย 5 ตัวอักษร)';
    return null;
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const files = Array.from(e.target.files);
      setPhotoFiles(prev => [...prev, ...files].slice(0, 3));

      // Update preview URLs
      const urls = files.map(f => window.URL.createObjectURL(f as Blob));
      setPhotos(prev => [...prev, ...urls].slice(0, 3));
    }
  };

  const handlePhotoClick = () => {
    fileInputRef.current?.click();
  };

  const removePhoto = (index: number) => {
    setPhotos(prev => prev.filter((_, i) => i !== index));
    setPhotoFiles(prev => prev.filter((_, i) => i !== index));
  };

  const fillMockPhotos = () => {
    setPhotos([
      "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=400",
      "https://images.unsplash.com/photo-1604719312566-8912e9227c6a?auto=format&fit=crop&q=80&w=400",
      "https://images.unsplash.com/photo-1534723452862-4c874018d66d?auto=format&fit=crop&q=80&w=400"
    ]);
    setPhotoFiles([]); // Clear real files since we use mocks
  };

  return (
    <div className="animate-in fade-in slide-in-from-right-4 duration-500 pb-20 bg-slate-50 min-h-screen relative">
      {/* Saving Loading Popup */}
      {saving && (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center p-6 sm:p-0">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-300"></div>
          <div className="bg-white rounded-[2.5rem] p-10 flex flex-col items-center gap-6 shadow-2xl relative z-10 animate-in zoom-in-95 duration-300 max-w-xs w-full">
            <div className="relative">
              <div className="w-16 h-16 rounded-full border-4 border-slate-100"></div>
              <div className="absolute top-0 left-0 w-16 h-16 rounded-full border-4 border-primary border-t-transparent animate-spin"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="material-symbols-outlined text-primary text-2xl">cloud_upload</span>
              </div>
            </div>
            <div className="text-center">
              <h3 className="text-xl font-black text-slate-800 tracking-tighter mb-2">กำลังบันทึกข้อมูล...</h3>
              <p className="text-sm text-slate-500 font-medium">กรุณารอสักครู่ ระบบกำลังอัปโหลดพิกัดและรูปภาพของคุณ</p>
            </div>
          </div>
        </div>
      )}

      {/* Mobile-First Header */}
      <div className="sticky top-0 z-[1000] bg-white/80 backdrop-blur-xl border-b border-slate-100 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 active:scale-90 transition-transform">
            <span className="material-symbols-outlined">arrow_back</span>
          </button>
          <div>
            <h1 className="text-lg font-black text-blue-900 tracking-tighter">
              {storeId ? 'สำรวจร้านค้า' : 'เพิ่มร้านค้าใหม่'}
            </h1>
            <div className="flex items-center gap-1.5">
              <span className={`w-1.5 h-1.5 rounded-full ${storeId ? 'bg-secondary' : 'bg-primary'}`}></span>
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                {storeId ? 'Store Survey Mode' : 'New Prospect Mode'}
              </span>
            </div>
          </div>
        </div>
        {!storeId && (
          <div className="bg-primary/10 text-primary text-[10px] font-black px-2.5 py-1 rounded-full uppercase tracking-tighter border border-primary/20">
            Field Survey
          </div>
        )}
      </div>

      {/* Map Section for Precise Check-in */}
      <section className="relative h-64 w-full bg-slate-200 z-10 shadow-sm overflow-hidden">
        <MapContainer
          center={[pinPosition.lat, pinPosition.lng]}
          zoom={18}
          scrollWheelZoom={true}
          className="h-full w-full"
          zoomControl={false}
        >
          <ZoomControl position="bottomright" />
          <ChangeMapView coords={pinPosition} />
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.google.com/vt/lyrs=m&x={x}&y={y}&z={z}"
            subdomains={['mt0', 'mt1', 'mt2', 'mt3']}
          />
          <Marker
            position={[pinPosition.lat, pinPosition.lng]}
            icon={fixedPinIcon}
            draggable={false}
          />
        </MapContainer>

        {/* GPS Overlay inside map */}
        <div className="absolute bottom-4 left-4 right-4 z-[400] flex justify-between items-end pointer-events-none">
          <div className={`pointer-events-auto bg-white/95 backdrop-blur shadow-lg rounded-2xl p-3 px-4 border ${isLocating ? 'border-primary' : (accuracy > 10 ? 'border-amber-200' : 'border-emerald-200')}`}>
            <div className="flex items-center gap-2 mb-1">
              <span className={`w-2 h-2 rounded-full animate-pulse ${isLocating ? 'bg-primary' : (accuracy > 10 ? 'bg-amber-500' : 'bg-emerald-500')}`}></span>
              <span className={`text-[10px] font-black uppercase tracking-widest ${isLocating ? 'text-primary' : (accuracy > 10 ? 'text-amber-600' : 'text-emerald-600')}`}>
                {isLocating ? 'ค้นหาสัญญาณ GPS...' : 'ความแม่นยำ GPS'}
              </span>
            </div>
            <p className="font-bold text-slate-700 text-sm">
              {isLocating ? `กำลังประมวลผล (คลาดเคลื่อน ${accuracy}m)` : `คลาดเคลื่อน ${accuracy} เมตร`}
            </p>
          </div>
          <button
            className={`pointer-events-auto w-12 h-12 bg-white rounded-full shadow-lg flex items-center justify-center text-primary active:scale-90 transition-transform hover:bg-slate-50 ${isLocating ? 'opacity-70 cursor-not-allowed' : ''}`}
            onClick={() => !isLocating && getCurrentLocation(!store)}
            disabled={isLocating}
          >
            <span className={`material-symbols-outlined ${isLocating ? 'animate-spin' : ''}`} style={{ fontVariationSettings: "'FILL' 1" }}>
              {isLocating ? 'sync' : 'my_location'}
            </span>
          </button>
        </div>
      </section>

      {/* GPS Distance Warning */}
      {isFarAway && (
        <div className="p-4 bg-amber-50 rounded-2xl border border-amber-200 flex items-start gap-3 mb-4 animate-in zoom-in-95">
          <span className="material-symbols-outlined text-amber-500 mt-0.5">location_off</span>
          <div>
            <p className="text-xs font-black text-amber-800 uppercase tracking-tighter">พิกัดไม่ตรงกับที่ตั้งร้าน!</p>
            <p className="text-[10px] text-amber-600 font-bold mb-3">คุณอยู่ห่างจากร้านเดิมประมาณ {distance.toFixed(0)} เมตร</p>
            <textarea
              placeholder="ทำไมพิกัดถึงไม่ตรง? (เช่น จอดรถไกลร้าน, ปักหมุดผิด...)"
              className="w-full bg-white border border-amber-200 rounded-xl p-3 text-xs font-bold outline-none ring-amber-500/20 focus:ring-4 transition-all"
              rows={2}
              value={discrepancyReason}
              onChange={e => setDiscrepancyReason(e.target.value)}
            />
          </div>
        </div>
      )}

      {/* Form Details */}
      <main className="p-6 space-y-8 -mt-4 relative z-20">
        <section className="space-y-4">
          <div className="flex items-center gap-2 px-1 text-primary">
            <span className="material-symbols-outlined">storefront</span>
            <h2 className="font-bold text-lg font-headline">ข้อมูลร้านค้า</h2>
          </div>
          <div className="precision-card p-6 space-y-5 bg-white shadow-xl shadow-slate-200/50 border border-slate-100">
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">
                ชื่อร้านค้า <span className="text-error">*</span>
              </label>
              <input
                className="w-full bg-slate-50 border-none rounded-xl focus:ring-2 focus:ring-primary/20 py-3 px-4 font-bold text-slate-800 outline-none"
                type="text"
                placeholder="ระบุชื่อร้านค้า"
                value={formData.name}
                onChange={e => setFormData({ ...formData, name: e.target.value })}
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">
                ประเภทร้านค้า <span className="text-error">*</span>
              </label>
              <select
                className="w-full bg-slate-50 border-none rounded-xl focus:ring-2 focus:ring-primary/20 py-3 px-4 font-bold text-slate-800 outline-none appearance-none"
                value={formData.type}
                onChange={e => setFormData({ ...formData, type: e.target.value })}
              >
                <option value="โชห่วย / ร้านค้าปลีก">โชห่วย / ร้านค้าปลีก</option>
                <option value="ร้านค้าส่ง">ร้านค้าส่ง</option>
                <option value="ร้านอาหาร / คาเฟ่">ร้านอาหาร / คาเฟ่</option>
                <option value="มินิมาร์ท">มินิมาร์ท</option>
                <option value="อื่นๆ">อื่นๆ</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">
                เบอร์โทรติดต่อ <span className="text-slate-300 font-medium">(ไม่บังคับ)</span>
              </label>
              <input
                className="w-full bg-slate-50 border-none rounded-xl focus:ring-2 focus:ring-primary/20 py-3 px-4 font-bold text-slate-800 outline-none"
                type="tel"
                placeholder="เช่น 081-xxx-xxxx"
                value={formData.phone}
                onChange={e => setFormData({ ...formData, phone: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">อำเภอ</label>
                <select
                  className="w-full bg-slate-50 border-none rounded-xl focus:ring-2 focus:ring-primary/20 py-3 px-4 font-bold text-slate-800 outline-none appearance-none"
                  value={formData.district}
                  onChange={e => {
                    const newDistrict = e.target.value;
                    const firstSub = mockSubDistricts.find(s => s.parent_id === mockDistricts.find(d => d.name_th === newDistrict)?.id);
                    setFormData({ ...formData, district: newDistrict, sub_district: firstSub?.name_th || '' });
                  }}
                >
                  {mockDistricts.map(d => <option key={d.id} value={d.name_th}>{d.name_th}</option>)}
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">ตำบล</label>
                <select
                  className="w-full bg-slate-50 border-none rounded-xl focus:ring-2 focus:ring-primary/20 py-3 px-4 font-bold text-slate-800 outline-none appearance-none"
                  value={formData.sub_district}
                  onChange={e => setFormData({ ...formData, sub_district: e.target.value })}
                >
                  {mockSubDistricts
                    .filter(s => s.parent_id === mockDistricts.find(d => d.name_th === formData.district)?.id)
                    .map(s => <option key={s.id} value={s.name_th}>{s.name_th}</option>)
                  }
                </select>
              </div>

              {/* Is Customer Toggle */}
              <div 
                className={`col-span-2 p-4 rounded-xl cursor-pointer transition-all border-2 flex justify-between items-center ${formData.is_customer ? 'bg-secondary/10 border-secondary' : 'bg-slate-50 border-transparent hover:bg-slate-100'}`}
                onClick={() => setFormData({ ...formData, is_customer: !formData.is_customer })}
              >
                 <div className="flex items-center gap-3">
                    <span className={`material-symbols-outlined ${formData.is_customer ? 'text-secondary' : 'text-slate-400'}`}>
                      {formData.is_customer ? 'verified_user' : 'person_add'}
                    </span>
                    <div>
                       <p className={`font-bold text-sm ${formData.is_customer ? 'text-secondary' : 'text-slate-600'}`}>เป็นลูกค้าของเรา</p>
                       <p className="text-[10px] font-medium text-slate-400">เลื่อนเปิดเมื่อสินค้าของร้านที่พบตรงกับสินค้าของโกดังเรา</p>
                    </div>
                 </div>
                 <div className={`w-12 h-6 rounded-full p-1 transition-all flex ${formData.is_customer ? 'bg-secondary justify-end' : 'bg-slate-300 justify-start'}`}>
                    <div className="w-4 h-4 bg-white rounded-full shadow-sm"></div>
                 </div>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">เลขที่</label>
                <input
                  className="w-full bg-slate-50 border-none rounded-xl focus:ring-2 focus:ring-primary/20 py-3 px-3 font-bold text-slate-800 outline-none"
                  type="text"
                  placeholder="123/4"
                  value={formData.house_number}
                  onChange={e => setFormData({ ...formData, house_number: e.target.value })}
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">หมู่</label>
                <input
                  className="w-full bg-slate-50 border-none rounded-xl focus:ring-2 focus:ring-primary/20 py-3 px-3 font-bold text-slate-800 outline-none"
                  type="text"
                  placeholder="5"
                  value={formData.moo}
                  onChange={e => setFormData({ ...formData, moo: e.target.value })}
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">ซอย</label>
                <input
                  className="w-full bg-slate-50 border-none rounded-xl focus:ring-2 focus:ring-primary/20 py-3 px-3 font-bold text-slate-800 outline-none"
                  type="text"
                  placeholder="มิตรภาพ 4"
                  value={formData.soi}
                  onChange={e => setFormData({ ...formData, soi: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">ข้อมูลสถานที่เพิ่มเติม / จุดสังเกต</label>
              <input
                className="w-full bg-slate-50 border-none rounded-xl focus:ring-2 focus:ring-primary/20 py-3 px-3 font-medium text-slate-800 outline-none"
                type="text"
                placeholder="เช่น ติดกับร้านทอง, สังเกตป้ายสีแดงใหญ่..."
                value={formData.additional_info}
                onChange={e => setFormData({ ...formData, additional_info: e.target.value })}
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">
                พิกัด GPS ณ ปัจจุบัน <span className="text-error">*</span>
              </label>
              <div className="relative group">
                <span className="material-symbols-outlined absolute left-3 top-3 text-blue-500">location_on</span>
                <input
                  className="w-full bg-blue-50 border border-blue-100 focus:border-blue-300 rounded-xl py-3 pl-10 pr-12 font-mono font-black text-blue-700 text-sm outline-none cursor-pointer hover:bg-blue-100 transition-all focus:ring-4 focus:ring-blue-500/10"
                  type="text"
                  value={`${pinPosition.lat.toFixed(6)}, ${pinPosition.lng.toFixed(6)}`}
                  readOnly
                  onClick={() => window.open(`https://www.google.com/maps/search/?api=1&query=${pinPosition.lat},${pinPosition.lng}`, '_blank')}
                  title="คลิกเพื่อตรวจสอบพิกัดบน Google Maps"
                />
                <div className="absolute right-2 top-2 bottom-2 aspect-square flex items-center justify-center bg-blue-600 text-white rounded-lg group-hover:bg-blue-700 transition shadow-sm pointer-events-none">
                  <span className="material-symbols-outlined text-[16px]">explore</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Photo Section */}
        <section className="space-y-4">
          <div className="flex items-center justify-between px-1">
            <div className="flex items-center gap-2 text-primary">
              <span className="material-symbols-outlined">add_a_photo</span>
              <h2 className="font-bold text-lg font-headline">อัปโหลดรูปภาพ <span className="text-error">*</span></h2>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={fillMockPhotos}
                className="text-[9px] font-black bg-blue-100 text-blue-600 px-3 py-1 rounded-lg uppercase tracking-widest hover:bg-blue-200 transition-colors"
                type="button"
              >
                ใส่รูป Mockup
              </button>
              <div className={`text-[10px] font-black px-2 py-0.5 rounded-full ${photos.length >= 3 ? 'bg-secondary/10 text-secondary' : 'bg-primary/10 text-primary'}`}>
                {photos.length}/3 ภาพ
              </div>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-3">
            {[0, 1, 2].map(i => (
              <div
                key={i}
                onClick={handlePhotoClick}
                className={`aspect-square rounded-2xl flex flex-col items-center justify-center gap-2 border-2 border-dashed transition-all cursor-pointer relative overflow-hidden ${photos[i]
                    ? 'bg-secondary/5 border-secondary text-secondary shadow-inner'
                    : 'bg-white border-slate-200 text-slate-400 hover:border-primary/50'
                  }`}
              >
                {photos[i] ? (
                  <>
                    <img src={photos[i]} alt="preview" className="w-full h-full object-cover" />
                    <button
                      onClick={(e) => { e.stopPropagation(); removePhoto(i); }}
                      className="absolute top-1 right-1 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center shadow-lg"
                    >
                      <span className="material-symbols-outlined text-sm">close</span>
                    </button>
                  </>
                ) : (
                  <>
                    <span className="material-symbols-outlined text-2xl text-slate-300">add_photo_alternate</span>
                    <span className="text-[9px] font-black uppercase tracking-tighter text-slate-400">
                      {i === 0 ? 'หน้าร้าน' : i === 1 ? 'ในร้าน' : 'สินค้า'}
                    </span>
                  </>
                )}
              </div>
            ))}
            <input
              type="file"
              ref={fileInputRef}
              className="hidden"
              accept="image/*"
              multiple
              onChange={handleFileChange}
            />
          </div>
        </section>

        {/* Actions */}
        <section className="flex flex-col gap-3 pt-4">
          <button
            onClick={handleSave}
            disabled={!isFormValid || saving}
            className={`w-full py-4 rounded-2xl font-black text-lg flex items-center justify-center gap-3 transition-all shadow-lg ${!isFormValid || saving ? 'bg-slate-300 text-slate-500 shadow-none cursor-not-allowed' : 'btn-primary shadow-blue-500/30'}`}
          >
            {saving ? (
              <span className="material-symbols-outlined animate-spin">progress_activity</span>
            ) : (
              !isFormValid ? <span className="material-symbols-outlined">info</span> : <span className="material-symbols-outlined">{storeId ? 'where_to_vote' : 'library_add'}</span>
            )}
            {saving ? 'กำลังบันทึกพิกัด...' : (!isFormValid ? getValidationError() : (storeId ? 'บันทึกข้อมูลผลการสำรวจ' : 'เก็บบันทึกข้อมูลร้านใหม่'))}
          </button>

          {storeId && store?.status === 'UNSURVEYED' && (
            <button
              onClick={handleNotFound}
              disabled={saving}
              className="w-full py-4 rounded-2xl font-black text-sm flex items-center justify-center gap-3 bg-white text-red-500 border-2 border-red-100 hover:bg-red-50 active:scale-95 transition-all mt-2"
            >
              <span className="material-symbols-outlined">cancel</span>
              ไม่พบร้านค้าในพิกัดนี้ (หมุดผิดพลาด/ลบหมุด)
            </button>
          )}
        </section>
      </main>

      {/* Saving Percentage Overlay */}
      {saving && (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm z-[9999] flex flex-col items-center justify-center p-8 animate-in fade-in duration-300">
          <div className="w-full max-w-sm bg-white p-8 rounded-[2rem] shadow-2xl flex flex-col items-center text-center animate-in zoom-in-95 duration-500">
            <div className="w-20 h-20 mb-6 bg-primary/10 text-primary rounded-full flex items-center justify-center">
              <span className="material-symbols-outlined text-4xl animate-spin">data_usage</span>
            </div>
            <h3 className="text-xl font-black text-slate-800 mb-2">กำลังบันทึกข้อมูล...</h3>
            <p className="text-xs font-bold text-slate-400 mb-6">{saveStatusText}</p>
            
            <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden relative">
              <div 
                className="absolute inset-y-0 left-0 bg-primary transition-all duration-300 ease-out" 
                style={{ width: `${saveProgress}%` }}
              ></div>
            </div>
            <div className="mt-3 text-sm font-black text-primary">{saveProgress}%</div>
          </div>
        </div>
      )}
    </div>
  );
}
