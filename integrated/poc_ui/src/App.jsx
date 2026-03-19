import './App.css'
import { useEffect, useMemo, useRef, useState } from 'react'

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:3000'
const WS_BASE = import.meta.env.VITE_WS_BASE || 'ws://localhost:3000'

const initialRiderRequests = [
  {
    id: 'RD-401',
    pickup: 'MG Road Metro',
    drop: 'Koramangala 5th Block',
    fare: 'INR 214',
    eta: '4 mins',
    priority: 'High',
  },
  {
    id: 'RD-402',
    pickup: 'Indiranagar 100ft Road',
    drop: 'HSR Layout Sector 2',
    fare: 'INR 176',
    eta: '7 mins',
    priority: 'Normal',
  },
]

const initialNearbyDrivers = [
  {
    name: 'Ravi K.',
    car: 'Swift Dzire',
    plate: 'KA 05 MR 9821',
    distance: '1.2 km',
    rating: '4.8',
    status: 'Available',
  },
  {
    name: 'Anita S.',
    car: 'Hyundai i20',
    plate: 'KA 03 HT 6634',
    distance: '2.1 km',
    rating: '4.9',
    status: 'On Trip',
  },
]

function toRadians(value) {
  return (value * Math.PI) / 180
}

function distanceBetweenKm(lat1, lng1, lat2, lng2) {
  if (![lat1, lng1, lat2, lng2].every((v) => Number.isFinite(v))) return null

  const earthRadiusKm = 6371
  const dLat = toRadians(lat2 - lat1)
  const dLng = toRadians(lng2 - lng1)
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) *
      Math.sin(dLng / 2) * Math.sin(dLng / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))

  return earthRadiusKm * c
}

