import React, { useEffect, useRef, useState } from 'react';
import { Box, Paper, Typography, Button } from '@mui/material';
import { useTheme } from '@mui/material/styles';

interface PennTinderProps {
  theme: any;
}

const PennTinder: React.FC<PennTinderProps> = ({ theme }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [currentActivity, setCurrentActivity] = useState<any>(null);
  const muiTheme = useTheme();

  useEffect(() => {
    if (containerRef.current) {
      // Add the HTML content to the container
      containerRef.current.innerHTML = `
        <div class="container">
          <header>
              <h1>Explore Penn</h1>
              <p>Discover campus life with a swipe</p>
              <p>Arrows/Drag to swipe left/right, Backspace/u to undo</p>
          </header>

          <div class="tab-nav">
              <button class="tab-btn active" data-tab="swipe">Swipe</button>
              <button class="tab-btn" data-tab="results">My Profile</button>
          </div>

          <div id="swipe-tab">
              <div class="swipe-container" id="swipe-container">
              </div>

              <div class="loading-indicator" style="display: none;" id="loading-indicator">
                  <h2>Loading Activities...</h2>
              </div>

              <div class="no-more-cards" style="display: none;" id="no-more-cards">
                  <h2>You've seen all activities!</h2>
                  <p>Check out your personalized campus profile in the "My Profile" tab, or start over.</p>
                  <button class="restart-btn" id="restart-btn-end">Start Over</button>
              </div>

              <div class="action-buttons">
                  <button class="btn btn-undo" id="undo-btn" aria-label="Undo last swipe" disabled>
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="1 4 1 10 7 10"></polyline><path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"></path></svg>
                  </button>
                  <button class="btn btn-pass" id="pass-btn" aria-label="Pass (Swipe Left)">
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                  </button>
                  <button class="btn btn-like" id="like-btn" aria-label="Like (Swipe Right)">
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path></svg>
                  </button>
              </div>
          </div>

          <div id="results-tab" class="results-section">
              <h2>Your Penn Profile</h2>
              <div class="profile-summary" id="profile-summary">
                  <p>Swipe on activities to generate your Penn profile!</p>
              </div>

              <h3>Top Interest Areas</h3>
              <div class="interests-list" id="interests-list">
                  <p>No interests identified yet.</p>
              </div>

              <h3>Activities You Liked (<span id="liked-count">0</span>)</h3>
              <div class="liked-items-container" id="liked-items-container">
                  <p id="no-liked-items">You haven't liked any activities yet.</p>
              </div>
              <button class="restart-btn" id="restart-btn-results" style="margin-top: 20px; display: block; margin-left: auto; margin-right: auto;">Start Over / Clear Profile</button>
          </div>
        </div>
      `;

      // Add the CSS styles
      const styleElement = document.createElement('style');
      styleElement.textContent = `
        :root {
            --primary: #011F5B; 
            --secondary: #990000; 
            --light: #f8f9fa;
            --dark: #343a40;
            --success: #28a745;
            --danger: #dc3545;
            --warning: #ffc107; 
            --card-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
            --button-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        }

        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
        }

        body {
            background-color: #f0f2f5;
            color: var(--dark);
            overscroll-behavior-y: contain; 
        }

        .container {
            max-width: 500px;
            min-height: 100vh;
            margin: 0 auto;
            padding: 15px;
            display: flex;
            flex-direction: column;
        }

        header {
            text-align: center;
            padding: 15px 0;
            background-color: white;
            box-shadow: var(--card-shadow);
            border-radius: 12px;
            margin-bottom: 15px;
        }

        header h1 {
            color: var(--primary);
            font-size: 1.8rem;
            margin-bottom: 3px;
        }

        header p {
            color: var(--secondary);
            font-size: 0.95rem;
        }

        .tab-nav {
            display: flex;
            justify-content: center;
            gap: 10px;
            margin-bottom: 15px;
        }

        .tab-btn {
            padding: 8px 18px;
            border: 1px solid #ddd;
            background-color: white;
            border-radius: 20px;
            cursor: pointer;
            font-weight: 600;
            color: var(--primary);
            transition: all 0.2s ease;
        }

        .tab-btn.active {
            background-color: var(--primary);
            color: white;
            border-color: var(--primary);
        }

        .tab-btn:hover:not(.active) {
            background-color: #eef;
        }

        #swipe-tab {
            flex-grow: 1;
            display: flex;
            flex-direction: column;
        }

        .swipe-container {
            position: relative;
            flex-grow: 1; 
            min-height: 55vh;
            max-height: 600px;
            display: flex;
            justify-content: center;
            align-items: center;
            perspective: 1000px;
            margin-bottom: 15px;
            overflow: hidden;
        }

        .card {
            position: absolute;
            width: 95%;
            max-width: 380px;
            height: 95%;
            max-height: 550px;
            background-color: white;
            border-radius: 20px;
            box-shadow: var(--card-shadow);
            overflow: hidden;
            transition: transform 0.4s cubic-bezier(0.25, 0.8, 0.25, 1), opacity 0.4s ease-out;
            transform-origin: center bottom;
            cursor: grab;
            touch-action: none;
            display: flex;
            flex-direction: column;
        }

        .card.dragging {
            cursor: grabbing;
            transition: none; 
        }

        .card-img-container {
            width: 100%;
            height: 60%;
            position: relative;
            background-color: #eee; 
        }

        .card-img {
            width: 100%;
            height: 100%;
            object-fit: cover;
            display: block;
        }

        .card-content {
            padding: 15px 20px;
            flex-grow: 1;
            overflow-y: auto;
        }

        .card-title {
            font-size: 1.4rem;
            font-weight: 700;
            margin-bottom: 5px;
            color: var(--primary);
        }

        .card-category {
            font-size: 0.85rem;
            color: var(--secondary);
            font-weight: 500;
            margin-bottom: 10px;
            display: inline-block;
            padding: 4px 12px;
            background-color: rgba(153, 0, 0, 0.08);
            border-radius: 15px;
        }

        .card-desc {
            font-size: 0.9rem;
            line-height: 1.45;
            color: #555;
        }

        .swipe-badge {
            position: absolute;
            top: 40px;
            padding: 10px 25px;
            border-radius: 8px;
            font-weight: bold;
            font-size: 1.8rem;
            text-transform: uppercase;
            transform: rotate(-25deg);
            z-index: 10;
            box-shadow: 0 5px 15px rgba(0,0,0,0.2);
            opacity: 0;
            transition: opacity 0.2s ease-in-out;
            border: 2px solid rgba(255, 255, 255, 0.8);
            color: white;
        }

        .like-badge {
            right: 25px;
            background-color: rgba(40, 167, 69, 0.9);
            transform: rotate(25deg);
        }

        .pass-badge {
            left: 25px;
            background-color: rgba(220, 53, 69, 0.9);
            transform: rotate(-25deg);
        }

        .action-buttons {
            display: flex;
            justify-content: space-evenly;
            align-items: center;
            padding: 10px 0;
        }

        .btn {
            border: none;
            border-radius: 50%;
            width: 65px;
            height: 65px;
            display: flex;
            justify-content: center;
            align-items: center;
            cursor: pointer;
            background-color: white;
            box-shadow: var(--button-shadow);
            transition: all 0.2s cubic-bezier(0.25, 0.8, 0.25, 1);
        }
        .btn:hover {
            transform: scale(1.1);
            box-shadow: 0 6px 18px rgba(0, 0, 0, 0.2);
        }
        .btn:active {
            transform: scale(0.95);
        }
        .btn:disabled {
            opacity: 0.5;
            cursor: not-allowed;
            transform: scale(1);
            box-shadow: var(--button-shadow);
        }

        .btn svg {
            width: 30px;
            height: 30px;
        }

        .btn-pass { color: var(--danger); }
        .btn-like { color: var(--success); }
        .btn-undo { color: var(--warning); }

        .swipe-left-anim {
            transform: translateX(-150%) rotate(-45deg) !important;
            opacity: 0 !important;
        }

        .swipe-right-anim {
            transform: translateX(150%) rotate(45deg) !important;
            opacity: 0 !important;
        }
        .undo-anim {
            transition: transform 0.3s ease-out, opacity 0.3s ease-out;
            transform: translateY(-20px); 
            opacity: 1;
        }

        #results-tab {
            background-color: white;
            border-radius: 12px;
            padding: 20px;
            box-shadow: var(--card-shadow);
            display: none; 
            margin-top: 15px; 
        }

        #results-tab h2 {
            color: var(--primary);
            margin-bottom: 20px;
            text-align: center;
            font-size: 1.6rem;
        }

        .profile-summary {
            background-color: #f0f2f5; 
            border-radius: 10px;
            padding: 18px;
            margin-bottom: 25px;
            border: 1px solid #e0e4e8;
        }

        .profile-summary p {
            line-height: 1.6;
            font-size: 1.05rem;
            color: #333;
        }
        .profile-summary strong {
            color: var(--primary);
            font-weight: 600;
        }

        #results-tab h3 {
            color: var(--primary);
            font-size: 1.2rem;
            margin-bottom: 10px;
            padding-bottom: 5px;
            border-bottom: 1px solid #eee;
        }

        .interests-list {
            display: flex;
            flex-wrap: wrap;
            gap: 8px;
            margin-bottom: 25px;
        }

        .interest-tag {
            background-color: rgba(1, 31, 91, 0.1); 
            color: var(--primary);
            padding: 6px 14px;
            border-radius: 15px;
            font-size: 0.9rem;
            font-weight: 500;
        }

        .liked-items-container {
            max-height: 400px;
            overflow-y: auto;
            padding-right: 5px; 
        }

        .liked-category-group {
            margin-bottom: 20px;
        }
        .liked-category-group h4 {
            font-size: 1rem;
            color: var(--secondary);
            margin-bottom: 8px;
            font-weight: 600;
        }

        .liked-item {
            display: flex;
            align-items: center;
            background-color: #fdfdfd;
            border-radius: 10px;
            padding: 10px;
            margin-bottom: 10px;
            box-shadow: 0 2px 5px rgba(0,0,0,0.05);
            border: 1px solid #eee;
        }

        .liked-item img {
            width: 55px;
            height: 55px;
            border-radius: 8px;
            object-fit: cover;
            margin-right: 15px;
            flex-shrink: 0;
            background-color: #eee;
        }

        .liked-item-info h5 { 
            font-size: 0.95rem;
            margin-bottom: 3px;
            color: var(--primary);
            font-weight: 600;
        }

        .liked-item-info p {
            font-size: 0.8rem;
            color: #777;
        }

        .loading-indicator, .no-more-cards {
            text-align: center;
            padding: 40px 20px;
            margin-top: 20px;
            background-color: white;
            border-radius: 12px;
            box-shadow: var(--card-shadow);
            display: none;
            flex-grow: 1;
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
        }
        .loading-indicator.visible, .no-more-cards.visible {
            display: flex;
        }

        .loading-indicator h2, .no-more-cards h2 {
            color: var(--primary);
            margin-bottom: 15px;
            font-size: 1.3rem;
        }

        .loading-indicator p, .no-more-cards p {
            margin-bottom: 20px;
            color: #555;
            font-size: 1rem;
        }

        .restart-btn {
            background-color: var(--primary);
            color: white;
            border: none;
            padding: 12px 25px;
            border-radius: 25px;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.2s ease;
            font-size: 1rem;
        }

        .restart-btn:hover {
            background-color: #01133a;
            transform: translateY(-2px);
            box-shadow: 0 4px 10px rgba(0, 0, 0, 0.15);
        }
        .hidden {
            display: none !important;
        }
      `;
      document.head.appendChild(styleElement);

      // Add the JavaScript code
      const scriptElement = document.createElement('script');
      const scriptContent = `
        (function() {
          const LOCAL_STORAGE_KEYS = {
              DECK: 'explorePennDeck_v2',
              LIKED: 'explorePennLiked_v2',
              PASSED: 'explorePennPassed_v2',
              LAST_ACTION: 'explorePennLastAction_v2'
          };

          /*
          This is just some sample GPTed placeholder activities.
          Populate with full list of actual activities with title, category, description, image/imageSeed, and tags.
          Cyrrently using imageSeed because fetching image from picsum as a placeholder img for now (Picsum is a bit funny lol)
          */
          const pennActivitiesData = [
              { id: 1, title: "Alpha Phi Alpha", category: "Fraternity", description: "A historic fraternity focused on leadership, academic excellence, and community service.", imageSeed: "apa", tags: ["Greek Life", "Leadership", "Service", "Social", "Brotherhood", "Community"] },
              { id: 2, title: "Penn Debate Society", category: "Academic Club", description: "Sharpen critical thinking and public speaking through competitive debate.", imageSeed: "debate", tags: ["Academic", "Public Speaking", "Competition", "Intellectual", "Skills"] },
              { id: 3, title: "Spring Fling", category: "Annual Event", description: "Penn's biggest annual music festival with popular artists, food, and games.", imageSeed: "fling", tags: ["Music", "Festival", "Entertainment", "Social", "Campus Life", "Tradition"] },
              { id: 4, title: "Wharton Undergrad Finance Club", category: "Professional Club", description: "Connect with professionals, gain skills, and explore finance careers.", imageSeed: "wufc", tags: ["Finance", "Professional", "Networking", "Career", "Wharton", "Business"] },
              { id: 5, title: "Penn Band", category: "Performing Arts", description: "Join the spirited marching band performing at athletic events and ceremonies.", imageSeed: "band", tags: ["Music", "Performance", "Spirit", "Athletics", "Tradition", "Creative"] },
              { id: 6, title: "Penn Hillel", category: "Cultural/Religious", description: "Vibrant Jewish community offering religious services, cultural events, and social gatherings.", imageSeed: "hillel", tags: ["Religious", "Cultural", "Community", "Jewish Life", "Social", "Support"] },
              { id: 7, title: "The Daily Pennsylvanian", category: "Student Media", description: "Penn's independent student newspaper covering campus news, sports, arts, and opinion.", imageSeed: "dp", tags: ["Journalism", "Writing", "Media", "Communication", "News", "Student Life"] },
              { id: 8, title: "Penn Outdoors Club", category: "Recreation", description: "Escape campus with hiking, camping, rock climbing, and other outdoor adventures.", imageSeed: "outdoors", tags: ["Nature", "Adventure", "Physical Activity", "Travel", "Recreation", "Wellness"] },
              { id: 9, title: "Class Board", category: "Student Government", description: "Plan class events, foster unity, and represent your class interests.", imageSeed: "classboard", tags: ["Leadership", "Event Planning", "Governance", "Representation", "Community", "Social"] },
              { id: 10, title: "Penn Queer Student Alliance", category: "Identity/Advocacy", description: "Supportive community for LGBTQ+ students and allies with events and advocacy.", imageSeed: "qsa", tags: ["LGBTQ+", "Advocacy", "Support", "Community", "Social Justice", "Inclusion"] },
              { id: 11, title: "Mask and Wig Club", category: "Performing Arts", description: "America's oldest all-male collegiate musical comedy troupe.", imageSeed: "maskwig", tags: ["Performance", "Comedy", "Creative", "Tradition", "Theater", "Music"] },
              { id: 12, title: "Penn Robotics", category: "Engineering/Tech Club", description: "Design, build, and compete with robots, developing STEM skills.", imageSeed: "robotics", tags: ["Engineering", "Technology", "Competition", "Innovation", "STEM", "Teamwork"] },
              { id: 13, title: "Penn Appetit", category: "Student Media", description: "Student-run food magazine exploring culinary arts on and off campus.", imageSeed: "appetit", tags: ["Food", "Writing", "Media", "Culinary", "Lifestyle", "Creative"] },
              { id: 14, title: "Volunteering (Civic House)", category: "Service/Community", description: "Connects students with diverse volunteer opportunities in Philadelphia.", imageSeed: "civichouse", tags: ["Service", "Volunteering", "Community Engagement", "Philadelphia", "Social Impact"] },
              { id: 15, title: "Penn Dems/Republicans", category: "Political Group", description: "Engage in political discussion, activism, and campaigning.", imageSeed: "politics", tags: ["Politics", "Advocacy", "Discussion", "Current Events", "Governance"] },
              { id: 16, title: "Intramural Sports", category: "Recreation", description: "Participate in various sports leagues for fun and friendly competition.", imageSeed: "intramural", tags: ["Sports", "Recreation", "Physical Activity", "Teamwork", "Social", "Wellness"] },
              { id: 17, title: "Arts House Dance Company", category: "Performing Arts", description: "A non-audition dance group offering classes and performance opportunities in various styles.", imageSeed: "artshouse", tags: ["Dance", "Performance", "Creative", "Arts", "Community", "Wellness"] },
              { id: 18, title: "Penn Fashion Collective", category: "Cultural/Professional", description: "Explore the fashion industry through workshops, speaker events, and an annual runway show.", imageSeed: "fashion", tags: ["Fashion", "Design", "Creative", "Professional", "Networking", "Lifestyle"] }
          ];

          let deckOrder = []; 
          let likedActivityIds = [];
          let passedActivityIds = [];
          let currentCardIndex = 0; 
          let currentCardElement = null;
          let lastAction = null; 
          let isDragging = false;
          let startX, currentX, startY, currentY;
          let activeTab = 'swipe'; 

          const swipeContainer = document.getElementById('swipe-container');
          const likeBtn = document.getElementById('like-btn');
          const passBtn = document.getElementById('pass-btn');
          const undoBtn = document.getElementById('undo-btn');
          const noMoreCardsDiv = document.getElementById('no-more-cards');
          const loadingIndicator = document.getElementById('loading-indicator');
          const profileSummaryDiv = document.getElementById('profile-summary');
          const interestsListDiv = document.getElementById('interests-list');
          const likedItemsContainer = document.getElementById('liked-items-container');
          const likedCountSpan = document.getElementById('liked-count');
          const noLikedItemsP = document.getElementById('no-liked-items');
          const swipeTabDiv = document.getElementById('swipe-tab');
          const resultsTabDiv = document.getElementById('results-tab');
          const tabButtons = document.querySelectorAll('.tab-btn');
          const restartBtnEnd = document.getElementById('restart-btn-end');
          const restartBtnResults = document.getElementById('restart-btn-results');

          const getActivityById = (id) => pennActivitiesData.find(a => a.id === id);

          const shuffleArray = (array) => {
              for (let i = array.length - 1; i > 0; i--) {
                  const j = Math.floor(Math.random() * (i + 1));
                  [array[i], array[j]] = [array[j], array[i]];
              }
              return array;
          };

          const saveState = () => {
              try {
                  localStorage.setItem(LOCAL_STORAGE_KEYS.DECK, JSON.stringify(deckOrder));
                  localStorage.setItem(LOCAL_STORAGE_KEYS.LIKED, JSON.stringify(likedActivityIds));
                  localStorage.setItem(LOCAL_STORAGE_KEYS.PASSED, JSON.stringify(passedActivityIds));
                  localStorage.setItem(LOCAL_STORAGE_KEYS.LAST_ACTION, JSON.stringify(lastAction));
                  updateUndoButtonState();
              } catch (e) {
                  console.error("Failed to save state to localStorage:", e);
              }
          };

          const loadState = () => {
              try {
                  const storedDeck = localStorage.getItem(LOCAL_STORAGE_KEYS.DECK);
                  const storedLiked = localStorage.getItem(LOCAL_STORAGE_KEYS.LIKED);
                  const storedPassed = localStorage.getItem(LOCAL_STORAGE_KEYS.PASSED);
                  const storedLastAction = localStorage.getItem(LOCAL_STORAGE_KEYS.LAST_ACTION);

                  if (storedDeck) deckOrder = JSON.parse(storedDeck);
                  if (storedLiked) likedActivityIds = JSON.parse(storedLiked);
                  if (storedPassed) passedActivityIds = JSON.parse(storedPassed);
                  if (storedLastAction) lastAction = JSON.parse(storedLastAction);

                  if (deckOrder && deckOrder.length === 0 && likedActivityIds.length === 0 && passedActivityIds.length === 0) {
                      return false;
                  }

                  return deckOrder && deckOrder.length > 0;

              } catch (e) {
                  console.error("Failed to load state from localStorage:", e);
                  clearState();
                  return false;
              }
          };

          const clearState = () => {
              Object.values(LOCAL_STORAGE_KEYS).forEach(key => localStorage.removeItem(key));
              deckOrder = [];
              likedActivityIds = [];
              passedActivityIds = [];
              lastAction = null;
              currentCardIndex = 0;
          };

          function initApp() {
              console.log("Initializing App...");
              loadingIndicator.classList.add('visible');
              swipeContainer.innerHTML = '';
              noMoreCardsDiv.classList.remove('visible');
              swipeTabDiv.style.display = 'flex';
              resultsTabDiv.style.display = 'none';
              setActiveTab('swipe');

              if (!loadState()) {
                  console.log("No valid state found or deck empty, starting fresh...");
                  clearState();
                  deckOrder = shuffleArray(pennActivitiesData.map(a => a.id));
                  console.log("Shuffled Deck:", deckOrder);
              } else {
                  console.log("Loaded state from localStorage.");
                  console.log("Deck:", deckOrder);
                  console.log("Liked:", likedActivityIds);
                  console.log("Passed:", passedActivityIds);
              }

              currentCardIndex = 0;
              saveState();
              setTimeout(() => {
                  loadingIndicator.classList.remove('visible');
                  loadNextCard();
                  updateUndoButtonState();
                  updateActionButtonsState();
              }, 300); 
          }

          function createCardElement(activity) {
              const card = document.createElement('div');
              card.className = 'card';
              card.id = \`card-\${activity.id}\`;
              card.dataset.id = activity.id;

              const imageUrl = \`https://picsum.photos/seed/\${activity.imageSeed || activity.id}/400/320\`;

              card.innerHTML = \`
                  <div class="card-img-container">
                      <img src="\${imageUrl}" alt="\${activity.title}" class="card-img" loading="lazy">
                      <div class="swipe-badge like-badge">LIKE</div>
                      <div class="swipe-badge pass-badge">PASS</div>
                  </div>
                  <div class="card-content">
                      <h2 class="card-title">\${activity.title}</h2>
                      <span class="card-category">\${activity.category}</span>
                      <p class="card-desc">\${activity.description}</p>
                  </div>
              \`;

              setupCardEvents(card);
              return card;
          }

          function loadNextCard() {
              if (currentCardElement) {
                  currentCardElement.remove();
                  currentCardElement = null;
              }

              if (currentCardIndex < deckOrder.length) {
                  const nextActivityId = deckOrder[currentCardIndex];
                  const activity = getActivityById(nextActivityId);
                  if (activity) {
                      currentCardElement = createCardElement(activity);
                      swipeContainer.appendChild(currentCardElement);
                      setTimeout(() => {
                          if (currentCardElement) currentCardElement.style.opacity = 1;
                      }, 50);
                  } else {
                      console.error(\`Activity with ID \${nextActivityId} not found! Skipping.\`);
                      currentCardIndex++;
                      loadNextCard(); 
                  }
                  noMoreCardsDiv.classList.remove('visible');
              } else {
                  console.log("No more cards to show.");
                  noMoreCardsDiv.classList.add('visible');
                  currentCardElement = null;
                  generateProfile();
              }
              updateActionButtonsState();
          }

          function setupCardEvents(card) {
              card.addEventListener('pointerdown', handleDragStart, { passive: false });
          }

          function handleDragStart(e) {
              if (!currentCardElement || e.button !== 0) return;
              e.preventDefault();

              currentCardElement.setPointerCapture(e.pointerId);
              isDragging = true;
              startX = e.clientX;
              startY = e.clientY;
              currentX = startX;
              currentCardElement.classList.add('dragging');
              currentCardElement.style.transition = 'none';
          }

          function handleDragMove(e) {
              if (!isDragging || !currentCardElement) return;
              e.preventDefault();

              currentX = e.clientX;
              const deltaX = currentX - startX;
              const cardWidth = currentCardElement.offsetWidth;
              const swipeThreshold = cardWidth * 0.3;

              const rotate = deltaX * 0.05;
              const deltaY = e.clientY - startY;
              const translateY = Math.max(-20, Math.min(20, deltaY * 0.2));

              currentCardElement.style.transform = \`translateX(\${deltaX}px) translateY(\${translateY}px) rotate(\${rotate}deg)\`;

              const likeBadge = currentCardElement.querySelector('.like-badge');
              const passBadge = currentCardElement.querySelector('.pass-badge');
              const opacity = Math.min(Math.abs(deltaX) / swipeThreshold, 1);

              if (deltaX > 10) {
                  likeBadge.style.opacity = opacity;
                  passBadge.style.opacity = 0;
              } else if (deltaX < -10) {
                  passBadge.style.opacity = opacity;
                  likeBadge.style.opacity = 0;
              } else {
                  likeBadge.style.opacity = 0;
                  passBadge.style.opacity = 0;
              }
          }

          function handleDragEnd(e) {
              if (!isDragging || !currentCardElement) return;
              e.preventDefault();

              currentCardElement.releasePointerCapture(e.pointerId);
              isDragging = false;
              currentCardElement.classList.remove('dragging');
              currentCardElement.style.transition = '';

              const deltaX = currentX - startX;
              const decisionThreshold = 80;

              if (deltaX > decisionThreshold) {
                  swipeRight();
              } else if (deltaX < -decisionThreshold) {
                  swipeLeft();
              } else {
                  currentCardElement.style.transform = 'translateX(0) translateY(0) rotate(0)';
                  currentCardElement.querySelector('.like-badge').style.opacity = 0;
                  currentCardElement.querySelector('.pass-badge').style.opacity = 0;
              }
          }

          function swipeRight() {
              if (!currentCardElement) return;
              const activityId = parseInt(currentCardElement.dataset.id);
              console.log(\`Liked: \${getActivityById(activityId)?.title}\`);

              likedActivityIds.push(activityId);
              lastAction = { type: 'like', activityId: activityId };
              deckOrder.splice(currentCardIndex, 1);

              currentCardElement.classList.add('swipe-right-anim');
              finalizeSwipe();
          }

          function swipeLeft() {
              if (!currentCardElement) return;
              const activityId = parseInt(currentCardElement.dataset.id);
              console.log(\`Passed: \${getActivityById(activityId)?.title}\`);

              passedActivityIds.push(activityId);
              lastAction = { type: 'pass', activityId: activityId };
              deckOrder.splice(currentCardIndex, 1);

              currentCardElement.classList.add('swipe-left-anim');
              finalizeSwipe();
          }

          function finalizeSwipe() {
              saveState();
              const cardToRemove = currentCardElement;
              currentCardElement = null;

              setTimeout(() => {
                  if (cardToRemove) cardToRemove.remove();
                  loadNextCard();
              }, 400);
          }

          function undoLastSwipe() {
              if (!lastAction) {
                  console.log("Nothing to undo.");
                  return;
              }

              console.log(\`Undoing last action: \${lastAction.type} on ID \${lastAction.activityId}\`);
              const activityIdToUndo = lastAction.activityId;

              if (lastAction.type === 'like') {
                  likedActivityIds = likedActivityIds.filter(id => id !== activityIdToUndo);
              } else {
                  passedActivityIds = passedActivityIds.filter(id => id !== activityIdToUndo);
              }

              deckOrder.unshift(activityIdToUndo);
              currentCardIndex = 0;

              lastAction = null;
              saveState();

              noMoreCardsDiv.classList.remove('visible');
              loadNextCard();
              updateUndoButtonState();
              updateActionButtonsState();

              if(currentCardElement) {
                  currentCardElement.style.opacity = 0;
                  currentCardElement.style.transform = 'translateY(-30px)';
                  setTimeout(() => {
                      if(currentCardElement) {
                          currentCardElement.classList.add('undo-anim');
                          currentCardElement.style.transform = '';
                          currentCardElement.style.opacity = 1;
                      }
                  }, 50);
              }
          }

          function generateProfile() {
              console.log("Generating profile...");
              if (likedActivityIds.length === 0) {
                  profileSummaryDiv.innerHTML = "<p>You haven't liked any activities yet. Start swiping in the 'Swipe' tab to build your profile!</p>";
                  interestsListDiv.innerHTML = '<p>No interests identified yet.</p>';
                  likedItemsContainer.innerHTML = '<p id="no-liked-items">You haven\\'t liked any activities yet.</p>';
                  likedCountSpan.textContent = '0';
                  return;
              }

              const likedActivities = likedActivityIds.map(getActivityById).filter(Boolean);

              const tagCounts = {};
              const categoryCounts = {};
              likedActivities.forEach(activity => {
                  categoryCounts[activity.category] = (categoryCounts[activity.category] || 0) + 1;
                  activity.tags.forEach(tag => {
                      tagCounts[tag] = (tagCounts[tag] || 0) + 1;
                  });
              });

              const sortedTags = Object.entries(tagCounts).sort(([, a], [, b]) => b - a);
              const sortedCategories = Object.entries(categoryCounts).sort(([, a], [, b]) => b - a);

              const topTags = sortedTags.slice(0, 7).map(entry => entry[0]);
              const topCategories = sortedCategories.map(entry => entry[0]);

              let profileText = "Based on your swipes, <strong>you're the type of Penn student who...</strong><br><br>";
              let characteristics = [];

              if (topCategories.includes("Professional Club") || topCategories.includes("Engineering/Tech Club") || topCategories.includes("Academic Club")) {
                  characteristics.push("is likely <strong>career-oriented</strong> and enjoys <strong>intellectual challenges</strong>");
              }
              if (topCategories.includes("Fraternity") || topCategories.includes("Annual Event") || topCategories.includes("Social")) {
                  characteristics.push("values <strong>social connections</strong> and vibrant <strong>campus life</strong>");
              }
              if (topCategories.includes("Performing Arts") || topCategories.includes("Student Media") || topCategories.includes("Cultural/Professional")) {
                  characteristics.push("has a <strong>creative streak</strong> and appreciates <strong>expression</strong>");
              }
              if (topCategories.includes("Service/Community") || topCategories.includes("Identity/Advocacy") || topCategories.includes("Cultural/Religious")) {
                  characteristics.push("is drawn to <strong>community building</strong> and making an <strong>impact</strong>");
              }
              if (topCategories.includes("Recreation") || topCategories.includes("Sports")) {
                  characteristics.push("enjoys staying <strong>active</strong> and perhaps a bit of <strong>adventure</strong>");
              }

              if (topTags.includes("Leadership")) characteristics.push("is interested in <strong>leadership roles</strong>");
              if (topTags.includes("Innovation") || topTags.includes("Technology")) characteristics.push("is fascinated by <strong>technology and innovation</strong>");
              if (topTags.includes("Competition") && characteristics.length < 4) characteristics.push("thrives in <strong>competitive environments</strong>");
              if (topTags.includes("Service") && characteristics.length < 4) characteristics.push("is motivated by <strong>helping others</strong>");

              if (characteristics.length === 0) {
                  profileText += " is still exploring! Keep swiping to refine your profile.";
              } else if (characteristics.length === 1) {
                  profileText += characteristics[0] + ".";
              } else {
                  profileText += characteristics.slice(0, -1).join(", ") + ", and " + characteristics.slice(-1) + ".";
              }

              profileText += \`<br><br>Your interests seem to gravitate towards areas like <strong>\${topTags.slice(0, 3).join(", ")}</strong>.\`;

              profileSummaryDiv.innerHTML = \`<p>\${profileText}</p>\`;

              if (topTags.length > 0) {
                  interestsListDiv.innerHTML = '';
                  topTags.forEach(tag => {
                      const tagEl = document.createElement('span');
                      tagEl.className = 'interest-tag';
                      tagEl.textContent = tag;
                      interestsListDiv.appendChild(tagEl);
                  });
              } else {
                  interestsListDiv.innerHTML = '<p>No specific interest tags identified yet.</p>';
              }

              likedCountSpan.textContent = likedActivities.length;
              if (likedActivities.length > 0) {
                  likedItemsContainer.innerHTML = '';
                  const groupedByCategory = likedActivities.reduce((acc, activity) => {
                      (acc[activity.category] = acc[activity.category] || []).push(activity);
                      return acc;
                  }, {});

                  const sortedGroupedCategories = Object.entries(groupedByCategory)
                      .sort(([, activitiesA], [, activitiesB]) => activitiesB.length - activitiesA.length);

                  sortedGroupedCategories.forEach(([category, activities]) => {
                      const groupDiv = document.createElement('div');
                      groupDiv.className = 'liked-category-group';
                      groupDiv.innerHTML = \`<h4>\${category} (\${activities.length})</h4>\`;

                      activities.forEach(activity => {
                          const itemEl = document.createElement('div');
                          itemEl.className = 'liked-item';
                          const imageUrl = \`https://picsum.photos/seed/\${activity.imageSeed || activity.id}/100/100\`;
                          itemEl.innerHTML = \`
                              <img src="\${imageUrl}" alt="\${activity.title}" loading="lazy">
                              <div class="liked-item-info">
                                  <h5>\${activity.title}</h5>
                                  <p>\${activity.tags.slice(0, 4).join(', ')}</p>
                              </div>
                          \`;
                          groupDiv.appendChild(itemEl);
                      });
                      likedItemsContainer.appendChild(groupDiv);
                  });

              } else {
                  likedItemsContainer.innerHTML = '<p id="no-liked-items">You haven\\'t liked any activities yet.</p>';
              }
          }

          function updateUndoButtonState() {
              undoBtn.disabled = !lastAction;
          }
          function updateActionButtonsState() {
              const hasCard = !!currentCardElement;
              likeBtn.disabled = !hasCard;
              passBtn.disabled = !hasCard;
          }

          function setActiveTab(tabName) {
              activeTab = tabName;
              tabButtons.forEach(button => {
                  button.classList.toggle('active', button.dataset.tab === tabName);
              });

              if (tabName === 'swipe') {
                  swipeTabDiv.style.display = 'flex';
                  resultsTabDiv.style.display = 'none';
                  updateActionButtonsState();
              } else if (tabName === 'results') {
                  swipeTabDiv.style.display = 'none';
                  resultsTabDiv.style.display = 'block';
                  generateProfile();
              }
          }

          function handleRestart() {
              if (confirm("Are you sure you want to start over? This will clear your current progress and liked items.")) {
                  console.log("Restarting...");
                  clearState();
                  initApp();
              }
          }

          function handleKeyboardSwipe(event) {
              if (activeTab === 'swipe' && currentCardElement && !isDragging) {
                  if (event.key === 'ArrowRight') {
                      console.log("Key Swipe Right");
                      swipeRight();
                  } else if (event.key === 'ArrowLeft') {
                      console.log("Key Swipe Left");
                      swipeLeft();
                  } else if (event.key === 'Backspace' || event.key === 'u') { 
                      if (!undoBtn.disabled) {
                          console.log("Key Undo");
                          undoLastSwipe();
                      }
                  }
              }
          }

          likeBtn.addEventListener('click', () => { if (currentCardElement) swipeRight(); });
          passBtn.addEventListener('click', () => { if (currentCardElement) swipeLeft(); });
          undoBtn.addEventListener('click', undoLastSwipe);
          restartBtnEnd.addEventListener('click', handleRestart);
          restartBtnResults.addEventListener('click', handleRestart);

          tabButtons.forEach(button => {
              button.addEventListener('click', () => setActiveTab(button.dataset.tab));
          });

          document.addEventListener('pointermove', handleDragMove, { passive: false });
          document.addEventListener('pointerup', handleDragEnd, { passive: false });
          document.addEventListener('keydown', handleKeyboardSwipe);

          // Initialize the app
          initApp();
        })();
      `;
      scriptElement.textContent = scriptContent;
      document.body.appendChild(scriptElement);

      // Clean up function
      return () => {
        if (styleElement) {
          document.head.removeChild(styleElement);
        }
        if (scriptElement) {
          document.body.removeChild(scriptElement);
        }
      };
    }
  }, []);

  return (
    <Box 
      ref={containerRef}
      sx={{ 
        height: '100%', 
        width: '100%', 
        overflow: 'auto',
        backgroundColor: '#f0f2f5'
      }}
    />
  );
};

export default PennTinder; 