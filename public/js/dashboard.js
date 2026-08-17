function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

async function postJson(url, data) {
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || res.statusText || 'Request failed');
  }
  return res.json().catch(() => ({}));
}

async function deleteResource(url) {
  const res = await fetch(url, { method: 'DELETE' });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || res.statusText || 'Delete failed');
  }
  return true;
}

document.addEventListener('DOMContentLoaded', () => {
  // Initialize map centered on Southport/Indianapolis
  const centerLat = 39.6644;
  const centerLng = -86.1205;
  const map = L.map('map').setView([centerLat, centerLng], 12);

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; OpenStreetMap contributors',
    maxZoom: 19,
  }).addTo(map);

  // Parse embedded restaurants data
  let restaurants = [];
  try {
    const el = document.getElementById('map-data');
    if (el) restaurants = JSON.parse(el.textContent || el.innerText || '[]');
  } catch (e) {
    console.error('Failed to parse restaurants JSON', e);
  }

  // Add markers
  restaurants.forEach((r) => {
    const lat = parseFloat(r.latitude);
    const lng = parseFloat(r.longitude);
    if (!Number.isFinite(lat) || !Number.isFinite(lng)) return;
    const marker = L.marker([lat, lng]).addTo(map);
    const name = escapeHtml(r.name || '');
    const cuisine = escapeHtml(r.cuisine || '');
    marker.bindPopup(`<strong>${name}</strong><br>${cuisine}`);
  });

  // Restaurant form
  const restaurantForm = document.getElementById('restaurant-form');
  if (restaurantForm) {
    restaurantForm.addEventListener('submit', async (ev) => {
      ev.preventDefault();
      const form = ev.currentTarget;
      const lat = parseFloat(form.querySelector('[name="latitude"]').value);
      const lng = parseFloat(form.querySelector('[name="longitude"]').value);

      // Catch malformed coordinates (e.g. a decimal point lost during typing/pasting)
      // before they're sent, since a garbage lat/lng silently plots no visible pin.
      if (!Number.isFinite(lat) || lat < -90 || lat > 90) {
        alert('Latitude must be a number between -90 and 90.');
        return;
      }
      if (!Number.isFinite(lng) || lng < -180 || lng > 180) {
        alert('Longitude must be a number between -180 and 180.');
        return;
      }

      const data = {
        name: form.querySelector('[name="name"]').value,
        cuisine: form.querySelector('[name="cuisine"]').value,
        latitude: lat,
        longitude: lng,
      };
      try {
        await postJson('/api/restaurants', data);
        location.reload();
      } catch (err) {
        console.error(err);
        alert('Failed to create restaurant: ' + err.message);
      }
    });
  }

  // Review form
  const reviewForm = document.getElementById('review-form');
  if (reviewForm) {
    reviewForm.addEventListener('submit', async (ev) => {
      ev.preventDefault();
      const form = ev.currentTarget;
      const data = {
        restaurant_id: form.querySelector('[name="restaurant_id"]').value,
        visit_date: form.querySelector('[name="visit_date"]').value || null,
        rating: form.querySelector('[name="rating"]').value,
        review_text: form.querySelector('[name="review_text"]').value || null,
      };
      try {
        await postJson('/api/reviews', data);
        location.reload();
      } catch (err) {
        console.error(err);
        alert('Failed to submit review: ' + err.message);
      }
    });
  }

  // Delete buttons via event delegation
  const timeline = document.getElementById('timeline');
  if (timeline) {
    timeline.addEventListener('click', async (ev) => {
      const btn = ev.target.closest('.delete-restaurant');
      if (!btn) return;
      const id = btn.dataset.id;
      if (!id) return;
      if (!confirm('Delete this restaurant and its reviews?')) return;
      try {
        await deleteResource(`/api/restaurants/${encodeURIComponent(id)}`);
        location.reload();
      } catch (err) {
        console.error(err);
        alert('Failed to delete restaurant: ' + err.message);
      }
    });
  }
});
