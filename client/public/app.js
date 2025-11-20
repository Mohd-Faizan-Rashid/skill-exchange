const APP_STATE = {
  currentUser: null,
  token: localStorage.getItem('token') || null,
  currentPage: 'home',
  users: [],
  connections: [],
  messages: [],
  skills: [],
  allSkills: []
};

const API_BASE = 'http://localhost:5000/api';

// Utility: API calls
async function apiCall(endpoint, method = 'GET', body = null) {
  const options = {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(APP_STATE.token && { 'Authorization': `Bearer ${APP_STATE.token}` })
    }
  };
  if (body) options.body = JSON.stringify(body);

  try {
    const response = await fetch(`${API_BASE}${endpoint}`, options);
    if (!response.ok) throw new Error(`API Error: ${response.status}`);
    return await response.json();
  } catch (err) {
    console.error('API call failed:', err);
    showAlert(err.message, 'error');
    throw err;
  }
}

// UI Helpers
function showAlert(message, type = 'success') {
  const alertContainer = document.getElementById('alerts');
  if (!alertContainer) return;
  
  const alert = document.createElement('div');
  alert.className = `alert alert-${type === 'error' ? 'danger' : type}`;
  alert.innerHTML = `${message} <button type="button" class="btn-close" onclick="this.parentElement.remove()"></button>`;
  alertContainer.appendChild(alert);
  
  setTimeout(() => alert.remove(), 5000);
}

function renderPage(page) {
  APP_STATE.currentPage = page;
  const app = document.getElementById('root');
  
  switch(page) {
    case 'home': app.innerHTML = renderHome(); break;
    case 'login': app.innerHTML = renderLogin(); break;
    case 'register': app.innerHTML = renderRegister(); break;
    case 'dashboard': app.innerHTML = renderDashboard(); break;
    case 'profile': app.innerHTML = renderProfile(); break;
    case 'discover': app.innerHTML = renderDiscover(); break;
    case 'connections': app.innerHTML = renderConnections(); break;
    case 'messages': app.innerHTML = renderMessages(); break;
    default: app.innerHTML = renderHome();
  }
  
  attachEventListeners();
  window.scrollTo(0, 0);
}

// Navigation Helper
function navigate(page) {
  renderPage(page);
}

