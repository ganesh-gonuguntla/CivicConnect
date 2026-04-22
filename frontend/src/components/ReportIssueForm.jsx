import { useState, useRef, useEffect } from "react";
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
                touchZoom: true,
                doubleClickZoom: true,
            }).setView([lat, lng], 15);

            L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
                attribution:
                    '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
            }).addTo(mapInstanceRef.current);

            // Add zoom controls
            L.control.zoom({ position: 'topleft' }).addTo(mapInstanceRef.current);

            // Add draggable marker at selected location
            if (form.location.lat && form.location.lng) {
                markerRef.current = L.marker([form.location.lat, form.location.lng], {
                    draggable: true,
                })
                    .addTo(mapInstanceRef.current)
                    .bindPopup(`${form.location.address}`);

                // Handle marker drag
                markerRef.current.on("dragend", async (e) => {
                    const { lat, lng } = e.target.getLatLng();
                    
                    // Reverse geocode to get address
                    try {
                        const response = await fetch(
                            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`
                        );
                        const data = await response.json();
                        
                        setForm((prevForm) => ({
                            ...prevForm,
                            location: {
                                lat: lat.toFixed(4),
                                lng: lng.toFixed(4),
                                address: data.address?.road || data.display_name || "Selected location",
                            },
                        }));
                    } catch (err) {
                        setForm((prevForm) => ({
                            ...prevForm,
                            location: {
                                lat: lat.toFixed(4),
                                lng: lng.toFixed(4),
                                address: "Selected location",
                            },
                        }));
                    }
                });
            }

            // Click on map to place marker
            mapInstanceRef.current.on("click", async (e) => {
                const { lat, lng } = e.latlng;

                // Remove old marker if exists
                if (markerRef.current) {
                    mapInstanceRef.current.removeLayer(markerRef.current);
                }

                // Create new draggable marker
                markerRef.current = L.marker([lat, lng], {
                    draggable: true,
                })
                    .addTo(mapInstanceRef.current)
                    .bindPopup(`Updating...`)
                    .openPopup();

                // Reverse geocode to get address
                try {
                    const response = await fetch(
                        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`
                    );
                    const data = await response.json();
                    
                    setForm((prevForm) => ({
                        ...prevForm,
                        location: {
                            lat: lat.toFixed(4),
                            lng: lng.toFixed(4),
                            address: data.address?.road || data.display_name || "Selected location",
                        },
                    }));

                    markerRef.current.setPopupContent(data.address?.road || data.display_name || "Selected location");
                } catch (err) {
                    setForm((prevForm) => ({
                        ...prevForm,
                        location: {
                            lat: lat.toFixed(4),
                            lng: lng.toFixed(4),
                            address: "Selected location",
                        },
                    }));
                }

                // Handle marker drag
                markerRef.current.on("dragend", async (dragEvent) => {
                    const dragLat = dragEvent.target.getLatLng().lat;
                    const dragLng = dragEvent.target.getLatLng().lng;
                    
                    try {
                        const response = await fetch(
                            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${dragLat}&lon=${dragLng}`
                        );
                        const data = await response.json();
                        
                        setForm((prevForm) => ({
                            ...prevForm,
                            location: {
                                lat: dragLat.toFixed(4),
                                lng: dragLng.toFixed(4),
                                address: data.address?.road || data.display_name || "Selected location",
                            },
                        }));

                        markerRef.current.setPopupContent(data.address?.road || data.display_name || "Selected location");
                    } catch (err) {
                        setForm((prevForm) => ({
                            ...prevForm,
                            location: {
                                lat: dragLat.toFixed(4),
                                lng: dragLng.toFixed(4),
                                address: "Selected location",
                            },
                        }));
                    }
                });
            });
        }

        return () => {
            if (mapInstanceRef.current) {
                mapInstanceRef.current.off();
            }
        };
    }, [showMap, form.location]);

    // Get current location using geolocation API
    const handleCurrentLocation = () => {
        if (navigator.geolocation) {
            setMsg("Getting your location...");
            navigator.geolocation.getCurrentPosition(
                async (position) => {
                    const { latitude, longitude } = position.coords;
                    
                    // Reverse geocode to get address
                    try {
                        const response = await fetch(
                            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`
                        );
                        const data = await response.json();
                        
                        setForm({
                            ...form,
                            location: {
                                lat: latitude.toFixed(4),
                                lng: longitude.toFixed(4),
                                address: data.address?.road || data.display_name || "Current location",
                            },
                        });
                        setMsg("✓ Current location captured!");
                        setShowMap(true);
                    } catch (err) {
                        setForm({
                            ...form,
                            location: {
                                lat: latitude.toFixed(4),
                                lng: longitude.toFixed(4),
                                address: "Current location",
                            },
                        });
                        setShowMap(true);
                    }
                },
                (error) => {
                    setMsg("Unable to get location. Please allow location access.");
                    console.error(error);
                }
            );
        } else {
            setMsg("Geolocation is not supported by your browser.");
        }
    };

    // Search for locations
    const handleLocationSearch = async (query) => {
        setSearchQuery(query);
        
        if (query.length < 3) {
            setSearchResults([]);
            setShowResults(false);
            return;
        }

        try {
            const response = await fetch(
                `https://nominatim.openstreetmap.org/search?q=${query}&format=json&limit=5`
            );
            const data = await response.json();
            setSearchResults(data);
            setShowResults(true);
        } catch (err) {
            console.error("Search error:", err);
            setMsg("Error searching locations");
        }
    };

    // Select location from search results
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
    };

    // Capture photo from webcam
    const handleCapturePhoto = () => {
        if (webcamRef.current) {
            const imageSrc = webcamRef.current.getScreenshot();
            // Convert base64 to blob and then to file
            fetch(imageSrc)
                .then((res) => res.blob())
                .then((blob) => {
                    const file = new File([blob], "camera-capture.jpg", {
                        type: "image/jpeg",
                    });
                    setForm({ ...form, image: file });
                    setImagePreview(imageSrc);
                    setUseCamera(false);
                    setMsg("✓ Photo captured!");
                });
        }
    };

    // Handle file input
    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setForm({ ...form, image: file });
            // Create preview
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result);
            };
            reader.readAsDataURL(file);
            setMsg("✓ Photo selected!");
        }
    };

    // Clear image and go back to camera/file selection
    const handleClearImage = () => {
        setForm({ ...form, image: null });
        setImagePreview(null);
        setUseCamera(false);
        setMsg("");
    };

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        // Validate all required fields
        if (!form.title || form.title.trim() === "") {
            setMsg("Please enter a title!");
            return;
        }

        if (!form.description || form.description.trim() === "") {
            setMsg("Please enter a description!");
            return;
        }

        if (!form.category || form.category.trim() === "") {
            setMsg("Please select a category!");
            return;
        }

        if (!form.location.lat || !form.location.lng) {
            setMsg("Please select a location!");
            return;
        }

        if (!form.image) {
            setMsg("Please upload a photo!");
            return;
        }

        setLoading(true);
        setMsg("");

        try {
            const data = new FormData();
            data.append("title", form.title);
            data.append("description", form.description);
            data.append("category", form.category);
            data.append(
                "location",
                JSON.stringify({
                    lat: parseFloat(form.location.lat),
                    lng: parseFloat(form.location.lng),
                    address: form.location.address,
                })
            );
            if (form.image) data.append("image", form.image);

            await createIssue(data);
            setMsg("Issue reported successfully!");
            setForm({
                title: "",
                description: "",
                category: "",
                location: { lat: null, lng: null, address: "Not set" },
                image: null,
            });
            setShowMap(false);
            setImagePreview(null);

            if (onSuccess) onSuccess();
        } catch (err) {
            console.error(err);
            setMsg(err.response?.data?.msg || "Error reporting issue");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div
            className={
                embedded
                    ? "space-y-6"
                    : "bg-slate-50 shadow-lg p-8 rounded-2xl space-y-6 max-h-[80vh] overflow-y-auto border border-slate-200"
            }
        >
            {msg && (
                <div
                    className={`p-4 rounded-lg font-semibold text-sm ${
                        msg.includes("successfully") || msg.includes("✓")
                            ? "bg-emerald-100 text-emerald-700"
                            : "bg-red-100 text-red-700"
                    }`}
                >
                    {msg}
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Title Input */}
                <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">📝 Issue Title</label>
                    <input
                        name="title"
                        placeholder="Brief title of the issue"
                        value={form.title}
                        onChange={handleChange}
                        className="w-full px-4 py-3 border-2 border-slate-200 rounded-lg bg-white focus:outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-100 transition"
                        required
                    />
                </div>

                {/* Description Input */}
                <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">📄 Description</label>
                    <textarea
                        name="description"
                        placeholder="Provide detailed information about the issue"
                        value={form.description}
                        onChange={handleChange}
                        className="w-full px-4 py-3 border-2 border-slate-200 rounded-lg bg-white focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition resize-none"
                        rows="4"
                        required
                    />
                </div>

                {/* Category Selection */}
                <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">🏷️ Category</label>
                    <select
                        name="category"
                        value={form.category}
                        onChange={handleChange}
                        className="w-full px-4 py-3 border-2 border-slate-200 rounded-lg bg-white focus:outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-100 transition"
                        required
                    >
                        <option value="">Select a category</option>
                        <option value="Roads">🛣️ Roads</option>
                        <option value="Water">💧 Water</option>
                        <option value="Sanitation">🧹 Sanitation</option>
                        <option value="Electricity">⚡ Electricity</option>
                    </select>
                </div>

                {/* Location Selection Section */}
                <div className="border-2 border-slate-200 p-6 rounded-lg bg-white">
                    <h3 className="font-bold text-slate-900 mb-4">📍 Location</h3>
                    
                    {/* Current Selection Display */}
                    <div className="mb-4">
                        {form.location.lat && form.location.lng ? (
                            <div className="bg-emerald-50 border border-emerald-200 p-3 rounded-lg">
                                <p className="text-emerald-700 font-semibold">✓ {form.location.address}</p>
                                <p className="text-xs text-emerald-600">{form.location.lat}°, {form.location.lng}°</p>
                            </div>
                        ) : (
                            <div className="bg-red-50 border border-red-200 p-3 rounded-lg">
                                <p className="text-red-700 font-semibold">❌ Location not selected</p>
                            </div>
                        )}
                    </div>

                    {/* Location Search Input */}
                    <div className="relative mb-4">
                        <input
                            type="text"
                            placeholder="Search location (e.g., 'Main Street')"
                            value={searchQuery}
                            onChange={(e) => handleLocationSearch(e.target.value)}
                            className="w-full px-4 py-3 border-2 border-slate-200 rounded-lg focus:outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-100 transition"
                        />
                        
                        {/* Search Results Dropdown */}
                        {showResults && searchResults.length > 0 && (
                            <div className="absolute top-full left-0 right-0 bg-white border-2 border-slate-200 rounded-lg mt-2 shadow-lg max-h-48 overflow-y-auto z-10">
                                {searchResults.map((result, index) => (
                                    <button
                                        key={index}
                                        type="button"
                                        onClick={() => handleSelectLocation(result)}
                                        className="w-full text-left px-4 py-3 hover:bg-violet-50 border-b border-slate-100 last:border-0 transition"
                                    >
                                        <div className="font-semibold text-slate-900">{result.name}</div>
                                        <div className="text-slate-500 text-xs">{result.display_name}</div>
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Current Location Button */}
                    <button
                        type="button"
                        onClick={handleCurrentLocation}
                        className="w-full bg-slate-950 text-white font-bold px-4 py-3 rounded-lg hover:bg-black transition shadow-lg mb-4 flex items-center justify-center gap-2"
                    >
                        📡 Use Current Location
                    </button>

                    {/* Map Display */}
                    {showMap && form.location.lat && form.location.lng && (
                        <div className="mt-4">
                            <p className="text-xs text-slate-600 mb-3 bg-violet-50 p-3 rounded-lg">
                                💡 <strong>Tip:</strong> Drag the marker to move • Click on map to reposition • Use +/- or scroll to zoom
                            </p>
                            <div
                                ref={mapRef}
                                className="w-full h-64 rounded-lg border-2 border-slate-200"
                                style={{ backgroundColor: "#e5e3df" }}
                            ></div>
                        </div>
                    )}
                </div>

                {/* Photo Capture Section */}
                <div className="border-2 border-slate-200 p-6 rounded-lg bg-white">
                    <h3 className="font-bold text-slate-900 mb-4">📷 Photo</h3>
                    
                    {/* Image Preview */}
                    {imagePreview ? (
                        <div className="space-y-4">
                            <div className="bg-emerald-50 border border-emerald-200 p-3 rounded-lg">
                                <p className="font-semibold text-emerald-700">✓ Photo Ready</p>
                            </div>
                            <img
                                src={imagePreview}
                                alt="Preview"
                                className="w-full h-48 object-cover rounded-lg border-2 border-slate-200"
                            />
                            <button
                                type="button"
                                onClick={handleClearImage}
                                className="w-full bg-red-500 hover:bg-red-600 text-white font-semibold px-4 py-3 rounded-lg transition"
                            >
                                🗑️ Change Photo
                            </button>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {!useCamera ? (
                                <>
                                    {/* Camera Option */}
                                    <button
                                        type="button"
                                        onClick={() => setUseCamera(true)}
                                        className="w-full bg-slate-100 text-slate-700 font-bold px-4 py-3 rounded-lg hover:bg-slate-200 transition border-2 border-slate-200"
                                    >
                                        📹 Take Photo with Camera
                                    </button>
                                    
                                    {/* File Upload Option */}
                                    <div className="border-2 border-dashed border-slate-300 rounded-lg p-6 text-center hover:border-violet-500 hover:bg-violet-50 transition cursor-pointer">
                                        <label className="block cursor-pointer">
                                            <input
                                                type="file"
                                                accept="image/*"
                                                onChange={handleFileChange}
                                                className="hidden"
                                            />
                                            <p className="text-slate-600 font-medium">📁 Choose an existing photo</p>
                                            <p className="text-xs text-slate-500 mt-1">or drag & drop</p>
                                        </label>
                                    </div>
                                </>
                            ) : (
                                <>
                                    {/* Webcam Component */}
                                    <Webcam
                                        ref={webcamRef}
                                        className="w-full rounded-lg border-2 border-slate-200"
                                        screenshotFormat="image/jpeg"
                                        width="100%"
                                    />
                                    <div className="flex gap-3">
                                        <button
                                            type="button"
                                            onClick={handleCapturePhoto}
                                            className="flex-1 bg-gradient-to-r from-emerald-600 to-emerald-700 text-white font-semibold px-4 py-3 rounded-lg hover:from-emerald-700 hover:to-emerald-800 transition"
                                        >
                                            ✓ Capture Photo
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setUseCamera(false)}
                                            className="flex-1 bg-slate-400 hover:bg-slate-500 text-white font-semibold px-4 py-3 rounded-lg transition"
                                        >
                                            ✕ Cancel
                                        </button>
                                    </div>
                                </>
                            )}
                        </div>
                    )}
                </div>

                {/* Submit Button */}
                <button
                    type="submit"
                    className={`w-full font-bold py-4 px-6 rounded-lg transition-all shadow-xl ${
                        form.title && form.description && form.category && form.location.lat && form.location.lng && form.image && !loading
                            ? "bg-gradient-to-r from-orange-500 to-amber-600 text-white hover:from-orange-600 hover:to-amber-700 shadow-orange-500/20"
                            : "bg-slate-200 text-slate-500 cursor-not-allowed shadow-none"
                    }`}
                    disabled={!form.title || !form.description || !form.category || !form.location.lat || !form.location.lng || !form.image || loading}
                >
                    {loading ? (
                        <span className="flex items-center justify-center gap-2">
                            <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                            </svg>
                            Reporting...
                        </span>
                    ) : (
                        "🚀 Report Issue"
                    )}
                </button>
            </form>
        </div>
    );
}

export default ReportIssueForm;
