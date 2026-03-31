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
                    ? "space-y-4"
                    : "bg-purple-500 shadow-lg p-5 rounded-xl space-y-4 max-h-[80vh] overflow-y-auto"
            }
        >
            {/* Logo */}
            {!embedded && (
                <div className="flex flex-col items-center mb-4 bg-gray-200 p-4 rounded-lg">
                    <img
                        src="/src/assets/favicon.png"
                        alt="CivicConnect Logo"
                        className="w-12 h-12 mb-2"
                    />
                </div>
            )}

            {msg && (
                <p
                    className={
                        msg.includes("successfully")
                            ? "text-green-500"
                            : "text-red-500"
                    }
                >
                    {msg}
                </p>
            )}
            <form onSubmit={handleSubmit} className="space-y-4 ">
                <input
                    name="title"
                    placeholder="Title"
                    value={form.title}
                    onChange={handleChange}
                    className="w-full p-2 border-3 border-white rounded bg-gray-200"
                    required
                />
                <textarea
                    name="description"
                    placeholder="Description"
                    value={form.description}
                    onChange={handleChange}
                    className="w-full p-2 border-3 border-white rounded bg-gray-200"
                    required
                />
                <select
                    name="category"
                    value={form.category}
                    onChange={handleChange}
                    className="w-full p-2 border-3 border-white rounded bg-gray-200"
                    required
                >
                    <option value="">Select Category</option>
                    <option value="Roads">Roads</option>
                    <option value="Water">Water</option>
                    <option value="Sanitation">Sanitation</option>
                    <option value="Electricity">Electricity</option>
                </select>

                {/* Location Selection Section */}
                <div className="border-3 border-white p-4 rounded bg-gray-200">
                  <center>  <h3 className="font-bold mb-3 ">📍 Location</h3></center>
                    
                    {/* Current Selection Display */}
                    <div className="space-y-2 mb-3">
                        {form.location.lat && form.location.lng ? (
                            <p className="text-green-600 font-semibold">
                                ✓ {form.location.address}
                            </p>
                        ) : (
                            <p className="text-red-500">Location not selected</p>
                        )}
                    </div>

                    {/* Location Search Input */}
                    <div className="relative mb-3">
                        <input
                            type="text"
                            placeholder="Search location (e.g., 'Main Street')"
                            value={searchQuery}
                            onChange={(e) => handleLocationSearch(e.target.value)}
                            className="w-full p-2 border-2 border-[#FF5A5A] rounded focus:outline-none focus:ring-2 focus:ring-purple-600"
                        />
                        
                        {/* Search Results Dropdown */}
                        {showResults && searchResults.length > 0 && (
                            <div className="absolute top-full left-0 right-0 bg-purple-50 border rounded mt-1 shadow-lg max-h-48 overflow-y-auto z-10">
                                {searchResults.map((result, index) => (
                                    <button
                                        key={index}
                                        type="button"
                                        onClick={() => handleSelectLocation(result)}
                                        className="w-full text-left p-2 hover:bg-purple-100 border-b text-sm"
                                    >
                                        <div className="font-semibold">{result.name}</div>
                                        <div className="text-gray-600 text-xs">{result.display_name}</div>
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Current Location Button */}
                    <button
                        type="button"
                        onClick={handleCurrentLocation}
                        className="w-full bg-[#3A8B95] text-white p-2 rounded hover:bg-green-600 mb-2"
                    >
                     Use Current Location
                    </button>

                    {/* Map Display */}
                    {showMap && form.location.lat && form.location.lng && (
                        <div className="mt-3">
                            <p className="text-sm text-gray-600 mb-2">
                                💡 Drag the marker to move • Click on map to reposition • Use +/- buttons or scroll wheel to zoom
                            </p>
                            <div
                                ref={mapRef}
                                className="w-full h-64 rounded border"
                                style={{ backgroundColor: "#e5e3df" }}
                            ></div>
                        </div>
                    )}
                </div>

                {/* Photo Capture Section */}
                <div className="border p-4 rounded bg-gray-200 border-3 border-white">
                    <center><h3 className="font-bold mb-3">📷 Photo</h3></center>
                    
                    {/* Image Preview */}
                    {imagePreview ? (
                        <div className="space-y-2">
                            <h4 className="font-semibold text-green-600">✓ Photo Ready</h4>
                            <img
                                src={imagePreview}
                                alt="Preview"
                                className="w-full h-48 object-cover rounded border"
                            />
                            <button
                                type="button"
                                onClick={handleClearImage}
                                className="w-full bg-red-500 text-white p-2 rounded hover:bg-red-600"
                            >
                                🗑️ Change Photo
                            </button>
                        </div>
                    ) : (
                        <div className="space-y-2">
                            {!useCamera ? (
                                <>
                                    {/* Camera Option */}
                                    <button
                                        type="button"
                                        onClick={() => setUseCamera(true)}
                                        className="w-full bg-[#3A8B95] text-white p-2 rounded hover:bg-purple-700 mb-2"
                                    >
                                         Take Photo with Camera
                                    </button>
                                    
                                    {/* File Upload Option */}
                                    <div className="border-2 border-[#FF5A5A] rounded p-3">
                                        <label className="block text-center cursor-pointer">
                                            <input
                                                type="file"
                                                accept="image/*"
                                                onChange={handleFileChange}
                                                className="hidden"
                                            />
                                            <span className="text-gray-600 "> Or choose an existing photo</span>
                                        </label>
                                    </div>
                                </>
                            ) : (
                                <>
                                    {/* Webcam Component */}
                                    <Webcam
                                        ref={webcamRef}
                                        className="w-full rounded border"
                                        screenshotFormat="image/jpeg"
                                        width="100%"
                                    />
                                    <div className="flex gap-2">
                                        <button
                                            type="button"
                                            onClick={handleCapturePhoto}
                                            className="flex-1 bg-green-500 text-white p-2 rounded hover:bg-green-600"
                                        >
                                            ✓ Capture Photo
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setUseCamera(false)}
                                            className="flex-1 bg-gray-500 text-white p-2 rounded hover:bg-gray-600"
                                        >
                                            ✕ Cancel
                                        </button>
                                    </div>
                                </>
                            )}
                        </div>
                    )}
                </div>

                <button
                    type="submit"
                    className={`w-full p-2 rounded font-semibold transition-colors ${
                        form.title && form.description && form.category && form.location.lat && form.location.lng && form.image && !loading
                            ? "bg-purple-600 text-white hover:bg-purple-700 cursor-pointer"
                            : "bg-gray-300 text-gray-600 cursor-not-allowed"
                    }`}
                    disabled={!form.title || !form.description || !form.category || !form.location.lat || !form.location.lng || !form.image || loading}
                    title={
                        !form.title ? "Please enter a title"
                        : !form.description ? "Please enter a description"
                        : !form.category ? "Please select a category"
                        : !form.location.lat || !form.location.lng ? "Please select a location"
                        : !form.image ? "Please upload a photo"
                        : "Submit your report"
                    }
                >
                    {loading ? "Submitting..." : "Report Issue"}
                </button>
            </form>
        </div>
    );
}

export default ReportIssueForm;
