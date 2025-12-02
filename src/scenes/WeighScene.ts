import Phaser from 'phaser';

export default class WeighScene extends Phaser.Scene {
    private userName: string = '';
    private bags: { size: string, capacity: number, filled: number, weight: number }[] = [];
    private totalWeightText!: Phaser.GameObjects.Text;
    private currentSessionWeight: number = 0;
    private cumulativeWeight: number = 0;
    private weighedBagCount: number = 0;
    private totalBagCount: number = 0;

    constructor() {
        super('WeighScene');
    }

    init(data: { userName: string, bags: any[] }) {
        this.userName = data.userName;
        // Calculate weights but don't show them yet
        const sizeWeights: { [key: string]: number } = { small: 1, medium: 2, large: 4 };

        this.bags = data.bags
            .filter(bag => bag.filled > 0) // Only show bags that have berries
            .map(bag => {
                const maxWeight = sizeWeights[bag.size];
                const fillRatio = bag.filled / bag.capacity;
                const weight = maxWeight * fillRatio;
                return { ...bag, weight };
            });

        this.totalBagCount = this.bags.length;
    }

    create() {
        const { width, height } = this.scale;

        // Background
        this.add.image(width / 2, height / 2, 'field_bg');

        this.add.text(width / 2, 50, 'Weighing Station', {
            fontSize: '40px',
            color: '#000000',
            stroke: '#ffffff',
            strokeThickness: 2
        }).setOrigin(0.5);

        // Price display
        this.add.text(width / 2, 95, '$5.00 per lb', {
            fontSize: '24px',
            color: '#ffff00',
            stroke: '#000000',
            strokeThickness: 3
        }).setOrigin(0.5);

        // Scale Visual & Drop Zone
        const scaleX = width / 2;
        const scaleY = height / 2 + 100;
        // Make scale bigger
        this.add.image(scaleX, scaleY, 'scale').setScale(1.5);

        // Scale Text (Digital Display) with proper spacing
        this.totalWeightText = this.add.text(scaleX, scaleY + 70, '0.00 lb', {
            fontSize: '32px',
            color: '#ff0000',
            fontFamily: 'monospace',
            backgroundColor: '#000000',
            padding: { x: 10, y: 5 }
        }).setOrigin(0.5);

        // Cumulative weight display
        const cumulativeText = this.add.text(width / 2, 150, `Total Weighed: ${this.cumulativeWeight.toFixed(2)} lb`, {
            fontSize: '24px',
            color: '#ffffff',
            stroke: '#000000',
            strokeThickness: 2
        }).setOrigin(0.5);

        // Bags weighed counter
        const bagCountText = this.add.text(width / 2, 180, `Bags Weighed: ${this.weighedBagCount}/${this.totalBagCount}`, {
            fontSize: '20px',
            color: '#ffff00',
            stroke: '#000000',
            strokeThickness: 2
        }).setOrigin(0.5);

        // Drop Zone - BIGGER/WIDER for all bags
        this.add.zone(scaleX, scaleY - 50, 400, 300).setRectangleDropZone(400, 300);

        // Create Draggable Bags
        this.createDraggableBags(width);

        // Drag Events
        this.input.on('drag', (_pointer: any, gameObject: Phaser.GameObjects.Container, dragX: number, dragY: number) => {
            gameObject.x = dragX;
            gameObject.y = dragY;
        });

        this.input.on('drop', (_pointer: any, gameObject: any, _dropZone: any) => {
            if (!gameObject.getData('onScale')) {
                gameObject.setData('onScale', true);
                const weight = gameObject.getData('weight');
                this.currentSessionWeight += weight;
                this.updateWeight();

                // Mark as weighed
                if (!gameObject.getData('weighed')) {
                    gameObject.setData('weighed', true);
                    this.weighedBagCount++;
                    this.cumulativeWeight += weight;
                    bagCountText.setText(`Bags Weighed: ${this.weighedBagCount}/${this.totalBagCount}`);
                    cumulativeText.setText(`Total Weighed: ${this.cumulativeWeight.toFixed(2)} lb`);
                }
            }

            this.rearrangeBagsOnScale(scaleX, scaleY);
        });

        this.input.on('dragstart', (_pointer: any, gameObject: any) => {
            if (gameObject.getData('onScale')) {
                gameObject.setData('onScale', false);
                const weight = gameObject.getData('weight');
                this.currentSessionWeight -= weight;
                this.updateWeight();

                // Remove label
                const label = gameObject.getData('label');
                if (label) {
                    label.destroy();
                    gameObject.setData('label', null);
                }
            }
        });

        // Next Button - only enabled when all bags weighed
        const nextButton = this.add.text(width / 2, height - 50, 'Get Barcode', {
            fontSize: '32px',
            color: '#ffffff',
            backgroundColor: this.weighedBagCount >= this.totalBagCount ? '#00aa00' : '#666666',
            padding: { x: 20, y: 10 },
        }).setOrigin(0.5).setInteractive({ useHandCursor: true });

        nextButton.on('pointerdown', () => {
            if (this.weighedBagCount >= this.totalBagCount && this.cumulativeWeight > 0) {
                this.scene.start('BarcodeScene', { userName: this.userName, weight: this.cumulativeWeight });
            } else {
                // Feedback - must weigh all bags first
                this.tweens.add({
                    targets: nextButton,
                    scale: 1.1,
                    yoyo: true,
                    duration: 100,
                    repeat: 2
                });

                const warning = this.add.text(width / 2, height - 100, 'Please weigh all bags first!', {
                    fontSize: '20px',
                    color: '#ff0000',
                    backgroundColor: '#000000',
                    padding: { x: 10, y: 5 }
                }).setOrigin(0.5);

                this.time.delayedCall(2000, () => warning.destroy());
            }
        });

        // Update button color when all bags are weighed
        this.events.on('update', () => {
            if (this.weighedBagCount >= this.totalBagCount) {
                nextButton.setStyle({ backgroundColor: '#00aa00' });
            }
        });
    }

