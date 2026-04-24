import { useState, useRef, useEffect, useCallback } from "react";
import { createIssue } from "../services/api";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import Webcam from "react-webcam";

function ReportIssueForm({ onSuccess, embedded = false }) {
    const [form, setForm] = useState({
        title: "",
        description: "",
        category: "",
        location: { lat: null, lng: null, address: "Not set" },
        image: null,
    });

    const [loading, setLoading] = useState(false);
    const [msg, setMsg] = useState("");
    const [searchQuery, setSearchQuery] = useState("");
    const [searchResults, setSearchResults] = useState([]);
    const [showResults, setShowResults] = useState(false);
    const [showMap, setShowMap] = useState(false);
    const [useCamera, setUseCamera] = useState(false);
    const [imagePreview, setImagePreview] = useState(null);
    const [isDragging, setIsDragging] = useState(false);
    
    const webcamRef = useRef(null);
    const mapRef = useRef(null);
    const mapInstanceRef = useRef(null);
    const markerRef = useRef(null);

    // Initialize focused map when showMap becomes true
    useEffect(() => {
        if (showMap && mapRef.current && !mapInstanceRef.current) {
            const lat = form.location.lat || 20.5937;
            const lng = form.location.lng || 78.9629;

            mapInstanceRef.current = L.map(mapRef.current, {
                zoom: 15,
                center: [lat, lng],
                zoomControl: true,
                scrollWheelZoom: true,
            });

            L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
                attribution: '&copy; OpenStreetMap contributors',
            }).addTo(mapInstanceRef.current);

            // Add draggable marker
            if (form.location.lat && form.location.lng) {
                markerRef.current = L.marker([form.location.lat, form.location.lng], {
                    draggable: true,
                }).addTo(mapInstanceRef.current).bindPopup(`${form.location.address}`);

                markerRef.current.on("dragend", async (e) => {
                    const { lat, lng } = e.target.getLatLng();
                    reverseGeocode(lat, lng);
                });
            }

            // Click to set marker
            mapInstanceRef.current.on("click", async (e) => {
                const { lat, lng } = e.latlng;
                if (markerRef.current) mapInstanceRef.current.removeLayer(markerRef.current);
                
                markerRef.current = L.marker([lat, lng], { draggable: true })
                    .addTo(mapInstanceRef.current)
                    .bindPopup(`Updating...`)
                    .openPopup();

                reverseGeocode(lat, lng);
                
                markerRef.current.on("dragend", async (dragEvent) => {
                    const dragLat = dragEvent.target.getLatLng().lat;
                    const dragLng = dragEvent.target.getLatLng().lng;
                    reverseGeocode(dragLat, dragLng);
                });
            });
        }

        return () => {
            if (mapInstanceRef.current) {
                mapInstanceRef.current.off();
            }
        };
    }, [showMap, form.location]);

    const reverseGeocode = async (lat, lng) => {
        try {
            const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`);
            const data = await response.json();
            const address = data.address?.road || data.display_name || "Selected location";
            
            setForm((prevForm) => ({
                ...prevForm,
                location: { lat: lat.toFixed(4), lng: lng.toFixed(4), address },
            }));
            if (markerRef.current) markerRef.current.setPopupContent(address);
        } catch (err) {
            setForm((prevForm) => ({
                ...prevForm,
                location: { lat: lat.toFixed(4), lng: lng.toFixed(4), address: "Selected location" },
            }));
        }
    };

    // Get current location
    const handleCurrentLocation = () => {
        if (navigator.geolocation) {
            setMsg("Getting your location...");
            navigator.geolocation.getCurrentPosition(
                async (position) => {
                    const { latitude, longitude } = position.coords;
                    await reverseGeocode(latitude, longitude);
                    setMsg("✓ Current location captured!");
                    setShowMap(true);
                    if (mapInstanceRef.current) {
                        mapInstanceRef.current.setView([latitude, longitude], 15);
                    }
                },
                (error) => {
                    setMsg("Unable to get location. Please allow location access.");
                }
            );
        } else {
            setMsg("Geolocation is not supported by your browser.");
        }
    };

    // Search locations
    const handleLocationSearch = async (query) => {
        setSearchQuery(query);
        if (query.length < 3) {
            setSearchResults([]);
            setShowResults(false);
            return;
        }

        try {
            const response = await fetch(`https://nominatim.openstreetmap.org/search?q=${query}&format=json&limit=5`);
            const data = await response.json();
            setSearchResults(data);
            setShowResults(true);
        } catch (err) {
            setMsg("Error searching locations");
        }
    };

    const handleSelectLocation = (result) => {
        setForm({
            ...form,
            location: {
                lat: parseFloat(result.lat).toFixed(4),
                lng: parseFloat(result.lon).toFixed(4),
                address: result.display_name || result.name,
            },
        });
        setSearchQuery(result.display_name || result.name);
        setShowResults(false);
        setSearchResults([]);
        setShowMap(true);
        setMsg("✓ Location selected!");
        
        if (mapInstanceRef.current) {
            mapInstanceRef.current.setView([result.lat, result.lon], 15);
        }
    };

    // Photo Handlers
    const processFile = (file) => {
        if (file && file.type.startsWith('image/')) {
            setForm({ ...form, image: file });
            const reader = new FileReader();
            reader.onloadend = () => setImagePreview(reader.result);
            reader.readAsDataURL(file);
            setMsg("✓ Photo selected!");
        } else {
            setMsg("Please upload a valid image file.");
        }
    };

    const handleFileChange = (e) => processFile(e.target.files[0]);
    
    const onDragOver = useCallback((e) => { e.preventDefault(); setIsDragging(true); }, []);
    const onDragLeave = useCallback((e) => { e.preventDefault(); setIsDragging(false); }, []);
    const onDrop = useCallback((e) => {
        e.preventDefault();
        setIsDragging(false);
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            processFile(e.dataTransfer.files[0]);
        }
    }, []);

    const handleCapturePhoto = () => {
        if (webcamRef.current) {
            const imageSrc = webcamRef.current.getScreenshot();
            fetch(imageSrc).then((res) => res.blob()).then((blob) => {
                const file = new File([blob], "camera-capture.jpg", { type: "image/jpeg" });
                setForm({ ...form, image: file });
                setImagePreview(imageSrc);
                setUseCamera(false);
                setMsg("✓ Photo captured!");
            });
        }
    };

    const handleClearImage = () => {
        setForm({ ...form, image: null });
        setImagePreview(null);
        setUseCamera(false);
        setMsg("");
    };

    const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!form.title.trim() || !form.description.trim() || !form.category || !form.location.lat || !form.image) {
            setMsg("Please fill all required fields, select a location, and upload a photo.");
            return;
        }

        setLoading(true);
        setMsg("");

        try {
            const data = new FormData();
            data.append("title", form.title);
            data.append("description", form.description);
            data.append("category", form.category);
            data.append("location", JSON.stringify({
                lat: parseFloat(form.location.lat),
                lng: parseFloat(form.location.lng),
                address: form.location.address,
            }));
            data.append("image", form.image);

            await createIssue(data);
            setMsg("✓ Issue reported successfully!");
            setForm({ title: "", description: "", category: "", location: { lat: null, lng: null, address: "Not set" }, image: null });
            setShowMap(false);
            setImagePreview(null);

            if (onSuccess) onSuccess();
        } catch (err) {
            setMsg(err.response?.data?.msg || "Error reporting issue");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={`w-full text-slate-800 font-sans bg-white border border-slate-200 rounded-3xl ${embedded ? 'p-4 md:p-6 shadow-sm' : 'p-6 md:p-8 max-w-6xl mx-auto shadow-xl'}`}>
            
            {msg && (
                <div className={`mb-6 p-4 rounded-xl font-medium text-sm border flex items-center gap-3 animate-fade-in ${
                    msg.includes("successfully") || msg.includes("✓")
                        ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                        : "bg-red-50 text-red-700 border-red-200"
                }`}>
                    <span className="text-lg">{msg.includes("✓") ? "✅" : "⚠️"}</span>
                    {msg}
                </div>
            )}

            <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 pb-4">
                
                {/* ── LEFT COLUMN: Text Inputs & Location ── */}
                <div className="flex flex-col" style={{ gap: '20px' }}>
                    <h2 className="text-xl font-bold tracking-tight mb-2 flex items-center gap-2 border-b border-slate-100 pb-3">
                        <span className="bg-indigo-100 text-indigo-700 w-8 h-8 rounded-lg flex items-center justify-center text-sm">01</span>
                        Issue Details
                    </h2>
                    
                    {/* Title */}
                    <div className="flex flex-col" style={{ gap: '8px' }}>
                        <label htmlFor="title" className="text-sm font-bold text-slate-700 ml-1">
                            Issue Title
                        </label>
                        <input
                            type="text" name="title" id="title"
                            value={form.title} onChange={handleChange} required
                            className="w-full px-4 py-3 text-slate-900 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all shadow-sm"
                            placeholder="Brief title of the issue"
                        />
                    </div>

                    {/* Category */}
                    <div className="flex flex-col" style={{ gap: '8px' }}>
                        <label htmlFor="category" className="text-sm font-bold text-slate-700 ml-1">
                            Category
                        </label>
                        <div className="relative">
                            <select
                                name="category" id="category"
                                value={form.category} onChange={handleChange} required
                                className="w-full px-4 py-3 text-slate-900 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all shadow-sm appearance-none"
                            >
                                <option value="" disabled hidden>Select a category</option>
                                <option value="Roads">🛣️ Roads</option>
                                <option value="Water">💧 Water</option>
                                <option value="Sanitation">🧹 Sanitation</option>
                                <option value="Electricity">⚡ Electricity</option>
                            </select>
                            <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none text-slate-400">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                            </div>
                        </div>
                    </div>

                    {/* Description */}
                    <div className="flex flex-col" style={{ gap: '8px' }}>
                        <label htmlFor="description" className="text-sm font-bold text-slate-700 ml-1">
                            Detailed Description
                        </label>
                        <textarea
                            name="description" id="description"
                            value={form.description} onChange={handleChange} required rows="4"
                            className="w-full px-4 py-3 text-slate-900 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all shadow-sm resize-none"
                            placeholder="Provide detailed information about the issue"
                        />
                    </div>

                    {/* Location Selection */}
                    <div className="bg-white border border-slate-200 p-5 rounded-2xl transition-all shadow-sm flex flex-col mt-2" style={{ gap: '16px' }}>
                        <div className="flex justify-between items-center">
                            <h3 className="font-bold text-slate-800 flex items-center gap-2">
                                <span className="text-blue-500 text-lg">📍</span> Location Info
                            </h3>
                            {form.location.lat ? (
                                <span className="px-2.5 py-1 bg-emerald-50 text-emerald-600 text-xs rounded-lg border border-emerald-200 font-bold">Selected</span>
                            ) : (
                                <span className="px-2.5 py-1 bg-red-50 text-red-600 text-xs rounded-lg border border-red-200 font-bold">Required</span>
                            )}
                        </div>
                        
                        <div className="relative">
                            <input
                                type="text"
                                placeholder="Search location (e.g., 'Main Street')"
                                value={searchQuery}
                                onChange={(e) => handleLocationSearch(e.target.value)}
                                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all shadow-sm"
                            />
                            {showResults && searchResults.length > 0 && (
                                <div className="absolute top-full left-0 right-0 bg-white border border-slate-200 rounded-xl mt-2 shadow-lg max-h-48 overflow-y-auto z-50">
                                    {searchResults.map((result, i) => (
                                        <button
                                            key={i} type="button"
                                            onClick={() => handleSelectLocation(result)}
                                            className="w-full text-left px-4 py-3 hover:bg-slate-50 border-b border-slate-100 last:border-0 transition text-sm flex flex-col gap-1"
                                        >
                                            <div className="font-semibold text-slate-800">{result.name}</div>
                                            <div className="text-slate-500 text-xs truncate">{result.display_name}</div>
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>

                        <button
                            type="button" onClick={handleCurrentLocation}
                            className="w-full bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold px-4 py-3 rounded-xl transition border border-indigo-200 flex items-center justify-center gap-2 shadow-sm"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
                            Use Current Location
                        </button>

                        {showMap && form.location.lat && (
                            <div className="animate-fade-in flex flex-col gap-2">
                                <div ref={mapRef} className="w-full h-48 rounded-xl border border-slate-200 z-0 relative shadow-inner overflow-hidden" style={{ backgroundColor: "#f8fafc" }}></div>
                                <p className="text-[11px] text-slate-500 text-center font-medium">Drag the marker to adjust exactly</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* ── RIGHT COLUMN: Photo Upload & Submit ── */}
                <div className="flex flex-col h-full" style={{ gap: '20px' }}>
                    <h2 className="text-xl font-bold tracking-tight mb-2 flex items-center gap-2 border-b border-slate-100 pb-3">
                        <span className="bg-indigo-100 text-indigo-700 w-8 h-8 rounded-lg flex items-center justify-center text-sm">02</span>
                        Visual Evidence
                    </h2>

                    {/* Photo Upload Area */}
                    <div className="flex-1 bg-white border border-slate-200 shadow-sm p-5 rounded-2xl transition-all hover:border-slate-300 flex flex-col min-h-[320px]">
                        
                        {imagePreview ? (
                            <div className="flex flex-col h-full animate-fade-in" style={{ gap: '16px' }}>
                                <div className="relative group flex-1 rounded-xl overflow-hidden border border-slate-200 shadow-sm min-h-[200px]">
                                    <img src={imagePreview} alt="Preview" className="w-full h-full object-cover absolute inset-0" />
                                    <div className="absolute inset-0 bg-slate-900/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-sm">
                                        <button type="button" onClick={handleClearImage} className="bg-red-500 hover:bg-red-600 text-white px-5 py-2.5 rounded-xl font-bold transition flex items-center gap-2 shadow-lg transform hover:scale-105">
                                            🗑️ Remove Photo
                                        </button>
                                    </div>
                                </div>
                                <div className="bg-emerald-50 border border-emerald-200 p-4 rounded-xl flex items-center justify-center shadow-sm">
                                    <p className="font-bold text-emerald-700 text-sm flex items-center gap-2">
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                                        Evidence Attached Successfully
                                    </p>
                                </div>
                            </div>
                        ) : (
                            <div className="flex flex-col h-full justify-between" style={{ gap: '16px' }}>
                                {!useCamera ? (
                                    <>
                                        <div 
                                            onDragOver={onDragOver} onDragLeave={onDragLeave} onDrop={onDrop}
                                            className={`flex-1 border-2 border-dashed rounded-xl p-6 flex flex-col items-center justify-center transition-all cursor-pointer min-h-[200px] bg-slate-50 ${
                                                isDragging ? 'border-indigo-500 bg-indigo-50' : 'border-slate-300 hover:border-indigo-400 hover:bg-slate-100'
                                            }`}
                                        >
                                            <label className="w-full h-full flex flex-col items-center justify-center cursor-pointer gap-2">
                                                <input type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
                                                <div className="w-16 h-16 mb-2 rounded-full bg-white flex items-center justify-center border border-slate-200 shadow-sm text-indigo-500 transition-transform transform hover:scale-110">
                                                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                                                </div>
                                                <p className="text-slate-800 font-bold text-lg">Click or drag image here</p>
                                                <p className="text-slate-500 text-sm text-center font-medium">Supports JPG, PNG • Max 5MB</p>
                                            </label>
                                        </div>
                                        
                                        <div className="flex items-center gap-4 py-1">
                                            <div className="h-px bg-slate-200 flex-1"></div>
                                            <span className="text-slate-400 text-sm font-bold">OR</span>
                                            <div className="h-px bg-slate-200 flex-1"></div>
                                        </div>

                                        <button
                                            type="button" onClick={() => setUseCamera(true)}
                                            className="w-full bg-white text-slate-800 font-bold px-4 py-3.5 rounded-xl hover:bg-slate-50 transition border border-slate-200 shadow-sm flex items-center justify-center gap-2 group"
                                        >
                                            <span className="group-hover:scale-110 transition-transform text-lg">📷</span> Use Device Camera
                                        </button>
                                    </>
                                ) : (
                                    <div className="flex flex-col h-full animate-fade-in flex-1" style={{ gap: '16px' }}>
                                        <div className="flex-1 rounded-xl overflow-hidden border border-slate-200 bg-slate-900 relative min-h-[200px] shadow-inner">
                                            <Webcam ref={webcamRef} screenshotFormat="image/jpeg" className="absolute inset-0 w-full h-full object-cover" />
                                        </div>
                                        <div className="flex gap-3">
                                            <button type="button" onClick={handleCapturePhoto} className="flex-1 bg-indigo-600 text-white font-bold px-4 py-3.5 rounded-xl hover:bg-indigo-700 shadow-md hover:shadow-lg transition transform hover:-translate-y-0.5">
                                                📸 Capture Photo
                                            </button>
                                            <button type="button" onClick={() => setUseCamera(false)} className="flex-1 bg-white hover:bg-slate-50 text-slate-800 font-bold px-4 py-3.5 rounded-xl transition border border-slate-200 shadow-sm">
                                                Cancel
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Helpful Tips Card */}
                    <div className="bg-indigo-50 border border-indigo-100 rounded-2xl p-5 flex items-start gap-4 shadow-sm">
                        <div className="text-2xl mt-0.5">💡</div>
                        <div className="flex flex-col gap-1.5">
                            <h4 className="text-indigo-900 font-bold text-sm">Tips for faster resolution</h4>
                            <ul className="text-indigo-700 text-xs list-disc list-inside flex flex-col gap-1 font-medium">
                                <li>Ensure the photo is clear and well-lit.</li>
                                <li>Provide specific landmarks in description.</li>
                                <li>Pinpoint the exact location on the map.</li>
                            </ul>
                        </div>
                    </div>

                    {/* Submit Button */}
                    <button
                        type="submit"
                        className={`w-full font-bold py-4 px-6 rounded-2xl transition-all duration-300 text-lg flex items-center justify-center gap-3 relative overflow-hidden group shadow-md mt-auto ${
                            form.title && form.description && form.category && form.location.lat && form.image && !loading
                                ? "bg-indigo-600 text-white hover:bg-indigo-700 hover:shadow-lg transform hover:-translate-y-1"
                                : "bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200 shadow-none"
                        }`}
                        disabled={!form.title || !form.description || !form.category || !form.location.lat || !form.image || loading}
                    >
                        {/* Hover overlay */}
                        <div className="absolute inset-0 bg-white/10 transform translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out"></div>
                        
                        <span className="relative z-10 flex items-center justify-center gap-2">
                            {loading ? (
                                <>
                                    <svg className="animate-spin h-5 w-5 text-current" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                                    </svg>
                                    Submitting Report...
                                </>
                            ) : (
                                <>
                                    🚀 Submit Civic Report
                                </>
                            )}
                        </span>
                    </button>
                </div>
            </form>
        </div>
    );
}

export default ReportIssueForm;
