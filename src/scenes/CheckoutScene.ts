import Phaser from 'phaser';

export default class CheckoutScene extends Phaser.Scene {
    private userName: string = '';
    private price: number = 0;

    constructor() {
        super('CheckoutScene');
    }

    init(data: { userName: string, price: number }) {
        this.userName = data.userName;
        this.price = data.price;
    }

    create() {
        const { width, height } = this.scale;

        this.add.image(width / 2, height / 2, 'field_bg');

        this.add.text(width / 2, 50, 'Checkout', {
            fontSize: '40px',
            color: '#000000',
            stroke: '#ffffff',
            strokeThickness: 2
        }).setOrigin(0.5);

        this.add.text(width / 2, 120, `Total: $${this.price.toFixed(2)}`, {
            fontSize: '48px',
            color: '#00aa00',
            stroke: '#ffffff',
            strokeThickness: 4
        }).setOrigin(0.5);

        this.add.text(width / 2, 200, 'Select Payment Method:', {
            fontSize: '24px',
            color: '#333333',
            stroke: '#ffffff',
            strokeThickness: 2
        }).setOrigin(0.5);

        const cashButton = this.add.text(width / 2 - 150, height / 2, 'PAY CASH', {
            fontSize: '28px',
            color: '#ffffff',
            backgroundColor: '#00aa00',
            padding: { x: 20, y: 10 },
        }).setOrigin(0.5).setInteractive({ useHandCursor: true });

        const cardButton = this.add.text(width / 2 + 150, height / 2, 'PAY CARD', {
            fontSize: '28px',
            color: '#ffffff',
            backgroundColor: '#0000aa',
            padding: { x: 20, y: 10 },
        }).setOrigin(0.5).setInteractive({ useHandCursor: true });

        cashButton.on('pointerdown', () => this.showCashPayment());
        cardButton.on('pointerdown', () => this.showCardPayment());

        cashButton.on('pointerover', () => cashButton.setTint(0xdddddd));
        cashButton.on('pointerout', () => cashButton.clearTint());
        cardButton.on('pointerover', () => cardButton.setTint(0xdddddd));
        cardButton.on('pointerout', () => cardButton.clearTint());
    }

    showCardPayment() {
        this.children.removeAll();

        const { width, height } = this.scale;
        this.add.image(width / 2, height / 2, 'field_bg');

        this.add.text(width / 2, 50, 'Card Payment', {
            fontSize: '36px',
            color: '#000000',
            stroke: '#ffffff',
            strokeThickness: 2
        }).setOrigin(0.5);

        const terminalX = width / 2;
        const terminalY = height / 2;

        const terminal = this.add.graphics();
        terminal.fillStyle(0x333333);
        terminal.fillRoundedRect(terminalX - 100, terminalY - 80, 200, 160, 10);
        terminal.fillStyle(0x87ceeb);
        terminal.fillRoundedRect(terminalX - 80, terminalY - 60, 160, 80, 5);
        terminal.fillStyle(0x000000);
        terminal.fillRect(terminalX - 70, terminalY + 40, 140, 20);

        this.add.text(terminalX, terminalY - 20, `$${this.price.toFixed(2)}`, {
            fontSize: '32px',
            color: '#000000'
        }).setOrigin(0.5);

        this.add.text(terminalX, terminalY + 120, 'Tap or Insert Card', {
            fontSize: '24px',
            color: '#ffff00',
            stroke: '#000000',
            strokeThickness: 2
        }).setOrigin(0.5);

        const card = this.add.graphics();
        card.fillStyle(0x4169e1);
        card.fillRoundedRect(0, 0, 100, 60, 5);
        card.fillStyle(0xffd700);
        card.fillCircle(20, 30, 8);
        card.fillCircle(35, 30, 8);

        const cardContainer = this.add.container(width - 200, height - 150);
        cardContainer.add(card);
        cardContainer.setSize(160, 100);
        cardContainer.setInteractive({ draggable: true, useHandCursor: true });

        this.add.text(width - 200, height - 80, 'Your Card', {
            fontSize: '16px',
            color: '#ffffff'
        }).setOrigin(0.5);

        cardContainer.on('drag', (_pointer: any, dragX: number, dragY: number) => {
            cardContainer.x = dragX;
            cardContainer.y = dragY;

            const distance = Phaser.Math.Distance.Between(cardContainer.x, cardContainer.y, terminalX, terminalY);
            if (distance < 100) {
                this.processCardPayment(cardContainer);
            }
        });
    }

