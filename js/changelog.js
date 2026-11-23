// Pulls releases from GitHub. Works on the HTML 5 pages; the other pages keep their static links.
var REPO = 'bondzuhmatvij29-boop/About-of-Your-Gadget';
var API = 'https://api.github.com/repos/' + REPO + '/releases';

function esc(s) {
  return String(s || '').replace(/[&<>"']/g, function (c) {
    return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
  });
}

// Latest version badge (index.html)
var badge = document.getElementById('latestVer');
if (badge) {
  fetch(API + '/latest').then(function (r) { return r.json(); }).then(function (rel) {
    if (rel && rel.tag_name) badge.textContent = 'Latest: ' + rel.tag_name;
  }).catch(function () {});
}

// Full list (changelog.html)
var list = document.getElementById('releases');
if (list) {
  fetch(API).then(function (r) { return r.json(); }).then(function (rels) {
    if (!rels.length) { list.innerHTML = '<p>No releases yet.</p>'; return; }
    var html = '';
    for (var i = 0; i < rels.length; i++) {
      var r = rels[i];
      var date = r.published_at ? r.published_at.substring(0, 10) : '';
      html += '<div class="card-box release"><h3>' + esc(r.name || r.tag_name) + '</h3>' +
              '<p class="muted">' + esc(date) + '</p>' +
              '<pre class="notes">' + esc(r.body || '—') + '</pre>' +
              '<a class="btn btn-outlined" href="' + esc(r.html_url) + '" target="_blank">GitHub</a></div>';
    }
    list.innerHTML = html;
  }).catch(function () {
    list.innerHTML = '<p>Could not load releases. <a href="https://github.com/' + REPO + '/releases">Open the releases page on GitHub</a>.</p>';
  });
}
