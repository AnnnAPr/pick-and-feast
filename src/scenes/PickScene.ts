import Phaser from 'phaser';

export default class PickScene extends Phaser.Scene {
    private userName: string = '';
    private character: string = 'human1';
    private field: string = '';
    private bagsConfig: { [key: string]: number } = {};
    private bagInstances: { size: string, capacity: number, filled: number }[] = [];
    private player!: Phaser.GameObjects.Sprite;
    private isMoving: boolean = false;

    // Bush positions for collision detection
    private bushes: Phaser.GameObjects.Sprite[] = [];
    private bushPositions: { x: number, y: number, row: number }[] = [];

    // UI Elements
    private bagTexts: { [key: string]: Phaser.GameObjects.Text } = {};
    private bagSprites: { [key: string]: Phaser.GameObjects.Image } = {};
    private bagOverflows: { [key: string]: Phaser.GameObjects.Container } = {};

    constructor() {
        super('PickScene');
    }

    init(data: { userName: string, character: string, field: string, bags: { [key: string]: number } }) {
        this.userName = data.userName;
        this.character = data.character || 'human1';
        this.field = data.field;
        this.bagsConfig = data.bags;

        this.bagInstances = [];
        const capacities: { [key: string]: number } = { small: 10, medium: 20, large: 40 };

        // Create flat list of bags sorted by size: small, medium, large
        ['small', 'medium', 'large'].forEach(size => {
            const count = this.bagsConfig[size] || 0;
            for (let i = 0; i < count; i++) {
                this.bagInstances.push({ size, capacity: capacities[size], filled: 0 });
            }
        });

        this.bushes = [];
        this.bushPositions = [];
    }

    create() {
        const { width, height } = this.scale;

        // Background
        this.add.image(width / 2, height / 2, 'field_bg');

        // Random Weather System
        const weather = Phaser.Math.RND.pick(['sunny', 'cloudy']);
        if (weather === 'cloudy') {
            // Add cloud overlay
            const clouds = this.add.graphics();
            clouds.fillStyle(0xcccccc, 0.3);
            clouds.fillRect(0, 0, width, height);
        }

        // Field Name
        this.add.text(width / 2, 40, `${this.field} Field U-Pick`, {
            fontSize: '36px',
            color: '#ffffff',
            stroke: '#000000',
            strokeThickness: 4,
            fontStyle: 'bold'
        }).setOrigin(0.5);

        // Price display
        this.add.text(width / 2, 80, '$5.00 per lb', {
            fontSize: '24px',
            color: '#ffff00',
            stroke: '#000000',
            strokeThickness: 3
        }).setOrigin(0.5);

        // Instructions - Upper Left Corner
        this.add.text(20, 20, '🍇 Single Click: Eat Berry', {
            fontSize: '16px',
            color: '#ffffff',
            backgroundColor: '#000000',
            padding: { x: 8, y: 4 },
            stroke: '#ffaa00',
            strokeThickness: 1
        }).setOrigin(0, 0);

        this.add.text(20, 45, 'Double Click: Pick to Bag', {
            fontSize: '16px',
            color: '#ffffff',
            backgroundColor: '#000000',
            padding: { x: 8, y: 4 },
            stroke: '#ffaa00',
            strokeThickness: 1
        }).setOrigin(0, 0);

        // Generate 7 straight rows of bushes with varying berry counts
        this.generateBushRows(width, height);

        // Add wind animation to bushes periodically
        this.time.addEvent({
            delay: 5000,
            callback: () => this.animateWind(),
            loop: true
        });

        this.createFlowers(width, height);

        // Player starts at bottom center between rows
        this.player = this.add.sprite(width / 2, height - 60, this.character);
        this.player.setScale(0.6); // Scale character to appropriate size (2x bigger)
        this.player.setDepth(this.player.y); // Depth based on Y position for proper layering

        // UI Panel on Right - High Depth
        const uiX = width - 250;
        const uiContainer = this.add.container(0, 0);
        uiContainer.setDepth(200); // Ensure UI is on top

        uiContainer.add(this.add.rectangle(uiX + 125, height / 2, 250, height, 0x000000, 0.5));

        uiContainer.add(this.add.text(uiX + 20, 120, 'Your Bags', {
            fontSize: '28px',
            color: '#ffffff',
            fontStyle: 'bold'
        }));

        // Bag Status
        let yPos = 180;
        ['small', 'medium', 'large'].forEach(size => {
            if (this.bagsConfig[size] > 0) {
                const bagKey = `bag_${size}`;
                const bagImg = this.add.image(uiX + 50, yPos + 20, bagKey).setScale(1.0);
                bagImg.setAlpha(0.6);
                this.bagSprites[size] = bagImg;
                uiContainer.add(bagImg);

                // Show count if > 1
                if (this.bagsConfig[size] > 1) {
                    const countText = this.add.text(uiX + 20, yPos + 20, `x${this.bagsConfig[size]}`, {
                        fontSize: '20px',
                        color: '#ffffff',
                        fontStyle: 'bold'
                    }).setOrigin(0.5);
                    uiContainer.add(countText);
                }

                const overflow = this.add.container(uiX + 50, yPos + 20);
                this.bagOverflows[size] = overflow;
                uiContainer.add(overflow);

                this.bagTexts[size] = this.add.text(uiX + 100, yPos, '', {
                    fontSize: '18px',
                    color: '#ffffff'
                });
                uiContainer.add(this.bagTexts[size]);
                yPos += 90;
            }
        });

        this.updateBagUI();

        // Finish button
        const finishButton = this.add.text(uiX + 125, height - 50, 'Weigh Bags', {
            fontSize: '24px',
            color: '#ffffff',
            backgroundColor: '#0000ff',
            padding: { x: 10, y: 5 },
        }).setOrigin(0.5).setInteractive({ useHandCursor: true });

        finishButton.on('pointerdown', () => {
            this.scene.start('WeighScene', { userName: this.userName, bags: this.bagInstances });
        });

        finishButton.on('pointerover', () => finishButton.setTint(0xdddddd));
        finishButton.on('pointerout', () => finishButton.clearTint());

        uiContainer.add(finishButton);
    }