// Render Functions
function renderHome() {
  const loggedIn = APP_STATE.token;
  return `
    <nav>
      <div class="navbar-container">
        <div class="logo">
          <div class="logo-icon">⟡</div>
          <span>SkillSwap</span>
        </div>
        <ul class="nav-links">
          <li class="nav-link active">Home</li>
          ${loggedIn ? `
            <li class="nav-link" onclick="navigate('discover')">Discover</li>
            <li class="nav-link" onclick="navigate('connections')">Connections</li>
            <li class="nav-link" onclick="navigate('messages')">Messages</li>
          ` : ''}
        </ul>
        <div class="user-menu">
          ${loggedIn ? `
            <button class="btn btn-outline" onclick="navigate('profile')">Profile</button>
            <button class="btn btn-secondary" onclick="logout()">Logout</button>
          ` : `
            <button class="btn btn-outline" onclick="navigate('login')">Login</button>
            <button class="btn btn-primary" onclick="navigate('register')">Sign Up</button>
          `}
        </div>
      </div>
    </nav>

    <div class="hero">
      <div class="hero-content">
        <h1>Learn Any Skill, Teach What You Know</h1>
        <p>Exchange knowledge with peers in your community. Free, collaborative, and peer-driven learning.</p>
        <div class="hero-buttons">
          ${!loggedIn ? `
            <button class="btn btn-primary" onclick="navigate('register')">Get Started Free →</button>
            <button class="btn btn-outline" style="color: white; border-color: white;" onclick="navigate('login')">Sign In</button>
          ` : `
            <button class="btn btn-primary" onclick="navigate('discover')">Find Matches →</button>
            <button class="btn btn-outline" style="color: white; border-color: white;" onclick="navigate('profile')">My Profile</button>
          `}
        </div>
      </div>
    </div>

    <div class="page-container">
      <div style="margin-bottom: 4rem;">
        <div class="grid cols-3" style="margin-bottom: 3rem;">
          <div class="card">
            <div class="card-body">
              <div style="font-size: 2.5rem; margin-bottom: 1rem;">📚</div>
              <h3 style="font-weight: 700; margin-bottom: 0.5rem;">100% Free</h3>
              <p>No hidden costs, no subscriptions. Learning is a gift you give to each other.</p>
            </div>
          </div>
          <div class="card">
            <div class="card-body">
              <div style="font-size: 2.5rem; margin-bottom: 1rem;">🤝</div>
              <h3 style="font-weight: 700; margin-bottom: 0.5rem;">Community Driven</h3>
              <p>Connect with passionate learners who share your interests and goals.</p>
            </div>
          </div>
          <div class="card">
            <div class="card-body">
              <div style="font-size: 2.5rem; margin-bottom: 1rem;">⭐</div>
              <h3 style="font-weight: 700; margin-bottom: 0.5rem;">Verified Reviews</h3>
              <p>Build trust through community ratings and transparent feedback.</p>
            </div>
          </div>
        </div>

        <div style="margin-top: 4rem;">
          <h2 class="section-title">How It Works</h2>
          <div class="grid cols-4">
            <div class="card">
              <div class="card-body" style="text-align: center;">
                <div style="width: 50px; height: 50px; border-radius: 50%; background: linear-gradient(135deg, var(--secondary), var(--accent)); display: flex; align-items: center; justify-content: center; color: white; font-weight: 700; margin: 0 auto 1rem; font-size: 1.5rem;">1</div>
                <h4 style="font-weight: 700;">Create Profile</h4>
                <p style="font-size: 0.9rem;">Tell us your skills and what you want to learn.</p>
              </div>
            </div>
            <div class="card">
              <div class="card-body" style="text-align: center;">
                <div style="width: 50px; height: 50px; border-radius: 50%; background: linear-gradient(135deg, var(--secondary), var(--accent)); display: flex; align-items: center; justify-content: center; color: white; font-weight: 700; margin: 0 auto 1rem; font-size: 1.5rem;">2</div>
                <h4 style="font-weight: 700;">Browse Peers</h4>
                <p style="font-size: 0.9rem;">Discover people with compatible skills.</p>
              </div>
            </div>
            <div class="card">
              <div class="card-body" style="text-align: center;">
                <div style="width: 50px; height: 50px; border-radius: 50%; background: linear-gradient(135deg, var(--secondary), var(--accent)); display: flex; align-items: center; justify-content: center; color: white; font-weight: 700; margin: 0 auto 1rem; font-size: 1.5rem;">3</div>
                <h4 style="font-weight: 700;">Connect</h4>
                <p style="font-size: 0.9rem;">Send connection requests and chat.</p>
              </div>
            </div>
            <div class="card">
              <div class="card-body" style="text-align: center;">
                <div style="width: 50px; height: 50px; border-radius: 50%; background: linear-gradient(135deg, var(--secondary), var(--accent)); display: flex; align-items: center; justify-content: center; color: white; font-weight: 700; margin: 0 auto 1rem; font-size: 1.5rem;">4</div>
                <h4 style="font-weight: 700;">Exchange</h4>
                <p style="font-size: 0.9rem;">Learn & teach, then leave reviews.</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div style="background: linear-gradient(135deg, var(--primary-dark), var(--primary)); color: white; border-radius: var(--border-radius); padding: 3rem; text-align: center; margin-top: 3rem;">
        <h2 style="font-weight: 700; margin-bottom: 1rem;">Ready to Start Learning?</h2>
        <p style="margin-bottom: 2rem; opacity: 0.9;">Join our community of passionate learners and teachers today.</p>
        ${!loggedIn ? `<button class="btn btn-primary" onclick="navigate('register')" style="background-color: white; color: var(--primary); font-weight: 600;">Get Started Free →</button>` : ''}
      </div>
    </div>

    <footer style="background-color: var(--neutral-800); color: white; padding: 3rem 2rem; text-align: center; margin-top: 4rem;">
      <div class="page-container">
        <p style="margin-bottom: 0.5rem; font-weight: 600;">SkillSwap - Mutual Skill Exchange</p>
        <p style="opacity: 0.7; font-size: 0.9rem;">&copy; 2025 Learn and teach skills for free. All rights reserved.</p>
      </div>
    </footer>
  `;
}

function renderLogin() {
  return `
    <nav>
      <div class="navbar-container">
        <div class="logo">
          <div class="logo-icon">⟡</div>
          <span>SkillSwap</span>
        </div>
        <div class="user-menu">
          <button class="btn btn-outline" onclick="navigate('register')">Create Account</button>
        </div>
      </div>
    </nav>

    <div class="page-container" style="max-width: 500px; margin-top: 3rem; margin-bottom: 3rem;">
      <div class="card">
        <div class="card-body">
          <h1 style="font-size: 2rem; font-weight: 700; margin-bottom: 0.5rem;">Welcome Back</h1>
          <p style="color: var(--text-secondary); margin-bottom: 2rem;">Sign in to your account to continue.</p>

          <form id="loginForm">
            <div class="form-group">
              <label>Email Address</label>
              <input type="email" class="form-control" id="email" placeholder="you@example.com" required>
            </div>
            <div class="form-group">
              <label>Password</label>
              <input type="password" class="form-control" id="password" placeholder="••••••••" required>
            </div>
            <button type="submit" class="btn btn-primary" style="width: 100%; padding: 0.75rem; font-size: 1rem;">Sign In</button>
          </form>

          <p style="margin-top: 2rem; text-align: center; color: var(--text-secondary);">
            Don't have an account? <a href="#" onclick="navigate('register'); return false;" style="font-weight: 600;">Create one here</a>
          </p>
        </div>
      </div>
    </div>
  `;
}

