import Phaser from 'phaser';

export default class BarcodeScene extends Phaser.Scene {
    private userName: string = '';
    private weight: number = 0;
    private price: number = 0;
    private scanned: boolean = false;

    constructor() {
        super('BarcodeScene');
    }

    init(data: { userName: string, weight: number }) {
        this.userName = data.userName;
        this.weight = data.weight;
        this.price = this.weight * 5; // $5 per lb
        this.scanned = false;
    }

    create() {
        const { width, height } = this.scale;

        // Background
        this.add.image(width / 2, height / 2, 'field_bg');

        this.add.text(width / 2, 50, `Barcode for ${this.userName}`, {
            fontSize: '32px',
            color: '#000000',
            stroke: '#ffffff',
            strokeThickness: 2
        }).setOrigin(0.5);

        // Draw a simple barcode representation
        const barcodeX = width / 2;
        const barcodeY = height / 2;

        const barcodeContainer = this.add.container(barcodeX, barcodeY);

        const graphics = this.add.graphics();
        graphics.fillStyle(0xffffff, 1);
        graphics.fillRect(-100, -50, 200, 100);

        // Draw lines
        graphics.fillStyle(0x000000, 1);
        for (let i = 0; i < 20; i++) {
            const w = Phaser.Math.Between(2, 8);
            const x = -90 + (i * 9);
            graphics.fillRect(x, -40, w, 80);
        }

        barcodeContainer.add(graphics);
        barcodeContainer.setData('isBarcode', true);

        // Instructions
        const instructions = this.add.text(width / 2, height / 2 + 100, 'Drag the scanner to the barcode to scan', {
            fontSize: '20px',
            color: '#ffff00',
            stroke: '#000000',
            strokeThickness: 2
        }).setOrigin(0.5);

        // Draggable Scanner Tool
        const scanner = this.add.sprite(100, height - 100, 'scanner')
            .setScale(1.5)
            .setInteractive({ draggable: true, useHandCursor: true });

        scanner.on('drag', (_pointer: any, dragX: number, dragY: number) => {
            scanner.x = dragX;
            scanner.y = dragY;

            // Check if scanner is over barcode
            if (!this.scanned) {
                const distance = Phaser.Math.Distance.Between(scanner.x, scanner.y, barcodeX, barcodeY);
                if (distance < 100) {
                    this.scanBarcode(scanner, instructions);
                }
            }
        });

        // Price display (hidden until scanned)
        const priceText = this.add.text(width / 2, height / 2 + 150, '', {
            fontSize: '32px',
            color: '#00aa00',
            stroke: '#ffffff',
            strokeThickness: 4
        }).setOrigin(0.5);
        priceText.setVisible(false);
        priceText.setData('priceDisplay', true);

        // Checkout button (hidden until scanned)
        const payButton = this.add.text(width / 2, height - 80, 'Proceed to Checkout', {
            fontSize: '28px',
            color: '#ffffff',
            backgroundColor: '#0000ff',
            padding: { x: 20, y: 10 },
        }).setOrigin(0.5).setInteractive({ useHandCursor: true });
        payButton.setVisible(false);

        payButton.on('pointerdown', () => {
            this.scene.start('CheckoutScene', { userName: this.userName, price: this.price });
        });

        payButton.on('pointerover', () => payButton.setTint(0xdddddd));
        payButton.on('pointerout', () => payButton.clearTint());

        this.registry.set('priceText', priceText);
        this.registry.set('payButton', payButton);
    }

    scanBarcode(scanner: Phaser.GameObjects.Sprite, instructions: Phaser.GameObjects.Text) {
        this.scanned = true;

        // Play beep sound
        const beepBuffer = this.cache.audio.get('beep');
        if (beepBuffer) {
            const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
            const source = audioContext.createBufferSource();
            source.buffer = beepBuffer;
            source.connect(audioContext.destination);
            source.start(0);
        }

        // Visual feedback
        scanner.setTint(0x00ff00);
        this.tweens.add({
            targets: scanner,
            scale: 2,
            yoyo: true,
            duration: 200
        });

        // Update instructions
        instructions.setText('Barcode Scanned Successfully!');
        instructions.setColor('#00ff00');

        // Show price and checkout button
        const priceText = this.registry.get('priceText') as Phaser.GameObjects.Text;
        const payButton = this.registry.get('payButton') as Phaser.GameObjects.Text;

        this.time.delayedCall(500, () => {
            priceText.setText(`Total: $${this.price.toFixed(2)} (${this.weight.toFixed(2)} lb @ $5/lb)`);
            priceText.setVisible(true);

            this.tweens.add({
                targets: priceText,
                scale: { from: 0, to: 1 },
                duration: 300
            });
        });

        this.time.delayedCall(800, () => {
            payButton.setVisible(true);
            this.tweens.add({
                targets: payButton,
                scale: { from: 0, to: 1 },
                duration: 300
            });
        });
    }
}