    updateBagUI() {
        // Calculate totals per size
        const status: { [key: string]: { filled: number, capacity: number, count: number } } = {};

        this.bagInstances.forEach(bag => {
            if (!status[bag.size]) status[bag.size] = { filled: 0, capacity: 0, count: 0 };
            status[bag.size].filled += bag.filled;
            status[bag.size].capacity += bag.capacity;
            status[bag.size].count++;
        });

        Object.keys(this.bagTexts).forEach(size => {
            const s = status[size];
            if (s) {
                this.bagTexts[size].setText(`${size.charAt(0).toUpperCase() + size.slice(1)}:\n${s.filled}/${s.capacity} berries`);

                // Update overflow visuals
                const overflow = this.bagOverflows[size];

                // Update bag transparency - full opacity if has berries
                if (this.bagSprites[size]) {
                    this.bagSprites[size].setAlpha(s.filled > 0 ? 1 : 0.6);
                }

                if (overflow) {
                    const fillRatio = s.filled / s.capacity;
                    const maxBerries = 50; // More berries for denser look
                    const targetBerryCount = Math.floor(maxBerries * fillRatio);
                    const currentBerryCount = overflow.list.length;

                    // Define fill area (relative to container center)
                    const bottomY = 30;
                    const topY = -30;
                    const totalHeight = bottomY - topY; // 60px
                    const pileHeight = totalHeight * fillRatio;
                    const currentTopY = bottomY - pileHeight;

                    if (targetBerryCount > currentBerryCount) {
                        // Add new berries
                        const berriesToAdd = targetBerryCount - currentBerryCount;
                        for (let i = 0; i < berriesToAdd; i++) {
                            const berryY = Phaser.Math.FloatBetween(currentTopY, bottomY);
                            // Keep berries within bag width (narrower range to stay inside)
                            // Use a tapered width: wider at top of pile, narrower at bottom? 
                            // Actually, bag is usually wider at bottom. Let's just keep it safe.
                            const berryX = Phaser.Math.Between(-12, 12);

                            const berry = this.add.image(berryX, berryY, 'blueberry')
                                .setScale(0.03)
                                .setRotation(Phaser.Math.FloatBetween(0, 6.28));
                            overflow.add(berry);
                        }
                    } else if (targetBerryCount < currentBerryCount) {
                        // Remove berries (LIFO)
                        const berriesToRemove = currentBerryCount - targetBerryCount;
                        for (let i = 0; i < berriesToRemove; i++) {
                            const berry = overflow.list[overflow.list.length - 1];
                            if (berry) {
                                berry.destroy(); // This removes it from the container too
                            }
                        }
                    }
                    // Note: We don't update positions of existing berries to prevent "jumping"
                }
            }
        });
    }

