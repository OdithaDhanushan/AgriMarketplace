import React, { useState } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Platform, Linking } from 'react-native';
import Svg, { Path, Circle, Rect, G, Text as SvgText, Defs, LinearGradient as SvgLinearGradient, Stop } from 'react-native-svg';
import { Ionicons } from '@expo/vector-icons';

export default function SriLankaMapView({
  height = 200,
  showControls = true,
  isOffline = false,
  origin = { name: "Sunil's Farm", city: "Dambadeniya", lat: 7.3622, lng: 80.1444 },
  destination = { name: "Green Leaf Restaurant", city: "Kurunegala", lat: 7.4863, lng: 80.3623 },
}) {
  const [zoomLevel, setZoomLevel] = useState(1);

  const handleZoomIn = () => setZoomLevel((z) => Math.min(2.0, Number((z + 0.25).toFixed(2))));
  const handleZoomOut = () => setZoomLevel((z) => Math.max(0.75, Number((z - 0.25).toFixed(2))));
  const handleReset = () => setZoomLevel(1);

  const openGoogleMapsDirections = () => {
    const url = `https://www.google.com/maps/dir/?api=1&origin=${origin.lat},${origin.lng}&destination=${destination.lat},${destination.lng}&travelmode=driving`;
    Linking.openURL(url).catch(() => {});
  };

  // If on web and not in offline mode, render real interactive Google Maps via high-res Google tile servers
  if (Platform.OS === 'web' && !isOffline) {
    const mapHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
        <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
        <style>
          html, body, #map { height: 100%; width: 100%; margin: 0; padding: 0; background: #e5e3df; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; }
          .custom-pin {
            display: flex;
            align-items: center;
            justify-content: center;
            border-radius: 50%;
            box-shadow: 0 3px 8px rgba(0,0,0,0.35);
          }
          .origin-pin { background: #2E7D32; color: white; width: 26px; height: 26px; border: 2px solid white; font-size: 14px; }
          .dest-pin { background: #EA4335; color: white; width: 26px; height: 26px; border: 2px solid white; font-size: 14px; }
          .truck-pin { background: #1B5E20; color: white; width: 32px; height: 32px; border: 2px solid #FFF; font-size: 16px; animation: pulse 2s infinite; }
          @keyframes pulse {
            0% { transform: scale(1); }
            50% { transform: scale(1.1); }
            100% { transform: scale(1); }
          }
          .google-badge {
            position: absolute;
            bottom: 6px;
            left: 8px;
            background: rgba(255, 255, 255, 0.92);
            padding: 3px 8px;
            border-radius: 4px;
            font-size: 11px;
            font-weight: 700;
            color: #4285F4;
            box-shadow: 0 1px 4px rgba(0,0,0,0.2);
            z-index: 999;
            display: flex;
            align-items: center;
            gap: 4px;
          }
          .google-logo-g {
            font-weight: 900;
            font-size: 13px;
          }
        </style>
      </head>
      <body>
        <div id="map"></div>
        <div class="google-badge">
          <span class="google-logo-g"><span style="color:#4285F4">G</span><span style="color:#EA4335">o</span><span style="color:#FBBC05">o</span><span style="color:#4285F4">g</span><span style="color:#34A853">l</span><span style="color:#EA4335">e</span></span> Maps • Sri Lanka
        </div>
        <script>
          const map = L.map('map', { zoomControl: false, attributionControl: false }).setView([7.424, 80.253], 11);

          // Real Google Maps Roadmap tiles
          L.tileLayer('https://{s}.google.com/vt/lyrs=m&x={x}&y={y}&z={z}', {
            maxZoom: 20,
            subdomains: ['mt0', 'mt1', 'mt2', 'mt3']
          }).addTo(map);

          // Route coordinates between Dambadeniya and Kurunegala along A6 / Narammala Road, Sri Lanka
          const routePoints = [
            [7.3622, 80.1444],
            [7.3750, 80.1620],
            [7.3910, 80.1930],
            [7.4120, 80.2190],
            [7.4350, 80.2480],
            [7.4580, 80.2920],
            [7.4720, 80.3290],
            [7.4863, 80.3623]
          ];

          // Real Google Maps Blue navigation route
          const routeBg = L.polyline(routePoints, {
            color: '#1A73E8',
            weight: 6,
            opacity: 0.9,
            lineJoin: 'round'
          }).addTo(map);

          // Origin Marker (Sunil's Farm, Dambadeniya)
          const originIcon = L.divIcon({
            className: 'custom-pin origin-pin',
            html: '🌱',
            iconSize: [26, 26],
            iconAnchor: [13, 13]
          });
          L.marker([7.3622, 80.1444], { icon: originIcon })
            .addTo(map)
            .bindPopup("<b>${origin.name}</b><br/>${origin.city}, Sri Lanka");

          // Destination Marker (Green Leaf Restaurant, Kurunegala)
          const destIcon = L.divIcon({
            className: 'custom-pin dest-pin',
            html: '📍',
            iconSize: [26, 26],
            iconAnchor: [13, 13]
          });
          L.marker([7.4863, 80.3623], { icon: destIcon })
            .addTo(map)
            .bindPopup("<b>${destination.name}</b><br/>${destination.city}, Sri Lanka");

          // Delivery Truck Marker
          const truckIcon = L.divIcon({
            className: 'custom-pin truck-pin',
            html: '🚚',
            iconSize: [32, 32],
            iconAnchor: [16, 16]
          });
          L.marker([7.425, 80.260], { icon: truckIcon })
            .addTo(map)
            .bindPopup("<b>Delivery Partner: Nimal Perera</b><br/>On A6 Highway • 8.4 km to destination");

          map.fitBounds(routeBg.getBounds(), { padding: [35, 35] });
        </script>
      </body>
      </html>
    `;

    return (
      <View style={[styles.mapContainer, { height }]}>
        <iframe
          srcDoc={mapHtml}
          style={{
            width: '100%',
            height: '100%',
            border: 'none',
            borderRadius: 18,
          }}
          title="Google Map Sri Lanka"
        />

        {/* Top-Right Google Maps Link Pill */}
        <TouchableOpacity
          onPress={openGoogleMapsDirections}
          style={styles.openGoogleMapsBtn}
          activeOpacity={0.85}
        >
          <Ionicons name="map" size={12} color="#1A73E8" />
          <Text style={styles.openGoogleMapsText}>Google Maps</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // Cross-platform vector fallback matching Sri Lanka Dambadeniya-Kurunegala layout
  return (
    <View style={[styles.mapContainer, { height }]}>
      <Svg width="100%" height="100%" viewBox="0 0 400 280">
        <Defs>
          <SvgLinearGradient id="bgGrad" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0%" stopColor="#E2EBE2" />
            <Stop offset="100%" stopColor="#EDF4EC" />
          </SvgLinearGradient>
          <SvgLinearGradient id="riverGrad" x1="0" y1="0" x2="1" y2="1">
            <Stop offset="0%" stopColor="#81D4FA" />
            <Stop offset="100%" stopColor="#4FC3F7" />
          </SvgLinearGradient>
        </Defs>

        {/* Map Background Terrain */}
        <Rect x="0" y="0" width="400" height="280" fill="url(#bgGrad)" rx="16" />

        <G transform={`scale(${zoomLevel})`} origin="200, 140">
          {/* Map Grids / Street Grid Network (Kurunegala / Dambadeniya) */}
          <Path
            d="M20 50 L380 50 M30 110 L370 110 M10 180 L390 180 M40 240 L360 240"
            stroke="#D0DED1"
            strokeWidth="1.5"
            strokeDasharray="4 4"
          />
          <Path
            d="M80 10 L80 270 M160 10 L160 270 M250 10 L250 270 M330 10 L330 270"
            stroke="#D0DED1"
            strokeWidth="1.5"
            strokeDasharray="4 4"
          />

          {/* River (Deduru Oya / Maha Oya water body curving through Kurunegala) */}
          <Path
            d="M100 0 C 130 60, 60 120, 110 180 C 140 220, 90 260, 80 280"
            fill="none"
            stroke="url(#riverGrad)"
            strokeWidth="18"
            strokeLinecap="round"
          />

          {/* Major Sri Lankan Road Network (A6 Kurunegala-Colombo Highway) */}
          <Path
            d="M20 220 C 110 200, 150 140, 240 100 C 300 80, 360 90, 400 85"
            fill="none"
            stroke="#FFFFFF"
            strokeWidth="12"
          />
          <Path
            d="M20 220 C 110 200, 150 140, 240 100 C 300 80, 360 90, 400 85"
            fill="none"
            stroke="#E0E6E1"
            strokeWidth="8"
          />

          {/* Active Route (Google Maps Blue Navigation Line) */}
          <Path
            d="M110 215 C 100 160, 95 130, 150 105 L 230 105 C 270 105, 300 95, 320 90"
            fill="none"
            stroke="#1A73E8"
            strokeWidth="5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Waypoints / Dotted Arch */}
          <Path
            d="M110 215 C 160 70, 270 50, 320 90"
            fill="none"
            stroke="#263238"
            strokeWidth="2.5"
            strokeDasharray="6 6"
          />

          {/* Pickup Pin: Sunil's Farm (Dambadeniya) */}
          <G transform="translate(110, 215)">
            <Circle cx="0" cy="0" r="10" fill="#2E7D32" />
            <Circle cx="0" cy="0" r="4" fill="#FFFFFF" />
            <SvgText x="-40" y="22" fill="#263238" fontSize="12" fontWeight="bold">
              {"Sunil's Farm"}
            </SvgText>
          </G>

          {/* Destination Pin: Green Leaf Restaurant (Kurunegala) */}
          <G transform="translate(320, 90)">
            <Path
              d="M0 -22 C -9 -22, -14 -14, -14 -7 C -14 3, 0 16, 0 16 C 0 16, 14 3, 14 -7 C 14 -14, 9 -22, 0 -22 Z"
              fill="#EA4335"
            />
            <Circle cx="0" cy="-9" r="5" fill="#FFFFFF" />
            <SvgText x="-65" y="-28" fill="#263238" fontSize="11" fontWeight="bold">
              Green Leaf Restaurant
            </SvgText>
            <SvgText x="-35" y="-15" fill="#546E7A" fontSize="10">
              Kurunegala
            </SvgText>
          </G>

          {/* Delivery Truck on road */}
          <G transform="translate(180, 102)">
            <Rect x="-14" y="-8" width="28" height="16" rx="4" fill="#1B5E20" />
            <Circle cx="-6" cy="8" r="3" fill="#37474F" />
            <Circle cx="8" cy="8" r="3" fill="#37474F" />
            <SvgText x="-8" y="4" fill="#FFFFFF" fontSize="9" fontWeight="bold">
              🚚
            </SvgText>
          </G>
        </G>
      </Svg>

      {/* Floating Compass / Nav Arrow icon */}
      <TouchableOpacity onPress={openGoogleMapsDirections} style={styles.compassButton}>
        <Ionicons name="navigate" size={18} color="#1A73E8" />
      </TouchableOpacity>

      {/* Zoom / Interactive Controls */}
      {showControls && (
        <View style={styles.zoomControls}>
          <TouchableOpacity onPress={handleZoomIn} style={styles.zoomButton}>
            <Ionicons name="add" size={18} color="#212121" />
          </TouchableOpacity>
          <TouchableOpacity onPress={handleZoomOut} style={styles.zoomButton}>
            <Ionicons name="remove" size={18} color="#212121" />
          </TouchableOpacity>
          <TouchableOpacity onPress={handleReset} style={styles.zoomButton}>
            <Ionicons name="locate" size={16} color="#1A73E8" />
          </TouchableOpacity>
        </View>
      )}

      {/* Sri Lanka Region Badge */}
      <View style={styles.regionBadge}>
        <Text style={styles.regionBadgeText}>Google Maps • Sri Lanka</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  mapContainer: {
    width: '100%',
    borderRadius: 18,
    overflow: 'hidden',
    backgroundColor: '#E5E3DF',
    position: 'relative',
    borderWidth: 1,
    borderColor: '#D8E2D8',
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
    elevation: 3,
  },
  compassButton: {
    position: 'absolute',
    top: 12,
    right: 12,
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: 'rgba(255,255,255,0.95)',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.14,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  zoomControls: {
    position: 'absolute',
    bottom: 12,
    right: 12,
    backgroundColor: 'rgba(255,255,255,0.95)',
    borderRadius: 8,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#E0E6E1',
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  zoomButton: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#ECEFF1',
  },
  regionBadge: {
    position: 'absolute',
    bottom: 10,
    left: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.94)',
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#DCE4DD',
  },
  regionBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#1A73E8',
  },
  openGoogleMapsBtn: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#CFDCD0',
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowRadius: 4,
  },
  openGoogleMapsText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#1A73E8',
  },
});