function App() {
  const wsRef = useRef(null)
  const riderLocationRef = useRef({ lat: 12.9716, lng: 77.5946 })
  const [role, setRole] = useState('rider')
  const [userId, setUserId] = useState('rider-101')
  const [token, setToken] = useState('')
  const [socketState, setSocketState] = useState('disconnected')
  const [status, setStatus] = useState('Idle')
  const [lat, setLat] = useState('12.9716')
  const [lng, setLng] = useState('77.5946')
  const [nearbyResults, setNearbyResults] = useState([])
  const [logLines, setLogLines] = useState([])

  const pushLog = (line) => {
    setLogLines((prev) => [
      `${new Date().toLocaleTimeString()}  ${line}`,
      ...prev.slice(0, 9),
    ])
  }

  const canSendWs = useMemo(() => {
    return wsRef.current && wsRef.current.readyState === WebSocket.OPEN
  }, [socketState])

  useEffect(() => {
    riderLocationRef.current = { lat: Number(lat), lng: Number(lng) }
  }, [lat, lng])

  useEffect(() => {
    return () => {
      if (wsRef.current) {
        wsRef.current.close()
      }
    }
  }, [])

  const loginAndConnect = async () => {
    setStatus('Authenticating...')

    try {
      const response = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, role }),
      })

      if (!response.ok) {
        throw new Error(`Login failed (${response.status})`)
      }

      const body = await response.json()
      setToken(body.token)
      pushLog(`Token issued for ${role}:${userId}`)

      const socket = new WebSocket(WS_BASE)
      wsRef.current = socket
      setSocketState('connecting')

      socket.onopen = () => {
        setSocketState('connected')
        setStatus('Socket connected')
        socket.send(JSON.stringify({ type: 'auth', token: body.token }))
      }

      socket.onmessage = (event) => {
        const payload = JSON.parse(event.data)

        if (payload.type === 'auth_success') {
          setStatus('Authenticated on websocket')
          pushLog('WebSocket auth_success')
          return
        }

        if (payload.type === 'nearby_drivers') {
          setNearbyResults(payload.drivers || [])
          pushLog(`Received ${payload.drivers?.length || 0} nearby drivers with distance`)
          return
        }

        if (payload.type === 'driver_update') {
          pushLog(`Driver ${payload.driverId} at ${payload.lat}, ${payload.lng}`)
          setNearbyResults((prev) => {
            const driverLat = Number(payload.lat)
            const driverLng = Number(payload.lng)
            const { lat: riderLat, lng: riderLng } = riderLocationRef.current
            const computedDistanceKm = distanceBetweenKm(riderLat, riderLng, driverLat, driverLng)

            const existingIndex = prev.findIndex((driver) => driver.driverId === payload.driverId)
            const nextDriver = {
              driverId: payload.driverId,
              distanceKm: computedDistanceKm,
            }

            if (existingIndex === -1) {
              return [...prev, nextDriver]
            }

            const updated = [...prev]
            updated[existingIndex] = nextDriver
            return updated
          })
        }
      }

      socket.onclose = () => {
        setSocketState('disconnected')
        setStatus('Socket disconnected')
      }

      socket.onerror = () => {
        setStatus('Socket error')
      }
    } catch (error) {
      setStatus(error.message)
      pushLog(`Error: ${error.message}`)
    }
  }

  const disconnect = () => {
    if (wsRef.current) {
      wsRef.current.close()
      wsRef.current = null
    }
    setSocketState('disconnected')
    setStatus('Disconnected')
  }

  const sendDriverLocation = () => {
    if (!canSendWs) return

    wsRef.current.send(
      JSON.stringify({
        type: 'location',
        lat: Number(lat),
        lng: Number(lng),
      }),
    )

    pushLog(`Sent location: ${lat}, ${lng}`)
  }

  const requestNearbyDrivers = () => {
    if (!canSendWs) return

    wsRef.current.send(
      JSON.stringify({
        type: 'nearby',
        lat: Number(lat),
        lng: Number(lng),
      }),
    )

    pushLog(`Requested nearby drivers from ${lat}, ${lng}`)
  }

  return (
    <main className="app-shell">
      <header className="topbar">
        <div>
          <p className="eyebrow">Driver-Rider POC</p>
          <h1>Realtime Dispatch Console</h1>
        </div>
        <div className="pill pill-live">WS: {socketState}</div>
      </header>

      <section className="controls panel">
        <div className="control-row">
          <label>
            Role
            <select value={role} onChange={(e) => setRole(e.target.value)}>
              <option value="rider">Rider</option>
              <option value="driver">Driver</option>
            </select>
          </label>
          <label>
            User ID
            <input value={userId} onChange={(e) => setUserId(e.target.value)} />
          </label>
          <label>
            Lat
            <input value={lat} onChange={(e) => setLat(e.target.value)} />
          </label>
          <label>
            Lng
            <input value={lng} onChange={(e) => setLng(e.target.value)} />
          </label>
        </div>

        <div className="control-actions">
          <button type="button" onClick={loginAndConnect}>Login + Connect</button>
          <button type="button" className="ghost-btn" onClick={disconnect}>Disconnect</button>
          {role === 'driver' ? (
            <button type="button" className="ghost-btn" onClick={sendDriverLocation}>
              Send Driver Location
            </button>
          ) : (
            <button type="button" className="ghost-btn" onClick={requestNearbyDrivers}>
              Request Nearby
            </button>
          )}
        </div>
        <p className="status-line">{status}</p>
        <p className="token-line">Token: {token ? `${token.slice(0, 26)}...` : 'Not issued yet'}</p>
      </section>

      <section className="grid-layout">
        <article className="panel rider-panel">
          <div className="panel-head">
            <h2>Rider Queue</h2>
            <span className="pill">{initialRiderRequests.length} waiting</span>
          </div>
          <div className="list">
            {initialRiderRequests.map((ride) => (
              <div key={ride.id} className="item-card">
                <div className="item-top">
                  <strong>{ride.id}</strong>
                  <span className={`tag ${ride.priority === 'High' ? 'tag-hot' : 'tag-soft'}`}>
                    {ride.priority}
                  </span>
                </div>
                <p>
                  <span>Pickup:</span> {ride.pickup}
                </p>
                <p>
                  <span>Drop:</span> {ride.drop}
                </p>
                <div className="meta-row">
                  <span>{ride.fare}</span>
                  <span>ETA {ride.eta}</span>
                </div>
                <button type="button">Assign Driver</button>
              </div>
            ))}
          </div>
        </article>

        <article className="panel driver-panel">
          <div className="panel-head">
            <h2>Nearby Drivers</h2>
            <span className="pill">{nearbyResults.length || initialNearbyDrivers.length} shown</span>
          </div>
          <div className="list">
            {nearbyResults.length > 0
              ? nearbyResults.map((driver) => (
                  <div key={driver.driverId} className="item-card">
                    <div className="item-top">
                      <strong>{driver.driverId}</strong>
                      <span className="tag tag-ready">Available</span>
                    </div>
                    <p>
                      <span>Distance:</span>{' '}
                      {Number.isFinite(driver.distanceKm)
                        ? `${Number(driver.distanceKm).toFixed(3)} km from rider`
                        : 'Distance unavailable'}
                    </p>
                  </div>
                ))
              : initialNearbyDrivers.map((driver) => (
                  <div key={driver.plate} className="item-card">
                    <div className="item-top">
                      <strong>{driver.name}</strong>
                      <span className={`tag ${driver.status === 'Available' ? 'tag-ready' : 'tag-busy'}`}>
                        {driver.status}
                      </span>
                    </div>
                    <p>
                      <span>Vehicle:</span> {driver.car}
                    </p>
                    <p>
                      <span>Plate:</span> {driver.plate}
                    </p>
                    <div className="meta-row">
                      <span>{driver.distance} away</span>
                      <span>{driver.rating} rating</span>
                    </div>
                  </div>
                ))}
          </div>
        </article>
      </section>

      <section className="panel log-panel">
        <div className="panel-head">
          <h2>Event Log</h2>
          <span className="pill">Recent</span>
        </div>
        {logLines.length === 0 ? (
          <p className="log-empty">No events yet.</p>
        ) : (
          <ul className="log-list">
            {logLines.map((line) => (
              <li key={line}>{line}</li>
            ))}
          </ul>
        )}
      </section>
    </main>
  )
}

export default App