    generateBushRows(width: number, height: number) {
        const rows = 7;
        const bushesPerRow = 10;
        const startX = 100;
        const startY = 150; // Lower to make room for instructions
        const rowWidth = width - 400;
        const spacingX = rowWidth / (rows - 1);
        const spacingY = (height - 250) / (bushesPerRow - 1);

        for (let col = 0; col < rows; col++) {
            for (let row = 0; row < bushesPerRow; row++) {
                const x = startX + col * spacingX;
                const y = startY + row * spacingY;

                // Create bush sprite
                const bush = this.add.sprite(x, y, 'bush');
                bush.setScale(0.15);
                bush.setDepth(y); // Depth based on Y position for proper layering

                bush.setInteractive({ useHandCursor: true });

                // Add Berries (5-10)
                const berryCount = Phaser.Math.Between(5, 10);
                const berries: Phaser.GameObjects.Sprite[] = [];

                for (let i = 0; i < berryCount; i++) {
                    const bx = Phaser.Math.Between(-20, 20);
                    const by = Phaser.Math.Between(-20, 20);
                    // Add berry to scene, relative to bush position
                    const berry = this.add.sprite(x + bx, y + by, 'blueberry').setScale(0.05);
                    berry.setDepth(y); // Same depth as parent bush
                    berries.push(berry);
                }

                bush.setData('hasBerries', true);
                bush.setData('row', col);
                bush.setData('position', row);
                bush.setData('berryCount', berryCount);
                bush.setData('visualBerries', berries);
                bush.setData('lastClickTime', 0);

                this.bushes.push(bush);
                this.bushPositions.push({ x, y, row: col });

                bush.on('pointerdown', () => {
                    if (!bush.getData('hasBerries') || this.isMoving) return;

                    const currentTime = this.time.now;
                    const lastClickTime = bush.getData('lastClickTime');
                    const clickTimer = bush.getData('clickTimer');

                    // Clear any existing timer
                    if (clickTimer) {
                        clearTimeout(clickTimer);
                        bush.setData('clickTimer', null);
                    }

                    if (currentTime - lastClickTime < 300) {
                        // Double click detected - Pick Berries to Bag
                        this.movePlayerToBush(bush, 'pick');
                        bush.setData('lastClickTime', 0); // Reset to prevent triple-click issues
                    } else {
                        // Potential single click - wait to see if double-click follows
                        const timer = setTimeout(() => {
                            // Single click confirmed - Eat Berry
                            this.movePlayerToBush(bush, 'eat');
                            bush.setData('clickTimer', null);
                        }, 300);

                        bush.setData('clickTimer', timer);
                        bush.setData('lastClickTime', currentTime);
                    }
                });
            }
        }
    }

    showYummEffect(bush: Phaser.GameObjects.Sprite) {
        // Visual Text
        const text = this.add.text(bush.x, bush.y - 40, 'Yumm! 😋', {
            fontSize: '20px',
            color: '#ff69b4',
            stroke: '#ffffff',
            strokeThickness: 2,
            fontStyle: 'bold'
        }).setOrigin(0.5);

        // Set high depth so text appears above bushes and player
        text.setDepth(10000);

        this.tweens.add({
            targets: text,
            y: bush.y - 80,
            alpha: 0,
            duration: 1000,
            onComplete: () => text.destroy()
        });
    }

    movePlayerToBush(targetBush: Phaser.GameObjects.Sprite, action: 'eat' | 'pick' = 'pick') {
        this.isMoving = true;

        const bushRow = targetBush.getData('row');
        const startX = 100;
        const rowWidth = this.scale.width - 400;
        const spacingX = rowWidth / 6; // 7 columns = 6 spaces between them

        // Position character in the aisle to the LEFT of the target bush column
        // This puts them between columns instead of on top of a column
        let aisleX: number;
        if (bushRow === 0) {
            // First column - stand to the right of it
            aisleX = startX + spacingX / 2;
        } else {
            // Stand in the aisle to the left of the bush column
            aisleX = startX + (bushRow - 0.5) * spacingX;
        }

        const targetY = targetBush.y; // Same Y as the bush

        // Calculate shortest path between rows
        const path = this.calculateShortestPath(this.player.x, this.player.y, aisleX, targetY);

        this.followPath(path, () => {
            this.isMoving = false;
            if (action === 'eat') {
                this.eatBerry(targetBush);
            } else {
                this.pickBerries(targetBush);
            }
        });
    }

