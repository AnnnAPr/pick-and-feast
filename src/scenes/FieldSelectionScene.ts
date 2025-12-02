import Phaser from 'phaser';

export default class FieldSelectionScene extends Phaser.Scene {
    private userName: string = '';
    private character: string = 'human1';

    constructor() {
        super('FieldSelectionScene');
    }

    init(data: { userName: string, character: string }) {
        this.userName = data.userName;
        this.character = data.character || 'human1';
    }

    create() {
        const { width, height } = this.scale;

        this.add.text(width / 2, 50, `Welcome, ${this.userName}!`, {
            fontSize: '32px',
            color: '#ffffff',
        }).setOrigin(0.5);

        this.add.text(width / 2, 120, 'Select a Field', {
            fontSize: '48px',
            color: '#ffff00',
        }).setOrigin(0.5);

        const fields = [
            { name: 'Blueberry', color: '#0000ff', active: true },
            { name: 'Strawberry', color: '#ff0000', active: false },
            { name: 'Raspberry', color: '#ff0088', active: false },
            { name: 'Apple', color: '#00ff00', active: false },
        ];

        fields.forEach((field, index) => {
            const x = width / 2;
            const y = 250 + index * 80;

            const btn = this.add.text(x, y, `${field.name} Field`, {
                fontSize: '32px',
                color: field.active ? '#ffffff' : '#888888',
                backgroundColor: field.active ? field.color : '#333333',
                padding: { x: 20, y: 10 },
            }).setOrigin(0.5).setInteractive();

            if (field.active) {
                btn.on('pointerdown', () => {
                    this.scene.start('BagSelectionScene', { userName: this.userName, character: this.character, field: field.name });
                });

                btn.on('pointerover', () => btn.setScale(1.1));
                btn.on('pointerout', () => btn.setScale(1.0));
            }
        });
    }
}
