import Phaser from 'phaser';

export default class BagSelectionScene extends Phaser.Scene {
    private userName: string = '';
    private character: string = 'human1';
    private field: string = '';
    private bags: { [key: string]: number } = { small: 0, medium: 0, large: 0 };

    constructor() {
        super('BagSelectionScene');
    }

    init(data: { userName: string, character: string, field: string }) {
        this.userName = data.userName;
        this.character = data.character || 'human1';
        this.field = data.field;
        this.bags = { small: 0, medium: 0, large: 0 };
    }

    create() {
        const { width, height } = this.scale;

        this.add.text(width / 2, 50, 'Select Bags', {
            fontSize: '40px',
            color: '#ffffff',
        }).setOrigin(0.5);

        const sizes = [
            { key: 'small', label: 'Small (1lb)', y: 150 },
            { key: 'medium', label: 'Medium (2lb)', y: 250 },
            { key: 'large', label: 'Large (4lb)', y: 350 },
        ];

        sizes.forEach(size => {
            this.add.text(width / 2 - 100, size.y, size.label, { fontSize: '24px', color: '#ffffff' }).setOrigin(1, 0.5);

            const countText = this.add.text(width / 2, size.y, '0', { fontSize: '32px', color: '#ffff00' }).setOrigin(0.5);

            const minusBtn = this.add.text(width / 2 - 50, size.y, '-', { fontSize: '40px', color: '#ff0000', backgroundColor: '#333' }).setOrigin(0.5).setInteractive();
            const plusBtn = this.add.text(width / 2 + 50, size.y, '+', { fontSize: '40px', color: '#00ff00', backgroundColor: '#333' }).setOrigin(0.5).setInteractive();

            minusBtn.on('pointerdown', () => {
                if (this.bags[size.key] > 0) {
                    this.bags[size.key]--;
                    countText.setText(this.bags[size.key].toString());
                }
            });

            plusBtn.on('pointerdown', () => {
                if (this.bags[size.key] < 2) { // Max 2 of each size
                    this.bags[size.key]++;
                    countText.setText(this.bags[size.key].toString());
                } else {
                    // Visual feedback for limit reached
                    this.tweens.add({
                        targets: plusBtn,
                        scale: 1.2,
                        yoyo: true,
                        duration: 100
                    });
                }
            });
        });

        const startPickButton = this.add.text(width / 2, height - 80, 'Go to Field', {
            fontSize: '32px',
            color: '#ffffff',
            backgroundColor: '#00aa00',
            padding: { x: 20, y: 10 },
        }).setOrigin(0.5).setInteractive();

        startPickButton.on('pointerdown', () => {
            const totalBags = Object.values(this.bags).reduce((a, b) => a + b, 0);
            if (totalBags > 0) {
                this.scene.start('PickScene', { userName: this.userName, character: this.character, field: this.field, bags: this.bags });
            } else {
                // Shake effect or warning could be added here
                this.cameras.main.shake(200, 0.01);

                const warning = this.add.text(this.scale.width / 2, this.scale.height - 120, 'Please select at least one bag!', {
                    fontSize: '20px',
                    color: '#ff0000',
                    backgroundColor: '#000000',
                    padding: { x: 10, y: 5 }
                }).setOrigin(0.5);

                this.time.delayedCall(2000, () => warning.destroy());
            }
        });
    }
}