function renderRegister() {
  return `
    <nav>
      <div class="navbar-container">
        <div class="logo">
          <div class="logo-icon">⟡</div>
          <span>SkillSwap</span>
        </div>
        <div class="user-menu">
          <button class="btn btn-outline" onclick="navigate('login')">Sign In</button>
        </div>
      </div>
    </nav>

    <div class="page-container" style="max-width: 600px; margin-top: 3rem; margin-bottom: 3rem;">
      <div class="card">
        <div class="card-body">
          <h1 style="font-size: 2rem; font-weight: 700; margin-bottom: 0.5rem;">Create Your Account</h1>
          <p style="color: var(--text-secondary); margin-bottom: 2rem;">Join our community of learners and teachers.</p>

          <form id="registerForm">
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin-bottom: 1.5rem;">
              <div class="form-group" style="margin-bottom: 0;">
                <label>First Name</label>
                <input type="text" class="form-control" id="firstName" placeholder="John" required>
              </div>
              <div class="form-group" style="margin-bottom: 0;">
                <label>Last Name</label>
                <input type="text" class="form-control" id="lastName" placeholder="Doe" required>
              </div>
            </div>

            <div class="form-group">
              <label>Username</label>
              <input type="text" class="form-control" id="username" placeholder="Choose a unique username" required>
            </div>

            <div class="form-group">
              <label>Email Address</label>
              <input type="email" class="form-control" id="email" placeholder="you@example.com" required>
            </div>

            <div class="form-group">
              <label>Password</label>
              <input type="password" class="form-control" id="password" placeholder="At least 6 characters" required>
            </div>

            <button type="submit" class="btn btn-primary" style="width: 100%; padding: 0.75rem; font-size: 1rem;">Create Account</button>
          </form>

          <p style="margin-top: 2rem; text-align: center; color: var(--text-secondary); font-size: 0.9rem;">
            Already have an account? <a href="#" onclick="navigate('login'); return false;" style="font-weight: 600;">Sign in here</a>
          </p>
        </div>
      </div>
    </div>
  `;
}