    eatBerry(bush: Phaser.GameObjects.Sprite) {
        if (!bush.getData('hasBerries')) return;

        const visualBerries = bush.getData('visualBerries') as Phaser.GameObjects.Sprite[];
        const currentCount = bush.getData('berryCount') || 0;

        if (currentCount > 0 && visualBerries && visualBerries.length > 0) {
            // Remove one visual berry
            const berry = visualBerries.pop();
            if (berry) berry.destroy();

            // Decrease count
            bush.setData('berryCount', currentCount - 1);

            // If no berries left, mark as empty
            if (currentCount - 1 === 0) {
                bush.setData('hasBerries', false);
                bush.setAlpha(0.5);
            }
        }

        // Show Yumm effect
        this.showYummEffect(bush);
    }

    calculateShortestPath(startX: number, startY: number, endX: number, endY: number): { x: number, y: number }[] {
        const path: { x: number, y: number }[] = [];

        // Find which aisle we're currently in
        const currentAisle = this.findNearestAisle(startX);
        const targetAisle = this.findNearestAisle(endX);

        // If we're in the same aisle, just move vertically
        if (Math.abs(currentAisle - targetAisle) < 0.5) {
            // Same aisle - move directly to target
            if (Math.abs(startY - endY) > 5) {
                path.push({ x: endX, y: endY });
            }
        } else {
            // Different aisles - need to navigate through corridors
            const startY_val = 150; // Top of field (where bushes start)
            const endY_val = this.scale.height - 40; // Bottom corridor (below last bush row)

            // Decide whether to go through top or bottom corridor
            // Choose the closer one
            const distanceToTop = Math.abs(startY - startY_val);
            const distanceToBottom = Math.abs(startY - endY_val);

            const corridorY = distanceToTop < distanceToBottom ? startY_val - 50 : endY_val;

            // 1. Move vertically to corridor
            if (Math.abs(startY - corridorY) > 10) {
                path.push({ x: startX, y: corridorY });
            }

            // 2. Move horizontally to target aisle
            if (Math.abs(startX - endX) > 5) {
                path.push({ x: endX, y: corridorY });
            }

            // 3. Move vertically to target bush
            if (Math.abs(corridorY - endY) > 5) {
                path.push({ x: endX, y: endY });
            }
        }

        return path;
    }

    findNearestAisle(x: number): number {
        const startX = 100;
        const rowWidth = this.scale.width - 400;
        const spacingX = rowWidth / 6;
        return (x - startX) / spacingX;
    }

    followPath(path: { x: number, y: number }[], onComplete: () => void) {
        if (path.length === 0) {
            onComplete();
            return;
        }

        const point = path.shift()!;
        const distance = Phaser.Math.Distance.Between(this.player.x, this.player.y, point.x, point.y);
        const duration = distance * 2; // Speed factor

        this.tweens.add({
            targets: this.player,
            x: point.x,
            y: point.y,
            duration: duration,
            onUpdate: () => {
                // Update depth as player moves to maintain proper layering
                this.player.setDepth(this.player.y);
            },
            onComplete: () => {
                this.followPath(path, onComplete);
            }
        });
    }

    animateBerriesToBag(bush: Phaser.GameObjects.Sprite, bag: { size: string }, berryCount: number) {
        // Determine target position based on bag size
        let targetY = 180;
        let yPos = 180;
        const { width } = this.scale;
        const uiX = width - 250;

        for (const size of ['small', 'medium', 'large']) {
            if (this.bagsConfig[size] > 0) {
                if (bag.size === size) {
                    targetY = yPos;
                    break;
                }
                yPos += 90;
            }
        }

        for (let i = 0; i < berryCount; i++) {
            const berry = this.add.sprite(bush.x, bush.y, 'blueberry').setScale(0.05);

            this.tweens.add({
                targets: berry,
                x: uiX + 50,
                y: targetY + 20,
                scale: 0.15,
                duration: 500,
                delay: i * 100,
                onComplete: () => {
                    berry.destroy();
                }
            });
        }
    }

