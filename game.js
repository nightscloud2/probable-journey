// =========================================================================
// [SECTION 0: ERROR HANDLING, LOGGING & DOM BINDINGS]
// =========================================================================
const GAME_VERSION = "v0.0.3";

function showMobileError(msg) {
    const logEl = document.getElementById('mobile-log');
    if (logEl) {
        logEl.style.display = 'block';
        logEl.innerText += '[ERR] ' + msg + '\n';
    }
}

// Global error listener to catch unhandled exceptions
window.onerror = function(msg, url, lineNo) {
    showMobileError(msg + " (line " + lineNo + ")");
    return false;
};

// Centralized UI Event Binding
document.addEventListener("DOMContentLoaded", () => {
    // 1. Inject Version
    document.querySelectorAll('.game-version').forEach(el => {
        el.innerText = GAME_VERSION;
    });

    // 2. Screen Transitions
    document.getElementById('btn-show-creation')?.addEventListener('click', () => window.showCharacterCreation());
    document.getElementById('btn-start-game')?.addEventListener('click', () => window.startGame());

    // 3. Gender Selectors
    document.getElementById('btn-g-m')?.addEventListener('click', () => window.selectGender('MALE'));
    document.getElementById('btn-g-f')?.addEventListener('click', () => window.selectGender('FEMALE'));

    // 4. Class Selectors
    document.getElementById('btn-c-brawler')?.addEventListener('click', () => window.selectClass('BRAWLER'));
    document.getElementById('btn-c-hunter')?.addEventListener('click', () => window.selectClass('HUNTER'));
    document.getElementById('btn-c-mage')?.addEventListener('click', () => window.selectClass('MAGE'));

    // 5. Tab Switchers (Inventory/Craft/Skills)
    document.getElementById('tab-btn-inv')?.addEventListener('click', () => window.switchTab('inv'));
    document.getElementById('tab-btn-craft')?.addEventListener('click', () => window.switchTab('craft'));
    document.getElementById('tab-btn-skills')?.addEventListener('click', () => window.switchTab('skills'));

    // 6. Menu Modal
    document.getElementById('btn-menu-open')?.addEventListener('click', () => {
        document.getElementById('menu-modal')?.classList.remove('hidden');
    });
    document.getElementById('btn-menu-close')?.addEventListener('click', () => {
        document.getElementById('menu-modal')?.classList.add('hidden');
    });
});

// =========================================================================
// [SECTION 1: UI STATE & SELECTION HANDLERS]
// =========================================================================
let playerGender = 'MALE';
let playerClass = 'BRAWLER';

window.selectGender = function(g) {
    playerGender = g;
    document.getElementById('btn-g-m')?.classList.toggle('active', g === 'MALE');
    document.getElementById('btn-g-f')?.classList.toggle('active', g === 'FEMALE');
};

// Updates the active class state, UI styling, and class description text
window.selectClass = function(c) {
    playerClass = c;
    document.getElementById('btn-c-brawler')?.classList.toggle('active', c === 'BRAWLER');
    document.getElementById('btn-c-hunter')?.classList.toggle('active', c === 'HUNTER');
    document.getElementById('btn-c-mage')?.classList.toggle('active', c === 'MAGE');

    const desc = document.getElementById('class-desc');
    if (desc) {
        if (c === 'BRAWLER') desc.innerText = "Brawlers focus on raw power and close-range striking force.";
        else if (c === 'HUNTER') desc.innerText = "Hunters use bows at range and lay bear traps to immobilize foes.";
        else if (c === 'MAGE') desc.innerText = "Mages channel offensive elemental magic through staves and wands.";
    }
};

window.showCharacterCreation = function() {
    try {
        const title = document.getElementById('title-screen');
        const creation = document.getElementById('creation-screen');
        if (title) title.style.display = 'none';
        if (creation) creation.style.display = 'flex';
    } catch(err) {
        showMobileError("showCharacterCreation: " + err.message);
    }
};

window.startGame = function() {
    try {
        const title = document.getElementById('title-screen');
        const creation = document.getElementById('creation-screen');
        if (title) title.style.display = 'none';
        if (creation) creation.style.display = 'none';
        initGameEngine();
    } catch(err) {
        showMobileError("startGame: " + err.message);
    }
};