function renderDashboard() {
  const user = APP_STATE.currentUser;
  return `
    <nav>
      <div class="navbar-container">
        <div class="logo">
          <div class="logo-icon">⟡</div>
          <span>SkillSwap</span>
        </div>
        <ul class="nav-links">
          <li class="nav-link" onclick="navigate('home')">Home</li>
          <li class="nav-link active" onclick="navigate('dashboard')">Dashboard</li>
          <li class="nav-link" onclick="navigate('discover')">Discover</li>
          <li class="nav-link" onclick="navigate('connections')">Connections</li>
          <li class="nav-link" onclick="navigate('messages')">Messages</li>
        </ul>
        <div class="user-menu">
          <button class="btn btn-outline" onclick="navigate('profile')">Profile</button>
          <button class="btn btn-secondary" onclick="logout()">Logout</button>
        </div>
      </div>
    </nav>

    <div class="page-container" style="max-width: 800px; margin-top: 3rem;">
      <div class="card mb-4">
        <div class="card-body">
          <h2>Welcome, ${user.firstName}! 👋</h2>
          <p class="text-muted">Complete your profile and add your skills to start connecting with other learners.</p>
          <div class="mt-4">
            <a href="#" onclick="navigate('profile'); return false;" class="btn btn-secondary me-2">Complete Profile →</a>
            <a href="#" onclick="navigate('discover'); return false;" class="btn btn-primary">Find Matches →</a>
          </div>
        </div>
      </div>

      <div class="card">
        <div class="card-body">
          <h3>Quick Stats</h3>
          <div class="row text-center">
            <div class="col-md-4">
              <h4 style="color: var(--secondary-color); font-weight: 700;">0</h4>
              <p>Skills Added</p>
            </div>
            <div class="col-md-4">
              <h4 style="color: var(--secondary-color); font-weight: 700;">0</h4>
              <p>Connections</p>
            </div>
            <div class="col-md-4">
              <h4 style="color: var(--secondary-color); font-weight: 700;">0</h4>
              <p>Reviews</p>
            </div>
          </div>
        </div>
      </div>

      <div class="card mt-4">
        <div class="card-body">
          <h3>Your Profile</h3>
          <div class="row align-items-center">
            <div class="col-md-3 text-center">
              <div class="avatar" style="width: 100px; height: 100px; font-size: 2rem; margin: 0 auto;">
                ${user.firstName.charAt(0).toUpperCase()}${user.lastName.charAt(0).toUpperCase()}
              </div>
            </div>
            <div class="col-md-9">
              <h4>${user.firstName} ${user.lastName}</h4>
              <p>@${user.username}</p>
              <p class="text-muted">${user.location || 'Location not set'}</p>
              <button class="btn btn-secondary btn-sm" onclick="showEditProfileModal()">Edit Profile</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;
}

function renderProfile() {
  const user = APP_STATE.currentUser;
  return `
    <nav>
      <div class="navbar-container">
        <div class="logo">
          <div class="logo-icon">⟡</div>
          <span>SkillSwap</span>
        </div>
        <ul class="nav-links">
          <li class="nav-link" onclick="navigate('home')">Home</li>
          <li class="nav-link" onclick="navigate('dashboard')">Dashboard</li>
          <li class="nav-link" onclick="navigate('discover')">Discover</li>
          <li class="nav-link" onclick="navigate('connections')">Connections</li>
          <li class="nav-link" onclick="navigate('messages')">Messages</li>
          <li class="nav-link active" onclick="navigate('profile')">Profile</li>
        </ul>
        <div class="user-menu">
          <button class="btn btn-outline" onclick="navigate('profile')">Profile</button>
          <button class="btn btn-secondary" onclick="logout()">Logout</button>
        </div>
      </div>
    </nav>

    <div class="page-container" style="max-width: 800px; margin-top: 3rem;">
      <div class="card mb-4">
        <div class="card-body">
          <h3>About ${user.firstName} ${user.lastName}</h3>
          <p>${user.bio || 'No bio added yet'}</p>
        </div>
      </div>

      <div class="card mb-4">
        <div class="card-body">
          <h3>My Skills</h3>
          <div id="skillsList"></div>
          <button class="btn btn-primary btn-sm mt-3" onclick="showAddSkillModal()">+ Add Skill</button>
        </div>
      </div>

      <div class="card">
        <div class="card-body">
          <h3>Reviews</h3>
          <div id="reviewsList"></div>
        </div>
      </div>
    </div>

    <!-- Edit Profile Modal -->
    <div class="modal fade" id="editProfileModal" tabindex="-1">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">Edit Profile</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
          </div>
          <div class="modal-body">
            <form id="editProfileForm">
              <div class="form-group">
                <label>First Name</label>
                <input type="text" class="form-control" id="editFirstName" value="${user.firstName}">
              </div>
              <div class="form-group">
                <label>Last Name</label>
                <input type="text" class="form-control" id="editLastName" value="${user.lastName}">
              </div>
              <div class="form-group">
                <label>Bio</label>
                <textarea class="form-control" id="editBio" rows="3">${user.bio || ''}</textarea>
              </div>
              <div class="form-group">
                <label>Location</label>
                <input type="text" class="form-control" id="editLocation" value="${user.location || ''}">
              </div>
            </form>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
            <button type="button" class="btn btn-primary" onclick="saveEditProfile()">Save Changes</button>
          </div>
        </div>
      </div>
    </div>

    <!-- Add Skill Modal -->
    <div class="modal fade" id="addSkillModal" tabindex="-1">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">Add Skill</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
          </div>
          <div class="modal-body">
            <form id="addSkillForm">
              <div class="form-group">
                <label>Skill</label>
                <select class="form-select" id="skillSelect" required>
                  <option value="">-- Select a skill --</option>
                  ${APP_STATE.allSkills.map(s => `<option value="${s.id}">${s.name}</option>`).join('')}
                </select>
              </div>
              <div class="form-group">
                <label>Proficiency Level</label>
                <select class="form-select" id="proficiencyLevel" required>
                  <option value="beginner">Beginner</option>
                  <option value="intermediate">Intermediate</option>
                  <option value="advanced">Advanced</option>
                  <option value="expert">Expert</option>
                </select>
              </div>
              <div class="form-group form-check">
                <input class="form-check-input" type="checkbox" id="wantToLearn">
                <label class="form-check-label" for="wantToLearn">
                  I want to learn this skill
                </label>
              </div>
            </form>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
            <button type="button" class="btn btn-primary" onclick="saveAddSkill()">Add Skill</button>
          </div>
        </div>
      </div>
    </div>
  `;
}

function renderDiscover() {
  return `
    <nav>
      <div class="navbar-container">
        <div class="logo">
          <div class="logo-icon">⟡</div>
          <span>SkillSwap</span>
        </div>
        <ul class="nav-links">
          <li class="nav-link" onclick="navigate('home')">Home</li>
          <li class="nav-link" onclick="navigate('dashboard')">Dashboard</li>
          <li class="nav-link active" onclick="navigate('discover')">Discover</li>
          <li class="nav-link" onclick="navigate('connections')">Connections</li>
          <li class="nav-link" onclick="navigate('messages')">Messages</li>
        </ul>
        <div class="user-menu">
          <button class="btn btn-outline" onclick="navigate('profile')">Profile</button>
          <button class="btn btn-secondary" onclick="logout()">Logout</button>
        </div>
      </div>
    </nav>

    <div class="page-container" style="max-width: 800px; margin-top: 3rem;">
      <h2 class="section-title">Discover Matches</h2>
      
      <div class="card mb-4">
        <div class="card-body">
          <div class="row g-2">
            <div class="col-md-10">
              <input type="text" class="form-control" id="searchQuery" placeholder="Search by skill or username...">
            </div>
            <div class="col-md-2">
              <button class="btn btn-secondary w-100" onclick="searchUsers()">Search</button>
            </div>
          </div>
          <small class="text-muted d-block mt-2">Tip: Search for skills you want to learn to find people who can teach you!</small>
        </div>
      </div>

      <div id="matchesList"></div>
    </div>
  `;
}

function renderConnections() {
  return `
    <nav>
      <div class="navbar-container">
        <div class="logo">
          <div class="logo-icon">⟡</div>
          <span>SkillSwap</span>
        </div>
        <ul class="nav-links">
          <li class="nav-link" onclick="navigate('home')">Home</li>
          <li class="nav-link" onclick="navigate('dashboard')">Dashboard</li>
          <li class="nav-link" onclick="navigate('discover')">Discover</li>
          <li class="nav-link active" onclick="navigate('connections')">Connections</li>
          <li class="nav-link" onclick="navigate('messages')">Messages</li>
        </ul>
        <div class="user-menu">
          <button class="btn btn-outline" onclick="navigate('profile')">Profile</button>
          <button class="btn btn-secondary" onclick="logout()">Logout</button>
        </div>
      </div>
    </nav>

    <div class="page-container" style="max-width: 800px; margin-top: 3rem;">
      <h2 class="section-title">My Connections</h2>
      
      <ul class="nav nav-tabs mb-4">
        <li class="nav-item">
          <a class="nav-link active" href="#" onclick="filterConnections('all'); return false;">All</a>
        </li>
        <li class="nav-item">
          <a class="nav-link" href="#" onclick="filterConnections('pending'); return false;">Pending</a>
        </li>
        <li class="nav-item">
          <a class="nav-link" href="#" onclick="filterConnections('accepted'); return false;">Accepted</a>
        </li>
      </ul>

      <div id="connectionsList"></div>
    </div>
  `;
}

function renderMessages() {
  return `
    <nav>
      <div class="navbar-container">
        <div class="logo">
          <div class="logo-icon">⟡</div>
          <span>SkillSwap</span>
        </div>
        <ul class="nav-links">
          <li class="nav-link" onclick="navigate('home')">Home</li>
          <li class="nav-link" onclick="navigate('dashboard')">Dashboard</li>
          <li class="nav-link" onclick="navigate('discover')">Discover</li>
          <li class="nav-link" onclick="navigate('connections')">Connections</li>
          <li class="nav-link active" onclick="navigate('messages')">Messages</li>
        </ul>
        <div class="user-menu">
          <button class="btn btn-outline" onclick="navigate('profile')">Profile</button>
          <button class="btn btn-secondary" onclick="logout()">Logout</button>
        </div>
      </div>
    </nav>

    <div class="page-container" style="max-width: 800px; margin-top: 3rem;">
      <h2 class="section-title">Messages</h2>
      
      <div class="row">
        <div class="col-md-4">
          <div class="card">
            <div class="card-body">
              <h5>Conversations</h5>
              <div id="conversationsList"></div>
            </div>
          </div>
        </div>
        <div class="col-md-8">
          <div class="card">
            <div class="card-body" id="messageThreadContainer">
              <p class="text-muted">Select a conversation to view messages</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;
}