    animateWind() {
        const bushesToAnimate = Phaser.Math.RND.shuffle([...this.bushes]).slice(0, 10);
        bushesToAnimate.forEach((bush, index) => {
            this.tweens.add({
                targets: bush,
                angle: 3,
                duration: 300,
                yoyo: true,
                repeat: 2,
                delay: index * 50
            });
        });
    }

    pickBerries(bush: Phaser.GameObjects.Sprite) {
        if (!bush.getData('hasBerries')) return;

        const berriesToPick = bush.getData('berryCount') || 3;
        let berriesRemaining = berriesToPick;
        const visualBerries = bush.getData('visualBerries') as Phaser.GameObjects.Sprite[];

        this.playPopSound();
        this.shakeBushWithLeaves(bush);

        for (let i = 0; i < this.bagInstances.length && berriesRemaining > 0; i++) {
            const bag = this.bagInstances[i];
            const spaceInBag = bag.capacity - bag.filled;

            if (spaceInBag > 0) {
                const berriesToAdd = Math.min(berriesRemaining, spaceInBag);
                bag.filled += berriesToAdd;
                berriesRemaining -= berriesToAdd;

                this.animateBerriesToBag(bush, bag, berriesToAdd);
                this.tiltBag(bag.size);

                if (visualBerries && visualBerries.length > 0) {
                    for (let j = 0; j < berriesToAdd; j++) {
                        const berry = visualBerries.pop();
                        if (berry) berry.destroy();
                    }
                }
            }
        }

        if (berriesRemaining === 0) {
            bush.setData('hasBerries', false);
            bush.setAlpha(0.5);
        }

        this.updateBagUI();
    }

    playPopSound() {
        const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);

        oscillator.frequency.value = 800;
        oscillator.type = 'sine';

        gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);

        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.1);
    }

    shakeBushWithLeaves(bush: Phaser.GameObjects.Sprite) {
        this.tweens.add({
            targets: bush,
            x: bush.x + 5,
            duration: 50,
            yoyo: true,
            repeat: 3
        });

        for (let i = 0; i < 5; i++) {
            const leaf = this.add.ellipse(
                bush.x + Phaser.Math.Between(-20, 20),
                bush.y - 20,
                6, 10,
                0x228b22
            );

            this.tweens.add({
                targets: leaf,
                y: bush.y + 40,
                x: leaf.x + Phaser.Math.Between(-30, 30),
                angle: Phaser.Math.Between(-180, 180),
                alpha: 0,
                duration: 1000 + i * 100,
                ease: 'Cubic.easeIn',
                onComplete: () => leaf.destroy()
            });
        }
    }

    tiltBag(size: string) {
        const bagSprite = this.bagSprites[size];
        if (!bagSprite) return;

        this.tweens.add({
            targets: bagSprite,
            angle: 5,
            duration: 150,
            yoyo: true,
            repeat: 1,
            onComplete: () => {
                bagSprite.angle = 0;
            }
        });
    }

    createFlowers(width: number, height: number) {
        const flowerCount = 30;
        const uiX = width - 250;

        for (let i = 0; i < flowerCount; i++) {
            let validPosition = false;
            let x = 0, y = 0;
            let attempts = 0;

            while (!validPosition && attempts < 50) {
                x = Phaser.Math.Between(50, uiX - 50);
                y = Phaser.Math.Between(150, height - 50);
                validPosition = true;

                // Check distance from bushes
                for (const bush of this.bushPositions) {
                    if (Phaser.Math.Distance.Between(x, y, bush.x, bush.y) < 60) {
                        validPosition = false;
                        break;
                    }
                }

                // Check distance from player start
                if (Phaser.Math.Distance.Between(x, y, width / 2, height - 60) < 80) {
                    validPosition = false;
                }

                attempts++;
            }

            if (validPosition) {
                // Draw a simple flower
                const flower = this.add.container(x, y);

                // Petals
                for (let j = 0; j < 5; j++) {
                    const angle = (j * 72) * (Math.PI / 180);
                    const px = Math.cos(angle) * 5;
                    const py = Math.sin(angle) * 5;
                    const petal = this.add.circle(px, py, 4, 0xffffff);
                    flower.add(petal);
                }

                // Center
                const center = this.add.circle(0, 0, 3, 0xffff00);
                flower.add(center);

                flower.setDepth(y - 1); // Slightly behind things at same Y
                flower.setAlpha(0.8);
                flower.setScale(0.8);
            }
        }
    }
}
