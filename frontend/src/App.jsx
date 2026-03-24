import { useEffect, useMemo, useState } from 'react';
import {
  API_BASE_URL,
  createShortUrl,
  deleteShortUrl,
  getAnalytics,
  listShortUrls,
} from './api';

const initialForm = {
  url: '',
  customAlias: '',
  expiresInDays: '',
};

function formatDate(value) {
  if (!value) {
    return '—';
  }

  return new Date(value).toLocaleString();
}

function StatList({ title, items }) {
  const entries = Object.entries(items || {});

  return (
    <div className="stat-card">
      <h4>{title}</h4>
      {entries.length === 0 ? (
        <p className="muted">No data yet.</p>
      ) : (
        <ul>
          {entries.map(([key, count]) => (
            <li key={key}>
              <span>{key}</span>
              <strong>{count}</strong>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default function App() {
  const [items, setItems] = useState([]);
  const [form, setForm] = useState(initialForm);
  const [selectedCode, setSelectedCode] = useState('');
  const [analytics, setAnalytics] = useState(null);
  const [loadingList, setLoadingList] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [loadingAnalytics, setLoadingAnalytics] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const activeItems = useMemo(() => items.filter((item) => item.is_active), [items]);

  async function refreshList(nextSelectedCode) {
    setLoadingList(true);
    try {
      const data = await listShortUrls();
      setItems(data);

      if (nextSelectedCode) {
        setSelectedCode(nextSelectedCode);
      } else if (data.length > 0 && !data.some((item) => item.short_code === selectedCode)) {
        setSelectedCode(data[0].short_code);
      } else if (data.length === 0) {
        setSelectedCode('');
        setAnalytics(null);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoadingList(false);
    }
  }

  useEffect(() => {
    refreshList();
  }, []);

  useEffect(() => {
    if (!selectedCode) {
      setAnalytics(null);
      return;
    }

    async function loadAnalytics() {
      setLoadingAnalytics(true);
      setError('');
      try {
        const data = await getAnalytics(selectedCode);
        setAnalytics(data);
      } catch (err) {
        setAnalytics(null);
        setError(err.message);
      } finally {
        setLoadingAnalytics(false);
      }
    }

    loadAnalytics();
  }, [selectedCode]);

  async function handleSubmit(event) {
    event.preventDefault();
    setSubmitting(true);
    setError('');
    setSuccess('');

    try {
      const created = await createShortUrl(form);
      setForm(initialForm);
      setSuccess(`Created short URL ${created.short_url}`);
      await refreshList(created.short_code);
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(shortCode) {
    setError('');
    setSuccess('');

    try {
      await deleteShortUrl(shortCode);
      setSuccess(`Deleted short code ${shortCode}`);
      const nextCode = selectedCode === shortCode ? '' : selectedCode;
      await refreshList(nextCode);
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <div className="page-shell">
      <header className="hero">
        <div>
          <p className="eyebrow">Frontend dashboard</p>
          <h1>URL Shortener</h1>
          <p className="muted">Create, browse, delete, and inspect analytics for the FastAPI backend.</p>
        </div>
        <div className="backend-chip">Backend: {API_BASE_URL}</div>
      </header>

      {error ? <div className="banner error">{error}</div> : null}
      {success ? <div className="banner success">{success}</div> : null}

      <main className="layout">
        <section className="card">
          <h2>Create short URL</h2>
          <form className="form-grid" onSubmit={handleSubmit}>
            <label>
              Original URL
              <input
                required
                type="url"
                placeholder="https://example.com/article"
                value={form.url}
                onChange={(event) => setForm((current) => ({ ...current, url: event.target.value }))}
              />
            </label>
            <label>
              Custom alias
              <input
                type="text"
                placeholder="optional-alias"
                value={form.customAlias}
                onChange={(event) => setForm((current) => ({ ...current, customAlias: event.target.value }))}
              />
            </label>
            <label>
              Expires in days
              <input
                type="number"
                min="1"
                max="3650"
                placeholder="optional"
                value={form.expiresInDays}
                onChange={(event) => setForm((current) => ({ ...current, expiresInDays: event.target.value }))}
              />
            </label>
            <button type="submit" disabled={submitting}>
              {submitting ? 'Creating…' : 'Create short URL'}
            </button>
          </form>
        </section>

        <section className="card">
          <div className="section-header">
            <h2>Short URLs</h2>
            <button type="button" className="secondary" onClick={() => refreshList()} disabled={loadingList}>
              {loadingList ? 'Refreshing…' : 'Refresh'}
            </button>
          </div>

          {loadingList ? (
            <p className="muted">Loading URLs…</p>
          ) : items.length === 0 ? (
            <p className="muted">No short URLs created yet.</p>
          ) : (
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Code</th>
                    <th>Original URL</th>
                    <th>Clicks</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((item) => (
                    <tr key={item.short_code} className={selectedCode === item.short_code ? 'selected-row' : ''}>
                      <td>
                        <button
                          type="button"
                          className="link-button"
                          onClick={() => setSelectedCode(item.short_code)}
                        >
                          {item.short_code}
                        </button>
                      </td>
                      <td>
                        <a href={item.original_url} target="_blank" rel="noreferrer">
                          {item.original_url}
                        </a>
                      </td>
                      <td>{item.click_count}</td>
                      <td>{item.is_active ? 'Active' : 'Inactive'}</td>
                      <td>
                        <div className="action-row">
                          <button type="button" className="secondary" onClick={() => setSelectedCode(item.short_code)}>
                            Analytics
                          </button>
                          <button
                            type="button"
                            className="danger"
                            onClick={() => handleDelete(item.short_code)}
                            disabled={!item.is_active}
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          <p className="muted compact">Active links: {activeItems.length} / {items.length}</p>
        </section>

        <section className="card analytics-card">
          <div className="section-header">
            <h2>Analytics</h2>
            <select value={selectedCode} onChange={(event) => setSelectedCode(event.target.value)} disabled={items.length === 0}>
              {items.length === 0 ? <option value="">No short URLs</option> : null}
              {items.map((item) => (
                <option key={item.short_code} value={item.short_code}>
                  {item.short_code}
                </option>
              ))}
            </select>
          </div>

          {!selectedCode ? (
            <p className="muted">Select a short code to view analytics.</p>
          ) : loadingAnalytics ? (
            <p className="muted">Loading analytics…</p>
          ) : analytics ? (
            <>
              <div className="analytics-overview">
                <div>
                  <span className="label">Short URL</span>
                  <a href={analytics.short_url} target="_blank" rel="noreferrer">{analytics.short_url}</a>
                </div>
                <div>
                  <span className="label">Original URL</span>
                  <span>{analytics.original_url}</span>
                </div>
                <div>
                  <span className="label">Total clicks</span>
                  <strong>{analytics.total_clicks}</strong>
                </div>
                <div>
                  <span className="label">Last click</span>
                  <span>{formatDate(analytics.last_clicked_at)}</span>
                </div>
              </div>

              <div className="stats-grid">
                <StatList title="Top referrers" items={analytics.top_referrers} />
                <StatList title="Browsers" items={analytics.browser_breakdown} />
                <StatList title="Devices" items={analytics.device_breakdown} />
              </div>

              <div>
                <h3>Recent clicks</h3>
                {analytics.recent_clicks.length === 0 ? (
                  <p className="muted">No click events recorded yet.</p>
                ) : (
                  <div className="table-wrap">
                    <table>
                      <thead>
                        <tr>
                          <th>Timestamp</th>
                          <th>IP</th>
                          <th>Referer</th>
                          <th>Browser</th>
                          <th>Device</th>
                        </tr>
                      </thead>
                      <tbody>
                        {analytics.recent_clicks.map((click, index) => (
                          <tr key={`${click.timestamp}-${index}`}>
                            <td>{formatDate(click.timestamp)}</td>
                            <td>{click.ip_address || '—'}</td>
                            <td>{click.referer || 'direct'}</td>
                            <td>{click.browser || 'unknown'}</td>
                            <td>{click.device_type || 'unknown'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </>
          ) : (
            <p className="muted">Analytics unavailable for this short code.</p>
          )}
        </section>
      </main>
    </div>
  );
}
