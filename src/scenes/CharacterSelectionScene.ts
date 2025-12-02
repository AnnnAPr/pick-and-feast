import Phaser from 'phaser';

export default class CharacterSelectionScene extends Phaser.Scene {
    private userName: string = '';
    private selectedCharacter: string = 'human1';

    constructor() {
        super('CharacterSelectionScene');
    }

    init(data: { userName: string }) {
        this.userName = data.userName;
    }

    create() {
        const { width, height } = this.scale;

        // Title
        this.add.text(width / 2, 80, `Welcome, ${this.userName}!`, {
            fontSize: '48px',
            color: '#ffffff',
            stroke: '#000000',
            strokeThickness: 4,
            fontStyle: 'bold'
        }).setOrigin(0.5);

        // Instruction
        this.add.text(width / 2, 150, 'Choose Your Character', {
            fontSize: '32px',
            color: '#ffff00',
            stroke: '#000000',
            strokeThickness: 3
        }).setOrigin(0.5);

        // Character 1
        const char1Container = this.add.container(width / 2 - 200, height / 2);
        const char1Sprite = this.add.image(0, 0, 'human1');
        char1Sprite.setScale(0.5); // Adjust scale to match current player size

        const char1Border = this.add.rectangle(0, 0, 200, 250, 0xffffff, 0);
        char1Border.setStrokeStyle(4, 0xffffff);

        const char1Text = this.add.text(0, 150, 'Character 1', {
            fontSize: '24px',
            color: '#ffffff',
            backgroundColor: '#000000',
            padding: { x: 10, y: 5 }
        }).setOrigin(0.5);

        char1Container.add([char1Border, char1Sprite, char1Text]);
        char1Container.setSize(200, 250);
        char1Container.setInteractive({ useHandCursor: true });

        // Character 2
        const char2Container = this.add.container(width / 2 + 200, height / 2);
        const char2Sprite = this.add.image(0, 0, 'human2');
        char2Sprite.setScale(0.5);

        const char2Border = this.add.rectangle(0, 0, 200, 250, 0xffffff, 0);
        char2Border.setStrokeStyle(4, 0xffffff);

        const char2Text = this.add.text(0, 150, 'Character 2', {
            fontSize: '24px',
            color: '#ffffff',
            backgroundColor: '#000000',
            padding: { x: 10, y: 5 }
        }).setOrigin(0.5);

        char2Container.add([char2Border, char2Sprite, char2Text]);
        char2Container.setSize(200, 250);
        char2Container.setInteractive({ useHandCursor: true });

        // Selection logic
        char1Container.on('pointerover', () => {
            if (this.selectedCharacter === 'human1') {
                char1Border.setStrokeStyle(6, 0x00ff00);
            } else {
                char1Border.setStrokeStyle(6, 0xffffff);
            }
            char1Sprite.setScale(0.55);
        });

        char1Container.on('pointerout', () => {
            if (this.selectedCharacter !== 'human1') {
                char1Border.setStrokeStyle(4, 0xffffff);
                char1Sprite.setScale(0.5);
            } else {
                char1Border.setStrokeStyle(4, 0x00ff00);
            }
        });

        char1Container.on('pointerdown', () => {
            this.selectedCharacter = 'human1';
            char1Border.setStrokeStyle(6, 0x00ff00);
            char2Border.setStrokeStyle(4, 0xffffff);
            char1Sprite.setScale(0.55);
            char2Sprite.setScale(0.5);
        });

        char2Container.on('pointerover', () => {
            if (this.selectedCharacter === 'human2') {
                char2Border.setStrokeStyle(6, 0x00ff00);
            } else {
                char2Border.setStrokeStyle(6, 0xffffff);
            }
            char2Sprite.setScale(0.55);
        });

        char2Container.on('pointerout', () => {
            if (this.selectedCharacter !== 'human2') {
                char2Border.setStrokeStyle(4, 0xffffff);
                char2Sprite.setScale(0.5);
            } else {
                char2Border.setStrokeStyle(4, 0x00ff00);
            }
        });

        char2Container.on('pointerdown', () => {
            this.selectedCharacter = 'human2';
            char2Border.setStrokeStyle(6, 0x00ff00);
            char1Border.setStrokeStyle(4, 0xffffff);
            char2Sprite.setScale(0.55);
            char1Sprite.setScale(0.5);
        });

        // Continue button
        const continueButton = this.add.text(width / 2, height - 100, 'Continue', {
            fontSize: '36px',
            color: '#ffffff',
            backgroundColor: '#0000ff',
            padding: { x: 30, y: 15 }
        }).setOrigin(0.5).setInteractive({ useHandCursor: true });

        continueButton.on('pointerdown', () => {
            this.scene.start('FieldSelectionScene', {
                userName: this.userName,
                character: this.selectedCharacter
            });
        });

        continueButton.on('pointerover', () => continueButton.setTint(0xdddddd));
        continueButton.on('pointerout', () => continueButton.clearTint());

        // Set default selection visual (Character 1 selected by default)
        char1Border.setStrokeStyle(6, 0x00ff00);
        char1Sprite.setScale(0.55);
    }
}
