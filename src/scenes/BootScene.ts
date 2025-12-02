import Phaser from 'phaser';

export default class BootScene extends Phaser.Scene {
    constructor() {
        super('BootScene');
    }

    preload() {
        // Load existing assets
        this.load.image('blueberry', '/assets/fruits/blueberry.png');
        this.load.image('bag', '/assets/bags/bag.png');
        this.load.image('bush', '/assets/fruits/blueberry_bush.png');

        // Load pie assets
        this.load.image('pie_base', '/assets/pie/pie_base.png');
        this.load.image('picked_blueberry', '/assets/pie/picked_blueberry.png');
        this.load.image('baked_pie', '/assets/pie/baked_pie.png');

        // Load character assets
        this.load.image('human1', '/assets/persons/human1.png');
        this.load.image('human2', '/assets/persons/human2.png');

        // Load other assets (if they existed, we would load them here)
        // this.load.image('field_bg', '/assets/field_bg.png');
        // ...
    }

    create() {
        // Generate placeholder textures for missing assets
        this.createPlaceholderAssets();

        this.scene.start('MenuScene');
    }

    createPlaceholderAssets() {
        // Field Background - larger for new window size
        const field = this.make.graphics({ x: 0, y: 0 });
        field.fillStyle(0x228822);
        field.fillRect(0, 0, 1200, 800);
        // Add some texture details
        field.fillStyle(0x1a661a);
        for (let i = 0; i < 150; i++) {
            field.fillCircle(Phaser.Math.Between(0, 1200), Phaser.Math.Between(0, 800), Phaser.Math.Between(2, 5));
        }
        field.generateTexture('field_bg', 1200, 800);

        // Kitchen Background
        const kitchen = this.make.graphics({ x: 0, y: 0 });
        kitchen.fillStyle(0xe0e0e0);
        kitchen.fillRect(0, 0, 1200, 800);
        kitchen.fillStyle(0xd2b48c); // Countertop
        kitchen.fillRect(0, 400, 1200, 400);
        kitchen.generateTexture('kitchen_bg', 1200, 800);

        // Bush placeholder removed to use loaded asset

        // Human Character - more detailed with hair
        const human = this.make.graphics({ x: 0, y: 0 });
        // Hair (brown)
        human.fillStyle(0x4a2511);
        human.fillEllipse(20, 10, 10, 8);
        // Head
        human.fillStyle(0xffdbac); // Skin tone
        human.fillCircle(20, 14, 7);
        // Eyes
        human.fillStyle(0x000000);
        human.fillCircle(17, 13, 1.5);
        human.fillCircle(23, 13, 1.5);
        // Smile
        human.lineStyle(1, 0x000000);
        human.beginPath();
        human.arc(20, 14, 3, 0.2, Math.PI - 0.2, false);
        human.strokePath();
        // Body (shirt)
        human.fillStyle(0x4169e1); // Blue shirt
        human.fillRect(14, 21, 12, 16);
        // Arms
        human.fillStyle(0x4169e1);
        human.fillRect(10, 23, 4, 13);
        human.fillRect(26, 23, 4, 13);
        // Hands
        human.fillStyle(0xffdbac);
        human.fillCircle(12, 36, 2);
        human.fillCircle(28, 36, 2);
        // Legs (pants)
        human.fillStyle(0x2c3e50); // Dark pants
        human.fillRect(14, 37, 5, 13);
        human.fillRect(21, 37, 5, 13);
        // Shoes
        human.fillStyle(0x000000);
        human.fillEllipse(16, 50, 3, 2);
        human.fillEllipse(23, 50, 3, 2);
        human.generateTexture('player', 40, 52);

        // Small Bag
        const bagSmall = this.make.graphics({ x: 0, y: 0 });
        bagSmall.fillStyle(0x8b4513);
        bagSmall.fillRect(10, 20, 30, 40);
        bagSmall.fillRect(5, 15, 40, 10);
        bagSmall.lineStyle(2, 0x654321);
        bagSmall.strokeRect(10, 20, 30, 40);
        bagSmall.generateTexture('bag_small', 50, 65);

        // Medium Bag
        const bagMedium = this.make.graphics({ x: 0, y: 0 });
        bagMedium.fillStyle(0x8b4513);
        bagMedium.fillRect(8, 15, 44, 55);
        bagMedium.fillRect(3, 10, 54, 10);
        bagMedium.lineStyle(2, 0x654321);
        bagMedium.strokeRect(8, 15, 44, 55);
        bagMedium.generateTexture('bag_medium', 60, 75);

        // Large Bag
        const bagLarge = this.make.graphics({ x: 0, y: 0 });
        bagLarge.fillStyle(0x8b4513);
        bagLarge.fillRect(5, 10, 60, 75);
        bagLarge.fillRect(0, 5, 70, 10);
        bagLarge.lineStyle(3, 0x654321);
        bagLarge.strokeRect(5, 10, 60, 75);
        bagLarge.generateTexture('bag_large', 70, 90);

        // Keep original bag for compatibility
        const bag = this.make.graphics({ x: 0, y: 0 });
        bag.fillStyle(0x8b4513);
        bag.fillRect(8, 15, 44, 55);
        bag.generateTexture('bag', 60, 75);

        // Barcode Scanner
        const scanner = this.make.graphics({ x: 0, y: 0 });
        scanner.fillStyle(0x333333);
        scanner.fillRect(0, 0, 40, 20); // Head
        scanner.fillRect(10, 20, 20, 60); // Handle
        scanner.fillStyle(0xff0000);
        scanner.fillRect(40, 5, 5, 10); // Laser
        scanner.generateTexture('scanner', 50, 80);

        // Oven
        const oven = this.make.graphics({ x: 0, y: 0 });
        oven.fillStyle(0xcccccc);
        oven.fillRect(0, 0, 200, 200);
        oven.fillStyle(0x333333); // Window
        oven.fillRect(20, 20, 160, 120);
        oven.fillStyle(0x000000); // Handle
        oven.fillRect(20, 150, 160, 10);
        oven.generateTexture('oven', 200, 200);

        // Pie Raw
        const pieRaw = this.make.graphics({ x: 0, y: 0 });
        pieRaw.fillStyle(0xdeb887); // Crust
        pieRaw.fillCircle(50, 50, 50);
        pieRaw.fillStyle(0x4b0082); // Filling
        pieRaw.fillCircle(50, 50, 40);
        pieRaw.generateTexture('pie_raw', 100, 100);

        // Pie Baked
        const pieBaked = this.make.graphics({ x: 0, y: 0 });
        pieBaked.fillStyle(0x8b4513); // Crust
        pieBaked.fillCircle(50, 50, 50);
        pieBaked.fillStyle(0x2e0854); // Filling
        pieBaked.fillCircle(50, 50, 40);
        // Lattice
        pieBaked.lineStyle(4, 0x8b4513);
        pieBaked.beginPath();
        pieBaked.moveTo(20, 30); pieBaked.lineTo(80, 70);
        pieBaked.moveTo(20, 70); pieBaked.lineTo(80, 30);
        pieBaked.strokePath();
        pieBaked.generateTexture('pie_baked', 100, 100);

        // Scale
        const scale = this.make.graphics({ x: 0, y: 0 });
        scale.fillStyle(0xaaaaaa);
        scale.fillRect(0, 50, 150, 20); // Base
        scale.fillStyle(0xeeeeee);
        scale.fillRect(10, 0, 130, 50); // Top
        scale.generateTexture('scale', 150, 70);

        // Generate beep sound
        this.generateBeepSound();
    }

    generateBeepSound() {
        // Create a simple beep sound using Web Audio API
        const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
        const duration = 0.2;
        const sampleRate = audioContext.sampleRate;
        const numSamples = duration * sampleRate;
        const buffer = audioContext.createBuffer(1, numSamples, sampleRate);
        const data = buffer.getChannelData(0);

        // Generate beep at 800Hz
        const frequency = 800;
        for (let i = 0; i < numSamples; i++) {
            data[i] = Math.sin(2 * Math.PI * frequency * i / sampleRate) * 0.3;
            // Apply envelope
            const envelope = 1 - (i / numSamples);
            data[i] *= envelope;
        }

        // Store in cache
        this.cache.audio.add('beep', buffer);
    }
}