// =========================================================================
// [SECTION 2: ENGINE INIT & INVENTORY MANAGEMENT]
// =========================================================================
function initGameEngine() {
    const container = document.getElementById('canvas-container');
    
    // Initial player stats
    let currentEnergy = 100;
    let currentHP = 100;
    const inventory = { wood: 0, stone: 0, meat: 0, hatchet: 0, knife: 0 };
    
    // Set UI text based on character creation choices
    document.getElementById('ui-char-class').innerText = playerClass;
    document.getElementById('ui-char-gender').innerText = playerGender + ' Adventurer';
    
    // Assign the appropriate attack icon based on class
    let attackIcon = '👊';
    if (playerClass === 'HUNTER') attackIcon = '🏹';
    if (playerClass === 'MAGE') attackIcon = '🪄';
    document.getElementById('equip-weapon-icon').innerText = attackIcon;

    // Refreshes the HUD and inventory grid to reflect current state
    function updateUI() {
        document.getElementById('bar-energy').style.width = currentEnergy + '%';
        document.getElementById('bar-hp').style.width = currentHP + '%';
        document.getElementById('count-wood').innerText = inventory.wood;
        document.getElementById('count-stone').innerText = inventory.stone;
        document.getElementById('count-meat').innerText = inventory.meat;
        document.getElementById('count-hatchet').innerText = inventory.hatchet;
        document.getElementById('count-knife').innerText = inventory.knife;
        
        const invGrid = document.getElementById('inventory-grid');
        if (invGrid) {
            invGrid.innerHTML = '';
            const items = [
                { icon: '🪓', count: inventory.hatchet },
                { icon: '🔪', count: inventory.knife },
                { icon: '🪵', count: inventory.wood },
                { icon: '🪨', count: inventory.stone },
                { icon: '🥩', count: inventory.meat }
            ];
            // Only render items that the player currently possesses
            items.forEach(item => {
                if (item.count > 0) {
                    const slot = document.createElement('div');
                    slot.className = 'inv-item-slot';
                    slot.innerHTML = `<span>${item.icon}</span><span class="qty">${item.count}</span>`;
                    invGrid.appendChild(slot);
                }
            });
        }
    }

    // Handles switching between in-game menu tabs
    window.switchTab = function(tabName) {
        document.getElementById('tab-inv').style.display = (tabName === 'inv') ? 'block' : 'none';
        document.getElementById('tab-craft').style.display = (tabName === 'craft') ? 'block' : 'none';
        document.getElementById('tab-skills').style.display = (tabName === 'skills') ? 'block' : 'none';
        document.getElementById('tab-btn-inv')?.classList.toggle('active', tabName === 'inv');
        document.getElementById('tab-btn-craft')?.classList.toggle('active', tabName === 'craft');
        document.getElementById('tab-btn-skills')?.classList.toggle('active', tabName === 'skills');
    };

    // =========================================================================
    // [SECTION 3: THREE.JS SCENE, LIGHTING & TERRAIN]
    // =========================================================================
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x87ceeb); // Sky blue
    scene.fog = new THREE.FogExp2(0x87ceeb, 0.012); // Atmospheric depth
    
    const camera = new THREE.PerspectiveCamera(55, window.innerWidth / window.innerHeight, 0.1, 1000);
    
    // Renderer setup with platform optimization (pixel ratio capping)
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.domElement.style.touchAction = 'none';
    container.appendChild(renderer.domElement);
    
    // Lighting
    scene.add(new THREE.AmbientLight(0xffffff, 0.75));
    const sunLight = new THREE.DirectionalLight(0xfffaed, 0.9);
    sunLight.position.set(30, 60, 20);
    scene.add(sunLight);

    // Terrain Function & Generation
    const WORLD_SIZE = 140;
    
    // Calculates procedural elevation based on coordinates
    function getTerrainHeight(x, z) {
        if (z > 35) return -0.5; // Water drop-off
        let height = 0;
        if (z > 20) {
            height = (35 - z) * 0.1; // Beach slope
        } else if (z < -30) {
            height = Math.abs(z + 30) * 0.6 + Math.sin(x * 0.2) * 4.0; // Mountainous region
        } else {
            height = Math.sin(x * 0.08) * Math.cos(z * 0.08) * 2.5 + 1.0; // Rolling hills
        }
        return height;
    }

    const groundGeo = new THREE.PlaneGeometry(WORLD_SIZE, WORLD_SIZE, 50, 50);
    groundGeo.rotateX(-Math.PI / 2);

    const pos = groundGeo.attributes.position;
    const colors = [];
    for (let i = 0; i < pos.count; i++) {
        const x = pos.getX(i);
        const z = pos.getZ(i);
        const y = getTerrainHeight(x, z);
        pos.setY(i, y);
        
        if (z > 20) {
            colors.push(0.9, 0.85, 0.55); // Sand
        } else if (z < -30) {
            colors.push(0.5, 0.5, 0.55); // Stone/Mountain
        } else {
            colors.push(0.28, 0.52, 0.28); // Grass
        }
    }
    
    groundGeo.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
    groundGeo.computeVertexNormals();
    const groundMesh = new THREE.Mesh(
        groundGeo, 
        new THREE.MeshStandardMaterial({ vertexColors: true, flatShading: true })
    );
    scene.add(groundMesh);

    // Ocean Water Plane
    const waterMesh = new THREE.Mesh(
        new THREE.PlaneGeometry(WORLD_SIZE, 40),
        new THREE.MeshStandardMaterial({ color: 0x1e90ff, transparent: true, opacity: 0.7 })
    );
    waterMesh.rotateX(-Math.PI / 2);
    waterMesh.position.set(0, -0.2, 45); // Positioned slightly below standard ground level
    scene.add(waterMesh);

    // =========================================================================
    // [SECTION 4: PLAYER ENTITY & TARGETING]
    // =========================================================================
    const playerGroup = new THREE.Group();
    const PLAYER_RADIUS = 0.5;
    
    // Differentiate player color by selected gender
    const bodyColor = (playerGender === 'MALE') ? 0x2266cc : 0xcc22aa;
    const bodyMesh = new THREE.Mesh(
        new THREE.BoxGeometry(0.7, 1.2, 0.5),
        new THREE.MeshStandardMaterial({ color: bodyColor, flatShading: true })
    );
    bodyMesh.position.y = 0.9;
    playerGroup.add(bodyMesh);
    
    const headMesh = new THREE.Mesh(
        new THREE.BoxGeometry(0.5, 0.5, 0.5),
        new THREE.MeshStandardMaterial({ color: 0xffcc99, flatShading: true })
    );
    headMesh.position.y = 1.75;
    playerGroup.add(headMesh);
    
    // Start player on the beach
    playerGroup.position.set(0, getTerrainHeight(0, 28), 28);
    scene.add(playerGroup);
    
    let playerVY = 0; // Vertical velocity for jumping/gravity
    let isGrounded = true;
    
    // Ring overlay to indicate the current interactive target
    const targetRing = new THREE.Mesh(
        new THREE.RingGeometry(0.8, 1.0, 16),
        new THREE.MeshBasicMaterial({ color: 0x00ffcc, side: THREE.DoubleSide })
    );
    targetRing.rotation.x = -Math.PI / 2;
    targetRing.visible = false;
    scene.add(targetRing);

    // =========================================================================
    // [SECTION 5: ENVIRONMENT & HARVESTABLES]
    // =========================================================================
    // Spawn aesthetic boat near spawn point
    const boatGroup = new THREE.Group();
    const hull = new THREE.Mesh(
        new THREE.BoxGeometry(3.5, 1.2, 7.0),
        new THREE.MeshStandardMaterial({ color: 0x4a2e18, flatShading: true })
    );
    hull.rotation.z = 0.3;
    hull.rotation.y = 0.4;
    boatGroup.add(hull);
    boatGroup.position.set(6, getTerrainHeight(6, 30) + 0.4, 30);
    scene.add(boatGroup);
    
    // Starter chest
    let chestLooted = false;
    const chestMesh = new THREE.Mesh(
        new THREE.BoxGeometry(1.0, 0.8, 0.8),
        new THREE.MeshStandardMaterial({ color: 0xffaa00, flatShading: true })
    );
    chestMesh.position.set(3.5, getTerrainHeight(3.5, 28) + 0.4, 28);
    scene.add(chestMesh);

    let harvestables = [];
    let obstacleColliders = [];
    const chestData = { isChest: true, mesh: chestMesh, x: 3.5, z: 28, radius: 0.8 };
    harvestables.push(chestData);
    obstacleColliders.push(chestData);
    
    // Generates trees and rocks randomly across the map
    function spawnProp(type, x, z) {
        const g = new THREE.Group();
        let dropType = 'wood';
        let propRadius = 0.8;
        
        if (type === 'tree') {
            const trunk = new THREE.Mesh(
                new THREE.CylinderGeometry(0.4, 0.6, 3.5), 
                new THREE.MeshStandardMaterial({ color: 0x5a3d28, flatShading: true })
            );
            trunk.position.y = 1.75;
            const foliage = new THREE.Mesh(
                new THREE.ConeGeometry(2.2, 5.0, 6), 
                new THREE.MeshStandardMaterial({ color: 0x2e8b57, flatShading: true })
            );
            foliage.position.y = 5.0;
            g.add(trunk, foliage);
            dropType = 'wood';
            propRadius = 1.0;
        } else if (type === 'stone') {
            const rock = new THREE.Mesh(
                new THREE.DodecahedronGeometry(1.2, 1), 
                new THREE.MeshStandardMaterial({ color: 0x778899, flatShading: true })
            );
            rock.position.y = 0.8;
            g.add(rock);
            dropType = 'stone';
            propRadius = 1.1;
        }
        
        // Snap prop to terrain height
        const groundY = getTerrainHeight(x, z);
        g.position.set(x, groundY, z);
        scene.add(g);
        
        const itemData = { isCreature: false, mesh: g, dropType, hp: 3, x, z, radius: propRadius };
        harvestables.push(itemData);
        obstacleColliders.push(itemData);
    }
    
    // Procedurally populate the map with 40 props
    for (let i = 0; i < 40; i++) {
        const rx = (Math.random() - 0.5) * 80;
        const rz = (Math.random() * -40) + 10;
        const r = Math.random();
        if (r < 0.6) spawnProp('tree', rx, rz);
        else spawnProp('stone', rx, rz);
    }
    
    // Cleanup function when an object is destroyed/looted
    function removeHarvestable(item) {
        scene.remove(item.mesh);
        harvestables = harvestables.filter(h => h !== item);
        obstacleColliders = obstacleColliders.filter(o => o !== item);
        
        if (item.isCreature) {
            const creatureIndex = creatures.indexOf(item);
            if (creatureIndex > -1) creatures.splice(creatureIndex, 1);
        }
    }

    function removeHarvestable(item) {
        scene.remove(item.mesh);
        harvestables = harvestables.filter(h => h !== item);
        obstacleColliders = obstacleColliders.filter(o => o !== item);
        
        if (item.isCreature) {
            const creatureIndex = creatures.indexOf(item);
            if (creatureIndex > -1) creatures.splice(creatureIndex, 1);
        }
    }

    // =========================================================================
    // [SECTION 6: AUTONOMOUS CREATURE SYSTEM]
    // =========================================================================
    const creatures = [];
    const projectiles = [];
    const traps = [];
    
    // Handles creature stats, rendering, and AI behavior
    class AutonomousCreature {
        constructor(template) {
            this.isCreature = true;
            this.name = template.name;
            this.temperament = template.temperament;
            this.type = template.type;
            this.element = template.element;
            
            this.hp = template.hp;
            this.maxHp = template.hp;
            this.state = 'IDLE';
            this.radius = template.radius || 0.9;
            this.speed = template.speed || 2.5;
            this.x = template.x;
            this.z = template.z;
            this.targetX = this.x;
            this.targetZ = this.z;
            
            this.changeTargetTimer = 0;
            this.rootedTimer = 0; // For Hunter traps
            
            this.group = new THREE.Group();
            const cBody = new THREE.Mesh(
                new THREE.BoxGeometry(1.0, 0.9, 1.4),
                new THREE.MeshStandardMaterial({ color: template.color || 0xcc4444, flatShading: true })
            );
            cBody.position.y = 0.5;
            this.group.add(cBody);
            
            const gY = getTerrainHeight(this.x, this.z);
            this.group.position.set(this.x, gY, this.z);
            scene.add(this.group);
            this.mesh = this.group;
        }
        
        // Evaluates state transitions when taking damage
        takeDamage(amt) {
            this.hp -= amt;
            if (this.hp <= 0) {
                removeHarvestable(this);
            } else if (this.hp <= (this.maxHp * 0.1)) {
                this.state = 'SUBMITTED';
            } else if (this.temperament !== 'DOCILE') {
                this.state = 'HOSTILE';
            } else {
                this.state = 'FLEEING';
            }
        }
        
        // Generates text for the target UI
        getConditionText() {
            if (this.state === 'SUBMITTED') return 'Condition: Submissive';
            const ratio = this.hp / this.maxHp;
            if (ratio > 0.7) return 'Condition: Healthy';
            if (ratio > 0.3) return 'Condition: Injured';
            return 'Condition: Critical';
        }
        
        // Runs every frame to update position and AI state
        update(delta, playerPos) {
            if (this.hp <= 0) return;
            
            if (this.rootedTimer > 0) {
                this.rootedTimer -= delta; // Process trap duration
                return;
            }
            
            this.x = this.group.position.x;
            this.z = this.group.position.z;
            
            // Determine target location based on current AI state
            if (this.state === 'HOSTILE') {
                this.targetX = playerPos.x;
                this.targetZ = playerPos.z;
            } else if (this.state === 'FLEEING') {
                this.targetX = this.x + (this.x - playerPos.x); // Move directly away
                this.targetZ = this.z + (this.z - playerPos.z);
            } else if (this.state === 'IDLE') {
                this.changeTargetTimer -= delta;
                if (this.changeTargetTimer <= 0) {
                    // Wander randomly
                    this.targetX = this.x + (Math.random() - 0.5) * 20;
                    this.targetZ = this.z + (Math.random() - 0.5) * 20;
                    this.changeTargetTimer = 4 + Math.random() * 5;
                }
            }
            
            const dx = this.targetX - this.x;
            const dz = this.targetZ - this.z;
            const distToTarget = Math.hypot(dx, dz);

            const minPlayerDist = 0.5 + this.radius;

            if (distToTarget > minPlayerDist && this.state !== 'SUBMITTED') {
                const angle = Math.atan2(dx, dz);
                const moveX = this.x + Math.sin(angle) * this.speed * delta;
                const moveZ = this.z + Math.cos(angle) * this.speed * delta;
                
                // Basic collision avoidance against obstacles
                let blocked = false;
                for (let obs of obstacleColliders) {
                    if (obs !== this && Math.hypot(moveX - obs.x, moveZ - obs.z) < (this.radius + obs.radius)) {
                        blocked = true;
                        this.changeTargetTimer = 0; // Force repath next frame
                        break;
                    }
                }
                
                if (!blocked) {
                    this.group.position.x = moveX;
                    this.group.position.z = moveZ;
                    this.group.rotation.y = angle;
                }
            }
            // Snap creature to ground height
            this.group.position.y = getTerrainHeight(this.group.position.x, this.group.position.z);
        }
    }
    
    // Spawn specific creature instances
    const boar = new AutonomousCreature({ name: 'Forest Boar', temperament: 'WARY', type: 'STRIKING', element: 'EARTH', hp: 25, x: -10, z: -5 });
    const stag = new AutonomousCreature({ name: 'Meadow Stag', temperament: 'DOCILE', type: 'SPECIAL', element: 'WIND', hp: 15, x: 12, z: 0 });
    
    creatures.push(boar, stag);
    harvestables.push(boar, stag);
    obstacleColliders.push(boar, stag);

    // =========================================================================
    // [SECTION 7: COMBAT, SKILLS & INTERACTION]
    // =========================================================================
    const attackBtn = document.getElementById('btn-attack');
    const skillBtn = document.getElementById('btn-skill');
    
    // Evaluates primary attacks based on character class
    function performPrimaryAttack() {
        if (playerClass === 'BRAWLER') {
            // Melee logic: check distance to harvestables/creatures
            for (let h of harvestables) {
                if (Math.hypot(playerGroup.position.x - h.x, playerGroup.position.z - h.z) < 2.2) {
                    if (h.isCreature) {
                        h.takeDamage(8);
                    } else if (!h.isChest) {
                        h.hp--;
                        if (h.hp <= 0) {
                            inventory[h.dropType] += 3;
                            updateUI();
                            removeHarvestable(h);
                        }
                    }
                    break;
                }
            }
        } else if (playerClass === 'HUNTER' || playerClass === 'MAGE') {
            // Ranged logic: spawn and direct a projectile
            const pGeo = (playerClass === 'MAGE') ? new THREE.SphereGeometry(0.3) : new THREE.CylinderGeometry(0.05, 0.05, 0.8);
            const pMat = new THREE.MeshBasicMaterial({ color: (playerClass === 'MAGE') ? 0x00ffff : 0xffaa00 });
            const proj = new THREE.Mesh(pGeo, pMat);
            proj.position.copy(playerGroup.position);
            proj.position.y += 1.2;
            proj.rotation.y = playerGroup.rotation.y;
            scene.add(proj);
            
            projectiles.push({
                mesh: proj,
                dirX: Math.sin(playerGroup.rotation.y),
                dirZ: Math.cos(playerGroup.rotation.y),
                speed: 18.0,
                life: 1.5,
                damage: 6
            });
        }
    }
    
    // Processes specialized class skills (Trap vs AOE Blast)
    function performClassSkill() {
        if (playerClass === 'HUNTER') {
            const trapMesh = new THREE.Mesh(
                new THREE.CylinderGeometry(0.6, 0.6, 0.1),
                new THREE.MeshStandardMaterial({ color: 0x333333 })
            );
            trapMesh.position.set(playerGroup.position.x, getTerrainHeight(playerGroup.position.x, playerGroup.position.z) + 0.05, playerGroup.position.z);
            scene.add(trapMesh);
            traps.push({ mesh: trapMesh, x: playerGroup.position.x, z: playerGroup.position.z });
            
        } else if (playerClass === 'MAGE') {
            const blast = new THREE.Mesh(
                new THREE.RingGeometry(0.5, 3.5, 16),
                new THREE.MeshBasicMaterial({ color: 0xff00ff, side: THREE.DoubleSide })
            );
            blast.rotation.x = -Math.PI / 2;
            blast.position.set(playerGroup.position.x, getTerrainHeight(playerGroup.position.x, playerGroup.position.z) + 0.1, playerGroup.position.z);
            scene.add(blast);
            
            setTimeout(() => scene.remove(blast), 400);
            creatures.forEach(c => {
                if (Math.hypot(playerGroup.position.x - c.x, playerGroup.position.z - c.z) < 3.8) {
                    c.takeDamage(12);
                }
            });
        }
    }
    
    if (attackBtn) attackBtn.onclick = performPrimaryAttack;
    if (skillBtn) skillBtn.onclick = performClassSkill;
    
    const interactBtn = document.getElementById('btn-interact');
    if (interactBtn) {
        interactBtn.onclick = () => {
            // Simple logic for looting the starter chest
            if (!chestLooted && Math.hypot(playerGroup.position.x - chestData.x, playerGroup.position.z - chestData.z) < 2.5) {
                chestLooted = true;
                inventory.hatchet += 1;
                inventory.knife += 1;
                updateUI();
                removeHarvestable(chestData);
            }
        };
    }
    
    const jumpBtn = document.getElementById('btn-jump');
    if (jumpBtn) {
        jumpBtn.onclick = () => {
            // Apply vertical velocity if currently on the ground
            if (isGrounded) { playerVY = 0.24; isGrounded = false; }
        };
    }

    if (attackBtn) attackBtn.onclick = performPrimaryAttack;
    if (skillBtn) skillBtn.onclick = performClassSkill;

    const interactBtn = document.getElementById('btn-interact');
    if (interactBtn) {
        interactBtn.onclick = () => {
            if (!chestLooted && Math.hypot(playerGroup.position.x - chestData.x, playerGroup.position.z - chestData.z) < 2.5) {
                chestLooted = true;
                inventory.hatchet += 1;
                inventory.knife += 1;
                updateUI();
                removeHarvestable(chestData);
            }
        };
    }

    const jumpBtn = document.getElementById('btn-jump');
    if (jumpBtn) {
        jumpBtn.onclick = () => {
            if (isGrounded) { playerVY = 0.24; isGrounded = false; }
        };
    }

    // =========================================================================
    // [SECTION 8: JOYSTICK CONTROL SYSTEM]
    // =========================================================================
    let joystickVector = { x: 0, y: 0 };
    const baseEl = document.getElementById('joystick-base');
    const knobEl = document.getElementById('joystick-knob');

    function handleJoystick(e) {
        if (!baseEl || !knobEl) return;
        const rect = baseEl.getBoundingClientRect();
        const touch = e.touches ? e.touches[0] : e;
        
        let dx = touch.clientX - (rect.left + rect.width / 2);
        let dy = touch.clientY - (rect.top + rect.height / 2);
        
        const dist = Math.hypot(dx, dy);
        const maxR = 40;
        
        if (dist > maxR) { dx = (dx / dist) * maxR; dy = (dy / dist) * maxR; }
        knobEl.style.transform = `translate(calc(-50% + ${dx}px), calc(-50% + ${dy}px))`;
        
        joystickVector = dist < 5 ? { x: 0, y: 0 } : { x: dx / maxR, y: dy / maxR };
    }

    function resetJoystick() {
        if (knobEl) knobEl.style.transform = `translate(-50%, -50%)`;
        joystickVector = { x: 0, y: 0 };
    }
    joystickVector = { x: 0, y: 0 };
}

    if (baseEl) {
        baseEl.addEventListener('pointerdown', (e) => { e.stopPropagation(); baseEl.setPointerCapture(e.pointerId); handleJoystick(e); });
        baseEl.addEventListener('pointermove', (e) => { if (baseEl.hasPointerCapture(e.pointerId)) handleJoystick(e); });
        baseEl.addEventListener('pointerup', (e) => { baseEl.releasePointerCapture(e.pointerId); resetJoystick(); });
    }

    // =========================================================================
    // [SECTION 9: CAMERA SYSTEM (SWIPE & AUTO-ALIGN)]
    // =========================================================================
    let cameraAngle = 0;
    let isSwipingCamera = false;
    let activePointerId = null;
    let lastTouchX = 0;
    
    let timeSinceLastManualCam = 100; 
    let continuousMoveTime = 0;

    window.addEventListener('pointerdown', (e) => {
        if (e.target.closest('button') || e.target.closest('#menu-modal') || e.target.closest('#joystick-base') || e.target.closest('.ui-layer')) return;
        
        isSwipingCamera = true;
        activePointerId = e.pointerId;
        lastTouchX = e.clientX;
    });
    
    window.addEventListener('pointermove', (e) => {
        if (isSwipingCamera && e.pointerId === activePointerId) {
            const deltaX = e.clientX - lastTouchX;
            cameraAngle -= deltaX * 0.005; 
            lastTouchX = e.clientX;
            timeSinceLastManualCam = 0; 
        }
    });

    const stopSwipe = (e) => {
        if (e.pointerId === activePointerId) {
            isSwipingCamera = false;
            activePointerId = null;
        }
    };

    window.addEventListener('pointerup', stopSwipe);
    window.addEventListener('pointercancel', stopSwipe);

    updateUI();

    function canMoveTo(nextX, nextZ) {
        const halfBoundary = (WORLD_SIZE / 2) - 1.5;
        if (Math.abs(nextX) > halfBoundary || Math.abs(nextZ) > halfBoundary) return false;
        
        for (let obj of obstacleColliders) {
            if (Math.hypot(nextX - obj.x, nextZ - obj.z) < (PLAYER_RADIUS + obj.radius)) return false;
        }
        return true;
    }

    // =========================================================================
    // [SECTION 10: MAIN ANIMATION & GAME LOOP]
    // =========================================================================
    const clock = new THREE.Clock();
    
    function animate() {
        requestAnimationFrame(animate);
        const delta = clock.getDelta();
        
        // --- MOVEMENT & INPUT LOGIC ---
        const jx = joystickVector.x;
        const jy = joystickVector.y;

        if (!isSwipingCamera) {
            timeSinceLastManualCam += delta;
        }

        let isMovingForward = jy < -0.3;
        if (isMovingForward) {
            continuousMoveTime += delta;
        } else {
            continuousMoveTime = 0; 
        }

        if (Math.abs(jx) > 0.05 || Math.abs(jy) > 0.05) {
            const moveSpeed = 7.5;

            const dx = (jx * Math.cos(cameraAngle) + jy * Math.sin(cameraAngle)) * moveSpeed * delta;
            const dz = (-jx * Math.sin(cameraAngle) + jy * Math.cos(cameraAngle)) * moveSpeed * delta;
            
            const nextX = playerGroup.position.x + dx;
            const nextZ = playerGroup.position.z + dz;
            
            // Slide along boundaries if one axis is blocked
            if (canMoveTo(nextX, playerGroup.position.z)) playerGroup.position.x = nextX;
            if (canMoveTo(playerGroup.position.x, nextZ)) playerGroup.position.z = nextZ;
            
            // Orient character model to movement direction
            playerGroup.rotation.y = Math.atan2(dx, dz);
        }

        for (let obs of obstacleColliders) {
            const dist = Math.hypot(playerGroup.position.x - obs.x, playerGroup.position.z - obs.z);
            const minDist = PLAYER_RADIUS + obs.radius;
            
            if (dist < minDist && dist > 0.001) {
                const overlap = minDist - dist;
                const pushX = (playerGroup.position.x - obs.x) / dist;
                const pushZ = (playerGroup.position.z - obs.z) / dist;
                
                playerGroup.position.x += pushX * overlap;
                playerGroup.position.z += pushZ * overlap;
            }
        }

        if (timeSinceLastManualCam > 1.5 && continuousMoveTime > 0.5) {
            let targetAngle = playerGroup.rotation.y - Math.PI;
            
            let diff = targetAngle - cameraAngle;
            diff = Math.atan2(Math.sin(diff), Math.cos(diff));
            
            const glideSpeed = 2.5; 
            cameraAngle += diff * glideSpeed * delta;
        }

        const groundY = getTerrainHeight(playerGroup.position.x, playerGroup.position.z);
        if (isGrounded) {
            playerGroup.position.y = groundY;
        } else {
            playerGroup.position.y += playerVY;
            playerVY -= 0.8 * delta; // Gravity scale
            
            // Land on terrain
            if (playerGroup.position.y <= groundY) {
                playerGroup.position.y = groundY;
                playerVY = 0;
                isGrounded = true;
            }
        }

        creatures.forEach(c => c.update(delta, playerGroup.position));
        
        // Update projectiles and evaluate creature hits
        for (let i = projectiles.length - 1; i >= 0; i--) {
            const p = projectiles[i];
            p.life -= delta;
            p.mesh.position.x += p.dirX * p.speed * delta;
            p.mesh.position.z += p.dirZ * p.speed * delta;
            
            for (let c of creatures) {
                if (c.hp > 0 && Math.hypot(p.mesh.position.x - c.x, p.mesh.position.z - c.z) < 1.2) {
                    c.takeDamage(p.damage);
                    p.life = 0;
                    break; // Destroy projectile on hit
                }
            }
            
            if (p.life <= 0) {
                scene.remove(p.mesh);
                projectiles.splice(i, 1);
            }
        }
        
        // Update Hunter traps and apply root/damage to creatures
        for (let i = traps.length - 1; i >= 0; i--) {
            const t = traps[i];
            for (let c of creatures) {
                if (c.hp > 0 && Math.hypot(t.x - c.x, t.z - c.z) < 1.0) {
                    c.rootedTimer = 4.0;
                    c.takeDamage(5);
                    scene.remove(t.mesh);
                    traps.splice(i, 1);
                    break;
                }
            }
        }
        
        // --- TARGETING SYSTEM ---
        // Finds the closest interactable object/creature
        let closest = null;
        let minDist = 3.5;
        harvestables.forEach(h => {
            const d = Math.hypot(playerGroup.position.x - h.x, playerGroup.position.z - h.z);
            if (d < minDist) { minDist = d; closest = h; }
        });
        
        const targetOverlay = document.getElementById('target-info-overlay');
        if (closest) {
            targetRing.position.set(closest.x, getTerrainHeight(closest.x, closest.z) + 0.1, closest.z);
            targetRing.visible = true;
            
            // Show floating UI info for creatures specifically
            if (closest.isCreature) {
                if (targetOverlay) targetOverlay.style.display = 'block';
                document.getElementById('target-name-lbl').innerText = closest.name;
                document.getElementById('target-status-lbl').innerText = closest.getConditionText();
            } else {
                if (targetOverlay) targetOverlay.style.display = 'none';
            }
        } else {
            targetRing.visible = false;
            if (targetOverlay) targetOverlay.style.display = 'none';
        }

        const aspect = window.innerWidth / window.innerHeight;
        const camDistance = aspect > 1.0 ? 5.5 : 7.0;
        const camHeight = aspect > 1.0 ? 2.8 : 3.5;

        camera.position.x = playerGroup.position.x + Math.sin(cameraAngle) * camDistance;
        camera.position.z = playerGroup.position.z + Math.cos(cameraAngle) * camDistance;
        camera.position.y = playerGroup.position.y + camHeight;
        camera.lookAt(playerGroup.position.x, playerGroup.position.y + 1.2, playerGroup.position.z);
        
        renderer.render(scene, camera);
    }
    
    animate();
    
    // Handle responsive browser resizing
    window.addEventListener('resize', () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    });
}