    processCardPayment(card: Phaser.GameObjects.Container) {
        card.removeAllListeners();
        card.disableInteractive();

        this.tweens.add({
            targets: card,
            x: this.scale.width / 2,
            y: this.scale.height / 2 + 50,
            duration: 300,
            onComplete: () => {
                const beepBuffer = this.cache.audio.get('beep');
                if (beepBuffer) {
                    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
                    const source = audioContext.createBufferSource();
                    source.buffer = beepBuffer;
                    source.connect(audioContext.destination);
                    source.start(0);
                }

                this.add.text(this.scale.width / 2, this.scale.height / 2 + 150, 'Payment Approved!', {
                    fontSize: '32px',
                    color: '#00ff00',
                    stroke: '#000000',
                    strokeThickness: 2
                }).setOrigin(0.5);

                this.time.delayedCall(2000, () => {
                    this.scene.start('CookScene', { userName: this.userName });
                });
            }
        });
    }

    showCashPayment() {
        this.children.removeAll();

        const { width, height } = this.scale;
        this.add.image(width / 2, height / 2, 'field_bg');

        this.add.text(width / 2, 50, 'Cash Payment', {
            fontSize: '36px',
            color: '#000000',
            stroke: '#ffffff',
            strokeThickness: 2
        }).setOrigin(0.5);

        const boxX = width / 2;
        const boxY = height / 2;

        const box = this.add.graphics();
        box.fillStyle(0x8b4513);
        box.fillRoundedRect(boxX - 120, boxY - 80, 240, 160, 10);
        box.lineStyle(3, 0x654321);
        box.strokeRoundedRect(boxX - 120, boxY - 80, 240, 160, 10);
        box.fillStyle(0x000000);
        box.fillRect(boxX - 100, boxY - 10, 200, 20);

        this.add.text(boxX, boxY - 110, 'PAY BY CASH HERE', {
            fontSize: '24px',
            color: '#ffff00',
            stroke: '#000000',
            strokeThickness: 3,
            fontStyle: 'bold'
        }).setOrigin(0.5);

        this.add.text(boxX, boxY + 100, `Amount Due: $${this.price.toFixed(2)}`, {
            fontSize: '20px',
            color: '#ffffff',
            stroke: '#000000',
            strokeThickness: 2
        }).setOrigin(0.5);

        // Remaining amount display
        const remainingText = this.add.text(boxX, boxY + 140, `Remaining: $${this.price.toFixed(2)}`, {
            fontSize: '24px',
            color: '#ff0000',
            stroke: '#000000',
            strokeThickness: 2,
            fontStyle: 'bold'
        }).setOrigin(0.5);

        const walletX = 150;
        const walletY = height - 150;

        const walletRect = this.add.rectangle(walletX, walletY, 120, 80, 0x654321);
        walletRect.setStrokeStyle(3, 0x000000);
        walletRect.setInteractive({ useHandCursor: true });

        const walletLabel = this.add.text(walletX, walletY, 'WALLET\nCLICK HERE', {
            fontSize: '14px',
            color: '#ffffff',
            align: 'center',
            fontStyle: 'bold'
        }).setOrigin(0.5);

        this.add.text(walletX, walletY + 70, 'Click to Open', {
            fontSize: '16px',
            color: '#ffff00',
            stroke: '#000000',
            strokeThickness: 2
        }).setOrigin(0.5);

        let billsCreated = false;

        walletRect.on('pointerover', () => {
            walletRect.setScale(1.1);
            walletLabel.setScale(1.1);
        });

        walletRect.on('pointerout', () => {
            walletRect.setScale(1);
            walletLabel.setScale(1);
        });

        walletRect.on('pointerdown', () => {
            if (!billsCreated) {
                walletLabel.setText('OPENED!');
                this.createCashBills(walletX, walletY, boxX, boxY, remainingText);
                billsCreated = true;
                walletRect.setAlpha(0.5);
                walletLabel.setAlpha(0.5);
                walletRect.removeInteractive();
            }
        });
    }

