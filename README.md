# 🌊 OceanEmbed

### AI-Powered Subsurface Ocean Intelligence Prototype

OceanEmbed is a frontend prototype that demonstrates an AI-powered workflow for reconstructing subsurface ocean temperature from surface observations.

## 🚀 Prototype

The current prototype demonstrates the complete OceanEmbed user experience through an interactive dashboard.

### Dashboard
- OceanEmbed overview
- SIH 2026 project introduction
- Interactive ocean map
- System KPIs
- Temperature snapshot
- Pipeline overview
- Quick navigation to core modules

### Ocean Explorer
- Interactive location selection
- Surface ocean observations
- SST, SSS, SLA, Current U/V and Wind U/V
- Animated reconstruction process
- Surface Observations → Ocean Encoder → Ocean Embedding → Depth Decoder → Subsurface Temperature

### Temperature Profile
- Temperature vs depth visualization
- 0–1000 m ocean profile
- 15 required depth levels
- Depth-wise temperature table
- Prediction/error visualization

### 3D Ocean X-Ray
- Interactive Three.js ocean volume
- Rotating 3D visualization
- Depth layers
- Depth slider
- ARGO reference points
- Temperature visualization from surface to 1000 m

### Subsurface Anomalies
- Expected State → Reconstructed State → Difference → Anomaly workflow
- Regional anomaly cards
- Depth profile visualization
- Regional anomaly distribution
- Anomaly filtering

### ARGO Validation
- GLORYS shown as the training target
- ARGO shown as independent validation
- Prediction vs ARGO comparison
- RMSE, bias and correlation metrics
- Depth-wise validation visualization

### Pipeline
- n8n-style pipeline visualization
- Data Sources → n8n → Python/Xarray → FastAPI → PyTorch → PostgreSQL → Dashboard
- Pipeline step monitoring
- Data source status

### System
- Service health monitoring
- System timeline
- Architecture visualization
- Component status

## 🛠️ Tech Stack

- React
- TypeScript
- Vite
- Tailwind CSS
- Framer Motion
- Three.js
- React Three Fiber

## 📌 Prototype Status

This is currently a **frontend demonstration prototype**.

The interface uses illustrative demo data to demonstrate the OceanEmbed workflow, visualizations, validation concept and overall user experience.

**OceanEmbed — From Surface Observations to Subsurface Ocean Intelligence.**
