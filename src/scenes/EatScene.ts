import Phaser from 'phaser';

export default class EatScene extends Phaser.Scene {
    private userName: string = '';

    constructor() {
        super('EatScene');
    }

    init(data: { userName: string }) {
        this.userName = data.userName;
    }

    create() {
        const { width, height } = this.scale;

        // Background
        this.add.image(width / 2, height / 2, 'kitchen_bg');

        this.add.text(width / 2, 100, `Yummy, ${this.userName}!`, {
            fontSize: '40px',
            color: '#000000',
        }).setOrigin(0.5);

        const pie = this.add.image(width / 2, height / 2, 'baked_pie').setScale(0.4).setInteractive();

        this.add.text(width / 2, height - 50, 'Click to eat', {
            fontSize: '24px',
            color: '#333333',
        }).setOrigin(0.5);

        let bites = 0;
        pie.on('pointerdown', () => {
            bites++;
            pie.setScale(0.4 - (bites * 0.08));

            // Simple crunch sound effect or visual shake
            this.cameras.main.shake(100, 0.01);

            if (bites >= 5) {
                pie.destroy();
                this.add.text(width / 2, height / 2, 'All gone!', {
                    fontSize: '48px',
                    color: '#00aa00',
                    stroke: '#ffffff',
                    strokeThickness: 4
                }).setOrigin(0.5);

                const restartButton = this.add.text(width / 2, height - 100, 'Play Again', {
                    fontSize: '32px',
                    color: '#ffffff',
                    backgroundColor: '#333333',
                    padding: { x: 20, y: 10 },
                }).setOrigin(0.5).setInteractive();

                restartButton.on('pointerdown', () => {
                    this.scene.start('MenuScene');
                });
            }
        });
    }
}