// Auth Functions
async function handleLogin(e) {
  e.preventDefault();
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;

  try {
    const response = await apiCall('/auth/login', 'POST', { email, password });
    APP_STATE.token = response.token;
    APP_STATE.currentUser = response.user;
    localStorage.setItem('token', response.token);
    showAlert('Login successful!', 'success');
    await loadCurrentUser();
    navigate('dashboard');
  } catch (err) {
    showAlert('Login failed', 'error');
  }
}

async function handleRegister(e) {
  e.preventDefault();
  const username = document.getElementById('username').value;
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;
  const firstName = document.getElementById('firstName').value;
  const lastName = document.getElementById('lastName').value;

  try {
    const response = await apiCall('/auth/register', 'POST', {
      username, email, password, firstName, lastName
    });
    APP_STATE.token = response.token;
    localStorage.setItem('token', response.token);
    showAlert('Registration successful!', 'success');
    await loadCurrentUser();
    navigate('dashboard');
  } catch (err) {
    showAlert('Registration failed', 'error');
  }
}

function logout() {
  APP_STATE.token = null;
  APP_STATE.currentUser = null;
  localStorage.removeItem('token');
  showAlert('Logged out successfully', 'success');
  navigate('home');
}

// Load Current User
async function loadCurrentUser() {
  if (!APP_STATE.token) return;
  try {
    const token = APP_STATE.token;
    const decoded = JSON.parse(atob(token.split('.')[1]));
    const user = await apiCall(`/users/${decoded.id}`);
    APP_STATE.currentUser = { id: decoded.id, username: decoded.username, ...user };
    
    // Load skills if not already loaded
    if (APP_STATE.allSkills.length === 0) {
      APP_STATE.allSkills = await apiCall('/skills');
    }
    
    // Load connections
    APP_STATE.connections = await apiCall(`/users/${decoded.id}/connections`);
    
    // Load messages
    APP_STATE.messages = await apiCall(`/users/${decoded.id}/messages`);
  } catch (err) {
    console.error('Failed to load user:', err);
  }
}

// Profile Management
function showEditProfileModal() {
  const modal = new bootstrap.Modal(document.getElementById('editProfileModal'));
  modal.show();
}

async function saveEditProfile() {
  const firstName = document.getElementById('editFirstName').value;
  const lastName = document.getElementById('editLastName').value;
  const bio = document.getElementById('editBio').value;
  const location = document.getElementById('editLocation').value;

  try {
    await apiCall(`/users/${APP_STATE.currentUser.id}`, 'PUT', {
      firstName, lastName, bio, location
    });
    APP_STATE.currentUser = { ...APP_STATE.currentUser, firstName, lastName, bio, location };
    showAlert('Profile updated successfully!', 'success');
    bootstrap.Modal.getInstance(document.getElementById('editProfileModal')).hide();
    navigate('profile');
  } catch (err) {
    showAlert('Failed to update profile', 'error');
  }
}

// Skill Management
function showAddSkillModal() {
  const modal = new bootstrap.Modal(document.getElementById('addSkillModal'));
  modal.show();
}