    createCashBills(walletX: number, walletY: number, boxX: number, boxY: number, remainingText: Phaser.GameObjects.Text) {
        const billValues: number[] = [];
        let remaining = Math.ceil(this.price);

        while (remaining > 0) {
            if (remaining >= 20) {
                billValues.push(20);
                remaining -= 20;
            } else if (remaining >= 10) {
                billValues.push(10);
                remaining -= 10;
            } else if (remaining >= 5) {
                billValues.push(5);
                remaining -= 5;
            } else {
                billValues.push(1);
                remaining -= 1;
            }
        }

        billValues.push(5, 1, 1);

        let totalPaid = 0;

        billValues.forEach((value, index) => {
            const bill = this.add.graphics();
            bill.fillStyle(value >= 10 ? 0x2e8b57 : 0x90ee90);
            bill.fillRect(0, 0, 80, 35);
            bill.lineStyle(2, 0x000000);
            bill.strokeRect(0, 0, 80, 35);

            // Better spacing - grid layout
            const row = Math.floor(index / 5);
            const col = index % 5;
            const billContainer = this.add.container(
                walletX - 100 + col * 90,
                walletY - 200 - row * 50
            );
            billContainer.add(bill);

            const text = this.add.text(40, 17.5, `$${value}`, {
                fontSize: '16px',
                color: '#000000',
                fontStyle: 'bold'
            }).setOrigin(0.5);
            billContainer.add(text);

            billContainer.setSize(140, 80);
            billContainer.setInteractive({ draggable: true, useHandCursor: true });
            billContainer.setData('value', value);
            billContainer.setData('used', false);

            billContainer.on('drag', (_pointer: any, dragX: number, dragY: number) => {
                billContainer.x = dragX;
                billContainer.y = dragY;

                const distance = Phaser.Math.Distance.Between(billContainer.x, billContainer.y, boxX, boxY);
                if (distance < 100 && !billContainer.getData('used')) {
                    billContainer.setData('used', true);
                    totalPaid += value;

                    const remaining = Math.max(0, this.price - totalPaid);
                    remainingText.setText(`Remaining: $${remaining.toFixed(2)}`);
                    if (remaining === 0) {
                        remainingText.setColor('#00ff00');
                    }

                    this.tweens.add({
                        targets: billContainer,
                        x: boxX,
                        y: boxY,
                        scale: 0,
                        duration: 300,
                        onComplete: () => {
                            billContainer.destroy();

                            if (totalPaid >= this.price) {
                                this.completeCashPayment(totalPaid);
                            }
                        }
                    });
                }
            });
        });
    }

    completeCashPayment(totalPaid: number) {
        const change = totalPaid - this.price;

        this.add.text(this.scale.width / 2, this.scale.height / 2 + 200,
            `Payment Complete!\nChange: $${change.toFixed(2)}`, {
            fontSize: '28px',
            color: '#00ff00',
            stroke: '#000000',
            strokeThickness: 2,
            align: 'center'
        }).setOrigin(0.5);

        this.time.delayedCall(2500, () => {
            this.scene.start('CookScene', { userName: this.userName });
        });
    }
}
