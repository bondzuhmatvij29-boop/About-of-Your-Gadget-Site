// Posts = GitHub Issues with label "post" in the community repository (read),
// and a small proxy that creates a new post for the visitor (write).
var COMMUNITY_REPO = 'bondzuhmatvij29-boop/aoyg-community';   // CHANGE to your repo
var POSTS_API = 'https://api.github.com/repos/' + COMMUNITY_REPO + '/issues?labels=post&state=open&per_page=30';
var POST_URL = 'https://aoyg-backend.onrender.com/api/posts';   // CHANGE to your Render URL

function esc(s) {
  return String(s || '').replace(/[&<>"']/g, function (c) {
    return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
  });
}

// Tabs
var tabs = document.querySelectorAll('[data-tab]');
for (var t = 0; t < tabs.length; t++) {
  tabs[t].addEventListener('click', function (e) {
    e.preventDefault();
    var name = this.getAttribute('data-tab');
    var panels = document.querySelectorAll('[data-panel]');
    for (var p = 0; p < panels.length; p++) {
      panels[p].style.display = panels[p].getAttribute('data-panel') === name ? 'block' : 'none';
    }
    for (var k = 0; k < tabs.length; k++) tabs[k].setAttribute('aria-selected', String(tabs[k] === this));
  });
}

// Load posts
var list = document.getElementById('posts');
if (list) {
  fetch(POSTS_API).then(function (r) {
    if (!r.ok) throw new Error('HTTP ' + r.status);
    return r.json();
  }).then(function (items) {
    var posts = items.filter(function (i) { return !i.pull_request; });
    if (!posts.length) { list.innerHTML = '<p>No posts yet. Be the first one.</p>'; return; }
    var html = '';
    for (var i = 0; i < posts.length; i++) {
      var p = posts[i];
      var body = (p.body || '').replace(/\r/g, '').replace(/^\*\*Author:\*\*.*\n\n/, '');
      if (body.length > 500) body = body.substring(0, 500) + '…';
      html += '<div class="card-box post"><h3>' + esc(p.title.replace(/^\[Post\]\s*/, '')) + '</h3>' +
              '<p class="muted">' + esc((p.created_at || '').substring(0, 10)) + '</p>' +
              '<p class="post-body">' + esc(body) + '</p></div>';
    }
    list.innerHTML = html;
  }).catch(function () {
    list.innerHTML = '<p>Could not load posts right now.</p>';
  });
}

// Write a post
var form = document.getElementById('postForm');
if (form) {
  var anon = document.getElementById('anon');
  var nick = document.getElementById('nick');
  var status = document.getElementById('postStatus');
  anon.addEventListener('change', function () { nick.disabled = anon.checked; });
  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var text = form.elements.text.value.trim();
    var website = form.elements.website.value;   // honeypot: must stay empty
    if (text.length < 5) { status.textContent = 'Write at least 5 characters.'; return; }
    status.textContent = 'Sending…';
    fetch(POST_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ kind: form.elements.kind.value, anonymous: anon.checked, nickname: nick.value, text: text, website: website })
    }).then(function (r) { return r.json().then(function (j) { return { ok: r.ok, j: j }; }); })
      .then(function (res) {
        if (res.ok) { status.textContent = 'Thanks! Your post will appear after a quick check.'; form.reset(); nick.disabled = false; }
        else { status.textContent = res.j.error || 'Could not send the post.'; }
      })
      .catch(function () { status.textContent = 'Could not reach the server. Try again later.'; });
  });
}