async function saveAddSkill() {
  const skillId = document.getElementById('skillSelect').value;
  const proficiencyLevel = document.getElementById('proficiencyLevel').value;
  const wantToLearn = document.getElementById('wantToLearn').checked;

  if (!skillId) {
    showAlert('Please select a skill', 'error');
    return;
  }

  try {
    await apiCall(`/users/${APP_STATE.currentUser.id}/skills`, 'POST', {
      skillId: parseInt(skillId),
      proficiencyLevel,
      wantToLearn
    });
    showAlert('Skill added successfully!', 'success');
    bootstrap.Modal.getInstance(document.getElementById('addSkillModal')).hide();
    await loadCurrentUser();
    navigate('profile');
  } catch (err) {
    showAlert('Failed to add skill', 'error');
  }
}

// Search and Discovery
async function searchUsers() {
  const query = document.getElementById('searchQuery')?.value || '';
  try {
    const results = await apiCall(`/search?query=${encodeURIComponent(query)}`);
    const matchesList = document.getElementById('matchesList');
    
    if (results.length === 0) {
      matchesList.innerHTML = '<div class="empty-state"><div class="empty-state-icon">🔍</div><p>No matches found. Try another search!</p></div>';
      return;
    }

    matchesList.innerHTML = results.map(user => `
      <div class="search-result">
        <div class="row align-items-center">
          <div class="col-md-1 text-center">
            <div class="avatar" style="width: 60px; height: 60px; font-size: 1.5rem; margin: 0;">
              ${user.firstName.charAt(0).toUpperCase()}${user.lastName.charAt(0).toUpperCase()}
            </div>
          </div>
          <div class="col-md-7">
            <h5>${user.firstName} ${user.lastName} <small class="text-muted">@${user.username}</small></h5>
            <p>${user.bio || 'No bio'}</p>
            <div>
              ${user.skills ? user.skills.split(',').map(s => `<span class="skill-badge">${s.trim()}</span>`).join('') : ''}
            </div>
          </div>
          <div class="col-md-4 text-end">
            <button class="btn btn-secondary btn-sm me-2" onclick="viewUserProfile(${user.id})">View Profile</button>
            <button class="btn btn-primary btn-sm" onclick="requestSkillSwap(${user.id})">Connect</button>
          </div>
        </div>
      </div>
    `).join('');
  } catch (err) {
    showAlert('Search failed', 'error');
  }
}

async function viewUserProfile(userId) {
  try {
    const user = await apiCall(`/users/${userId}`);
    
    // Create a modal-like overlay to show user profile
    const overlay = document.createElement('div');
    overlay.style.cssText = 'position: fixed; inset: 0; background: rgba(0,0,0,0.7); display: flex; align-items: center; justify-content: center; z-index: 9999; padding: 2rem;';
    overlay.onclick = (e) => { if (e.target === overlay) overlay.remove(); };
    
    const skillsList = user.skills && user.skills.length > 0 
      ? user.skills.map(s => `<span class="skill-badge">${s.name} (${s.proficiencyLevel})</span>`).join(' ')
      : '<p class="text-muted">No skills listed</p>';
    
    const reviews = user.reviews && user.reviews.length > 0
      ? user.reviews.map(r => `
          <div class="review-card" style="margin-bottom: 1rem;">
            <div class="review-header">
              <div class="review-avatar">${r.reviewerName.charAt(0).toUpperCase()}</div>
              <div class="review-meta">
                <div class="review-author">${r.reviewerName}</div>
                <div class="star-rating">${'⭐'.repeat(r.rating)}</div>
              </div>
            </div>
            <div class="review-text">${r.comment}</div>
          </div>
        `).join('')
      : '<p class="text-muted">No reviews yet</p>';
    
    overlay.innerHTML = `
      <div class="card" style="max-width: 600px; width: 100%; max-height: 90vh; overflow-y: auto;">
        <div class="card-header" style="background: linear-gradient(135deg, var(--secondary), var(--accent)); color: white; text-align: center; padding: 2rem;">
          <div class="avatar" style="width: 100px; height: 100px; font-size: 2.5rem; margin: 0 auto 1rem; border: 3px solid white;">
            ${user.firstName.charAt(0).toUpperCase()}${user.lastName.charAt(0).toUpperCase()}
          </div>
          <h2 style="margin-bottom: 0.5rem;">${user.firstName} ${user.lastName}</h2>
          <p style="opacity: 0.9;">@${user.username}</p>
        </div>
        <div class="card-body">
          <div style="margin-bottom: 2rem;">
            <h4 style="font-weight: 600; margin-bottom: 0.5rem;">About</h4>
            <p class="text-muted">${user.bio || 'No bio provided'}</p>
            ${user.location ? `<p class="text-muted">📍 ${user.location}</p>` : ''}
          </div>
          
          <div style="margin-bottom: 2rem;">
            <h4 style="font-weight: 600; margin-bottom: 1rem;">Skills</h4>
            <div class="skills-grid">${skillsList}</div>
          </div>
          
          <div>
            <h4 style="font-weight: 600; margin-bottom: 1rem;">Reviews</h4>
            ${reviews}
          </div>
        </div>
        <div class="card-footer" style="display: flex; gap: 1rem; justify-content: flex-end;">
          <button class="btn btn-secondary" onclick="this.closest('[style*=fixed]').remove()">Close</button>
          <button class="btn btn-primary" onclick="requestSkillSwap(${userId}); this.closest('[style*=fixed]').remove();">Send Connection Request</button>
        </div>
      </div>
    `;
    
    document.body.appendChild(overlay);
  } catch (err) {
    showAlert('Failed to load profile', 'error');
  }
}

