import { useState } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

const icono = L.icon({
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

function ClicMapa({ onSeleccionar }) {
  useMapEvents({
    click(e) {
      onSeleccionar(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
}

export default function SelectorMapa({ latitud, longitud, onCambiar }) {
  const posicionInicial = [latitud || -1.8312, longitud || -78.1834]; // centro aproximado de Ecuador

  return (
    <div>
      <div className="border border-slate-300" style={{ height: 250 }}>
        <MapContainer center={posicionInicial} zoom={latitud ? 13 : 6} style={{ height: '100%', width: '100%' }}>
          <TileLayer
            attribution='&copy; OpenStreetMap contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <ClicMapa onSeleccionar={onCambiar} />
          {latitud && longitud && <Marker position={[latitud, longitud]} icon={icono} />}
        </MapContainer>
      </div>
      {latitud && longitud ? (
        <p className="text-xs text-slate-500 mt-1">
          Coordenadas: {latitud.toFixed(5)}, {longitud.toFixed(5)}
        </p>
      ) : (
        <p className="text-xs text-slate-400 mt-1">Haz clic en el mapa para marcar la ubicación del vuelo.</p>
      )}
    </div>
  );
}