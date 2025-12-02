import Phaser from 'phaser';
import BootScene from './scenes/BootScene';
import MenuScene from './scenes/MenuScene';
import PickScene from './scenes/PickScene';
import WeighScene from './scenes/WeighScene';
import BarcodeScene from './scenes/BarcodeScene';
import CheckoutScene from './scenes/CheckoutScene';
import CookScene from './scenes/CookScene';
import EatScene from './scenes/EatScene';
import FieldSelectionScene from './scenes/FieldSelectionScene';
import BagSelectionScene from './scenes/BagSelectionScene';
import CharacterSelectionScene from './scenes/CharacterSelectionScene';

const config: Phaser.Types.Core.GameConfig = {
    type: Phaser.AUTO,
    width: 1200,
    height: 800,
    parent: 'app',
    dom: {
        createContainer: true
    },
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { x: 0, y: 0 },
            debug: false
        }
    },
    scene: [
        BootScene,
        MenuScene,
        CharacterSelectionScene,
        FieldSelectionScene,
        BagSelectionScene,
        PickScene,
        WeighScene,
        BarcodeScene,
        CheckoutScene,
        CookScene,
        EatScene
    ]
};

new Phaser.Game(config);
