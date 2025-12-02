import Phaser from 'phaser';

export default class CookScene extends Phaser.Scene {
    private userName: string = '';

    constructor() {
        super('CookScene');
    }

    init(data: { userName: string }) {
        this.userName = data.userName;
    }

    create() {
        const { width, height } = this.scale;

        // Background
        this.add.image(width / 2, height / 2, 'kitchen_bg');

        this.add.text(width / 2, 80, `Baking Time, ${this.userName}!`, {
            fontSize: '40px',
            color: '#000000',
            stroke: '#ffffff',
            strokeThickness: 2
        }).setOrigin(0.5);

        // Oven
        this.add.image(width / 2, height / 2, 'oven');

        // Two SEPARATE images starting FAR LEFT - smaller size (0.2)
        const pieBase = this.add.image(150, height / 2, 'pie_base').setScale(0.2);
        const pickedBerries = this.add.image(250, height / 2, 'picked_blueberry').setScale(0.2);

        this.add.text(150, height / 2 + 70, 'Pie Crust', {
            fontSize: '14px',
            color: '#000000',
            stroke: '#ffffff',
            strokeThickness: 2
        }).setOrigin(0.5);

        this.add.text(250, height / 2 + 70, 'Blueberries', {
            fontSize: '14px',
            color: '#000000',
            stroke: '#ffffff',
            strokeThickness: 2
        }).setOrigin(0.5);

        // Animation - wait 2 seconds, then move TOGETHER into oven
        this.time.delayedCall(2000, () => {
            this.tweens.add({
                targets: [pieBase, pickedBerries],
                x: width / 2,
                duration: 1500,
                ease: 'Power2',
                onComplete: () => {
                    pieBase.setVisible(false);
                    pickedBerries.setVisible(false);

                    const bakeText = this.add.text(width / 2, height / 2 - 150, 'Baking...', {
                        fontSize: '32px',
                        color: '#ff0000',
                        stroke: '#000000',
                        strokeThickness: 2
                    }).setOrigin(0.5);

                    // Baking animation
                    this.tweens.add({
                        targets: bakeText,
                        alpha: 0.5,
                        yoyo: true,
                        repeat: -1,
                        duration: 500
                    });

                    this.time.delayedCall(3000, () => {
                        bakeText.setText('Done!');
                        bakeText.setColor('#00ff00');
                        bakeText.clearAlpha();

                        // Show baked_pie FROM OVEN (smaller - 0.2)
                        const bakedPie = this.add.image(width / 2, height / 2, 'baked_pie').setScale(0.2);
                        bakedPie.setAlpha(0);

                        // Fade in baked pie
                        this.tweens.add({
                            targets: bakedPie,
                            alpha: 1,
                            duration: 500
                        });

                        // Take out of oven - move further away
                        this.tweens.add({
                            targets: bakedPie,
                            x: width / 2 + 300,
                            duration: 1000,
                            delay: 500,
                            onComplete: () => {
                                this.add.text(width / 2 + 300, height / 2 + 90, 'Baked Pie!', {
                                    fontSize: '18px',
                                    color: '#8b4513',
                                    stroke: '#ffffff',
                                    strokeThickness: 2
                                }).setOrigin(0.5);

                                const eatButton = this.add.text(width / 2, height - 80, 'Eat Pie', {
                                    fontSize: '32px',
                                    color: '#ffffff',
                                    backgroundColor: '#ff8800',
                                    padding: { x: 20, y: 10 },
                                }).setOrigin(0.5).setInteractive({ useHandCursor: true });

                                eatButton.on('pointerdown', () => {
                                    this.scene.start('EatScene', { userName: this.userName });
                                });

                                eatButton.on('pointerover', () => eatButton.setTint(0xdddddd));
                                eatButton.on('pointerout', () => eatButton.clearTint());
                            }
                        });
                    });
                }
            });
        });
    }
}