// Connections Management
async function requestSkillSwap(userId) {
  if (!APP_STATE.currentUser) {
    showAlert('Please login first', 'error');
    return;
  }
  
  // Show skill selection modal
  const overlay = document.createElement('div');
  overlay.style.cssText = 'position: fixed; inset: 0; background: rgba(0,0,0,0.7); display: flex; align-items: center; justify-content: center; z-index: 9999; padding: 2rem;';
  
  const userSkills = APP_STATE.currentUser.skills || [];
  const teachSkills = userSkills.filter(s => !s.wantToLearn);
  const learnSkills = userSkills.filter(s => s.wantToLearn);
  
  if (teachSkills.length === 0 || learnSkills.length === 0) {
    showAlert('Please add skills you can teach and want to learn first', 'error');
    navigate('profile');
    return;
  }
  
  overlay.innerHTML = `
    <div class="card" style="max-width: 500px; width: 100%;">
      <div class="card-header">
        <h3>Send Connection Request</h3>
      </div>
      <div class="card-body">
        <form id="connectionRequestForm">
          <div class="form-group">
            <label>I will teach:</label>
            <select class="form-select" id="teachSkillSelect" required>
              <option value="">-- Select skill --</option>
              ${teachSkills.map(s => `<option value="${s.id}">${s.name}</option>`).join('')}
            </select>
          </div>
          <div class="form-group">
            <label>I want to learn:</label>
            <select class="form-select" id="learnSkillSelect" required>
              <option value="">-- Select skill --</option>
              ${learnSkills.map(s => `<option value="${s.id}">${s.name}</option>`).join('')}
            </select>
          </div>
          <div class="form-group">
            <label>Message (optional):</label>
            <textarea class="form-control" id="connectionMessage" rows="3" placeholder="Introduce yourself..."></textarea>
          </div>
        </form>
      </div>
      <div class="card-footer" style="display: flex; gap: 1rem; justify-content: flex-end;">
        <button class="btn btn-secondary" onclick="this.closest('[style*=fixed]').remove()">Cancel</button>
        <button class="btn btn-primary" onclick="submitConnectionRequest(${userId})">Send Request</button>
      </div>
    </div>
  `;
  
  document.body.appendChild(overlay);
}

async function submitConnectionRequest(recipientId) {
  const teachSkillId = document.getElementById('teachSkillSelect').value;
  const learnSkillId = document.getElementById('learnSkillSelect').value;
  const message = document.getElementById('connectionMessage').value;
  
  if (!teachSkillId || !learnSkillId) {
    showAlert('Please select both skills', 'error');
    return;
  }
  
  try {
    await apiCall('/connections', 'POST', {
      recipientId: parseInt(recipientId),
      initiatorSkillId: parseInt(teachSkillId),
      recipientSkillId: parseInt(learnSkillId),
      message
    });
    
    showAlert('Connection request sent successfully!', 'success');
    document.querySelector('[style*="position: fixed"]').remove();
    await loadCurrentUser();
  } catch (err) {
    showAlert('Failed to send connection request', 'error');
  }
}

async function filterConnections(status) {
  const connectionsList = document.getElementById('connectionsList');
  let connections = APP_STATE.connections;
  
  if (status !== 'all') {
    connections = connections.filter(c => c.status === status);
  }

  if (connections.length === 0) {
    connectionsList.innerHTML = '<div class="empty-state"><div class="empty-state-icon">🔗</div><p>No connections yet</p></div>';
    return;
  }

  connectionsList.innerHTML = connections.map(c => `
    <div class="connection-card">
      <div class="row align-items-center">
        <div class="col-md-8">
          <h5>${c.initiatorId === APP_STATE.currentUser.id ? c.recipientName : c.initiatorName}</h5>
          <p class="text-muted">
            ${c.initiatorId === APP_STATE.currentUser.id ? 'You teach' : 'They teach'}: <strong>${c.initiatorSkillName}</strong>
            <br/>
            ${c.initiatorId === APP_STATE.currentUser.id ? 'They teach' : 'You teach'}: <strong>${c.recipientSkillName}</strong>
          </p>
          <span class="connection-status ${c.status}">${c.status.toUpperCase()}</span>
        </div>
        <div class="col-md-4 text-end">
          ${c.status === 'pending' && c.recipientId === APP_STATE.currentUser.id ? `
            <button class="btn btn-success btn-sm me-2" onclick="updateConnectionStatus(${c.id}, 'accepted')">Accept</button>
            <button class="btn btn-danger btn-sm" onclick="updateConnectionStatus(${c.id}, 'rejected')">Reject</button>
          ` : `
            <button class="btn btn-secondary btn-sm" onclick="messageUser(${c.initiatorId === APP_STATE.currentUser.id ? c.recipientId : c.initiatorId})">Message</button>
          `}
        </div>
      </div>
    </div>
  `).join('');
}

