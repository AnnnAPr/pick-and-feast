import Phaser from 'phaser';

export default class MenuScene extends Phaser.Scene {
    constructor() {
        super('MenuScene');
    }

    create() {
        const { width, height } = this.scale;

        this.add.text(width / 2, height / 3, 'Pick and Feast', {
            fontSize: '64px',
            color: '#ffffff',
        }).setOrigin(0.5);

        this.add.text(width / 2, height / 2 - 50, 'Enter your name:', {
            fontSize: '24px',
            color: '#ffffff',
        }).setOrigin(0.5);

        const nameInput = this.add.dom(width / 2, height / 2).createFromHTML('<input type="text" name="nameInput" placeholder="Berry Muncher" style="font-size: 24px; padding: 10px; width: 300px; text-align: center;">');

        const startButton = this.add.text(width / 2, height / 2 + 100, 'Start Game', {
            fontSize: '32px',
            color: '#00ff00',
            backgroundColor: '#333333',
            padding: { x: 20, y: 10 },
        }).setOrigin(0.5).setInteractive();

        startButton.on('pointerdown', () => {
            const inputElement = nameInput.getChildByName('nameInput') as HTMLInputElement;
            const userName = inputElement.value.trim() || 'Berry Muncher';
            this.scene.start('CharacterSelectionScene', { userName });
        });

        startButton.on('pointerover', () => {
            startButton.setStyle({ color: '#ffff00' });
        });

        startButton.on('pointerout', () => {
            startButton.setStyle({ color: '#00ff00' });
        });
    }
}