    rearrangeBagsOnScale(scaleX: number, scaleY: number) {
        // Find all bags currently on the scale
        const bagsOnScale = this.children.list.filter((child: any) =>
            child.type === 'Container' && child.getData && child.getData('onScale')
        ) as Phaser.GameObjects.Container[];

        if (bagsOnScale.length === 0) return;

        const count = bagsOnScale.length;
        const availableWidth = 300; // Width of scale top
        const spacing = Math.min(80, availableWidth / count); // Max spacing 80, or squeeze

        bagsOnScale.forEach((bag, index) => {
            // Calculate new position
            // Center the group
            const totalGroupWidth = (count - 1) * spacing;
            const groupStartX = scaleX - totalGroupWidth / 2;

            const targetX = groupStartX + index * spacing;
            const targetY = scaleY - 60;

            // Animate to position
            this.tweens.add({
                targets: bag,
                x: targetX,
                y: targetY,
                duration: 200,
                ease: 'Power2'
            });

            // Update label position if it exists
            const label = bag.getData('label');
            if (label) {
                label.destroy();
            }

            // Re-add label
            const weight = bag.getData('weight');
            const newLabel = this.add.text(targetX, targetY - 80, `${weight.toFixed(2)} lb`, {
                fontSize: '16px',
                color: '#000000',
                backgroundColor: '#ffffff'
            }).setOrigin(0.5);
            bag.setData('label', newLabel);

            // Adjust depth so they stack nicely
            bag.setDepth(100 + index);
            newLabel.setDepth(101 + index);
        });
    }

    createDraggableBags(width: number) {
        const startX = 100;
        const startY = 200;
        let x = startX;
        let y = startY;

        this.bags.forEach(bag => {
            // Create Container for Bag + Berries
            const bagContainer = this.add.container(x, y);
            bagContainer.setSize(60, 80); // Approximate size

            // Use appropriate bag sprite based on size
            const bagKey = `bag_${bag.size}`;
            const bagSprite = this.add.image(0, 0, bagKey);
            bagSprite.setScale(1.0); // Match PickScene scale
            bagContainer.add(bagSprite);

            // Add berries to show it's filled - Bottom Up
            const fillRatio = bag.filled / bag.capacity;
            const maxBerries = 50; // Dense look
            const visualBerryCount = Math.floor(maxBerries * fillRatio);

            // Define fill area (relative to container center)
            const bottomY = 30;
            const topY = -30;
            const totalHeight = bottomY - topY;
            const pileHeight = totalHeight * fillRatio;
            const currentTopY = bottomY - pileHeight;

            for (let i = 0; i < visualBerryCount; i++) {
                const berryY = Phaser.Math.FloatBetween(currentTopY, bottomY);
                // Keep berries within bag width
                const berryX = Phaser.Math.Between(-12, 12);

                const berry = this.add.image(berryX, berryY, 'blueberry')
                    .setScale(0.03)
                    .setRotation(Phaser.Math.FloatBetween(0, 6.28));

                bagContainer.add(berry);
            }

            // Increase hit area for easier grabbing
            bagContainer.setInteractive(new Phaser.Geom.Rectangle(-50, -60, 100, 120), Phaser.Geom.Rectangle.Contains);
            this.input.setDraggable(bagContainer);

            // Change cursor on hover
            bagContainer.on('pointerover', () => {
                this.input.setDefaultCursor('pointer');
                bagContainer.setScale(1.1);
            });

            bagContainer.on('pointerout', () => {
                this.input.setDefaultCursor('default');
                bagContainer.setScale(1.0);
            });

            bagContainer.setData('weight', bag.weight);
            bagContainer.setData('onScale', false);
            bagContainer.setData('weighed', false);

            // Layout
            x += 120; // More spacing for larger bags
            if (x > width - 350) {
                x = startX;
                y += 140;
            }
        });
    }

    updateWeight() {
        this.totalWeightText.setText(`${this.currentSessionWeight.toFixed(2)} lb`);
    }
}