async function updateConnectionStatus(connectionId, status) {
  try {
    await apiCall(`/connections/${connectionId}`, 'PUT', { status });
    showAlert(`Connection ${status}!`, 'success');
    await loadCurrentUser();
    filterConnections('all');
  } catch (err) {
    showAlert('Failed to update connection', 'error');
  }
}

// Messaging
async function messageUser(userId) {
  try {
    // Check if conversation exists
    let conversation = APP_STATE.messages.find(m => 
      m.senderId === userId || m.recipientId === userId
    );
    
    if (!conversation) {
      // Create new conversation
      conversation = await apiCall('/messages', 'POST', {
        recipientId: userId,
        content: 'Hi! I would like to connect with you.'
      });
    }
    
    navigate('messages');
    // Load the specific conversation
    setTimeout(() => loadConversation(userId), 100);
  } catch (err) {
    showAlert('Failed to start conversation', 'error');
  }
}

async function loadConversation(userId) {
  try {
    const messages = await apiCall(`/messages/${userId}`);
    const otherUser = await apiCall(`/users/${userId}`);
    
    const container = document.getElementById('messageThreadContainer');
    if (!container) return;
    
    container.innerHTML = `
      <div style="border-bottom: 1px solid var(--neutral-200); padding-bottom: 1rem; margin-bottom: 1rem;">
        <h4>${otherUser.firstName} ${otherUser.lastName}</h4>
        <p class="text-muted">@${otherUser.username}</p>
      </div>
      
      <div style="max-height: 400px; overflow-y: auto; margin-bottom: 1rem;" id="messagesContainer">
        ${messages.length > 0 
          ? messages.map(m => `
              <div style="margin-bottom: 1rem; text-align: ${m.senderId === APP_STATE.currentUser.id ? 'right' : 'left'};">
                <div style="display: inline-block; max-width: 70%; padding: 0.75rem 1rem; border-radius: var(--border-radius); background: ${m.senderId === APP_STATE.currentUser.id ? 'var(--secondary)' : 'var(--neutral-200)'}; color: ${m.senderId === APP_STATE.currentUser.id ? 'white' : 'var(--text-primary)'};">
                  ${m.content}
                </div>
                <div style="font-size: 0.75rem; color: var(--text-secondary); margin-top: 0.25rem;">
                  ${new Date(m.createdAt).toLocaleString()}
                </div>
              </div>
            `).join('')
          : '<p class="text-muted text-center">No messages yet. Start the conversation!</p>'
        }
      </div>
      
      <form id="sendMessageForm" style="display: flex; gap: 0.5rem;">
        <input type="text" class="form-control" id="messageInput" placeholder="Type your message..." required>
        <button type="submit" class="btn btn-primary">Send</button>
      </form>
    `;
    
    // Attach send message handler
    document.getElementById('sendMessageForm').onsubmit = async (e) => {
      e.preventDefault();
      const content = document.getElementById('messageInput').value;
      
      try {
        await apiCall('/messages', 'POST', {
          recipientId: userId,
          content
        });
        
        document.getElementById('messageInput').value = '';
        loadConversation(userId); // Reload messages
      } catch (err) {
        showAlert('Failed to send message', 'error');
      }
    };
    
    // Scroll to bottom
    const messagesContainer = document.getElementById('messagesContainer');
    if (messagesContainer) {
      messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }
  } catch (err) {
    showAlert('Failed to load conversation', 'error');
  }
}

// Profile Display Helper
async function displayProfileContent() {
  const user = APP_STATE.currentUser;
  
  // Display skills
  const skillsList = document.getElementById('skillsList');
  if (user.skills && user.skills.length > 0) {
    skillsList.innerHTML = user.skills.map(s => `
      <div class="mb-3">
        <span class="skill-badge ${s.wantToLearn ? 'wanted' : ''}">
          ${s.name} - ${s.proficiencyLevel.toUpperCase()}
          ${s.wantToLearn ? ' (Want to Learn)' : ' (Can Teach)'}
        </span>
      </div>
    `).join('');
  } else {
    skillsList.innerHTML = '<p class="text-muted">No skills added yet. Add your first skill!</p>';
  }

  // Display reviews
  const reviewsList = document.getElementById('reviewsList');
  if (user.reviews && user.reviews.length > 0) {
    reviewsList.innerHTML = user.reviews.map(r => `
      <div class="message-box">
        <strong>${r.username}</strong> ${Array(r.rating).fill('⭐').join('')}
        <p>${r.comment}</p>
      </div>
    `).join('');
  } else {
    reviewsList.innerHTML = '<p class="text-muted">No reviews yet</p>';
  }
}

// Attach Event Listeners
function attachEventListeners() {
  const loginForm = document.getElementById('loginForm');
  if (loginForm) loginForm.addEventListener('submit', handleLogin);

  const registerForm = document.getElementById('registerForm');
  if (registerForm) registerForm.addEventListener('submit', handleRegister);

  // Load profile content if on profile page
  if (APP_STATE.currentPage === 'profile') {
    displayProfileContent();
  }

  // Load connections if on connections page
  if (APP_STATE.currentPage === 'connections') {
    filterConnections('all');
  }
}

// Initialize
document.addEventListener('DOMContentLoaded', async () => {
  await loadCurrentUser();
  const startPage = APP_STATE.token ? 'dashboard' : 'home';
  navigate(startPage);
});
